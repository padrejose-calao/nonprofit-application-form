/**
 * Enhanced Document Service with Netlify Storage + Google Drive Backup
 * Combines local document management with cloud storage and Google Drive sync
 */

import { toast } from 'react-hot-toast';
import { googleDriveService, OrganizationProfile } from './googleDriveService';
import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

export interface EnhancedDocument {
  id: string;
  name: string;
  originalName: string;
  type: string;
  category: string;
  sectionId: string;
  fieldId?: string;
  file?: File;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
  description: string;
  metadata?: Record<string, unknown>;
  
  // Storage locations
  netlifyUrl?: string;
  googleDriveFileId?: string;
  googleDriveUrl?: string;
  localObjectUrl?: string;
  
  // Sync status
  syncStatus: 'local_only' | 'netlify_only' | 'synced' | 'sync_pending' | 'sync_failed';
  lastSyncTime?: string;
  syncError?: string;
  
  // AI extracted content
  aiExtractedContent?: {
    text?: string;
    entities?: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    summary?: string;
  };
}

export interface DocumentUploadOptions {
  organizationId: string;
  sectionId: string;
  fieldId?: string;
  description?: string;
  category?: string;
  autoSync?: boolean;
  metadata?: Record<string, unknown>;
}

class EnhancedDocumentService {
  private documents: Map<string, EnhancedDocument> = new Map();
  private listeners: ((documents: EnhancedDocument[]) => void)[] = [];
  private currentProfile: OrganizationProfile | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Load documents from Netlify
    await this.loadDocuments();
    
    // Set up online/offline listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingDocuments();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Set current organization profile
   */
  setCurrentProfile(profile: OrganizationProfile) {
    this.currentProfile = profile;
    googleDriveService.setCurrentProfile(profile);
  }

  /**
   * Subscribe to document changes
   */
  subscribe(listener: (documents: EnhancedDocument[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of document changes
   */
  private async notifyListeners() {
    const docs = Array.from(this.documents.values());
    this.listeners.forEach(listener => listener(docs));
    await this.saveDocuments();
  }

  /**
   * Load documents from Netlify
   */
  private async loadDocuments() {
    try {
      const stored = await netlifySettingsService.get('enhanced-nonprofit-documents');
      if (stored && Array.isArray(stored)) {
        this.documents = new Map(stored.map((doc: EnhancedDocument) => [doc.id, doc]));
      }
    } catch (error) {
      logger.error('Failed to load documents:', error);
    }
  }

  /**
   * Save documents to Netlify
   */
  private async saveDocuments() {
    try {
      const docArray = Array.from(this.documents.values());
      await netlifySettingsService.set('enhanced-nonprofit-documents', docArray, 'organization');
    } catch (error) {
      logger.error('Failed to save documents:', error);
    }
  }

  /**
   * Upload document with multi-tier storage
   */
  async uploadDocument(
    file: File,
    options: DocumentUploadOptions
  ): Promise<EnhancedDocument> {
    const documentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create initial document object
    const document: EnhancedDocument = {
      id: documentId,
      name: file.name,
      originalName: file.name,
      type: file.type,
      category: options.category || 'general',
      sectionId: options.sectionId,
      fieldId: options.fieldId,
      file,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      version: 1,
      status: 'draft',
      tags: [],
      description: options.description || '',
      metadata: options.metadata || {},
      localObjectUrl: URL.createObjectURL(file),
      syncStatus: 'local_only'
    };

    // Store locally first
    this.documents.set(documentId, document);
    await this.notifyListeners();

    // Upload to Netlify if online
    if (this.isOnline) {
      try {
        await this.uploadToNetlify(document, options);
      } catch (error) {
        logger.error('Netlify upload failed:', error);
        document.syncStatus = 'sync_failed';
        document.syncError = 'Failed to upload to Netlify';
      }
    } else {
      document.syncStatus = 'sync_pending';
    }

    // Backup to Google Drive if enabled and auto-sync is on
    if (options.autoSync !== false && this.currentProfile?.syncEnabled) {
      try {
        await this.uploadToGoogleDrive(document);
      } catch (error) {
        logger.error('Google Drive upload failed:', error);
        // Don't change sync status for Google Drive failures
      }
    }

    await this.notifyListeners();
    toast.success(`Document "${file.name}" uploaded successfully`);
    return document;
  }

  /**
   * Upload to Netlify storage
   */
  private async uploadToNetlify(
    document: EnhancedDocument,
    options: DocumentUploadOptions
  ): Promise<void> {
    if (!document.file) {
      throw new Error('No file to upload');
    }

    const formData = new FormData();
    formData.append('file', document.file);
    formData.append('organizationId', options.organizationId);
    formData.append('sectionId', options.sectionId);
    if (options.fieldId) formData.append('fieldId', options.fieldId);
    if (options.description) formData.append('description', options.description);

    const response = await fetch('/.netlify/functions/upload-document', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    
    // Update document with Netlify info
    document.netlifyUrl = result.document.publicUrl;
    document.syncStatus = document.googleDriveFileId ? 'synced' : 'netlify_only';
    document.lastSyncTime = new Date().toISOString();
    delete document.syncError;
  }

  /**
   * Upload to Google Drive
   */
  private async uploadToGoogleDrive(document: EnhancedDocument): Promise<void> {
    if (!document.file) {
      throw new Error('No file to upload');
    }

    const googleFile = await googleDriveService.uploadFile(
      document.file,
      document.name,
      document.description
    );

    if (googleFile) {
      document.googleDriveFileId = googleFile.id;
      document.googleDriveUrl = googleFile.webViewLink;
      document.syncStatus = document.netlifyUrl ? 'synced' : 'local_only';
      document.lastSyncTime = new Date().toISOString();
    }
  }

  /**
   * Sync pending documents when coming back online
   */
  private async syncPendingDocuments(): Promise<void> {
    const pendingDocs = Array.from(this.documents.values()).filter(
      doc => doc.syncStatus === 'sync_pending' || doc.syncStatus === 'sync_failed'
    );

    if (pendingDocs.length === 0) return;

    toast.loading(`Syncing ${pendingDocs.length} pending documents...`);

    for (const doc of pendingDocs) {
      try {
        if (!doc.netlifyUrl && this.currentProfile) {
          await this.uploadToNetlify(doc, {
            organizationId: this.currentProfile.id,
            sectionId: doc.sectionId,
            fieldId: doc.fieldId,
            description: doc.description
          });
        }
      } catch (error) {
        logger.error(`Failed to sync document ${doc.id}:`, error);
      }
    }

    await this.notifyListeners();
    toast.dismiss();
    toast.success('Documents synced successfully');
  }

  /**
   * Get all documents
   */
  getDocuments(): EnhancedDocument[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category: string): EnhancedDocument[] {
    return this.getDocuments().filter(doc => doc.category === category);
  }

  /**
   * Get documents by section
   */
  getDocumentsBySection(sectionId: string): EnhancedDocument[] {
    return this.getDocuments().filter(doc => doc.sectionId === sectionId);
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): EnhancedDocument | null {
    return this.documents.get(id) || null;
  }

  /**
   * Delete document from all storage locations
   */
  async deleteDocument(id: string): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document) return false;

    try {
      // Delete from Netlify if exists
      if (document.netlifyUrl && this.currentProfile) {
        try {
          const response = await fetch(
            `/.netlify/functions/delete-document?documentId=${id}&organizationId=${this.currentProfile.id}`,
            { method: 'DELETE' }
          );
          if (!response.ok) {
            logger.warn('Failed to delete from Netlify');
          }
        } catch (error) {
          logger.warn('Failed to delete from Netlify:', error as any);
        }
      }

      // Delete from Google Drive if exists
      if (document.googleDriveFileId) {
        try {
          await googleDriveService.deleteFile(document.googleDriveFileId);
        } catch (error) {
          logger.warn('Failed to delete from Google Drive:', error as any);
        }
      }

      // Clean up local object URL
      if (document.localObjectUrl) {
        URL.revokeObjectURL(document.localObjectUrl);
      }

      // Remove from local storage
      this.documents.delete(id);
      await this.notifyListeners();

      toast.success(`Document "${document.name}" deleted successfully`);
      return true;
    } catch (error) {
      logger.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  }

  /**
   * Sync all documents to Google Drive
   */
  async syncAllToGoogleDrive(): Promise<void> {
    if (!googleDriveService.isSignedIn()) {
      toast.error('Please sign in to Google Drive first');
      return;
    }

    const localDocs = this.getDocuments().filter(doc => 
      doc.file && !doc.googleDriveFileId
    );

    if (localDocs.length === 0) {
      toast.success('All documents are already synced');
      return;
    }

    const localFiles = localDocs
      .filter(doc => doc.file)
      .map(doc => ({
        id: doc.id,
        file: doc.file!,
        name: doc.name,
        description: doc.description
      }));

    if (localFiles.length > 0) {
      await googleDriveService.syncToGoogleDrive(localFiles);
    }
    
    // Update document sync status
    for (const doc of localDocs) {
      doc.syncStatus = doc.netlifyUrl ? 'synced' : 'local_only';
      doc.lastSyncTime = new Date().toISOString();
    }
    
    await this.notifyListeners();
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalDocuments: number;
    totalSize: number;
    syncedCount: number;
    pendingCount: number;
    failedCount: number;
  } {
    const docs = this.getDocuments();
    return {
      totalDocuments: docs.length,
      totalSize: docs.reduce((sum, doc) => sum + doc.size, 0),
      syncedCount: docs.filter(doc => doc.syncStatus === 'synced').length,
      pendingCount: docs.filter(doc => doc.syncStatus === 'sync_pending').length,
      failedCount: docs.filter(doc => doc.syncStatus === 'sync_failed').length
    };
  }

  /**
   * Search documents
   */
  searchDocuments(query: string): EnhancedDocument[] {
    const lowerQuery = query.toLowerCase();
    return this.getDocuments().filter(doc =>
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.category.toLowerCase().includes(lowerQuery) ||
      doc.sectionId.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, updates: Partial<EnhancedDocument>): Promise<EnhancedDocument | null> {
    const document = this.documents.get(id);
    if (!document) return null;

    const updatedDocument = {
      ...document,
      ...updates,
      version: document.version + 1,
      uploadedAt: new Date().toISOString()
    };

    this.documents.set(id, updatedDocument);
    await this.notifyListeners();

    toast.success(`Document "${updatedDocument.name}" updated`);
    return updatedDocument;
  }
}

// Export singleton instance
export const enhancedDocumentService = new EnhancedDocumentService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).enhancedDocumentService = enhancedDocumentService;
}