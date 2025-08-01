import { toast } from 'react-toastify';

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file: File | null;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
  description: string;
  size: number;
  metadata?: Record<string, any>;
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

// Document Service for managing document state and operations
class DocumentService {
  private documents: Document[] = [];
  private listeners: ((documents: Document[]) => void)[] = [];
  private static instance: DocumentService;

  private constructor() {
    // Load documents from localStorage on initialization
    this.loadDocuments();
  }

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  // Subscribe to document changes
  subscribe(listener: (documents: Document[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of document changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.documents));
    this.saveDocuments();
  }

  // Load documents from localStorage
  private loadDocuments() {
    try {
      const stored = localStorage.getItem('nonprofit-documents');
      if (stored) {
        this.documents = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }

  // Save documents to localStorage
  private saveDocuments() {
    try {
      localStorage.setItem('nonprofit-documents', JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save documents:', error);
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
      // Create document object
      const document: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: metadata.name || file.name,
        type: metadata.type || file.type || 'unknown',
        category: metadata.category || 'general',
        file,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: metadata.uploadedBy || 'Current User',
        version: 1,
        status: metadata.status || 'draft',
        tags: metadata.tags || [],
        description: metadata.description || '',
        size: file.size,
        metadata: metadata.metadata || {}
      };

      // Add to documents
      this.documents.push(document);
      this.notifyListeners();

      toast.success(`Document "${document.name}" uploaded successfully`);
      return document;
    } catch (error) {
      toast.error('Failed to upload document');
      throw error;
    }
  }

  // Update document
  updateDocument(id: string, updates: Partial<Document>): Document | null {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return null;

    const updatedDocument = {
      ...this.documents[index],
      ...updates,
      version: this.documents[index].version + 1,
      uploadedAt: new Date().toISOString()
    };

    this.documents[index] = updatedDocument;
    this.notifyListeners();

    toast.success(`Document "${updatedDocument.name}" updated`);
    return updatedDocument;
  }

  // Delete document
  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    const document = this.documents[index];
    this.documents.splice(index, 1);
    this.notifyListeners();

    toast.success(`Document "${document.name}" deleted`);
    return true;
  }

  // Add tag to document
  async addTag(id: string, tag: string): Promise<Document | null> {
    const document = this.getDocument(id);
    if (!document) return null;

    if (!document.tags?.includes(tag)) {
      return await this.updateDocument(id, {
        tags: [...(document.tags || []), tag]
      });
    }
    return document;
  }

  // Remove tag from document
  async removeTag(id: string, tag: string): Promise<Document | null> {
    const document = this.getDocument(id);
    if (!document) return null;

    return await this.updateDocument(id, {
      tags: document.tags.filter(t => t !== tag)
    });
  }

  // Search documents
  searchDocuments(query: string): Document[] {
    const lowerQuery = query.toLowerCase();
    return this.documents.filter(doc =>
      (doc.name || '').toLowerCase().includes(lowerQuery) ||
      (doc.description || '').toLowerCase().includes(lowerQuery) ||
      (doc.tags || []).some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)) ||
      (doc.category || '').toLowerCase().includes(lowerQuery)
    );
  }

  // Get documents by status
  getDocumentsByStatus(status: Document['status']): Document[] {
    return this.documents.filter(doc => doc.status === status);
  }

  // Approve document
  async approveDocument(id: string): Promise<Document | null> {
    return await this.updateDocument(id, { status: 'approved' });
  }

  // Archive document
  async archiveDocument(id: string): Promise<Document | null> {
    return await this.updateDocument(id, { status: 'archived' });
  }

  // Extract content with AI (mock implementation)
  async extractContent(id: string): Promise<Document | null> {
    const document = this.getDocument(id);
    if (!document) return null;

    // Simulate AI extraction
    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiContent = {
      text: `Extracted text content from ${document.name}...`,
      entities: [
        { type: 'organization', value: 'Example Nonprofit', confidence: 0.95 },
        { type: 'date', value: '2024-01-15', confidence: 0.89 },
        { type: 'amount', value: '$50,000', confidence: 0.92 }
      ],
      summary: `This document contains information about ${document.category}. Key details have been extracted.`
    };

    return await this.updateDocument(id, {
      aiExtractedContent: aiContent
    });
  }
}

// Export singleton instance
export const documentService = DocumentService.getInstance();