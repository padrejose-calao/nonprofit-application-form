import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, File, FileText, Image, Video, Download, 
  Eye, Trash2, Edit2, Check, X, Plus, Search,
  RefreshCw, AlertCircle, CheckCircle, Clock,
  Paperclip, Tag, Calendar, User, Settings,
  Copy, Share, Lock, Unlock, Star, Flag
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';
import { formatRelativeTime } from '../hooks/useAutoSave';

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadDate: Date;
  lastModified: Date;
  uploadedBy: string;
  category: string;
  tags: string[];
  description?: string;
  version: number;
  isPublic: boolean;
  expiryDate?: Date;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
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

interface DocumentUploadFieldProps {
  label: string;
  value: DocumentInfo | DocumentInfo[] | null;
  onChange: (value: DocumentInfo | DocumentInfo[] | null) => void;
  multiple?: boolean;
  required?: boolean;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  category?: string;
  allowedTypes?: string[];
  showPreview?: boolean;
  enableVersioning?: boolean;
  enableApproval?: boolean;
  enableAIExtraction?: boolean;
  autoUpload?: boolean;
  permissions?: {
    canUpload?: boolean;
    canDelete?: boolean;
    canEdit?: boolean;
    canView?: boolean;
    canDownload?: boolean;
    canShare?: boolean;
  };
  onUpload?: (files: File[]) => Promise<DocumentInfo[]>;
  onDelete?: (documentId: string) => Promise<void>;
  onEdit?: (document: DocumentInfo) => void;
  onView?: (document: DocumentInfo) => void;
  onDownload?: (document: DocumentInfo) => void;
  onShare?: (document: DocumentInfo) => void;
  onAIExtract?: (document: DocumentInfo) => Promise<{ text: string; entities: any[]; summary: string }>;
  placeholder?: string;
  helpText?: string;
  showTags?: boolean;
  showMetadata?: boolean;
  enableDragDrop?: boolean;
  showUploadProgress?: boolean;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  label,
  value,
  onChange,
  multiple = false,
  required = false,
  className = '',
  accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov',
  maxSize = 10, // 10MB default
  maxFiles = 5,
  category = 'general',
  allowedTypes = [],
  showPreview = true,
  enableVersioning = true,
  enableApproval = false,
  enableAIExtraction = true,
  autoUpload = true,
  permissions = {
    canUpload: true,
    canDelete: true,
    canEdit: true,
    canView: true,
    canDownload: true,
    canShare: true
  },
  onUpload,
  onDelete,
  onEdit,
  onView,
  onDownload,
  onShare,
  onAIExtract,
  placeholder = 'Upload documents or drag and drop here',
  helpText,
  showTags = true,
  showMetadata = true,
  enableDragDrop = true,
  showUploadProgress = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const [showDocumentActions, setShowDocumentActions] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentInfo | null>(null);
  const [newTags, setNewTags] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiProcessing, setAiProcessing] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Get documents array
  const documents = multiple ? (value as DocumentInfo[]) || [] : value ? [value as DocumentInfo] : [];

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())) || false
  );

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !permissions.canUpload) return;

    const fileArray = Array.from(files);
    
    // Validate file count
    if (multiple && maxFiles && documents.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      // Check file type
      if (allowedTypes.length > 0) {
        const fileType = file.type;
        const isValidType = allowedTypes.some(type => 
          fileType.includes(type) || file.name.toLowerCase().endsWith(type)
        );
        if (!isValidType) {
          toast.error(`File type ${fileType} not allowed for ${file.name}`);
          return false;
        }
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    if (autoUpload) {
      handleUpload(validFiles);
    } else {
      // Add files to pending upload state
      const pendingDocs = validFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
        lastModified: new Date(),
        uploadedBy: 'Current User',
        category,
        tags: [],
        version: 1,
        isPublic: false,
        approvalStatus: 'pending' as const
      }));

      if (multiple) {
        onChange([...documents, ...pendingDocs]);
      } else {
        onChange(pendingDocs[0]);
      }
    }
  };

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    if (!permissions.canUpload) return;

    setIsUploading(true);
    
    try {
      let uploadedDocs: DocumentInfo[];
      
      if (onUpload) {
        uploadedDocs = await onUpload(files);
      } else {
        // Default upload simulation
        uploadedDocs = files.map(file => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadDate: new Date(),
          lastModified: new Date(),
          uploadedBy: 'Current User',
          category,
          tags: [],
          version: 1,
          isPublic: false,
          approvalStatus: enableApproval ? 'pending' : 'approved'
        }));
      }

      // Update value
      if (multiple) {
        onChange([...documents, ...uploadedDocs]);
      } else {
        onChange(uploadedDocs[0]);
      }

      // Extract AI content if enabled
      if (enableAIExtraction) {
        uploadedDocs.forEach(doc => {
          if (doc.type?.includes('text') || doc.type?.includes('pdf')) {
            handleAIExtraction(doc);
          }
        });
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle AI content extraction
  const handleAIExtraction = async (document: DocumentInfo) => {
    if (!enableAIExtraction || !onAIExtract) return;

    setAiProcessing(prev => ({ ...prev, [document.id]: true }));
    
    try {
      const extractedContent = await onAIExtract(document);
      
      // Update document with extracted content
      const updatedDocument = {
        ...document,
        aiExtractedContent: extractedContent
      };

      if (multiple) {
        const updatedDocs = documents.map(doc => 
          doc.id === document.id ? updatedDocument : doc
        );
        onChange(updatedDocs);
      } else {
        onChange(updatedDocument);
      }

      toast.success('AI content extraction completed');
    } catch (error) {
      toast.error('AI extraction failed');
    } finally {
      setAiProcessing(prev => ({ ...prev, [document.id]: false }));
    }
  };

  // Handle document deletion
  const handleDelete = async (document: DocumentInfo) => {
    if (!permissions.canDelete) return;

    const confirmed = await confirm({
      title: 'Delete Document',
      message: `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (onDelete) {
            await onDelete(document.id);
          }

          if (multiple) {
            onChange(documents.filter(doc => doc.id !== document.id));
          } else {
            onChange(null);
          }

          toast.success('Document deleted successfully');
        } catch (error) {
          toast.error('Failed to delete document');
        }
      }
    });
  };

  // Handle document editing
  const handleEdit = (document: DocumentInfo) => {
    if (!permissions.canEdit) return;
    
    setEditingDocument(document);
    setNewTags(document.tags.join(', '));
  };

  // Save document edits
  const handleSaveEdit = () => {
    if (!editingDocument) return;

    const updatedDocument = {
      ...editingDocument,
      tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      lastModified: new Date()
    };

    if (multiple) {
      const updatedDocs = documents.map(doc => 
        doc.id === editingDocument.id ? updatedDocument : doc
      );
      onChange(updatedDocs);
    } else {
      onChange(updatedDocument);
    }

    setEditingDocument(null);
    setNewTags('');
    toast.success('Document updated successfully');

    if (onEdit) {
      onEdit(updatedDocument);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (enableDragDrop) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [enableDragDrop]);

  // Get file type icon
  const getFileTypeIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-5 h-5" />;
    if (type.includes('video')) return <Video className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`document-upload-field ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {multiple && maxFiles && (
          <span className="text-xs text-gray-500">
            {documents.length} / {maxFiles} files
          </span>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <p className="text-sm text-gray-600 mb-3">{helpText}</p>
      )}

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Upload Area */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {isUploading ? (
          <div className="space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-500">
              {accept} files up to {maxSize}MB
            </p>
            
            {permissions.canUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document List */}
      {filteredDocuments.length > 0 && (
        <div className="mt-4 space-y-3">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                {/* File Icon */}
                <div className="text-gray-500">
                  {getFileTypeIcon(document.type)}
                </div>
                
                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </h3>
                    
                    {/* Status Indicators */}
                    {document.approvalStatus === 'pending' && (
                      <div title="Pending approval">
                        <Clock className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    {document.approvalStatus === 'approved' && (
                      <div title="Approved">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    {document.approvalStatus === 'rejected' && (
                      <div title="Rejected">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    
                    {aiProcessing[document.id] && (
                      <div title="Processing AI extraction">
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(document.size)}</span>
                    <span>Uploaded {formatRelativeTime(document.uploadDate)}</span>
                    <span>by {document.uploadedBy}</span>
                    {enableVersioning && (
                      <span>v{document.version}</span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {showTags && document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-xs text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Extracted Content Preview */}
                  {document.aiExtractedContent?.summary && (
                    <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
                      <p className="text-xs text-gray-600 font-medium">AI Summary:</p>
                      <p className="text-xs text-gray-700 mt-1">{document.aiExtractedContent.summary}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1">
                {permissions.canView && (
                  <button
                    onClick={() => onView?.(document)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                
                {permissions.canDownload && (
                  <button
                    onClick={() => onDownload?.(document)}
                    className="p-1 text-gray-500 hover:text-green-600 rounded"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                
                {permissions.canEdit && (
                  <button
                    onClick={() => handleEdit(document)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded"
                    title="Edit document"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                
                {permissions.canShare && (
                  <button
                    onClick={() => onShare?.(document)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded"
                    title="Share document"
                  >
                    <Share className="w-4 h-4" />
                  </button>
                )}
                
                {permissions.canDelete && (
                  <button
                    onClick={() => handleDelete(document)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={editingDocument.name}
                  onChange={(e) => setEditingDocument({
                    ...editingDocument,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingDocument.description || ''}
                  onChange={(e) => setEditingDocument({
                    ...editingDocument,
                    description: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              {showTags && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingDocument(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default DocumentUploadField;