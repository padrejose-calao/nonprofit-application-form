/**
 * NetlifyDocumentService - Handles document operations via Netlify
 * Replaces localStorage for document persistence
 */

import { Document } from './documentService';
import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

interface DocumentStore {
  documents: Document[];
  lastUpdated: string;
}

class NetlifyDocumentService {
  private static instance: NetlifyDocumentService;
  private documents: Document[] = [];
  private listeners: ((documents: Document[]) => void)[] = [];
  private organizationId: string = 'default-org';
  private isLoading: boolean = false;

  private constructor() {
    this.loadDocuments();
  }

  static getInstance(): NetlifyDocumentService {
    if (!NetlifyDocumentService.instance) {
      NetlifyDocumentService.instance = new NetlifyDocumentService();
    }
    return NetlifyDocumentService.instance;
  }

  setOrganizationId(organizationId: string) {
    if (this.organizationId !== organizationId) {
      this.organizationId = organizationId;
      this.loadDocuments();
    }
  }

  // Subscribe to document changes
  subscribe(listener: (documents: Document[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately notify with current documents
    listener(this.documents);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of document changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.documents));
  }

  // Load documents from Netlify
  private async loadDocuments() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const stored = await netlifySettingsService.get(`documents-${this.organizationId}`);
      if (stored && (stored as any).documents) {
        this.documents = (stored as any).documents;
        this.notifyListeners();
      }
    } catch (error) {
      logger.error('Failed to load documents:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Save documents to Netlify
  private async saveDocuments() {
    try {
      const documentStore: DocumentStore = {
        documents: this.documents,
        lastUpdated: new Date().toISOString()
      };
      
      await netlifySettingsService.set(
        `documents-${this.organizationId}`,
        documentStore,
        'organization'
      );
    } catch (error) {
      logger.error('Failed to save documents:', error);
      throw error;
    }
  }

  // Get all documents
  getDocuments(): Document[] {
    return [...this.documents];
  }

  // Get documents by category
  getDocumentsByCategory(category: string): Document[] {
    return this.documents.filter(doc => doc.category === category);
  }

  // Get document by ID
  getDocument(id: string): Document | null {
    return this.documents.find(doc => doc.id === id) || null;
  }

  // Upload document
  async uploadDocument(file: File, metadata: Partial<Document> = {}): Promise<Document> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', this.organizationId);
      formData.append('metadata', JSON.stringify(metadata));

      // Upload to Netlify function
      const response = await fetch('/.netlify/functions/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Create document record
      const document: Document = {
        id: result.id,
        name: metadata.name || file.name,
        type: file.type,
        category: metadata.category || 'general',
        file: null, // Don't store file locally
        url: result.url,
        uploadedAt: new Date().toISOString(),
        uploadedBy: metadata.uploadedBy || 'Unknown',
        version: metadata.version || 1,
        status: metadata.status || 'draft',
        tags: metadata.tags || [],
        description: metadata.description || '',
        size: file.size,
        metadata: metadata.metadata,
        aiExtractedContent: metadata.aiExtractedContent,
      };

      // Add to documents array
      this.documents.push(document);
      
      // Save and notify
      await this.saveDocuments();
      this.notifyListeners();

      return document;
    } catch (error) {
      logger.error('Document upload failed:', error);
      throw error;
    }
  }

  // Update document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    const index = this.documents.findIndex(doc => doc.id === id);
    
    if (index === -1) {
      return null;
    }

    // Update document
    this.documents[index] = {
      ...this.documents[index],
      ...updates,
      id, // Ensure ID doesn't change
    };

    // Save and notify
    await this.saveDocuments();
    this.notifyListeners();

    return this.documents[index];
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    
    if (index === -1) {
      return false;
    }

    const document = this.documents[index];

    // Delete from Netlify storage if URL exists
    if (document.url) {
      try {
        await fetch(`/.netlify/functions/delete-document?id=${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        logger.error('Failed to delete document from storage:', error);
      }
    }

    // Remove from array
    this.documents.splice(index, 1);

    // Save and notify
    await this.saveDocuments();
    this.notifyListeners();

    return true;
  }

  // Search documents
  searchDocuments(query: string): Document[] {
    const lowerQuery = query.toLowerCase();
    
    return this.documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get document statistics
  getStatistics() {
    const total = this.documents.length;
    const byCategory = this.documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = this.documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSize = this.documents.reduce((sum, doc) => sum + doc.size, 0);

    return {
      total,
      byCategory,
      byStatus,
      totalSize,
    };
  }

  // Export documents
  async exportDocuments(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(this.documents, null, 2);
    }

    // CSV export
    const headers = ['ID', 'Name', 'Category', 'Status', 'Uploaded At', 'Uploaded By', 'Size', 'Tags'];
    const rows = this.documents.map(doc => [
      doc.id,
      doc.name,
      doc.category,
      doc.status,
      doc.uploadedAt,
      doc.uploadedBy,
      doc.size.toString(),
      doc.tags.join(';'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  // Import documents
  async importDocuments(data: string, format: 'json' | 'csv' = 'json'): Promise<number> {
    try {
      let imported: Document[] = [];

      if (format === 'json') {
        imported = JSON.parse(data);
      } else {
        // CSV parsing would go here
        throw new Error('CSV import not implemented');
      }

      // Validate and add documents
      let count = 0;
      for (const doc of imported) {
        if (doc.id && doc.name && doc.category) {
          // Check if document already exists
          if (!this.documents.find(d => d.id === doc.id)) {
            this.documents.push(doc);
            count++;
          }
        }
      }

      if (count > 0) {
        await this.saveDocuments();
        this.notifyListeners();
      }

      return count;
    } catch (error) {
      logger.error('Import failed:', error);
      throw error;
    }
  }
}

export const netlifyDocumentService = NetlifyDocumentService.getInstance();