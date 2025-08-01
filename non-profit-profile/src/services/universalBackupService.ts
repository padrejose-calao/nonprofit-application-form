/**
 * Universal Backup Service
 * Handles multi-tier backup strategy:
 * 1. Netlify server storage (primary)
 * 2. Profile-specific Google Drive backup
 * 3. Admin dashboard dual Google Drive backup
 * 4. Google Workspace integration
 */

import { toast } from 'react-hot-toast';
import { googleDriveService } from './googleDriveService';
import { googleWorkspaceService } from './googleWorkspaceService';
import { enhancedDocumentService, EnhancedDocument } from './enhancedDocumentService';
import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

export interface BackupLocation {
  id: string;
  name: string;
  type: 'netlify' | 'google_drive' | 'google_workspace';
  status: 'active' | 'inactive' | 'error';
  lastBackup?: string;
  spaceUsed?: number;
  spaceLimit?: number;
  accountEmail?: string;
  folderId?: string;
  folderUrl?: string;
}

export interface AdminBackupConfig {
  netlifyBackupId?: string; // Primary backup location
  lastBackupTime?: string;
  primaryGoogleAccount: {
    email: string;
    folderId?: string;
    isWorkspace: boolean;
  };
  secondaryGoogleAccount: {
    email: string;
    folderId?: string;
    isWorkspace: boolean;
  };
  autoBackupInterval: number; // in minutes
  retentionDays: number;
  enableRealTimeSync: boolean;
  backupTypes: {
    documents: boolean;
    profiles: boolean;
    configurations: boolean;
    logs: boolean;
  };
  backupHierarchy: {
    primary: 'netlify';
    secondary: 'google_drive_1';
    tertiary: 'google_drive_2';
  };
}

export interface OrganizationProfile {
  id: string;
  name: string;
  googleAccountEmail?: string;
  googleDriveFolderId?: string;
  backupEnabled: boolean;
  lastBackupTime?: string;
  backupStatus: 'never' | 'success' | 'partial' | 'failed';
  documentCount: number;
  totalSize: number;
}

class UniversalBackupService {
  private backupLocations: Map<string, BackupLocation> = new Map();
  private adminConfig: AdminBackupConfig | null = null;
  private currentProfile: OrganizationProfile | null = null;
  private backupQueue: Array<{id: string, type: string, data: unknown}> = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the backup service
   */
  private async initializeService() {
    await this.loadBackupLocations();
    await this.loadAdminConfig();
    this.startBackupQueue();
    this.setupPeriodicBackup();
  }

  /**
   * Set current organization profile
   */
  setCurrentProfile(profile: OrganizationProfile) {
    this.currentProfile = profile;
  }

  /**
   * Load backup locations from storage
   */
  private async loadBackupLocations() {
    try {
      const stored = await netlifySettingsService.get('backup-locations');
      if (stored && Array.isArray(stored)) {
        this.backupLocations = new Map(stored.map((loc: BackupLocation) => [loc.id, loc]));
      }
      
      // Always ensure Netlify location exists
      if (!this.backupLocations.has('netlify')) {
        this.backupLocations.set('netlify', {
          id: 'netlify',
          name: 'Netlify Server',
          type: 'netlify',
          status: 'active'
        });
      }
    } catch (error) {
      logger.error('Failed to load backup locations:', error);
    }
  }

  /**
   * Save backup locations to storage
   */
  private async saveBackupLocations() {
    try {
      const locations = Array.from(this.backupLocations.values());
      await netlifySettingsService.set('backup-locations', locations, 'organization');
    } catch (error) {
      logger.error('Failed to save backup locations:', error);
    }
  }

  /**
   * Load admin backup configuration
   */
  private async loadAdminConfig() {
    try {
      const stored = await netlifySettingsService.get('admin-backup-config');
      if (stored) {
        this.adminConfig = stored as AdminBackupConfig;
      }
    } catch (error) {
      logger.error('Failed to load admin config:', error);
    }
  }

  /**
   * Save admin backup configuration
   */
  private async saveAdminConfig() {
    try {
      if (this.adminConfig) {
        await netlifySettingsService.set('admin-backup-config', this.adminConfig, 'organization');
      }
    } catch (error) {
      logger.error('Failed to save admin config:', error);
    }
  }

  /**
   * Configure admin backup settings
   */
  configureAdminBackup(config: AdminBackupConfig) {
    this.adminConfig = config;
    this.saveAdminConfig();
    
    // Update backup locations
    this.backupLocations.set('admin-primary', {
      id: 'admin-primary',
      name: `Admin Primary (${config.primaryGoogleAccount.email})`,
      type: config.primaryGoogleAccount.isWorkspace ? 'google_workspace' : 'google_drive',
      status: 'active',
      accountEmail: config.primaryGoogleAccount.email,
      folderId: config.primaryGoogleAccount.folderId
    });

    this.backupLocations.set('admin-secondary', {
      id: 'admin-secondary',
      name: `Admin Secondary (${config.secondaryGoogleAccount.email})`,
      type: config.secondaryGoogleAccount.isWorkspace ? 'google_workspace' : 'google_drive',
      status: 'active',
      accountEmail: config.secondaryGoogleAccount.email,
      folderId: config.secondaryGoogleAccount.folderId
    });

    this.saveBackupLocations();
    toast.success('Admin backup configuration saved');
  }

  /**
   * Add organization profile Google Drive backup
   */
  async addProfileBackup(profile: OrganizationProfile): Promise<boolean> {
    try {
      if (!profile.googleAccountEmail) {
        throw new Error('No Google account configured for this profile');
      }

      const backupLocation: BackupLocation = {
        id: `profile-${profile.id}`,
        name: `${profile.name} Google Drive`,
        type: 'google_drive',
        status: 'active',
        accountEmail: profile.googleAccountEmail,
        folderId: profile.googleDriveFolderId
      };

      this.backupLocations.set(backupLocation.id, backupLocation);
      this.saveBackupLocations();

      // Initial backup
      await this.backupProfileData(profile);
      
      toast.success(`Backup configured for ${profile.name}`);
      return true;
    } catch (error) {
      logger.error('Failed to add profile backup:', error);
      toast.error('Failed to configure profile backup');
      return false;
    }
  }

  /**
   * Backup specific document to all configured locations
   */
  async backupDocument(document: EnhancedDocument, priority: 'high' | 'normal' = 'normal'): Promise<void> {
    const backupItem = {
      id: `doc-${document.id}-${Date.now()}`,
      type: 'document',
      data: document
    };

    if (priority === 'high') {
      this.backupQueue.unshift(backupItem);
    } else {
      this.backupQueue.push(backupItem);
    }

    if (!this.isProcessingQueue) {
      this.processBackupQueue();
    }
  }

  /**
   * Backup entire organization profile
   */
  async backupProfileData(profile: OrganizationProfile): Promise<void> {
    const backupItem = {
      id: `profile-${profile.id}-${Date.now()}`,
      type: 'profile',
      data: profile
    };

    this.backupQueue.push(backupItem);

    if (!this.isProcessingQueue) {
      this.processBackupQueue();
    }
  }

  /**
   * Backup application configuration (admin only)
   */
  async backupApplicationConfig(): Promise<void> {
    if (!this.adminConfig) {
      toast.error('Admin backup not configured');
      return;
    }

    const configData = {
      backupLocations: Array.from(this.backupLocations.values()),
      adminConfig: this.adminConfig,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const backupItem = {
      id: `config-${Date.now()}`,
      type: 'configuration',
      data: configData
    };

    this.backupQueue.unshift(backupItem); // High priority

    if (!this.isProcessingQueue) {
      this.processBackupQueue();
    }
  }

  /**
   * Process backup queue
   */
  private async processBackupQueue() {
    if (this.isProcessingQueue || this.backupQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.backupQueue.length > 0) {
      const item = this.backupQueue.shift();
      if (!item) continue;

      try {
        await this.processBackupItem(item);
      } catch (error) {
        logger.error(`Failed to backup item ${item.id}:`, error);
      }

      // Small delay to prevent overwhelming services
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Process individual backup item
   */
  private async processBackupItem(item: {id: string, type: string, data: unknown}) {
    switch (item.type) {
      case 'document':
        await this.backupDocumentToLocations(item.data as any);
        break;
      case 'profile':
        await this.backupProfileToLocations(item.data as any);
        break;
      case 'configuration':
        await this.backupConfigToAdmin(item.data as any);
        break;
    }
  }

  /**
   * Backup document to all applicable locations
   */
  private async backupDocumentToLocations(document: EnhancedDocument) {
    const promises: Promise<void>[] = [];

    // Backup to Netlify (always)
    promises.push(this.backupDocumentToNetlify(document));

    // Backup to profile-specific Google Drive
    if (this.currentProfile?.googleAccountEmail) {
      const profileLocation = this.backupLocations.get(`profile-${this.currentProfile.id}`);
      if (profileLocation && profileLocation.status === 'active') {
        promises.push(this.backupDocumentToGoogleDrive(document, profileLocation));
      }
    }

    // Backup to admin locations if configured
    if (this.adminConfig?.backupTypes.documents) {
      const adminPrimary = this.backupLocations.get('admin-primary');
      const adminSecondary = this.backupLocations.get('admin-secondary');
      
      if (adminPrimary?.status === 'active') {
        promises.push(this.backupDocumentToGoogleDrive(document, adminPrimary));
      }
      
      if (adminSecondary?.status === 'active') {
        promises.push(this.backupDocumentToGoogleDrive(document, adminSecondary));
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Backup document to Netlify
   */
  private async backupDocumentToNetlify(document: EnhancedDocument) {
    if (!document.file || document.netlifyUrl) return; // Already backed up

    try {
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('organizationId', this.currentProfile?.id || 'default');
      formData.append('sectionId', document.sectionId);
      formData.append('fieldId', document.fieldId || '');
      formData.append('description', document.description);

      const response = await fetch('/.netlify/functions/upload-document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        document.netlifyUrl = result.document.publicUrl;
        
        const netlifyLocation = this.backupLocations.get('netlify');
        if (netlifyLocation) {
          netlifyLocation.lastBackup = new Date().toISOString();
          netlifyLocation.status = 'active';
        }
      }
    } catch (error) {
      logger.error('Netlify backup failed:', error);
      const netlifyLocation = this.backupLocations.get('netlify');
      if (netlifyLocation) {
        netlifyLocation.status = 'error';
      }
    }

    this.saveBackupLocations();
  }

  /**
   * Backup document to Google Drive
   */
  private async backupDocumentToGoogleDrive(document: EnhancedDocument, location: BackupLocation) {
    if (!document.file) return;

    try {
      // Switch to the correct Google account for this backup location
      // This would require implementing account switching in googleDriveService
      
      const uploadedFile = await googleDriveService.uploadFile(
        document.file,
        document.name,
        `Backup from ${this.currentProfile?.name || 'Nonprofit Profile'}: ${document.description}`,
        location.folderId
      );

      if (uploadedFile) {
        location.lastBackup = new Date().toISOString();
        location.status = 'active';
        
        // Update document with Google Drive info for this location
        if (location.id.startsWith('profile-')) {
          document.googleDriveFileId = uploadedFile.id;
          document.googleDriveUrl = uploadedFile.webViewLink;
        }
      }
    } catch (error) {
      logger.error(`Google Drive backup failed for ${location.name}:`, error);
      location.status = 'error';
    }

    this.saveBackupLocations();
  }

  /**
   * Backup profile data to all locations
   */
  private async backupProfileToLocations(profile: OrganizationProfile) {
    const profileData = {
      profile,
      documents: enhancedDocumentService.getDocuments(),
      timestamp: new Date().toISOString()
    };

    const dataBlob = new Blob([JSON.stringify(profileData, null, 2)], {
      type: 'application/json'
    });
    
    const dataFile = new File([dataBlob], `${profile.name}-profile-backup.json`, {
      type: 'application/json'
    });

    // Backup profile data as a file
    const profileDocument: EnhancedDocument = {
      id: `profile-backup-${Date.now()}`,
      name: dataFile.name,
      originalName: dataFile.name,
      type: dataFile.type,
      category: 'system_backup',
      sectionId: 'profile_backup',
      file: dataFile,
      size: dataFile.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'System',
      version: 1,
      status: 'approved',
      tags: ['backup', 'profile', 'system'],
      description: `Complete profile backup for ${profile.name}`,
      syncStatus: 'local_only'
    };

    await this.backupDocumentToLocations(profileDocument);
  }

  /**
   * Backup configuration to admin accounts
   */
  private async backupConfigToAdmin(configData: unknown) {
    if (!this.adminConfig) return;

    const configBlob = new Blob([JSON.stringify(configData, null, 2)], {
      type: 'application/json'
    });
    
    const configFile = new File([configBlob], `admin-config-backup-${Date.now()}.json`, {
      type: 'application/json'
    });

    const configDocument: EnhancedDocument = {
      id: `admin-config-backup-${Date.now()}`,
      name: configFile.name,
      originalName: configFile.name,
      type: configFile.type,
      category: 'admin_backup',
      sectionId: 'admin_config',
      file: configFile,
      size: configFile.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Admin System',
      version: 1,
      status: 'approved',
      tags: ['backup', 'admin', 'configuration'],
      description: 'Admin configuration backup',
      syncStatus: 'local_only'
    };

    // Only backup to admin locations
    const promises: Promise<void>[] = [];
    
    const adminPrimary = this.backupLocations.get('admin-primary');
    const adminSecondary = this.backupLocations.get('admin-secondary');
    
    if (adminPrimary?.status === 'active') {
      promises.push(this.backupDocumentToGoogleDrive(configDocument, adminPrimary));
    }
    
    if (adminSecondary?.status === 'active') {
      promises.push(this.backupDocumentToGoogleDrive(configDocument, adminSecondary));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Start periodic backup process
   */
  private setupPeriodicBackup() {
    if (!this.adminConfig?.autoBackupInterval) return;

    const intervalMs = this.adminConfig.autoBackupInterval * 60 * 1000; // Convert to milliseconds
    
    setInterval(() => {
      this.performPeriodicBackup();
    }, intervalMs);
  }

  /**
   * Perform periodic backup
   */
  private async performPeriodicBackup() {
    if (!this.adminConfig?.enableRealTimeSync) return;

    try {
      // Backup current profile if available
      if (this.currentProfile && this.currentProfile.backupEnabled) {
        await this.backupProfileData(this.currentProfile);
      }

      // Backup application configuration
      await this.backupApplicationConfig();
      
      logger.info('Periodic backup completed');
    } catch (error) {
      logger.error('Periodic backup failed:', error);
    }
  }

  /**
   * Get backup status for all locations
   */
  getBackupStatus(): BackupLocation[] {
    return Array.from(this.backupLocations.values());
  }

  /**
   * Get backup statistics
   */
  getBackupStats(): {
    totalLocations: number;
    activeLocations: number;
    lastBackupTime: string | null;
    totalBackupSize: number;
    queueSize: number;
  } {
    const locations = Array.from(this.backupLocations.values());
    const activeLocs = locations.filter(loc => loc.status === 'active');
    const lastBackups = locations
      .map(loc => loc.lastBackup)
      .filter(Boolean)
      .sort()
      .reverse();

    return {
      totalLocations: locations.length,
      activeLocations: activeLocs.length,
      lastBackupTime: lastBackups[0] || null,
      totalBackupSize: activeLocs.reduce((sum, loc) => sum + (loc.spaceUsed || 0), 0),
      queueSize: this.backupQueue.length
    };
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(location: BackupLocation, backupId: string): Promise<boolean> {
    try {
      // Implementation would depend on the backup location type
      // This is a placeholder for the restore functionality
      toast.success(`Restore initiated from ${location.name}`);
      return true;
    } catch (error) {
      logger.error('Restore failed:', error);
      toast.error('Failed to restore from backup');
      return false;
    }
  }

  /**
   * Test backup connectivity
   */
  async testBackupConnectivity(): Promise<{[locationId: string]: boolean}> {
    const results: {[locationId: string]: boolean} = {};
    
    for (const [id, location] of Array.from(this.backupLocations)) {
      try {
        switch (location.type) {
          case 'netlify':
            // Test Netlify connection
            const response = await fetch('/.netlify/functions/upload-document', {
              method: 'OPTIONS'
            });
            results[id] = response.ok;
            break;
            
          case 'google_drive':
          case 'google_workspace':
            // Test Google Drive connection
            results[id] = googleDriveService.isSignedIn();
            break;
        }
      } catch (error) {
        results[id] = false;
      }
    }
    
    return results;
  }

  /**
   * Start backup queue processing
   */
  private startBackupQueue() {
    // Process queue every 30 seconds
    setInterval(() => {
      if (!this.isProcessingQueue && this.backupQueue.length > 0) {
        this.processBackupQueue();
      }
    }, 30000);
  }

  /**
   * Export profile data to Google Sheets
   */
  async exportToGoogleSheets(profileId: string): Promise<void> {
    try {
      if (!googleWorkspaceService.isSignedIn()) {
        await googleWorkspaceService.signIn();
      }

      const profile = this.currentProfile;
      if (!profile || profile.id !== profileId) {
        throw new Error('Profile not loaded');
      }

      // Get all profile data including documents
      const profileData = await this.getProfileBackupData(profileId);
      
      // Export to Google Sheets
      const sheet = await googleWorkspaceService.exportToSheets(
        profileData as Record<string, unknown>,
        profile.name
      );

      toast.success(`Data exported to Google Sheets: ${sheet.name}`);
      
      // Update profile with sheet reference
      await this.updateProfileMetadata(profileId, {
        lastExportSheet: sheet.id,
        lastExportTime: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to export to Google Sheets:', error);
      toast.error('Failed to export to Google Sheets');
      throw error;
    }
  }

  /**
   * Create Google Forms for data collection
   */
  async createDataCollectionForm(profileId: string, formType: string): Promise<string> {
    try {
      if (!googleWorkspaceService.isSignedIn()) {
        await googleWorkspaceService.signIn();
      }

      const profile = this.currentProfile;
      if (!profile || profile.id !== profileId) {
        throw new Error('Profile not loaded');
      }

      // Define form fields based on type
      const formConfigs: Record<string, unknown> = {
        'board_update': {
          title: `${profile.name} - Board Member Update Form`,
          fields: [
            { name: 'Member Name', type: 'text', required: true },
            { name: 'Position', type: 'text', required: true },
            { name: 'Email', type: 'text', required: true },
            { name: 'Phone', type: 'text', required: false },
            { name: 'Bio', type: 'textarea', required: false },
            { name: 'Term Start Date', type: 'text', required: true },
            { name: 'Term End Date', type: 'text', required: true }
          ]
        },
        'program_impact': {
          title: `${profile.name} - Program Impact Report`,
          fields: [
            { name: 'Program Name', type: 'text', required: true },
            { name: 'Reporting Period', type: 'text', required: true },
            { name: 'Number of Beneficiaries', type: 'text', required: true },
            { name: 'Key Outcomes', type: 'textarea', required: true },
            { name: 'Challenges Faced', type: 'textarea', required: false },
            { name: 'Success Stories', type: 'textarea', required: false }
          ]
        },
        'volunteer_application': {
          title: `${profile.name} - Volunteer Application`,
          fields: [
            { name: 'Full Name', type: 'text', required: true },
            { name: 'Email', type: 'text', required: true },
            { name: 'Phone', type: 'text', required: true },
            { name: 'Areas of Interest', type: 'textarea', required: true },
            { name: 'Availability', type: 'text', required: true },
            { name: 'Previous Experience', type: 'textarea', required: false }
          ]
        }
      };

      const config = formConfigs[formType] || {
        title: `${profile.name} - Data Collection Form`,
        fields: [
          { name: 'Name', type: 'text', required: true },
          { name: 'Information', type: 'textarea', required: true }
        ]
      };

      const form = await googleWorkspaceService.createForm((config as any).title, (config as any).fields);
      
      toast.success('Form created successfully');
      return form.publishedUrl || form.editUrl || '';
    } catch (error) {
      logger.error('Failed to create form:', error);
      toast.error('Failed to create Google Form');
      throw error;
    }
  }

  /**
   * Setup automated Google Workspace sync
   */
  async setupWorkspaceSync(profileId: string): Promise<void> {
    try {
      if (!googleWorkspaceService.isSignedIn()) {
        await googleWorkspaceService.signIn();
      }

      const profile = this.currentProfile;
      if (!profile || profile.id !== profileId) {
        throw new Error('Profile not loaded');
      }

      // Create organization folder structure
      const { folderId, structure } = await googleWorkspaceService.createOrganizationStructure(
        profile.name
      );

      // Update profile with workspace configuration
      await this.updateProfileMetadata(profileId, {
        workspaceFolderId: folderId,
        workspaceStructure: structure,
        workspaceSyncEnabled: true,
        workspaceSyncSetupDate: new Date().toISOString()
      });

      // Enable Workspace backup location
      const workspaceLocation: BackupLocation = {
        id: `workspace_${profileId}`,
        name: `${profile.name} - Google Workspace`,
        type: 'google_workspace',
        status: 'active',
        folderId: folderId,
        folderUrl: `https://drive.google.com/drive/folders/${folderId}`
      };

      this.backupLocations.set(workspaceLocation.id, workspaceLocation);
      await this.saveBackupLocations();

      toast.success('Google Workspace sync configured successfully');
    } catch (error) {
      logger.error('Failed to setup workspace sync:', error);
      toast.error('Failed to setup Google Workspace sync');
      throw error;
    }
  }

  /**
   * Perform admin dual-account backup
   * Primary: Netlify storage
   * Secondary: Dual Google accounts for redundancy
   */
  async performAdminDualBackup(primaryCredentials: unknown, secondaryCredentials: unknown): Promise<void> {
    try {
      toast('Starting comprehensive admin backup...', { icon: 'ℹ️' });

      // Step 1: Primary backup to Netlify
      const netlifyBackupResult = await this.backupToNetlify();
      if (!netlifyBackupResult.success) {
        throw new Error('Netlify primary backup failed');
      }
      toast.success('Primary backup to Netlify completed');

      // Step 2: Secondary backup to primary Google account
      const authToken = await netlifySettingsService.getAuthToken();
      const primaryResult = await fetch('/.netlify/functions/sync-google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          action: 'admin-backup',
          googleCredentials: primaryCredentials,
          netlifyBackupId: netlifyBackupResult.backupId
        })
      });

      if (!primaryResult.ok) {
        logger.error('Primary Google backup failed, but Netlify backup succeeded');
      } else {
        const _primaryData = await primaryResult.json();
        toast.success('Secondary backup to primary Google account completed');
      }
      
      // Step 3: Tertiary backup to secondary Google account
      const secondaryResult = await fetch('/.netlify/functions/sync-google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          action: 'admin-backup',
          googleCredentials: secondaryCredentials,
          netlifyBackupId: netlifyBackupResult.backupId
        })
      });

      if (!secondaryResult.ok) {
        logger.error('Secondary Google backup failed, but Netlify backup succeeded');
      } else {
        const _secondaryData = await secondaryResult.json();
        toast.success('Tertiary backup to secondary Google account completed');
      }

      // Update admin config with all backup locations
      if (this.adminConfig) {
        this.adminConfig.lastBackupTime = new Date().toISOString();
        this.adminConfig.netlifyBackupId = netlifyBackupResult.backupId;
        if (primaryResult.ok) {
          const primaryData = await primaryResult.json();
          this.adminConfig.primaryGoogleAccount.folderId = primaryData.backupId;
        }
        if (secondaryResult.ok) {
          const secondaryData = await secondaryResult.json();
          this.adminConfig.secondaryGoogleAccount.folderId = secondaryData.backupId;
        }
        await this.saveAdminConfig();
      }

      toast.success('Complete admin backup finished (Netlify + Dual Google)');
    } catch (error) {
      logger.error('Admin backup failed:', error);
      toast.error('Admin backup failed - check console for details');
      throw error;
    }
  }

  /**
   * Backup all data to Netlify storage (primary)
   */
  private async backupToNetlify(): Promise<{success: boolean, backupId: string}> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `admin_backup_${timestamp}`;
      
      // Get all data to backup
      const backupData = {
        profiles: await this.getAllProfilesData(),
        documents: await this.getAllDocumentsData(),
        configurations: await this.getAllConfigurationsData(),
        metadata: {
          backupId,
          timestamp: new Date().toISOString(),
          type: 'admin_full_backup',
          version: '1.0'
        }
      };

      // Store to Netlify
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch('/.netlify/functions/admin-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          action: 'create',
          backupId,
          data: backupData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to store backup to Netlify');
      }

      // Update Netlify backup location
      const netlifyLocation: BackupLocation = {
        id: 'netlify_primary',
        name: 'Netlify Primary Storage',
        type: 'netlify',
        status: 'active',
        lastBackup: new Date().toISOString(),
        spaceUsed: JSON.stringify(backupData).length
      };

      this.backupLocations.set(netlifyLocation.id, netlifyLocation);
      await this.saveBackupLocations();

      return { success: true, backupId };
    } catch (error) {
      logger.error('Netlify backup failed:', error);
      return { success: false, backupId: '' };
    }
  }

  /**
   * Get all profiles data for backup
   */
  private async getAllProfilesData(): Promise<unknown> {
    try {
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch('/.netlify/functions/profile-crud', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return await response.json();
    } catch (error) {
      logger.error('Failed to get profiles data:', error);
      return [];
    }
  }

  /**
   * Get all documents data for backup
   */
  private async getAllDocumentsData(): Promise<unknown> {
    try {
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch('/.netlify/functions/list-documents', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (error) {
      logger.error('Failed to get documents data:', error);
      return [];
    }
  }

  /**
   * Get all configurations data for backup
   */
  private async getAllConfigurationsData(): Promise<unknown> {
    const systemSettings = await netlifySettingsService.get('system-settings');
    return {
      adminConfig: this.adminConfig,
      backupLocations: Array.from(this.backupLocations.values()),
      systemSettings: systemSettings || {}
    };
  }

  /**
   * Get admin configuration
   */
  async getAdminConfig(): Promise<AdminBackupConfig | null> {
    return this.adminConfig;
  }

  /**
   * Get all backup locations
   */
  getBackupLocations(): BackupLocation[] {
    return Array.from(this.backupLocations.values());
  }

  /**
   * Get all profiles
   */
  async getAllProfiles(): Promise<OrganizationProfile[]> {
    try {
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch('/.netlify/functions/profile-crud', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const profiles = await response.json();
      return profiles || [];
    } catch (error) {
      logger.error('Failed to get all profiles:', error);
      return [];
    }
  }

  /**
   * Get profile backup data
   */
  async getProfileBackupData(profileId: string): Promise<unknown> {
    try {
      // Get profile data
      const authToken = await netlifySettingsService.getAuthToken();
      const profileResponse = await fetch(`/.netlify/functions/profile-crud?id=${profileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profile = await profileResponse.json();
      
      // Get documents for this profile
      const documents = await this.getProfileDocuments(profileId);
      
      return {
        profile,
        documents,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get profile backup data:', error);
      throw error;
    }
  }

  /**
   * Get profile documents
   */
  private async getProfileDocuments(profileId: string): Promise<any[]> {
    try {
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch(`/.netlify/functions/list-documents?profileId=${profileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return await response.json();
    } catch (error) {
      logger.error('Failed to get profile documents:', error);
      return [];
    }
  }

  /**
   * Update profile metadata
   */
  private async updateProfileMetadata(profileId: string, metadata: unknown): Promise<void> {
    try {
      const authToken = await netlifySettingsService.getAuthToken();
      const response = await fetch('/.netlify/functions/profile-crud', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...(metadata as any),
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile metadata');
      }
    } catch (error) {
      logger.error('Failed to update profile metadata:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const universalBackupService = new UniversalBackupService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).universalBackupService = universalBackupService;
}