import React, { useState } from 'react';
import { 
  Shield, FileText, CheckCircle, AlertCircle, Calendar, 
  Clock, Upload, Download, Globe, Building, Scale,
  Users, Eye, Lock, Gavel, BookOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';
  dueDate?: string;
  lastReviewed?: string;
  notes: string;
  documents: File[];
}

interface ComplianceSectionProps {
  complianceItems: ComplianceItem[];
  errors: any;
  locked: boolean;
  onComplianceItemsChange: (items: ComplianceItem[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
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
  const [activeTab, setActiveTab] = useState<'legal' | 'policies' | 'reporting'>('legal');

  // Default compliance requirements
  const defaultRequirements = [
    { id: 'irs-determination', requirement: 'IRS Determination Letter', category: 'legal' },
    { id: 'state-registration', requirement: 'State Registration/Incorporation', category: 'legal' },
    { id: 'annual-filing', requirement: 'Annual State Filing', category: 'legal' },
    { id: 'form-990', requirement: 'Form 990 Filing', category: 'reporting' },
    { id: 'bylaws', requirement: 'Current Bylaws', category: 'policies' },
    { id: 'conflict-policy', requirement: 'Conflict of Interest Policy', category: 'policies' },
    { id: 'whistleblower', requirement: 'Whistleblower Policy', category: 'policies' },
    { id: 'document-retention', requirement: 'Document Retention Policy', category: 'policies' },
    { id: 'fundraising-license', requirement: 'Fundraising License/Registration', category: 'legal' },
    { id: 'insurance', requirement: 'Liability Insurance', category: 'legal' },
    { id: 'employment-compliance', requirement: 'Employment Law Compliance', category: 'legal' },
    { id: 'donor-privacy', requirement: 'Donor Privacy Policy', category: 'policies' }
  ];

  // Initialize compliance items if empty
  React.useEffect(() => {
    if (complianceItems.length === 0) {
      const initialItems: ComplianceItem[] = defaultRequirements.map(req => ({
        id: req.id,
        requirement: req.requirement,
        status: 'in-progress' as const,
        notes: '',
        documents: []
      }));
      onComplianceItemsChange(initialItems);
    }
  }, []);

  const updateComplianceItem = (id: string, updates: Partial<ComplianceItem>) => {
    onComplianceItemsChange(complianceItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'non-compliant':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStats = () => {
    const compliant = complianceItems.filter(item => item.status === 'compliant').length;
    const total = complianceItems.filter(item => item.status !== 'not-applicable').length;
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { compliant, total, percentage };
  };

  const stats = getComplianceStats();

  const getItemsByCategory = (category: string) => {
    const categoryRequirements = defaultRequirements
      .filter(req => req.category === category)
      .map(req => req.id);
    
    return complianceItems.filter(item => categoryRequirements.includes(item.id));
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Legal & Regulatory Compliance
        </h3>

        {/* Compliance Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
            <div className="text-sm text-gray-600">Compliance Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
            <div className="text-sm text-gray-600">Compliant Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceItems.filter(item => item.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {complianceItems.filter(item => item.status === 'non-compliant').length}
            </div>
            <div className="text-sm text-gray-600">Non-Compliant</div>
          </div>
        </div>

        {/* Compliance Progress Bar */}
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Compliance</span>
            <span className="text-sm text-gray-600">{stats.compliant} of {stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('legal')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'legal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Legal Requirements
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'policies'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Policies & Procedures
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reporting'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Reporting & Filings
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Legal Requirements Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              {/* Legal Compliance Items */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <Scale className="w-4 h-4 mr-2" />
                  Legal & Regulatory Requirements
                </h4>
                <div className="space-y-4">
                  {getItemsByCategory('legal').map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => updateComplianceItem(item.id, { 
                            status: e.target.value as any,
                            lastReviewed: new Date().toISOString().split('T')[0]
                          })}
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}
                          disabled={locked}
                        >
                          <option value="compliant">Compliant</option>
                          <option value="non-compliant">Non-Compliant</option>
                          <option value="in-progress">In Progress</option>
                          <option value="not-applicable">Not Applicable</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={item.dueDate || ''}
                            onChange={(e) => updateComplianceItem(item.id, { dueDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Last Reviewed</label>
                          <input
                            type="date"
                            value={item.lastReviewed || ''}
                            onChange={(e) => updateComplianceItem(item.id, { lastReviewed: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={item.notes}
                          onChange={(e) => updateComplianceItem(item.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Compliance notes, renewal dates, etc..."
                          disabled={locked}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Supporting Documents</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateComplianceItem(item.id, { 
                                documents: [...item.documents, file] 
                              });
                              toast.success(`Document uploaded for ${item.requirement}`);
                            }
                          }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={locked}
                          className="block"
                        />
                        {item.documents.length > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            {item.documents.length} document(s) uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Counsel Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Gavel className="w-4 h-4 mr-2" />
                  Legal Counsel Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Counsel/Firm
                    </label>
                    <input
                      type="text"
                      value={formData?.legalCounsel || ''}
                      onChange={(e) => onInputChange?.('legalCounsel', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Law firm or attorney name"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={formData?.legalCounselContact || ''}
                      onChange={(e) => onInputChange?.('legalCounselContact', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone/email"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              {/* Policy Compliance Items */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Organizational Policies
                </h4>
                <div className="space-y-4">
                  {getItemsByCategory('policies').map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => updateComplianceItem(item.id, { 
                            status: e.target.value as any,
                            lastReviewed: new Date().toISOString().split('T')[0]
                          })}
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}
                          disabled={locked}
                        >
                          <option value="compliant">Compliant</option>
                          <option value="non-compliant">Non-Compliant</option>
                          <option value="in-progress">In Progress</option>
                          <option value="not-applicable">Not Applicable</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Last Updated</label>
                          <input
                            type="date"
                            value={item.lastReviewed || ''}
                            onChange={(e) => updateComplianceItem(item.id, { lastReviewed: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Next Review</label>
                          <input
                            type="date"
                            value={item.dueDate || ''}
                            onChange={(e) => updateComplianceItem(item.id, { dueDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm text-gray-700 mb-1">Policy Notes</label>
                        <textarea
                          value={item.notes}
                          onChange={(e) => updateComplianceItem(item.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Policy details, approval dates, etc..."
                          disabled={locked}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Policy Document</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateComplianceItem(item.id, { 
                                documents: [...item.documents, file] 
                              });
                              toast.success(`Policy document uploaded for ${item.requirement}`);
                            }
                          }}
                          accept=".pdf,.doc,.docx"
                          disabled={locked}
                          className="block"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Review Process */}
              <div>
                <label className="block font-semibold mb-2">
                  Policy Review Process
                </label>
                <RichTextEditor
                  value={formData?.policyReviewProcess || ''}
                  onChange={(content) => onInputChange?.('policyReviewProcess', content)}
                  placeholder="Describe your process for reviewing and updating policies..."
                  disabled={locked}
                  height={150}
                />
              </div>
            </div>
          )}

          {/* Reporting Tab */}
          {activeTab === 'reporting' && (
            <div className="space-y-6">
              {/* Reporting Requirements */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Filing & Reporting Requirements
                </h4>
                <div className="space-y-4">
                  {getItemsByCategory('reporting').map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => updateComplianceItem(item.id, { 
                            status: e.target.value as any,
                            lastReviewed: new Date().toISOString().split('T')[0]
                          })}
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}
                          disabled={locked}
                        >
                          <option value="compliant">Filed</option>
                          <option value="non-compliant">Overdue</option>
                          <option value="in-progress">In Progress</option>
                          <option value="not-applicable">Not Required</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Filing Deadline</label>
                          <input
                            type="date"
                            value={item.dueDate || ''}
                            onChange={(e) => updateComplianceItem(item.id, { dueDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Filed Date</label>
                          <input
                            type="date"
                            value={item.lastReviewed || ''}
                            onChange={(e) => updateComplianceItem(item.id, { lastReviewed: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm text-gray-700 mb-1">Filing Notes</label>
                        <textarea
                          value={item.notes}
                          onChange={(e) => updateComplianceItem(item.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Confirmation numbers, amendments, etc..."
                          disabled={locked}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Filed Documents</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateComplianceItem(item.id, { 
                                documents: [...item.documents, file] 
                              });
                              toast.success(`Filing document uploaded for ${item.requirement}`);
                            }
                          }}
                          accept=".pdf,.doc,.docx"
                          disabled={locked}
                          className="block"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Calendar */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Compliance Calendar
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Annual Compliance Calendar
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('complianceCalendar', file);
                        toast.success('Compliance calendar uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload a calendar showing all filing deadlines and compliance requirements
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceSection;