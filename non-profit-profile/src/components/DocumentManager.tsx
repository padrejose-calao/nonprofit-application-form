import React, { useState, useEffect } from 'react';
import {

  X,
  Plus,
  Edit,
  Trash2,
  FileText,
  Upload,
  Tag,
  Calendar,
  User,
  Download,
  Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file: File | null;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
  description: string;
  size: number;
}

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  editingDocumentId: string | null;
  onEditingDocumentChange: (id: string | null) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  isOpen,
  onClose,
  documents,
  onDocumentsChange,
  editingDocumentId,
  onEditingDocumentChange,
}) => {
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    name: '',
    type: '',
    category: '',
    description: '',
    tags: [],
    status: 'draft',
  });
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const categories = [
    'Legal Documents',
    'Financial Reports',
    'Board Documents',
    'Program Materials',
    'Grant Applications',
    'Policies & Procedures',
    'Annual Reports',
    'Strategic Plans',
    'Other',
  ];

  const documentTypes = [
    'PDF',
    'Word Document',
    'Excel Spreadsheet',
    'PowerPoint',
    'Image',
    'Text File',
    'Other',
  ];

  const editingDocument = editingDocumentId
    ? documents.find((doc) => doc.id === editingDocumentId)
    : null;

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag) => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())) || false;
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddTag = () => {
    if (newTag.trim() && !newDocument.tags?.includes(newTag.trim())) {
      setNewDocument((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewDocument((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument((prev) => ({
        ...prev,
        file,
        size: file.size,
        type: file.type || 'Other',
      }));
    }
  };

  const handleSave = () => {
    if (!newDocument.name || !newDocument.category || !newDocument.file) {
      toast.error('Please fill in all required fields and upload a file');
      return;
    }

    const document: Document = {
      id: editingDocument?.id || Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type || 'Other',
      category: newDocument.category,
      file: newDocument.file,
      uploadedAt: editingDocument?.uploadedAt || new Date().toISOString(),
      uploadedBy: editingDocument?.uploadedBy || 'Current User',
      version: editingDocument?.version || 1,
      status: newDocument.status || 'draft',
      tags: newDocument.tags || [],
      description: newDocument.description || '',
      size: newDocument.size || 0,
    };

    if (editingDocument) {
      const updatedDocuments = documents.map((doc) =>
        doc.id === editingDocument.id ? document : doc
      );
      onDocumentsChange(updatedDocuments);
      toast.success('Document updated successfully!');
    } else {
      onDocumentsChange([...documents, document]);
      toast.success('Document added successfully!');
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocuments = documents.filter((doc) => doc.id !== id);
      onDocumentsChange(updatedDocuments);
      toast.success('Document deleted successfully!');
    }
  };

  const handleClose = () => {
    setNewDocument({
      name: '',
      type: '',
      category: '',
      description: '',
      tags: [],
      status: 'draft',
    });
    setNewTag('');
    onEditingDocumentChange(null);
    onClose();
  };

  const handleEdit = (document: Document) => {
    setNewDocument({
      name: document.name,
      type: document.type,
      category: document.category,
      description: document.description,
      tags: document.tags,
      status: document.status,
      file: document.file,
      size: document.size,
    });
    onEditingDocumentChange(document.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {editingDocument ? 'Edit Document' : 'Add New Document'}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                value={newDocument.name}
                onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={newDocument.category}
                onChange={(e) => setNewDocument((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newDocument.status}
                onChange={(e) =>
                  setNewDocument((prev) => ({ ...prev, status: e.target.value as any }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newDocument.description}
                onChange={(e) =>
                  setNewDocument((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter document description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newDocument.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {newDocument.file ? newDocument.file.name : 'Click to upload or drag and drop'}
                  </span>
                  {newDocument.file && (
                    <span className="text-xs text-gray-500 mt-1">
                      Size: {formatFileSize(newDocument.size || 0)}
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingDocument ? 'Update Document' : 'Add Document'}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Documents List Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Current Documents</h3>

              {/* Search and Filters */}
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDocuments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No documents found</p>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-md p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <h4 className="font-medium text-sm">{doc.name}</h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                doc.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : doc.status === 'review'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : doc.status === 'archived'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{doc.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{doc.category}</span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
