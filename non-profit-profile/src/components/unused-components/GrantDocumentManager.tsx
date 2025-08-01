import React, { useState, useCallback, useEffect } from 'react';
import {

  Upload,
  File,
  Folder,
  Calendar,
  Tag,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  FileText,
  Award,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Share2,
  Link,
  History,
  UserCheck,
  Lock,
  Unlock,
  MoreVertical,
  Send,
  Paperclip,
  FileSearch,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Archive,
  Settings,
  Copy,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Grid,
  List,
  Save,
  Database,
  Mail,
  Layout,
  FolderPlus,
  Star,
  BookOpen,
  Hash,
  CalendarRange,
  SortAsc,
  FileCheck,
  Plus,
} from 'lucide-react';

const GrantDocumentManager = () => {
  // Document templates
  const _documentTemplates = {
    'NIH R01': {
      'Research Plan': {
        category: 'Grant Application',
        type: 'Full Proposal',
        tags: ['NIH', 'R01', 'Template'],
      },
      'Budget Justification': {
        category: 'Budget Documents',
        type: 'Budget Justification',
        tags: ['NIH', 'R01', 'Budget', 'Template'],
      },
      Biosketch: {
        category: 'Supporting Documents',
        type: 'CVs/Biosketches',
        tags: ['NIH', 'Template'],
      },
    },
    NSF: {
      'Project Description': {
        category: 'Grant Application',
        type: 'Full Proposal',
        tags: ['NSF', 'Template'],
      },
      'Data Management Plan': {
        category: 'Compliance Documents',
        type: 'Data Management Plan',
        tags: ['NSF', 'Template'],
      },
    },
  };

  // Folder structure
  const [folders, _setFolders] = useState([
    {
      id: 'root',
      name: 'All Documents',
      parent: null,
      children: [
        {
          id: 'active',
          name: 'Active Grants',
          parent: 'root',
          children: [
            {
              id: 'nih-2024',
              name: 'NIH 2024',
              parent: 'active',
              children: [
                { id: 'r01-cancer', name: 'R01 Cancer Research', parent: 'nih-2024', children: [] },
              ],
            },
            {
              id: 'nsf-2024',
              name: 'NSF 2024',
              parent: 'active',
              children: [],
            },
          ],
        },
        {
          id: 'archived',
          name: 'Archived',
          parent: 'root',
          children: [],
        },
        {
          id: 'templates',
          name: 'Templates',
          parent: 'root',
          children: [],
        },
      ],
    },
  ]);

  const [currentFolder, setCurrentFolder] = useState('root');
  const [expandedFolders, setExpandedFolders] = useState(['root', 'active']);

  // Document collections
  const [collections, _setCollections] = useState([
    { id: 1, name: 'Q1 2025 Submissions', documentIds: [1, 2], color: 'blue' },
    { id: 2, name: 'Cancer Research Grants', documentIds: [1], color: 'purple' },
  ]);

  // Required documents configuration
  const _requiredDocuments = {
    R01: [
      { category: 'Grant Application', type: 'Full Proposal', name: 'Research Plan' },
      { category: 'Grant Application', type: 'Letter of Intent', name: 'Letter of Intent' },
      { category: 'Budget Documents', type: 'Budget Justification', name: 'Budget Justification' },
      { category: 'Supporting Documents', type: 'CVs/Biosketches', name: 'Biosketch' },
    ],
    NSF: [
      { category: 'Grant Application', type: 'Full Proposal', name: 'Project Description' },
      {
        category: 'Compliance Documents',
        type: 'Data Management Plan',
        name: 'Data Management Plan',
      },
    ],
  };

  // Documents state
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Research Plan - Cancer Treatment',
      category: 'Grant Application',
      type: 'Full Proposal',
      tags: ['NIH', 'R01', 'Cancer', 'Research'],
      folder: 'r01-cancer',
      version: '2.1',
      status: 'draft',
      lastModified: '2024-01-15T10:30:00Z',
      createdBy: 'Dr. Smith',
      fileSize: '2.5MB',
      fileType: 'pdf',
      collaborators: ['Dr. Johnson', 'Dr. Williams'],
      shared: true,
      locked: false,
      required: true,
      grantType: 'R01',
      dueDate: '2024-03-15',
      priority: 'high',
      reviewStatus: 'pending',
      comments: [
        {
          id: 1,
          author: 'Dr. Johnson',
          text: 'Section 3 needs more detail',
          date: '2024-01-14T15:20:00Z',
        },
        { id: 2, author: 'Dr. Williams', text: 'Budget looks good', date: '2024-01-13T09:45:00Z' },
      ],
      versions: [
        {
          version: '1.0',
          date: '2024-01-10T14:30:00Z',
          author: 'Dr. Smith',
          changes: 'Initial draft',
        },
        {
          version: '2.0',
          date: '2024-01-12T16:20:00Z',
          author: 'Dr. Smith',
          changes: 'Added methodology section',
        },
        {
          version: '2.1',
          date: '2024-01-15T10:30:00Z',
          author: 'Dr. Smith',
          changes: 'Incorporated feedback',
        },
      ],
    },
    {
      id: 2,
      name: 'Budget Justification - Q1 2025',
      category: 'Budget Documents',
      type: 'Budget Justification',
      tags: ['Budget', 'Q1', '2025'],
      folder: 'r01-cancer',
      version: '1.0',
      status: 'final',
      lastModified: '2024-01-10T11:15:00Z',
      createdBy: 'Dr. Smith',
      fileSize: '1.2MB',
      fileType: 'pdf',
      collaborators: ['Dr. Johnson'],
      shared: true,
      locked: true,
      required: true,
      grantType: 'R01',
      dueDate: '2024-02-28',
      priority: 'medium',
      reviewStatus: 'approved',
      comments: [],
      versions: [
        {
          version: '1.0',
          date: '2024-01-10T11:15:00Z',
          author: 'Dr. Smith',
          changes: 'Final budget',
        },
      ],
    },
  ]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<unknown>(null);

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag) => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())) || false;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesFolder = doc.folder === currentFolder || currentFolder === 'root';

    return matchesSearch && matchesStatus && matchesCategory && matchesFolder;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'size':
        return parseFloat(a.fileSize) - parseFloat(b.fileSize);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Document actions
  const handleDocumentSelect = (docId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleDocumentAction = (action: string, docId: number) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    switch (action) {
      case 'view':
        // Handle view action
        break;
      case 'edit':
        // Handle edit action
        break;
      case 'share':
        setSelectedDocument(doc);
        setShowShareModal(true);
        break;
      case 'version':
        setSelectedDocument(doc);
        setShowVersionModal(true);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this document?')) {
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
        }
        break;
    }
  };

  // Folder actions
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const selectFolder = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  // Render folder tree
  const renderFolderTree = (folderList: unknown[], level = 0) => {
    return folderList.map((folder: unknown) => (
      <div key={(folder as any).id} className="w-full">
        <div
          className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${
            currentFolder === (folder as any).id ? 'bg-blue-100' : ''
          }`}
          onClick={() => selectFolder((folder as any).id)}
        >
          {(folder as any).children && (folder as any).children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder((folder as any).id);
              }}
              className="p-1 mr-1"
            >
              {expandedFolders.includes((folder as any).id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm">{(folder as any).name}</span>
        </div>
        {(folder as any).children && (folder as any).children.length > 0 && expandedFolders.includes((folder as any).id) && (
          <div className="ml-4">{renderFolderTree((folder as any).children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Document Manager</h2>
          <p className="text-sm text-gray-500">Manage grant documents</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Folders</h3>
          {renderFolderTree(folders)}
        </div>

        {/* Collections */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Collections</h3>
          {collections.map((collection) => (
            <div key={collection.id} className="flex items-center py-1">
              <div className={`w-3 h-3 rounded-full mr-2 bg-${collection.color}-500`}></div>
              <span className="text-sm text-gray-600">{collection.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentFolder === 'root'
                  ? 'All Documents'
                  : folders.flatMap((f) => f.children || []).find((f) => f.id === currentFolder)
                      ?.name || 'Documents'}
              </h1>
              <span className="text-sm text-gray-500">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Grant Application">Grant Application</option>
              <option value="Budget Documents">Budget Documents</option>
              <option value="Supporting Documents">Supporting Documents</option>
              <option value="Compliance Documents">Compliance Documents</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Documents Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedDocuments.includes(doc.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleDocumentSelect(doc.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <File className="h-8 w-8 text-blue-500" />
                    <div className="flex items-center space-x-1">
                      {doc.shared && <Share2 className="h-4 w-4 text-green-500" />}
                      {doc.locked && <Lock className="h-4 w-4 text-red-500" />}
                      {doc.required && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{doc.category}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.fileSize}</span>
                    <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        doc.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : doc.status === 'review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentAction('view', doc.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentAction('share', doc.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Share2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentAction('version', doc.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <History className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedDocuments.includes(doc.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleDocumentSelect(doc.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={() => handleDocumentSelect(doc.id)}
                            className="mr-3"
                          />
                          <File className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">v{doc.version}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            doc.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : doc.status === 'review'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.fileSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('view', doc.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('edit', doc.id);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('share', doc.id);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentAction('delete', doc.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showUploadModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <input
                type="file"
                className="w-full border border-gray-200 rounded-lg p-2"
                multiple
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showShareModal && selectedDocument ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Share Document</h3>
            <p className="text-sm text-gray-600 mb-4">{(selectedDocument as any).name}</p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full border border-gray-200 rounded-lg p-2"
              />
              <select className="w-full border border-gray-200 rounded-lg p-2">
                <option value="view">View only</option>
                <option value="edit">Can edit</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showVersionModal && selectedDocument ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Version History</h3>
            <p className="text-sm text-gray-600 mb-4">{(selectedDocument as any).name}</p>
            <div className="space-y-3">
              {(selectedDocument as any).versions.map((version: unknown, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Version {(version as any).version}</span>
                    <span className="text-sm text-gray-500">
                      {new Date((version as any).date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">By {(version as any).author}</p>
                  <p className="text-sm text-gray-900">{(version as any).changes}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GrantDocumentManager;
