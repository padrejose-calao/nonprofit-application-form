import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Shield, FileText, Eye,
  TrendingDown, Target, CheckCircle, Clock, X,
  AlertCircle, Scale, Zap, Activity, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface RiskItem {
  id: string | number;
  category: string;
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'monitoring' | 'mitigated' | 'closed';
  owner: string;
  reviewDate: string;
  notes: string;
}

interface RiskManagementSectionProps {
  riskItems: RiskItem[];
  errors: any;
  locked: boolean;
  onRiskItemsChange: (items: RiskItem[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

const RiskManagementSection: React.FC<RiskManagementSectionProps> = ({
  riskItems,
  errors,
  locked,
  onRiskItemsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'register' | 'policies'>('assessment');

  const riskCategories = [
    'Financial', 'Operational', 'Strategic', 'Compliance', 'Reputational',
    'Technology', 'Human Resources', 'Legal', 'Environmental', 'Political'
  ];

  const addRiskItem = () => {
    const newRisk: RiskItem = {
      id: Date.now(),
      category: 'Operational',
      risk: '',
      probability: 'medium',
      impact: 'medium',
      mitigation: '',
      status: 'identified',
      owner: '',
      reviewDate: '',
      notes: ''
    };
    onRiskItemsChange([...riskItems, newRisk]);
  };

  const updateRiskItem = (id: string | number, updates: Partial<RiskItem>) => {
    onRiskItemsChange(riskItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeRiskItem = (id: string | number) => {
    onRiskItemsChange(riskItems.filter(item => item.id !== id));
    toast.info('Risk item removed');
  };

  const getRiskScore = (probability: string, impact: string) => {
    const probMap = { low: 1, medium: 2, high: 3 };
    const impactMap = { low: 1, medium: 2, high: 3 };
    return probMap[probability as keyof typeof probMap] * impactMap[impact as keyof typeof impactMap];
  };

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'identified':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'monitoring':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'mitigated':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRisksByCategory = (category: string) => {
    return riskItems.filter(item => item.category === category);
  };

  const getHighRisks = () => {
    return riskItems.filter(item => getRiskScore(item.probability, item.impact) >= 6);
  };

  return (
    <div className="space-y-6">
      {/* Risk Management Overview */}
      <div className="bg-amber-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2" />
          Risk Management Overview
        </h3>

        {/* Risk Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{riskItems.length}</div>
            <div className="text-sm text-gray-600">Total Risks</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{getHighRisks().length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {riskItems.filter(item => item.status === 'mitigated').length}
            </div>
            <div className="text-sm text-gray-600">Mitigated</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {riskItems.filter(item => item.status === 'monitoring').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
        </div>

        {/* High Priority Risks Alert */}
        {getHighRisks().length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="font-medium text-red-800">High Priority Risks Require Attention</h4>
            </div>
            <div className="space-y-1">
              {getHighRisks().slice(0, 3).map(risk => (
                <div key={risk.id} className="text-sm text-red-700">
                  • {risk.risk || 'Unnamed risk'}
                </div>
              ))}
              {getHighRisks().length > 3 && (
                <div className="text-sm text-red-600">
                  And {getHighRisks().length - 3} more high priority risks...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'assessment'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Risk Assessment
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Risk Register
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'policies'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Policies & Procedures
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              {/* Risk Management Framework */}
              <div>
                <label className="block font-semibold mb-2">
                  Risk Management Framework <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData?.riskManagementFramework || ''}
                  onChange={(content) => onInputChange?.('riskManagementFramework', content)}
                  placeholder="Describe your organization's approach to risk management..."
                  disabled={locked}
                  height={150}
                />
                {errors?.riskManagementFramework && (
                  <p className="text-red-600 text-sm mt-1">{errors.riskManagementFramework}</p>
                )}
              </div>

              {/* Risk Assessment Process */}
              <div>
                <label className="block font-semibold mb-2">
                  Risk Assessment Process
                </label>
                <RichTextEditor
                  value={formData?.riskAssessmentProcess || ''}
                  onChange={(content) => onInputChange?.('riskAssessmentProcess', content)}
                  placeholder="How does your organization identify and assess risks?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Risk Appetite */}
              <div>
                <label className="block font-semibold mb-2">
                  Risk Appetite & Tolerance
                </label>
                <RichTextEditor
                  value={formData?.riskAppetite || ''}
                  onChange={(content) => onInputChange?.('riskAppetite', content)}
                  placeholder="Describe your organization's risk tolerance and appetite..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Risk Assessment Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Risk Assessment Frequency
                  </label>
                  <select
                    value={formData?.riskAssessmentFrequency || ''}
                    onChange={(e) => onInputChange?.('riskAssessmentFrequency', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    disabled={locked}
                  >
                    <option value="">Select frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Last Risk Assessment Date
                  </label>
                  <input
                    type="date"
                    value={formData?.lastRiskAssessment || ''}
                    onChange={(e) => onInputChange?.('lastRiskAssessment', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Risk Committee */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Scale className="w-4 h-4 mr-2" />
                  Risk Governance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Committee Chair
                    </label>
                    <input
                      type="text"
                      value={formData?.riskCommitteeChair || ''}
                      onChange={(e) => onInputChange?.('riskCommitteeChair', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                      placeholder="Committee chair name"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Committee Meeting Frequency
                    </label>
                    <select
                      value={formData?.riskCommitteeMeetingFreq || ''}
                      onChange={(e) => onInputChange?.('riskCommitteeMeetingFreq', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                      disabled={locked}
                    >
                      <option value="">Select frequency</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annually">Semi-Annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Register Tab */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Risk Register</h4>
                <button
                  type="button"
                  onClick={addRiskItem}
                  disabled={locked}
                  className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm flex items-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Add Risk
                </button>
              </div>

              {riskItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No risks identified yet.</p>
                  <p className="text-sm text-gray-500">Click "Add Risk" to start building your risk register.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {riskItems.map((risk) => {
                    const riskScore = getRiskScore(risk.probability, risk.impact);
                    const riskLevel = getRiskLevel(riskScore);
                    
                    return (
                      <div key={risk.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(risk.status)}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${riskLevel.bg} ${riskLevel.color}`}>
                              {riskLevel.level} Risk
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRiskItem(risk.id)}
                            disabled={locked}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Risk Category</label>
                            <select
                              value={risk.category}
                              onChange={(e) => updateRiskItem(risk.id, { category: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              disabled={locked}
                            >
                              {riskCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Status</label>
                            <select
                              value={risk.status}
                              onChange={(e) => updateRiskItem(risk.id, { status: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              disabled={locked}
                            >
                              <option value="identified">Identified</option>
                              <option value="monitoring">Monitoring</option>
                              <option value="mitigated">Mitigated</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm text-gray-700 mb-1">Risk Description</label>
                          <textarea
                            value={risk.risk}
                            onChange={(e) => updateRiskItem(risk.id, { risk: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                            rows={2}
                            placeholder="Describe the risk..."
                            disabled={locked}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Probability</label>
                            <select
                              value={risk.probability}
                              onChange={(e) => updateRiskItem(risk.id, { probability: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              disabled={locked}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Impact</label>
                            <select
                              value={risk.impact}
                              onChange={(e) => updateRiskItem(risk.id, { impact: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              disabled={locked}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Owner</label>
                            <input
                              type="text"
                              value={risk.owner}
                              onChange={(e) => updateRiskItem(risk.id, { owner: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              placeholder="Risk owner"
                              disabled={locked}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Mitigation Strategy</label>
                            <textarea
                              value={risk.mitigation}
                              onChange={(e) => updateRiskItem(risk.id, { mitigation: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              rows={2}
                              placeholder="How is this risk being mitigated?"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Review Date</label>
                            <input
                              type="date"
                              value={risk.reviewDate}
                              onChange={(e) => updateRiskItem(risk.id, { reviewDate: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500"
                              disabled={locked}
                            />
                            <textarea
                              value={risk.notes}
                              onChange={(e) => updateRiskItem(risk.id, { notes: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-amber-500 mt-2"
                              rows={2}
                              placeholder="Additional notes..."
                              disabled={locked}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              {/* Crisis Management */}
              <div>
                <label className="block font-semibold mb-2">
                  Crisis Management Plan
                </label>
                <RichTextEditor
                  value={formData?.crisisManagementPlan || ''}
                  onChange={(content) => onInputChange?.('crisisManagementPlan', content)}
                  placeholder="Describe your crisis management procedures..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Business Continuity */}
              <div>
                <label className="block font-semibold mb-2">
                  Business Continuity Planning
                </label>
                <RichTextEditor
                  value={formData?.businessContinuityPlan || ''}
                  onChange={(content) => onInputChange?.('businessContinuityPlan', content)}
                  placeholder="How does your organization ensure continuity during disruptions?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Emergency Procedures */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Emergency Procedures
                </h4>
                <div className="space-y-3">
                  {[
                    { field: 'hasEmergencyContacts', label: 'Emergency Contact List' },
                    { field: 'hasEvacuationPlan', label: 'Evacuation Plan' },
                    { field: 'hasBackupSystems', label: 'Backup Systems & Data Recovery' },
                    { field: 'hasEmergencyFunding', label: 'Emergency Funding Plan' },
                    { field: 'hasStaffSafety', label: 'Staff Safety Procedures' },
                    { field: 'hasClientSafety', label: 'Client/Beneficiary Safety Procedures' }
                  ].map(item => (
                    <label key={item.field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData?.[item.field] || false}
                        onChange={(e) => onInputChange?.(item.field, e.target.checked)}
                        className="rounded"
                        disabled={locked}
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Management Documents */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Risk Management Documentation
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Management Policy
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('riskManagementPolicy', file);
                          toast.success('Risk management policy uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Continuity Plan
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('businessContinuityDocument', file);
                          toast.success('Business continuity plan uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Response Procedures
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('emergencyProcedures', file);
                          toast.success('Emergency procedures uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskManagementSection;