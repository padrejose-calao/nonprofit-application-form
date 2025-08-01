/**
 * Attestation Memo Workflow System
 * Enhanced document upload with attestation workflow features
 */

import React, { useState, useRef } from 'react';
import { logger } from '../../../../utils/logger';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Edit,
  Trash2,
  Clock,
  Shield,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useOrganization } from '../../../../contexts/OrganizationContext';

export interface AttestationDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  documentType: 'attestation' | 'memo' | 'certificate' | 'supporting';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  attestationLevel: 'self' | 'witness' | 'notarized' | 'certified';
  reviewers: Array<{
    name: string;
    email: string;
    role: string;
    reviewDate?: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
  }>;
  workflow: {
    requiresNotarization: boolean;
    requiresWitnessSignature: boolean;
    requiresMultipleReviewers: boolean;
    expirationDate?: string;
    renewalRequired: boolean;
  };
  metadata: {
    attestedBy: string;
    attestationDate: string;
    witnessName?: string;
    notaryName?: string;
    notaryCommission?: string;
    legalDescription: string;
    tags: string[];
  };
}

interface AttestationMemoUploadProps {
  fieldId: string;
  sectionId: string;
  documentType: 'attestation' | 'memo' | 'certificate' | 'supporting';
  attestationLevel: 'self' | 'witness' | 'notarized' | 'certified';
  onUpload: (documentId: string) => void;
  currentDocId?: string;
  requiresWorkflow?: boolean;
  maxSize?: number;
  allowedFormats?: string[];
}

const AttestationMemoUpload: React.FC<AttestationMemoUploadProps> = ({
  fieldId,
  sectionId,
  documentType = 'attestation',
  attestationLevel = 'self',
  onUpload,
  currentDocId,
  requiresWorkflow = true,
  maxSize = 10,
  allowedFormats = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<AttestationDocument | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAttestationForm, setShowAttestationForm] = useState(false);
  
  const { organizationId, organizationEIN } = useOrganization();
  
  // Attestation form state
  const [attestationData, setAttestationData] = useState({
    attestedBy: '',
    attestationDate: new Date().toISOString().split('T')[0],
    witnessName: '',
    notaryName: '',
    notaryCommission: '',
    legalDescription: '',
    requiresNotarization: false,
    requiresWitnessSignature: false,
    requiresMultipleReviewers: false,
    expirationDate: '',
    renewalRequired: false
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setUploadError(`Please upload a file in one of these formats: ${allowedFormats.join(', ')}`);
      return;
    }

    setUploadError(null);
    
    if (requiresWorkflow) {
      // Show attestation form for workflow documents
      setShowAttestationForm(true);
      // Store file temporarily
      (window as any).tempAttestationFile = file;
    } else {
      // Direct upload for simple documents
      await uploadDocument(file);
    }
  };

  const uploadDocument = async (file: File) => {
    setUploading(true);
    
    try {
      const { enhancedDocumentService } = await import('../../../../services/enhancedDocumentService');
      
      const attestationDoc: Partial<AttestationDocument> = {
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        documentType,
        status: requiresWorkflow ? 'draft' : 'approved',
        attestationLevel,
        reviewers: [],
        workflow: {
          requiresNotarization: attestationData.requiresNotarization,
          requiresWitnessSignature: attestationData.requiresWitnessSignature,
          requiresMultipleReviewers: attestationData.requiresMultipleReviewers,
          expirationDate: attestationData.expirationDate || undefined,
          renewalRequired: attestationData.renewalRequired
        },
        metadata: {
          attestedBy: attestationData.attestedBy,
          attestationDate: attestationData.attestationDate,
          witnessName: attestationData.witnessName || undefined,
          notaryName: attestationData.notaryName || undefined,
          notaryCommission: attestationData.notaryCommission || undefined,
          legalDescription: attestationData.legalDescription,
          tags: [documentType, attestationLevel, sectionId]
        }
      };

      const enhancedDoc = await enhancedDocumentService.uploadDocument(file, {
        organizationId: organizationId || organizationEIN || 'default-org',
        sectionId: sectionId,
        fieldId: fieldId,
        category: sectionId,
        description: `${documentType} document with ${attestationLevel} attestation`,
        metadata: {
          documentType,
          attestationLevel,
          attestationData: attestationDoc
        }
      });

      setCurrentDocument(attestationDoc as AttestationDocument);
      onUpload(enhancedDoc.id);
      
      toast.success(`${documentType} uploaded successfully with ${attestationLevel} attestation`);
    } catch (error) {
      logger.error('Upload failed:', error);
      setUploadError('Failed to upload document. Please try again.');
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAttestationSubmit = async () => {
    const file = (window as any).tempAttestationFile;
    if (!file) return;

    // Validate required fields based on attestation level
    if (attestationLevel === 'witness' && !attestationData.witnessName) {
      setUploadError('Witness name is required for witness attestation');
      return;
    }
    
    if (attestationLevel === 'notarized' && (!attestationData.notaryName || !attestationData.notaryCommission)) {
      setUploadError('Notary information is required for notarized documents');
      return;
    }

    if (!attestationData.attestedBy) {
      setUploadError('Person making attestation is required');
      return;
    }

    if (!attestationData.legalDescription) {
      setUploadError('Legal description of document is required');
      return;
    }

    setShowAttestationForm(false);
    await uploadDocument(file);
    
    // Clean up temp file
    delete (window as any).tempAttestationFile;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAttestationLevelIcon = (level: string) => {
    switch (level) {
      case 'self': return <FileText className="h-4 w-4" />;
      case 'witness': return <Users className="h-4 w-4" />;
      case 'notarized': return <Shield className="h-4 w-4" />;
      case 'certified': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedFormats.map(format => `.${format}`).join(',')}
          className="hidden"
          id={`attestation-upload-${fieldId}`}
        />
        
        {currentDocument ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3">
              {getAttestationLevelIcon(attestationLevel)}
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{currentDocument.fileName}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentDocument.status)}`}>
                  {currentDocument.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {attestationLevel.toUpperCase()} ATTESTATION
                </span>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setShowWorkflowModal(true)}
                className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                <Eye className="h-3 w-3 inline mr-1" />
                View Details
              </button>
              <label
                htmlFor={`attestation-upload-${fieldId}`}
                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
              >
                <Edit className="h-3 w-3 inline mr-1" />
                Replace
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Upload className="h-8 w-8 text-gray-400" />
              {getAttestationLevelIcon(attestationLevel)}
            </div>
            <div>
              <p className="text-gray-600 font-medium">
                Upload {documentType} with {attestationLevel} attestation
              </p>
              <p className="text-sm text-gray-500">
                Accepts: {allowedFormats.join(', ').toUpperCase()} (max {maxSize}MB)
              </p>
            </div>
            <label
              htmlFor={`attestation-upload-${fieldId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Document
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Attestation Form Modal */}
      {showAttestationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Complete Attestation Information
              </h3>
              <p className="text-sm text-gray-600">
                Provide required information for {attestationLevel} attestation
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Attestation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attested By (Required) *
                  </label>
                  <input
                    type="text"
                    value={attestationData.attestedBy}
                    onChange={(e) => setAttestationData({...attestationData, attestedBy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name of person making attestation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attestation Date *
                  </label>
                  <input
                    type="date"
                    value={attestationData.attestationDate}
                    onChange={(e) => setAttestationData({...attestationData, attestationDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Witness Information (if required) */}
              {(attestationLevel === 'witness' || attestationLevel === 'notarized') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Witness Name *
                  </label>
                  <input
                    type="text"
                    value={attestationData.witnessName}
                    onChange={(e) => setAttestationData({...attestationData, witnessName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name of witness"
                  />
                </div>
              )}

              {/* Notary Information (if required) */}
              {attestationLevel === 'notarized' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notary Name *
                    </label>
                    <input
                      type="text"
                      value={attestationData.notaryName}
                      onChange={(e) => setAttestationData({...attestationData, notaryName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Notary public name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notary Commission Number *
                    </label>
                    <input
                      type="text"
                      value={attestationData.notaryCommission}
                      onChange={(e) => setAttestationData({...attestationData, notaryCommission: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Commission/license number"
                    />
                  </div>
                </div>
              )}

              {/* Legal Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Description of Document *
                </label>
                <textarea
                  value={attestationData.legalDescription}
                  onChange={(e) => setAttestationData({...attestationData, legalDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this document attests to and its legal significance..."
                />
              </div>

              {/* Workflow Options */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Workflow Requirements</h4>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Requires multiple reviewer approval?</span>
                  <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="requiresMultipleReviewers"
                        checked={attestationData.requiresMultipleReviewers === true}
                        onChange={() => setAttestationData({...attestationData, requiresMultipleReviewers: true})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="requiresMultipleReviewers"
                        checked={attestationData.requiresMultipleReviewers === false || !attestationData.requiresMultipleReviewers}
                        onChange={() => setAttestationData({...attestationData, requiresMultipleReviewers: false})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Requires periodic renewal?</span>
                  <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="renewalRequired"
                        checked={attestationData.renewalRequired === true}
                        onChange={() => setAttestationData({...attestationData, renewalRequired: true})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="renewalRequired"
                        checked={attestationData.renewalRequired === false || !attestationData.renewalRequired}
                        onChange={() => setAttestationData({...attestationData, renewalRequired: false})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                
                {attestationData.renewalRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={attestationData.expirationDate}
                      onChange={(e) => setAttestationData({...attestationData, expirationDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAttestationForm(false);
                  delete (window as any).tempAttestationFile;
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAttestationSubmit}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload with Attestation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {showWorkflowModal && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Document Details & Workflow Status
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">File:</span> {currentDocument.fileName}</p>
                    <p><span className="font-medium">Type:</span> {currentDocument.documentType}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(currentDocument.status)}`}>
                        {currentDocument.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(currentDocument.uploadDate).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attestation Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Level:</span> {currentDocument.attestationLevel.toUpperCase()}</p>
                    <p><span className="font-medium">Attested By:</span> {currentDocument.metadata.attestedBy}</p>
                    <p><span className="font-medium">Date:</span> {new Date(currentDocument.metadata.attestationDate).toLocaleDateString()}</p>
                    {currentDocument.metadata.witnessName && (
                      <p><span className="font-medium">Witness:</span> {currentDocument.metadata.witnessName}</p>
                    )}
                    {currentDocument.metadata.notaryName && (
                      <p><span className="font-medium">Notary:</span> {currentDocument.metadata.notaryName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Legal Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {currentDocument.metadata.legalDescription}
                </p>
              </div>

              {/* Workflow Status */}
              {currentDocument.reviewers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Review Status</h4>
                  <div className="space-y-2">
                    {currentDocument.reviewers.map((reviewer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium text-sm">{reviewer.name}</p>
                          <p className="text-xs text-gray-600">{reviewer.role}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reviewer.status)}`}>
                          {reviewer.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Requirements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Workflow Requirements</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {currentDocument.workflow.requiresNotarization ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    )}
                    <span>Notarization Required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentDocument.workflow.requiresWitnessSignature ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    )}
                    <span>Witness Signature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentDocument.workflow.requiresMultipleReviewers ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    )}
                    <span>Multiple Reviewers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentDocument.workflow.renewalRequired ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded-full"></div>
                    )}
                    <span>Renewal Required</span>
                  </div>
                </div>
                
                {currentDocument.workflow.expirationDate && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Expires: {new Date(currentDocument.workflow.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttestationMemoUpload;