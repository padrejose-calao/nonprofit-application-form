import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, CheckCircle, AlertCircle, Calendar, 
  Clock, Upload, Download, Globe, Building, Scale,
  Users, Eye, Lock, Gavel, BookOpen, Plus, Trash2, Edit2,
  TrendingUp, ExternalLink, AlertTriangle, Star, Search,
  Filter, RefreshCw, Save
} from 'lucide-react';
import { toast } from 'react-toastify';
// import RichTextEditor from '../RichTextEditor';
// import DocumentUploadField from '../DocumentUploadField';

interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';
  category: 'legal' | 'policies' | 'reporting' | 'operational';
  dueDate?: string;
  lastReviewed?: string;
  notes: string;
  documents: unknown[];
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  completionDate?: string;
  renewalFrequency?: 'annual' | 'biannual' | 'monthly' | 'quarterly' | 'ongoing';
  regulatoryBody?: string;
  consequences?: string;
}

interface ComplianceSectionProps {
  complianceItems: ComplianceItem[];
  errors: unknown;
  locked: boolean;
  onComplianceItemsChange: (items: ComplianceItem[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: unknown;
  onInputChange?: (field: string, value: unknown) => void;
}

const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  complianceItems,
  errors,
  locked,
  onComplianceItemsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'legal' | 'policies' | 'reporting' | 'operational'>('dashboard');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Default compliance requirements with comprehensive coverage
  const defaultRequirements: ComplianceItem[] = [
    // Legal Requirements
    { 
      id: 'irs-determination', 
      requirement: 'IRS Determination Letter', 
      category: 'legal', 
      priority: 'high', 
      regulatoryBody: 'IRS',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'state-registration', 
      requirement: 'State Registration/Incorporation', 
      category: 'legal', 
      priority: 'high',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'charitable-solicitation', 
      requirement: 'Charitable Solicitation Registration', 
      category: 'legal', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    { 
      id: 'employment-law', 
      requirement: 'Employment Law Compliance', 
      category: 'legal', 
      priority: 'high',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'ada-compliance', 
      requirement: 'ADA Compliance', 
      category: 'legal', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    
    // Reporting Requirements  
    { 
      id: 'form-990', 
      requirement: 'Form 990 Filing', 
      category: 'reporting', 
      priority: 'high', 
      renewalFrequency: 'annual',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'state-annual-report', 
      requirement: 'State Annual Report', 
      category: 'reporting', 
      priority: 'high', 
      renewalFrequency: 'annual',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'donor-acknowledgments', 
      requirement: 'Donor Acknowledgment Letters', 
      category: 'reporting', 
      priority: 'medium',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'grant-reporting', 
      requirement: 'Grant Reporting', 
      category: 'reporting', 
      priority: 'high',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    
    // Policies Requirements
    { 
      id: 'conflict-of-interest', 
      requirement: 'Conflict of Interest Policy', 
      category: 'policies', 
      priority: 'high',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'whistleblower-policy', 
      requirement: 'Whistleblower Policy', 
      category: 'policies', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    { 
      id: 'document-retention', 
      requirement: 'Document Retention Policy', 
      category: 'policies', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    { 
      id: 'compensation-policy', 
      requirement: 'Executive Compensation Policy', 
      category: 'policies', 
      priority: 'medium',
      status: 'not-applicable',
      notes: '',
      documents: []
    },
    { 
      id: 'gift-acceptance', 
      requirement: 'Gift Acceptance Policy', 
      category: 'policies', 
      priority: 'low',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    
    // Operational Requirements
    { 
      id: 'board-governance', 
      requirement: 'Board Governance Standards', 
      category: 'operational', 
      priority: 'high',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'financial-controls', 
      requirement: 'Financial Controls', 
      category: 'operational', 
      priority: 'high',
      status: 'compliant',
      notes: '',
      documents: []
    },
    { 
      id: 'data-privacy', 
      requirement: 'Data Privacy/GDPR Compliance', 
      category: 'operational', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    },
    { 
      id: 'volunteer-screening', 
      requirement: 'Volunteer Screening Procedures', 
      category: 'operational', 
      priority: 'medium',
      status: 'in-progress',
      notes: '',
      documents: []
    }
  ];

  // Initialize compliance items with defaults if empty
  useEffect(() => {
    if (complianceItems.length === 0) {
      onComplianceItemsChange(defaultRequirements);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and search functionality
  const _filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate compliance metrics
  const complianceMetrics = {
    total: complianceItems.length,
    compliant: complianceItems.filter(item => item.status === 'compliant').length,
    nonCompliant: complianceItems.filter(item => item.status === 'non-compliant').length,
    inProgress: complianceItems.filter(item => item.status === 'in-progress').length,
    notApplicable: complianceItems.filter(item => item.status === 'not-applicable').length,
    overdue: complianceItems.filter(item => 
      item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'compliant'
    ).length
  };

  const complianceRate = complianceItems.length > 0 
    ? Math.round((complianceMetrics.compliant / (complianceMetrics.total - complianceMetrics.notApplicable)) * 100)
    : 0;

  // Handle adding new compliance item
  const handleAddItem = (newItem: Omit<ComplianceItem, 'id'>) => {
    const item: ComplianceItem = {
      ...newItem,
      id: Date.now().toString()
    };
    
    onComplianceItemsChange([...complianceItems, item]);
    setShowAddItem(false);
    toast.success('Compliance item added successfully');
  };

  // Handle updating compliance item
  const handleUpdateItem = (updatedItem: ComplianceItem) => {
    const updated = complianceItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    onComplianceItemsChange(updated);
    setEditingItem(null);
    toast.success('Compliance item updated successfully');
  };

  // Handle deleting compliance item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this compliance item?')) {
      const updated = complianceItems.filter(item => item.id !== itemId);
      onComplianceItemsChange(updated);
      toast.success('Compliance item deleted');
    }
  };

  // Render compliance dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Compliance Overview</h3>
              <p className="text-gray-600">Monitor your organization's compliance status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{complianceRate}%</div>
            <div className="text-sm text-gray-600">Compliance Rate</div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{complianceMetrics.compliant}</div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{complianceMetrics.nonCompliant}</div>
            <div className="text-sm text-gray-600">Non-Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{complianceMetrics.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{complianceMetrics.notApplicable}</div>
            <div className="text-sm text-gray-600">Not Applicable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{complianceMetrics.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>

      {/* Priority Items */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">High Priority Items</h3>
        <div className="space-y-3">
          {complianceItems
            .filter(item => item.priority === 'high' && item.status !== 'compliant')
            .slice(0, 5)
            .map(item => (
              <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between bg-red-50 border-red-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.requirement}</h4>
                      <p className="text-sm text-gray-600">{item.category} • {item.status}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(item)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  disabled={locked}
                >
                  Update
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {complianceItems
            .filter(item => item.dueDate && new Date(item.dueDate) > new Date())
            .sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())
            .slice(0, 5)
            .map(item => {
              const daysUntilDue = Math?.ceil((new Date(item.dueDate || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.requirement}</h4>
                        <p className="text-sm text-gray-600">
                          Due in {daysUntilDue} days • {new Date(item.dueDate || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // Render compliance items by category
  const renderCategoryItems = (category: string) => {
    const categoryItems = complianceItems.filter(item => item.category === category);
    
    return (
      <div className="space-y-4">
        {categoryItems.map(item => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">{item.requirement}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    item.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                    item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.priority} priority
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  {item.regulatoryBody && <p>Regulatory Body: {item.regulatoryBody}</p>}
                  {item.dueDate && <p>Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>}
                  {item.lastReviewed && <p>Last Reviewed: {new Date(item.lastReviewed).toLocaleDateString()}</p>}
                  {item.assignedTo && <p>Assigned To: {item.assignedTo}</p>}
                </div>
                
                {item.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {item.notes}
                  </div>
                )}
              </div>
              
              {!locked && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Documents */}
            {item.documents && item.documents.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Related Documents</h5>
                <div className="flex flex-wrap gap-2">
                  {item.documents.map((doc: unknown, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {(doc as any).name || `Document ${index + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {categoryItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {category} requirements yet</p>
            <p className="text-sm">Add compliance items to track requirements</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
          <p className="text-gray-600">Track legal, regulatory, and policy compliance requirements</p>
        </div>
        
        {!locked && (
          <button
            onClick={() => setShowAddItem(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search compliance requirements..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="non-compliant">Non-Compliant</option>
          <option value="in-progress">In Progress</option>
          <option value="not-applicable">Not Applicable</option>
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="legal">Legal</option>
          <option value="policies">Policies</option>
          <option value="reporting">Reporting</option>
          <option value="operational">Operational</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { key: 'legal', label: 'Legal', icon: Scale },
            { key: 'policies', label: 'Policies', icon: BookOpen },
            { key: 'reporting', label: 'Reporting', icon: FileText },
            { key: 'operational', label: 'Operational', icon: Building }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'dashboard' | 'legal' | 'policies' | 'reporting' | 'operational')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'legal' && renderCategoryItems('legal')}
        {activeTab === 'policies' && renderCategoryItems('policies')}
        {activeTab === 'reporting' && renderCategoryItems('reporting')}
        {activeTab === 'operational' && renderCategoryItems('operational')}
      </div>

      {/* Add/Edit Modal */}
      {(showAddItem || editingItem) && (
        <ComplianceItemModal
          item={editingItem}
          onSubmit={editingItem ? handleUpdateItem : (handleAddItem as any)}
          onCancel={() => {
            setShowAddItem(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Compliance Item Modal Component
const ComplianceItemModal: React.FC<{
  item: ComplianceItem | null;
  onSubmit: (item: unknown) => void;
  onCancel: () => void;
}> = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    requirement: item?.requirement || '',
    category: item?.category || 'legal',
    priority: item?.priority || 'medium',
    status: item?.status || 'in-progress',
    notes: item?.notes || '',
    dueDate: item?.dueDate || '',
    assignedTo: item?.assignedTo || '',
    regulatoryBody: item?.regulatoryBody || '',
    renewalFrequency: item?.renewalFrequency || 'annual',
    consequences: item?.consequences || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(item ? { ...item, ...formData } : { ...formData, documents: [] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {item ? 'Edit Compliance Requirement' : 'Add Compliance Requirement'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement *</label>
            <input
              type="text"
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="legal">Legal</option>
                <option value="policies">Policies</option>
                <option value="reporting">Reporting</option>
                <option value="operational">Operational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="in-progress">In Progress</option>
                <option value="not-applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Body</label>
              <input
                type="text"
                value={formData.regulatoryBody}
                onChange={(e) => setFormData({ ...formData, regulatoryBody: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., IRS, State Department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Person responsible"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes, requirements, or next steps..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {item ? 'Update' : 'Add'} Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceSection;