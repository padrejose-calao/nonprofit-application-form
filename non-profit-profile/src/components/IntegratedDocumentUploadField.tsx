import React, { useState, useEffect } from 'react';
import { documentService, Document } from '../services/documentService';
import DocumentUploadField from './DocumentUploadField';
import { toast } from 'react-toastify';

interface IntegratedDocumentUploadFieldProps {
  label: string;
  category: string;
  value?: string | string[]; // Document IDs
  onChange?: (documentIds: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
  accept?: string;
  maxSize?: number;
  showDocumentManager?: boolean;
  onDocumentManagerOpen?: () => void;
}

const IntegratedDocumentUploadField: React.FC<IntegratedDocumentUploadFieldProps> = ({
  label,
  category,
  value,
  onChange,
  multiple = false,
  required = false,
  className = '',
  helpText,
  accept,
  maxSize,
  showDocumentManager = true,
  onDocumentManagerOpen
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

  // Subscribe to document service
  useEffect(() => {
    const unsubscribe = documentService.subscribe((docs) => {
      setDocuments(docs);
    });

    // Initial load
    setDocuments(documentService.getDocuments());

    return unsubscribe;
  }, []);

  // Update selected documents when value changes
  useEffect(() => {
    if (value) {
      const ids = Array.isArray(value) ? value : [value];
      const docs = ids.map(id => {
        const doc = documentService.getDocument(id);
        if (doc) {
          return {
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            url: doc.url || '',
            uploadDate: new Date(doc.uploadedAt),
            lastModified: new Date(doc.uploadedAt),
            uploadedBy: doc.uploadedBy,
            category: doc.category,
            tags: doc.tags,
            description: doc.description,
            version: doc.version,
            isPublic: false,
            metadata: doc.metadata,
            aiExtractedContent: doc.aiExtractedContent
          };
        }
        return null;
      }).filter(Boolean);
      
      setSelectedDocs(multiple ? docs : docs[0] ? [docs[0]] : []);
    } else {
      setSelectedDocs([]);
    }
  }, [value, documents, multiple]);

  // Handle document upload
  const handleUpload = async (files: File[]): Promise<any[]> => {
    try {
      const uploadedDocs = await Promise.all(
        files.map(file => documentService.uploadDocument(file, { category }))
      );

      const docIds = uploadedDocs.map(doc => doc.id);
      const newValue = multiple 
        ? [...(Array.isArray(value) ? value : []), ...docIds]
        : docIds[0];
      
      onChange?.(newValue);

      return uploadedDocs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        url: doc.url || '',
        uploadDate: new Date(doc.uploadedAt),
        lastModified: new Date(doc.uploadedAt),
        uploadedBy: doc.uploadedBy,
        category: doc.category,
        tags: doc.tags,
        description: doc.description,
        version: doc.version,
        isPublic: false,
        metadata: doc.metadata
      }));
    } catch (error) {
      toast.error('Failed to upload documents');
      throw error;
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      const success = documentService.deleteDocument(documentId);
      if (success) {
        if (multiple) {
          const newValue = (Array.isArray(value) ? value : []).filter(id => id !== documentId);
          onChange?.(newValue);
        } else {
          onChange?.('');
        }
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  // Handle document view
  const handleView = (document: any) => {
    const doc = documentService.getDocument(document.id);
    if (doc?.url) {
      window.open(doc.url, '_blank');
    }
  };

  // Handle AI extraction
  const handleAIExtract = async (document: any) => {
    try {
      const result = await documentService.extractContent(document.id);
      if (result?.aiExtractedContent) {
        return {
          text: result.aiExtractedContent.text || '',
          entities: result.aiExtractedContent.entities || [],
          summary: result.aiExtractedContent.summary || ''
        };
      }
      throw new Error('Failed to extract content');
    } catch (error) {
      toast.error('Failed to extract document content');
      throw error;
    }
  };

  return (
    <div className={className}>
      <DocumentUploadField
        label={label}
        value={selectedDocs}
        onChange={(docs) => {
          // This is handled by onUpload
        }}
        multiple={multiple}
        required={required}
        accept={accept}
        maxSize={maxSize}
        category={category}
        showPreview={true}
        enableVersioning={true}
        enableAIExtraction={true}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onView={handleView}
        onAIExtract={handleAIExtract}
        helpText={helpText}
        showTags={true}
        enableDragDrop={true}
      />
      
      {showDocumentManager && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onDocumentManagerOpen}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Browse existing documents in Document Manager
          </button>
        </div>
      )}
    </div>
  );
};

export default IntegratedDocumentUploadField;