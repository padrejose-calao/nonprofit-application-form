import React, { useState, useEffect } from 'react';
import {
  Upload, Send, Users, FileText, Image, Filter, Search,
  ChevronDown, ChevronRight, Eye, Download, Edit, Trash2,
  CheckCircle, Clock, AlertCircle, User, Building2, Tag,
  FolderOpen, Star, Archive, Share, Bell, Settings, Lock,
  Plus, X, Calendar, MapPin, Globe, Mail, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: string[];
  requiredFields: string[];
  isActive: boolean;
}

interface DistributionTarget {
  id: string;
  type: 'user' | 'profile' | 'group';
  name: string;
  email?: string;
  profileId?: string;
  groupType?: string;
  status: 'active' | 'inactive';
  lastActivity?: string;
}

interface QueuedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadDate: string;
  targetProfiles: string[];
  targetSections: string[];
  status: 'pending_review' | 'approved' | 'distributed' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  autoAssign: boolean;
  schedule?: {
    sendDate: string;
    sendTime: string;
    recurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

interface AdminDocumentDistributionProps {
  onClose: () => void;
  userRole: 'admin' | 'user';
}

const AdminDocumentDistribution: React.FC<AdminDocumentDistributionProps> = ({
  onClose,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'queue' | 'templates' | 'targets' | 'analytics'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadMode, setUploadMode] = useState<'manual' | 'smart'>('manual');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [documentCategory, setDocumentCategory] = useState('');
  const [documentTags, setDocumentTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [autoAssign, setAutoAssign] = useState(false);
  const [scheduleUpload, setScheduleUpload] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [queuedDocuments, setQueuedDocuments] = useState<QueuedDocument[]>([
    {
      id: '1',
      name: 'Board Resolution Template.pdf',
      type: 'pdf',
      size: 2400000,
      uploadedBy: 'admin@calao.org',
      uploadDate: new Date().toISOString(),
      targetProfiles: ['profile-1', 'profile-2'],
      targetSections: ['governance'],
      status: 'pending_review',
      priority: 'high',
      category: 'governance',
      tags: ['board', 'resolution', 'template'],
      autoAssign: true
    },
    {
      id: '2',
      name: 'Financial Reporting Guidelines.docx',
      type: 'docx',
      size: 1800000,
      uploadedBy: 'admin@calao.org',
      uploadDate: new Date(Date.now() - 3600000).toISOString(),
      targetProfiles: ['profile-3'],
      targetSections: ['financials'],
      status: 'approved',
      reviewedBy: 'admin@calao.org',
      reviewDate: new Date().toISOString(),
      priority: 'medium',
      category: 'financial',
      tags: ['financial', 'reporting', 'guidelines'],
      autoAssign: false
    }
  ]);

  const [distributionTargets, setDistributionTargets] = useState<DistributionTarget[]>([
    {
      id: 'profile-1',
      type: 'profile',
      name: 'Community Health Initiative',
      profileId: 'chi-001',
      status: 'active',
      lastActivity: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'profile-2',
      type: 'profile',
      name: 'Education Foundation',
      profileId: 'ef-002',
      status: 'active',
      lastActivity: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'user-1',
      type: 'user',
      name: 'John Doe',
      email: 'john.doe@nonprofit.org',
      status: 'active',
      lastActivity: new Date().toISOString()
    },
    {
      id: 'group-1',
      type: 'group',
      name: 'Board Members',
      groupType: 'board',
      status: 'active'
    }
  ]);

  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([
    {
      id: 'template-1',
      name: 'Board Resolution',
      description: 'Standard board resolution template for nonprofit governance',
      category: 'governance',
      sections: ['governance', 'boardMemberDetails'],
      requiredFields: ['boardMembers', 'meetingDate', 'resolutionText'],
      isActive: true
    },
    {
      id: 'template-2',
      name: 'Financial Report',
      description: 'Monthly financial reporting template',
      category: 'financial',
      sections: ['financials'],
      requiredFields: ['revenue', 'expenses', 'budget'],
      isActive: true
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<QueuedDocument | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const documentCategories = [
    'governance', 'financial', 'programs', 'compliance', 
    'legal', 'hr', 'operations', 'communications', 'other'
  ];

  const profileSections = [
    'basicInfo', 'narrative', 'governance', 'management', 'financials',
    'programs', 'impact', 'compliance', 'technology', 'communications',
    'riskManagement', 'insurance', 'otherLocations', 'additionalInfo',
    'leadershipDetails', 'boardMemberDetails', 'staffDetails', 'donations', 'references'
  ];

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (selectedTargets.length === 0) {
      toast.error('Please select distribution targets');
      return;
    }

    try {
      // Process each file
      Array.from(selectedFiles).forEach((file, index) => {
        const newDocument: QueuedDocument = {
          id: Date.now() + index + '',
          name: file.name,
          type: file.type.split('/')[1] || 'unknown',
          size: file.size,
          uploadedBy: 'admin@calao.org',
          uploadDate: new Date().toISOString(),
          targetProfiles: selectedTargets.filter(t => distributionTargets.find(dt => dt.id === t)?.type === 'profile'),
          targetSections: selectedSections,
          status: 'pending_review',
          priority,
          category: documentCategory || 'other',
          tags: documentTags,
          autoAssign,
          schedule: scheduleUpload ? {
            sendDate: scheduleDate,
            sendTime: scheduleTime
          } : undefined
        };

        setQueuedDocuments(prev => [newDocument, ...prev]);
      });

      toast.success(`${selectedFiles.length} document(s) uploaded successfully`);
      
      // Reset form
      setSelectedFiles(null);
      setSelectedTargets([]);
      setSelectedSections([]);
      setDocumentCategory('');
      setDocumentTags([]);
      setPriority('medium');
      setAutoAssign(false);
      setScheduleUpload(false);
      setScheduleDate('');
      setScheduleTime('');
      
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error('Upload error:', error);
    }
  };

  const handleDocumentAction = (documentId: string, action: 'approve' | 'reject' | 'distribute') => {
    setQueuedDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const now = new Date().toISOString();
        switch (action) {
          case 'approve':
            return {
              ...doc,
              status: 'approved',
              reviewedBy: 'admin@calao.org',
              reviewDate: now
            };
          case 'reject':
            return {
              ...doc,
              status: 'rejected',
              reviewedBy: 'admin@calao.org',
              reviewDate: now
            };
          case 'distribute':
            return {
              ...doc,
              status: 'distributed',
              reviewedBy: 'admin@calao.org',
              reviewDate: now
            };
          default:
            return doc;
        }
      }
      return doc;
    }));

    const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'distributed';
    toast.success(`Document ${actionText} successfully`);
    setSelectedDocument(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'distributed': return <Send className="w-4 h-4 text-blue-600" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'distributed': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredDocuments = queuedDocuments.filter(doc => {
    const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || doc.category === filterCategory;
    const searchMatch = searchQuery === '' || 
      (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())) || false;
    
    return statusMatch && categoryMatch && searchMatch;
  });

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* Upload Mode Selection */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setUploadMode('manual')}
          className={`px-4 py-2 rounded-lg ${
            uploadMode === 'manual' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Manual Distribution
        </button>
        <button
          onClick={() => setUploadMode('smart')}
          className={`px-4 py-2 rounded-lg ${
            uploadMode === 'smart' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Smart Auto-Assignment
        </button>
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Select Files
          </label>
        </div>
        
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Selected Files:</h4>
            <div className="space-y-2">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Distribution Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distribution Targets
          </label>
          <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
            {distributionTargets.map(target => (
              <div
                key={target.id}
                className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  id={target.id}
                  checked={selectedTargets.includes(target.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTargets(prev => [...prev, target.id]);
                    } else {
                      setSelectedTargets(prev => prev.filter(id => id !== target.id));
                    }
                  }}
                  className="mr-3"
                />
                <div className="flex items-center space-x-2 flex-1">
                  {target.type === 'user' && <User className="w-4 h-4 text-blue-600" />}
                  {target.type === 'profile' && <Building2 className="w-4 h-4 text-green-600" />}
                  {target.type === 'group' && <Users className="w-4 h-4 text-purple-600" />}
                  <div>
                    <div className="font-medium text-sm">{target.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{target.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Sections
          </label>
          <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
            {profileSections.map(section => (
              <div
                key={section}
                className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  id={section}
                  checked={selectedSections.includes(section)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSections(prev => [...prev, section]);
                    } else {
                      setSelectedSections(prev => prev.filter(s => s !== section));
                    }
                  }}
                  className="mr-3"
                />
                <label htmlFor={section} className="text-sm capitalize cursor-pointer">
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={documentCategory}
            onChange={(e) => setDocumentCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {documentCategories.map(category => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoAssign"
            checked={autoAssign}
            onChange={(e) => setAutoAssign(e.target.checked)}
            className="mr-3"
          />
          <label htmlFor="autoAssign" className="text-sm font-medium text-gray-700">
            Enable Smart Auto-Assignment (AI will categorize and assign automatically)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="scheduleUpload"
            checked={scheduleUpload}
            onChange={(e) => setScheduleUpload(e.target.checked)}
            className="mr-3"
          />
          <label htmlFor="scheduleUpload" className="text-sm font-medium text-gray-700">
            Schedule Distribution
          </label>
        </div>

        {scheduleUpload && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={handleFileUpload}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload & Queue for Review
        </button>
      </div>
    </div>
  );

  const renderQueueTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="distributed">Distributed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {documentCategories.map(category => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {filteredDocuments.length} documents
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {filteredDocuments.map(document => (
          <div
            key={document.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedDocument(document)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FileText className="w-5 h-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{document.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(document.priority)}`} />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Uploaded by {document.uploadedBy}</span>
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                    <span>{(document.size / 1024 / 1024).toFixed(1)} MB</span>
                    <span className="capitalize">{document.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">Targets:</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {document.targetProfiles.length} profiles
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {document.targetSections.length} sections
                    </span>
                  </div>
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {document.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(document.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No documents found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Send className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Document Distribution System</h2>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              Admin Only
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload & Distribute
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'queue'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Review Queue ({queuedDocuments.filter(d => d.status === 'pending_review').length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'targets'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Targets
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'queue' && renderQueueTab()}
          {activeTab === 'templates' && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Document templates will be managed here</p>
            </div>
          )}
          {activeTab === 'targets' && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Distribution targets management will be here</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Distribution analytics and reports will be here</p>
            </div>
          )}
        </div>

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Status:</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(selectedDocument.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                          {selectedDocument.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Priority:</label>
                      <div className={`mt-1 font-medium ${getPriorityColor(selectedDocument.priority)}`}>
                        {selectedDocument.priority}
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Category:</label>
                      <div className="mt-1 capitalize">{selectedDocument.category}</div>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Size:</label>
                      <div className="mt-1">{(selectedDocument.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">Target Profiles:</label>
                    <div className="mt-1 text-sm">
                      {selectedDocument.targetProfiles.length} profiles selected
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">Target Sections:</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedDocument.targetSections.map(section => (
                        <span key={section} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div>
                      <label className="font-medium text-gray-700">Tags:</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedDocument.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <div>Uploaded by: {selectedDocument.uploadedBy}</div>
                    <div>Upload Date: {new Date(selectedDocument.uploadDate).toLocaleString()}</div>
                    {selectedDocument.reviewedBy && (
                      <>
                        <div>Reviewed by: {selectedDocument.reviewedBy}</div>
                        <div>Review Date: {new Date(selectedDocument.reviewDate!).toLocaleString()}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedDocument.status === 'pending_review' && userRole === 'admin' && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleDocumentAction(selectedDocument.id, 'reject')}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDocumentAction(selectedDocument.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDocumentAction(selectedDocument.id, 'distribute')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Distribute Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentDistribution;