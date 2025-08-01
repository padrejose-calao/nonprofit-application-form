/**
 * Google Drive Integration Service for Document Management
 * Handles authentication, file uploads, folder management, and syncing
 */

import { toast } from 'react-hot-toast';
import { logger } from '../utils/logger';

// Google Drive API configuration
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  description?: string;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  googleAccountEmail?: string;
  googleDriveFolderId?: string;
  lastSyncTime?: string;
  syncEnabled: boolean;
}

class GoogleDriveService {
  private gapi: unknown = null;
  private isInitialized = false;
  private currentProfile: OrganizationProfile | null = null;
  
  constructor() {
    this.initializeGAPI();
  }

  /**
   * Initialize Google API
   */
  private async initializeGAPI() {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGAPIScript();
      }

      await window.gapi.load('auth2', () => {});
      await window.gapi.load('client', () => {});
      
      await window.gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
      logger.debug('Google Drive API initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Drive API:', error);
      throw new Error('Google Drive integration not available');
    }
  }

  /**
   * Load Google API script dynamically
   */
  private loadGAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Set current organization profile
   */
  setCurrentProfile(profile: OrganizationProfile) {
    this.currentProfile = profile;
  }

  /**
   * Sign in to Google account
   */
  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeGAPI();
      }

      const authInstance = (this.gapi as any).auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        const profile = user.getBasicProfile();
        toast.success(`Signed in as ${profile.getEmail()}`);
        
        // Update current profile with Google account info
        if (this.currentProfile) {
          this.currentProfile.googleAccountEmail = profile.getEmail();
          this.currentProfile.syncEnabled = true;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Google Sign-in failed:', error);
      toast.error('Failed to sign in to Google Drive');
      return false;
    }
  }

  /**
   * Sign out from Google account
   */
  async signOut(): Promise<void> {
    try {
      const authInstance = (this.gapi as any).auth2.getAuthInstance();
      await authInstance.signOut();
      
      if (this.currentProfile) {
        this.currentProfile.googleAccountEmail = undefined;
        this.currentProfile.syncEnabled = false;
      }
      
      toast.success('Signed out from Google Drive');
    } catch (error) {
      logger.error('Google Sign-out failed:', error);
      toast.error('Failed to sign out from Google Drive');
    }
  }

  /**
   * Check if user is currently signed in
   */
  isSignedIn(): boolean {
    if (!this.isInitialized || !this.gapi) return false;
    const authInstance = (this.gapi as any).auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  /**
   * Get current signed-in user's email
   */
  getCurrentUserEmail(): string | null {
    if (!this.isSignedIn()) return null;
    const authInstance = (this.gapi as any).auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    return user.getBasicProfile().getEmail();
  }

  /**
   * Create organization folder in Google Drive
   */
  async createOrganizationFolder(organizationName: string): Promise<GoogleDriveFolder | null> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      const folderMetadata = {
        name: `${organizationName} - Nonprofit Profile Documents`,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Document storage for ${organizationName} nonprofit profile`
      };

      const response = await (this.gapi as any).client.drive.files.create({
        resource: folderMetadata,
        fields: 'id,name,webViewLink,createdTime'
      });

      const folder = response.result;
      
      // Update current profile with folder ID
      if (this.currentProfile) {
        this.currentProfile.googleDriveFolderId = folder.id;
      }

      toast.success(`Created Google Drive folder: ${folder.name}`);
      return folder;
    } catch (error) {
      logger.error('Failed to create Google Drive folder:', error);
      toast.error('Failed to create organization folder in Google Drive');
      return null;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    file: File, 
    fileName?: string, 
    description?: string,
    parentFolderId?: string
  ): Promise<GoogleDriveFile | null> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      // Use organization folder if no parent specified
      const folderId = parentFolderId || this.currentProfile?.googleDriveFolderId;
      
      const metadata = {
        name: fileName || file.name,
        description: description || `Document uploaded from ${this.currentProfile?.name || 'Nonprofit Profile'}`,
        parents: folderId ? [folderId] : undefined
      };

      // Create multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(this.gapi as any).auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadedFile = await response.json();
      toast.success(`Uploaded ${uploadedFile.name} to Google Drive`);
      
      return uploadedFile;
    } catch (error) {
      logger.error('Failed to upload file to Google Drive:', error);
      toast.error('Failed to upload file to Google Drive');
      return null;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      const response = await (this.gapi as any).client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return new Blob([response.body]);
    } catch (error) {
      logger.error('Failed to download file from Google Drive:', error);
      toast.error('Failed to download file from Google Drive');
      return null;
    }
  }

  /**
   * List files in organization folder
   */
  async listOrganizationFiles(): Promise<GoogleDriveFile[]> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      const folderId = this.currentProfile?.googleDriveFolderId;
      if (!folderId) {
        return [];
      }

      const response = await (this.gapi as any).client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,description)',
        orderBy: 'modifiedTime desc'
      });

      return response.result.files || [];
    } catch (error) {
      logger.error('Failed to list Google Drive files:', error);
      toast.error('Failed to list Google Drive files');
      return [];
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      await (this.gapi as any).client.drive.files.delete({
        fileId: fileId
      });

      toast.success('File deleted from Google Drive');
      return true;
    } catch (error) {
      logger.error('Failed to delete file from Google Drive:', error);
      toast.error('Failed to delete file from Google Drive');
      return false;
    }
  }

  /**
   * Sync local documents to Google Drive
   */
  async syncToGoogleDrive(localFiles: Array<{id: string, file: File, name: string, description?: string}>): Promise<void> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Must be signed in to Google Drive');
      }

      // Ensure organization folder exists
      if (!this.currentProfile?.googleDriveFolderId) {
        await this.createOrganizationFolder(this.currentProfile?.name || 'Nonprofit Profile');
      }

      const syncPromises = localFiles.map(async (localFile) => {
        try {
          const uploadedFile = await this.uploadFile(
            localFile.file,
            localFile.name,
            localFile.description
          );
          return { localId: localFile.id, googleDriveFile: uploadedFile };
        } catch (error) {
          logger.error(`Failed to sync file ${localFile.name}:`, error);
          return { localId: localFile.id, googleDriveFile: null };
        }
      });

      const results = await Promise.all(syncPromises);
      const successful = results.filter(r => r.googleDriveFile !== null);
      
      toast.success(`Synced ${successful.length} of ${localFiles.length} files to Google Drive`);
      
      // Update sync time
      if (this.currentProfile) {
        this.currentProfile.lastSyncTime = new Date().toISOString();
      }
      
    } catch (error) {
      logger.error('Failed to sync to Google Drive:', error);
      toast.error('Failed to sync documents to Google Drive');
    }
  }

  /**
   * Get organization folder link
   */
  getOrganizationFolderLink(): string | null {
    const folderId = this.currentProfile?.googleDriveFolderId;
    return folderId ? `https://drive.google.com/drive/folders/${folderId}` : null;
  }

  /**
   * Check quota usage
   */
  async getStorageQuota(): Promise<{used: number, limit: number} | null> {
    try {
      if (!this.isSignedIn()) {
        return null;
      }

      const response = await (this.gapi as any).client.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.result.storageQuota;
      return {
        used: parseInt(quota.usage || '0'),
        limit: parseInt(quota.limit || '0')
      };
    } catch (error) {
      logger.error('Failed to get storage quota:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).googleDriveService = googleDriveService;
}