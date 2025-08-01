/**
 * Google Drive Backup Service
 * Provides automatic backup of all Netlify data to Google Drive
 * Implements the critical requirement: "anything that uses local needs to go up to netlify with google as back up"
 */

import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

interface BackupMetadata {
  version: string;
  timestamp: string;
  organizationId: string;
  userId: string;
  dataType: string;
  checksum?: string;
}

interface BackupResult {
  success: boolean;
  fileId?: string;
  error?: string;
  timestamp: string;
}

interface RestoreResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

class GoogleDriveBackupService {
  private static instance: GoogleDriveBackupService;
  private isInitialized = false;
  private accessToken: string | null = null;
  private backupQueue: Map<string, any> = new Map();
  private isProcessing = false;
  private backupInterval: NodeJS.Timeout | null = null;

  private readonly BACKUP_FOLDER_NAME = 'NonprofitProfile_Backups';
  private readonly BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  private constructor() {}

  static getInstance(): GoogleDriveBackupService {
    if (!GoogleDriveBackupService.instance) {
      GoogleDriveBackupService.instance = new GoogleDriveBackupService();
    }
    return GoogleDriveBackupService.instance;
  }

  /**
   * Initialize the Google Drive backup service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if Google Drive access token is available
      this.accessToken = (await netlifySettingsService.get('google-drive-access-token')) as string | null;
      
      if (!this.accessToken) {
        logger.debug('Google Drive backup not configured - no access token');
        return false;
      }

      // Verify token is still valid
      const isValid = await this.verifyAccessToken();
      if (!isValid) {
        logger.debug('Google Drive access token is invalid or expired');
        return false;
      }

      // Ensure backup folder exists
      await this.ensureBackupFolder();

      // Start automatic backup interval
      this.startAutoBackup();

      this.isInitialized = true;
      logger.debug('✅ Google Drive backup service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Google Drive backup:', error);
      return false;
    }
  }

  /**
   * Configure Google Drive access
   */
  async configureAccess(accessToken: string): Promise<boolean> {
    try {
      this.accessToken = accessToken;
      await netlifySettingsService.set('google-drive-access-token', accessToken, 'user');
      
      const isValid = await this.verifyAccessToken();
      if (isValid) {
        await this.initialize();
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to configure Google Drive access:', error);
      return false;
    }
  }

  /**
   * Backup data to Google Drive
   */
  async backup(dataType: string, data: unknown, metadata?: Partial<BackupMetadata>): Promise<BackupResult> {
    const timestamp = new Date().toISOString();
    
    if (!this.isInitialized || !this.accessToken) {
      return {
        success: false,
        error: 'Google Drive backup not initialized',
        timestamp
      };
    }

    try {
      // Create backup metadata
      const fullMetadata: BackupMetadata = {
        version: '1.0.0',
        timestamp,
        organizationId: await this.getOrganizationId(),
        userId: await this.getUserId(),
        dataType,
        ...metadata
      };

      // Create backup content
      const backupContent = {
        metadata: fullMetadata,
        data: data,
        checksum: this.generateChecksum(data)
      };

      // Get or create backup folder
      const folderId = await this.getBackupFolderId();
      if (!folderId) {
        throw new Error('Could not access backup folder');
      }

      // Create filename
      const filename = this.generateBackupFilename(dataType, fullMetadata);

      // Upload to Google Drive
      const fileId = await this.uploadToGoogleDrive(
        filename,
        JSON.stringify(backupContent, null, 2),
        folderId
      );

      // Save backup reference
      await this.saveBackupReference(dataType, fileId, fullMetadata);

      logger.debug(`✅ Backed up ${dataType} to Google Drive`);
      
      return {
        success: true,
        fileId,
        timestamp
      };
    } catch (error) {
      logger.error(`Failed to backup ${dataType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
    }
  }

  /**
   * Queue data for backup (batched processing)
   */
  queueBackup(dataType: string, data: unknown, metadata?: Partial<BackupMetadata>): void {
    this.backupQueue.set(dataType, { data, metadata, queued: Date.now() });
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processBackupQueue();
    }
  }

  /**
   * Restore data from Google Drive
   */
  async restore(dataType: string, version?: string): Promise<RestoreResult> {
    const timestamp = new Date().toISOString();
    
    if (!this.isInitialized || !this.accessToken) {
      return {
        success: false,
        error: 'Google Drive backup not initialized',
        timestamp
      };
    }

    try {
      // Get backup reference
      const reference = await this.getBackupReference(dataType, version);
      if (!reference) {
        throw new Error(`No backup found for ${dataType}`);
      }

      // Download from Google Drive
      const content = await this.downloadFromGoogleDrive((reference as any).fileId);
      const backup = JSON.parse(content);

      // Verify checksum
      if (backup.checksum && backup.checksum !== this.generateChecksum(backup.data)) {
        throw new Error('Backup data integrity check failed');
      }

      logger.debug(`✅ Restored ${dataType} from Google Drive`);
      
      return {
        success: true,
        data: backup.data,
        timestamp
      };
    } catch (error) {
      logger.error(`Failed to restore ${dataType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
    }
  }

  /**
   * List available backups
   */
  async listBackups(dataType?: string): Promise<any[]> {
    try {
      const backups = (await netlifySettingsService.get('google-drive-backups') || {}) as Record<string, any>;
      
      if (dataType) {
        return backups[dataType] || [];
      }

      // Return all backups
      const allBackups = [];
      for (const [type, typeBackups] of Object.entries(backups)) {
        if (Array.isArray(typeBackups)) {
          allBackups.push(...typeBackups.map((b: unknown) => ({ ...(b as any), dataType: type })));
        }
      }

      return allBackups.sort((a, b) => 
        new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
      );
    } catch (error) {
      logger.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Backup all application data
   */
  async backupAll(): Promise<Map<string, BackupResult>> {
    const results = new Map<string, BackupResult>();

    try {
      // Get all data types to backup
      const dataTypes = [
        { type: 'settings', getData: () => netlifySettingsService.getAll() },
        { type: 'contacts', getData: async () => (await import('./netlifyContactService')).netlifyContactService.getContacts() },
        { type: 'forms', getData: async () => (await import('./netlifyFormService')).netlifyFormService.getAllFormData() },
        { type: 'documents', getData: async () => (await import('./documentService')).documentService.getDocuments() },
        { type: 'backup-locations', getData: async () => (await import('./universalBackupService')).universalBackupService.getBackupLocations() }
      ];

      // Backup each data type
      for (const { type, getData } of dataTypes) {
        try {
          const data = await getData();
          const result = await this.backup(type, data);
          results.set(type, result);
        } catch (error) {
          results.set(type, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
      }

      logger.debug('✅ Completed full backup to Google Drive');
    } catch (error) {
      logger.error('Failed to complete full backup:', error);
    }

    return results;
  }

  /**
   * Restore all application data
   */
  async restoreAll(version?: string): Promise<Map<string, RestoreResult>> {
    const results = new Map<string, RestoreResult>();

    try {
      const backups = await this.listBackups();
      const dataTypes = new Set(backups.map(b => b.dataType));

      for (const dataType of Array.from(dataTypes)) {
        const result = await this.restore(dataType, version);
        results.set(dataType, result);
      }

      logger.debug('✅ Completed full restore from Google Drive');
    } catch (error) {
      logger.error('Failed to complete full restore:', error);
    }

    return results;
  }

  /**
   * Private helper methods
   */
  private async verifyAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async ensureBackupFolder(): Promise<string> {
    try {
      // Check if folder already exists
      const existingFolderId = await netlifySettingsService.get('google-drive-backup-folder-id');
      if (existingFolderId && typeof existingFolderId === 'string') {
        // Verify it still exists
        const exists = await this.checkFileExists(existingFolderId);
        if (exists) {
          return existingFolderId as string;
        }
      }

      // Create new folder
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.BACKUP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create backup folder');
      }

      const folder = await response.json();
      await netlifySettingsService.set('google-drive-backup-folder-id', folder.id, 'organization');
      
      return folder.id;
    } catch (error) {
      logger.error('Failed to ensure backup folder:', error);
      throw error;
    }
  }

  private async getBackupFolderId(): Promise<string | null> {
    try {
      const folderId = await netlifySettingsService.get('google-drive-backup-folder-id');
      if (folderId && typeof folderId === 'string') {
        return folderId;
      }
      
      return await this.ensureBackupFolder();
    } catch (error) {
      logger.error('Failed to get backup folder ID:', error);
      return null;
    }
  }

  private async uploadToGoogleDrive(filename: string, content: string, folderId: string): Promise<string> {
    // Create metadata
    const metadata = {
      name: filename,
      parents: [folderId]
    };

    // Create multipart request
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Google Drive');
    }

    const file = await response.json();
    return file.id;
  }

  private async downloadFromGoogleDrive(fileId: string): Promise<string> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download file from Google Drive');
    }

    return await response.text();
  }

  private async checkFileExists(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private generateBackupFilename(dataType: string, metadata: BackupMetadata): string {
    const date = new Date(metadata.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0];
    
    return `${dataType}_${dateStr}_${timeStr}_${metadata.organizationId}.json`;
  }

  private generateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  private async getOrganizationId(): Promise<string> {
    const orgData = await netlifySettingsService.get('organizationData');
    return (orgData as any)?.id || 'default-org';
  }

  private async getUserId(): Promise<string> {
    const userData = await netlifySettingsService.get('calao_user_session');
    return (userData as any)?.user?.id || 'default-user';
  }

  private async saveBackupReference(dataType: string, fileId: string, metadata: BackupMetadata): Promise<void> {
    const backups = (await netlifySettingsService.get('google-drive-backups') || {}) as Record<string, any>;
    
    if (!backups[dataType]) {
      backups[dataType] = [];
    }

    backups[dataType].unshift({
      fileId,
      metadata,
      created: Date.now()
    });

    // Keep only last 10 backups per type
    backups[dataType] = backups[dataType].slice(0, 10);

    await netlifySettingsService.set('google-drive-backups', backups, 'organization');
  }

  private async getBackupReference(dataType: string, version?: string): Promise<unknown> {
    const backups = (await netlifySettingsService.get('google-drive-backups') || {}) as Record<string, any>;
    const typeBackups = backups[dataType] || [];

    if (typeBackups.length === 0) {
      return null;
    }

    if (version) {
      return typeBackups.find((b: unknown) => (b as any).metadata.version === version);
    }

    // Return most recent
    return typeBackups[0];
  }

  private async processBackupQueue(): Promise<void> {
    if (this.isProcessing || this.backupQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const entries = Array.from(this.backupQueue.entries());
      this.backupQueue.clear();

      for (const [dataType, { data, metadata }] of entries) {
        await this.backup(dataType, data, metadata);
        // Small delay between backups
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      logger.error('Error processing backup queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private startAutoBackup(): void {
    // Clear existing interval if any
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Set up automatic backup interval
    this.backupInterval = setInterval(() => {
      logger.debug('⏰ Running automatic backup...');
      this.backupAll().catch(error => {
        logger.error('Automatic backup failed:', error);
      });
    }, this.BACKUP_INTERVAL_MS);

    // Also run an initial backup
    setTimeout(() => {
      this.backupAll().catch(error => {
        logger.error('Initial backup failed:', error);
      });
    }, 5000); // 5 seconds after initialization
  }

  /**
   * Stop automatic backups
   */
  stop(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    this.isInitialized = false;
  }
}

export const googleDriveBackupService = GoogleDriveBackupService.getInstance();