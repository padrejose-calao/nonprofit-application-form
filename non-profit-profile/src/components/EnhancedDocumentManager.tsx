import React, { useState, useRef, useCallback, useMemo } from 'react';
import { logger } from '../utils/logger';
import {
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  Share2,
  Copy,
  Archive,
  Star,
  StarOff,
  Filter,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Tag,
  FileImage,
  FileSpreadsheet,
  FileType,
  Folder,
  FolderOpen,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  History,
  Link,
  Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from './PermissionsLocker';
import { readTextFromDocument } from '../utils/documentExport';

interface DocumentVersion {
  id: string;
  version: number;
  uploadedAt: Date;
  uploadedBy: string;
  changes: string;
  fileSize: number;
  checksum?: string;
}

interface DocumentMetadata {
  author?: string;
  subject?: string;
  keywords?: string[];
  createdDate?: Date;
  modifiedDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  subcategory?: string;
  file: File | null;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
  lastModified: Date;
  lastModifiedBy: string;
  version: number;
  versions: DocumentVersion[];
  status: 'draft' | 'review' | 'approved' | 'archived' | 'expired';
  tags: string[];
  description: string;
  size: number;
  mimeType: string;
  isStarred: boolean;
  isLocked: boolean;
  permissions: {
    canView: string[];
    canEdit: string[];
    canDownload: string[];
    canDelete: string[];
  };
  metadata: DocumentMetadata;
  relatedDocuments: string[];
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    resolved: boolean;
  }[];
  expirationDate?: Date;
  reminderDate?: Date;
  workflow?: {
    currentStep: number;
    steps: {
      name: string;
      assignedTo: string;
      status: 'pending' | 'approved' | 'rejected';
      comments?: string;
      completedAt?: Date;
    }[];
  };
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  createdBy: string;
  description?: string;
  isExpanded: boolean;
  permissions: {
    canView: string[];
    canEdit: string[];
  };
}

interface EnhancedDocumentManagerProps {
  documents: Document[];
  folders: Folder[];
  onDocumentsChange: (documents: Document[]) => void;
  onFoldersChange: (folders: Folder[]) => void;
  locked?: boolean;
  currentUser?: string;
  organizationName?: string;
}

const EnhancedDocumentManager: React.FC<EnhancedDocumentManagerProps> = ({
  documents = [],
  folders = [],
  onDocumentsChange,
  onFoldersChange,
  locked = false,
  currentUser = 'Current User',
  organizationName = 'Organization'
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const sectionLocked = locked || isLocked('documentManager');
  const canEdit = checkPermission('write', 'documentManager') && !sectionLocked;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'folders'>('list');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, _setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [_currentFolder, _setCurrentFolder] = useState<string | null>(null);
  const [_showNewFolderModal, _setShowNewFolderModal] = useState(false);
  const [_showUploadModal, _setShowUploadModal] = useState(false);
  const [_showDetailsModal, setShowDetailsModal] = useState(false);
  const [_selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Document categories with subcategories
  const categories = {
    'Legal Documents': ['Articles of Incorporation', 'Bylaws', 'Contracts', 'Legal Opinions', 'Compliance Records'],
    'Financial Reports': ['Annual Reports', 'Audit Reports', 'Tax Returns', 'Budget Documents', 'Financial Statements'],
    'Board Documents': ['Meeting Minutes', 'Resolutions', 'Board Policies', 'Committee Reports', 'Strategic Plans'],
    'Program Materials': ['Program Descriptions', 'Evaluation Reports', 'Curriculum', 'Training Materials', 'Outcome Data'],
    'Grant Applications': ['Grant Proposals', 'Grant Reports', 'Award Letters', 'Grant Agreements', 'Budget Justifications'],
    'Policies & Procedures': ['HR Policies', 'Operational Procedures', 'Safety Protocols', 'IT Policies', 'Privacy Policies'],
    'Marketing Materials': ['Brochures', 'Annual Reports', 'Newsletters', 'Press Releases', 'Presentations'],
    'Insurance & Risk': ['Insurance Policies', 'Risk Assessments', 'Incident Reports', 'Safety Documents', 'Liability Waivers'],
    'Human Resources': ['Employee Handbooks', 'Job Descriptions', 'Performance Reviews', 'Training Records', 'Benefit Information'],
    'Technology': ['IT Documentation', 'Software Licenses', 'System Backups', 'Security Policies', 'User Manuals']
  };

  // Analytics
  const analytics = useMemo(() => {
    const totalDocuments = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const avgSize = totalDocuments > 0 ? totalSize / totalDocuments : 0;
    
    const statusCounts = documents.reduce((counts, doc) => {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const categoryCounts = documents.reduce((counts, doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const recentUploads = documents
      .filter(doc => {
        const daysSinceUpload = (new Date().getTime() - doc.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpload <= 30;
      }).length;

    const expiringDocuments = documents
      .filter(doc => {
        if (!doc.expirationDate) return false;
        const daysUntilExpiry = (doc.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length;

    return {
      totalDocuments,
      totalSize,
      avgSize,
      statusCounts,
      categoryCounts,
      recentUploads,
      expiringDocuments,
      starredCount: documents.filter(doc => doc.isStarred).length,
      lockedCount: documents.filter(doc => doc.isLocked).length
    };
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesType = filterType === 'all' || doc.type === filterType;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchTerm, filterCategory, filterStatus, filterType, sortBy, sortOrder]);

  // File upload handlers
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || !canEdit) return;

    Array.from(files).forEach(async (file) => {
      const newDocument: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.type),
        category: 'Other',
        file,
        uploadedAt: new Date(),
        uploadedBy: currentUser,
        lastModified: new Date(),
        lastModifiedBy: currentUser,
        version: 1,
        versions: [{
          id: '1',
          version: 1,
          uploadedAt: new Date(),
          uploadedBy: currentUser,
          changes: 'Initial upload',
          fileSize: file.size
        }],
        status: 'draft',
        tags: [],
        description: '',
        size: file.size,
        mimeType: file.type,
        isStarred: false,
        isLocked: false,
        permissions: {
          canView: [currentUser],
          canEdit: [currentUser],
          canDownload: [currentUser],
          canDelete: [currentUser]
        },
        metadata: {
          createdDate: new Date(file.lastModified),
          modifiedDate: new Date(file.lastModified)
        },
        relatedDocuments: [],
        comments: []
      };

      // Try to extract text content for search indexing
      if (file.type.startsWith('text/')) {
        try {
          const textContent = await readTextFromDocument(file);
          newDocument.metadata.wordCount = textContent.split(/\s+/).length;
        } catch (error) {
          logger.warn('Could not extract text content:', error as any);
        }
      }

      onDocumentsChange([...documents, newDocument]);
      toast.success(`Document "${file.name}" uploaded successfully`);
    });
  }, [canEdit, currentUser, documents, onDocumentsChange]);

  // Drag and drop handlers
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
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Document actions
  const toggleStar = (docId: string) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
    );
    onDocumentsChange(updatedDocuments);
    toast.success('Document starred status updated');
  };

  const toggleLock = (docId: string) => {
    if (!canEdit) return;
    
    const updatedDocuments = documents.map(doc =>
      doc.id === docId ? { ...doc, isLocked: !doc.isLocked } : doc
    );
    onDocumentsChange(updatedDocuments);
    toast.success('Document lock status updated');
  };

  const deleteDocument = (docId: string) => {
    if (!canEdit) return;
    
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    onDocumentsChange(updatedDocuments);
    toast.success('Document deleted successfully');
  };

  const downloadDocument = (doc: Document) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Document download started');
    } else if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  // Utility functions
  const getFileType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word Document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Excel Spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('text')) return 'Text File';
    return 'Other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'Word Document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Excel Spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'Image':
        return <FileImage className="w-5 h-5 text-purple-600" />;
      default:
        return <FileType className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <SectionLock sectionId="documentManager" position="top" />

      {/* Header with Analytics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Enhanced Document Manager</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
              </>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Total Documents</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">{analytics.totalDocuments}</p>
            <p className="text-sm text-blue-600">{formatFileSize(analytics.totalSize)} total</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Recent Activity</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">{analytics.recentUploads}</p>
            <p className="text-sm text-green-600">uploads last 30 days</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-900">Expiring Soon</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{analytics.expiringDocuments}</p>
            <p className="text-sm text-yellow-600">documents expire soon</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Starred Items</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">{analytics.starredCount}</p>
            <p className="text-sm text-purple-600">starred documents</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.keys(categories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="type">Sort by Type</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {[
            { key: 'list', label: 'List View', icon: FileText },
            { key: 'grid', label: 'Grid View', icon: BarChart3 },
            { key: 'folders', label: 'Folder View', icon: Folder }
          ].map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  activeView === view.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`bg-white rounded-lg border-2 border-dashed p-6 min-h-96 ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragOver && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-lg text-blue-600 font-medium">Drop files here to upload</p>
            <p className="text-sm text-blue-500">Supports multiple file types</p>
          </div>
        )}

        {!dragOver && (
          <>
            {/* List View */}
            {activeView === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(filteredDocuments.map(doc => doc.id));
                            } else {
                              setSelectedDocuments([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Size</th>
                      <th className="text-left p-3">Modified</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, doc.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{doc.name}</span>
                                {doc.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                {doc.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                              </div>
                              {doc.description && (
                                <p className="text-sm text-gray-600">{doc.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{doc.type}</td>
                        <td className="p-3">{doc.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">{formatFileSize(doc.size)}</td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>{doc.lastModified.toLocaleDateString()}</div>
                            <div className="text-gray-500">{doc.lastModifiedBy}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedDocument(doc);
                                setShowDetailsModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadDocument(doc)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleStar(doc.id)}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                              title={doc.isStarred ? "Remove star" : "Add star"}
                            >
                              {doc.isStarred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  onClick={() => toggleLock(doc.id)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                  title={doc.isLocked ? "Unlock" : "Lock"}
                                >
                                  {doc.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this document?')) {
                                      deleteDocument(doc.id);
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by uploading your first document.'
                      }
                    </p>
                    {canEdit && !searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4" />
                        Upload First Document
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Grid View */}
            {activeView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.type)}
                        {doc.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {doc.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments([...selectedDocuments, doc.id]);
                          } else {
                            setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                          }
                        }}
                        className="rounded"
                      />
                    </div>
                    
                    <h3 className="font-medium mb-2 truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description || 'No description'}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{doc.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 mt-4 pt-3 border-t">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded text-sm"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Folder View */}
            {activeView === 'folders' && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Folder View</h3>
                <p className="text-gray-600">Folder organization feature coming soon</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{selectedDocuments.length} documents selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Bulk download logic would go here
                  toast.info('Bulk download feature coming soon');
                }}
                className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
                      const updatedDocuments = documents.filter(doc => !selectedDocuments.includes(doc.id));
                      onDocumentsChange(updatedDocuments);
                      setSelectedDocuments([]);
                      toast.success('Documents deleted successfully');
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedDocuments([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {sectionLocked && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This section is currently locked. Contact an administrator to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <SectionLock sectionId="documentManager" position="bottom" />
    </div>
  );
};

export default EnhancedDocumentManager;