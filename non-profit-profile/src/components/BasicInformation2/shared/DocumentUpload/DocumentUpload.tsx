import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, X, Trash2, Download } from 'lucide-react';
import { logger } from '../../../../utils/logger';

interface DocumentUploadProps {
  fieldId: string;
  sectionId: string;
  acceptedFormats: string[];
  onUpload: (documentId: string) => void;
  currentDocId?: string;
  maxSize?: number; // in MB
  organizationId?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  fieldId,
  sectionId,
  acceptedFormats,
  onUpload,
  currentDocId,
  maxSize = 10,
  organizationId = 'default'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    name: string;
    size: number;
    uploadDate: string;
  } | null>(null);

  // Fetch document info if currentDocId exists
  useEffect(() => {
    if (currentDocId) {
      fetchDocumentInfo(currentDocId);
    }
  }, [currentDocId]);

  const fetchDocumentInfo = async (docId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/upload-document?documentId=${docId}`);
      if (response.ok) {
        const metadata = await response.json();
        setDocumentInfo({
          name: metadata.originalName,
          size: metadata.size,
          uploadDate: metadata.uploadDate
        });
      }
    } catch (error) {
      logger.error('Failed to fetch document info:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      setUploadError(`Please upload a file in one of these formats: ${acceptedFormats.join(', ')}`);
      toast.error(`Invalid file format. Accepted: ${acceptedFormats.join(', ')}`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);
      formData.append('sectionId', sectionId);
      formData.append('fieldId', fieldId);
      formData.append('description', `Document for ${sectionId} - ${fieldId}`);

      // Upload to Netlify Function
      const response = await fetch('/.netlify/functions/upload-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      const document = result.document;

      setDocumentInfo({
        name: document.originalName,
        size: document.size,
        uploadDate: document.uploadDate
      });

      // Also save to local documentService for immediate access
      const { documentService } = await import('../../../../services/documentService');
      await documentService.uploadDocument(file, {
        id: document.id,
        name: document.originalName,
        category: sectionId,
        description: document.description,
        metadata: {
          fieldId,
          sectionId,
          netlifyId: document.id,
          publicUrl: document.publicUrl
        }
      });

      onUpload(document.id);
      toast.success(`Document uploaded successfully`);
    } catch (error) {
      logger.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentDocId) return;

    try {
      // Delete from Netlify
      const response = await fetch('/.netlify/functions/upload-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentId: currentDocId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Also remove from local documentService
      const { documentService } = await import('../../../../services/documentService');
      await documentService.deleteDocument(currentDocId);

      setDocumentInfo(null);
      onUpload('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Document removed successfully');
    } catch (error) {
      logger.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  const handleDownload = () => {
    if (currentDocId) {
      window.open(`/.netlify/functions/upload-document?documentId=${currentDocId}`, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          className="hidden"
          id={`upload-${fieldId}`}
          disabled={uploading}
        />
        
        {!documentInfo && !currentDocId ? (
          <label
            htmlFor={`upload-${fieldId}`}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </>
            )}
          </label>
        ) : (
          <div className="flex items-center space-x-3 w-full">
            <div className="flex-1 flex items-center space-x-3 px-4 py-2 bg-green-50 border border-green-200 rounded-md">
              <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {documentInfo?.name || 'Document uploaded'}
                </p>
                {documentInfo && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(documentInfo.size)} • {formatDate(documentInfo.uploadDate)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleDownload}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Download document"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRemove}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-start space-x-2">
          <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {!documentInfo && !currentDocId && (
        <p className="text-xs text-gray-500">
          Accepted formats: {acceptedFormats.join(', ')} (max {maxSize}MB)
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;