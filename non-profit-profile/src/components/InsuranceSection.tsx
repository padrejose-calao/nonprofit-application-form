import React, { useState } from 'react';
import { 
  FileCheck, Shield, DollarSign, Calendar, AlertCircle,
  CheckCircle, Clock, FileText, Phone, Building, Car, Users, Plus, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface InsurancePolicy {
  id: string | number;
  type: string;
  provider: string;
  policyNumber: string;
  coverage: number;
  deductible: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  notes: string;
}

interface InsuranceSectionProps {
  insurancePolicies: InsurancePolicy[];
  errors: any;
  locked: boolean;
  onInsurancePoliciesChange: (policies: InsurancePolicy[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  insurancePolicies,
  errors,
  locked,
  onInsurancePoliciesChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'assessment'>('policies');

  const insuranceTypes = [
    'General Liability',
    'Professional Liability',
    'Directors & Officers (D&O)',
    'Employment Practices Liability',
    'Cyber Liability',
    'Property Insurance',
    'Business Interruption',
    'Workers Compensation',
    'Commercial Auto',
    'Event Insurance',
    'Volunteer Accident',
    'Crime/Fidelity Bond',
    'Umbrella Policy'
  ];

  const addInsurancePolicy = () => {
    const newPolicy: InsurancePolicy = {
      id: Date.now(),
      type: '',
      provider: '',
      policyNumber: '',
      coverage: 0,
      deductible: 0,
      premium: 0,
      startDate: '',
      endDate: '',
      status: 'active',
      notes: ''
    };
    onInsurancePoliciesChange([...insurancePolicies, newPolicy]);
  };

  const updatePolicy = (id: string | number, updates: Partial<InsurancePolicy>) => {
    onInsurancePoliciesChange(insurancePolicies.map(policy => 
      policy.id === id ? { ...policy, ...updates } : policy
    ));
  };

  const removePolicy = (id: string | number) => {
    onInsurancePoliciesChange(insurancePolicies.filter(policy => policy.id !== id));
    toast.info('Insurance policy removed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileCheck className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalCoverage = () => {
    return insurancePolicies
      .filter(p => p.status === 'active')
      .reduce((total, policy) => total + (policy.coverage || 0), 0);
  };

  const calculateTotalPremiums = () => {
    return insurancePolicies
      .filter(p => p.status === 'active')
      .reduce((total, policy) => total + (policy.premium || 0), 0);
  };

  const getExpiringPolicies = () => {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    return insurancePolicies.filter(policy => {
      if (!policy.endDate) return false;
      const endDate = new Date(policy.endDate);
      return endDate <= sixMonthsFromNow && policy.status === 'active';
    });
  };

  return (
    <div className="space-y-6">
      {/* Insurance Overview */}
      <div className="bg-emerald-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <FileCheck className="w-5 h-5 mr-2" />
          Insurance Coverage Overview
        </h3>

        {/* Insurance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{insurancePolicies.length}</div>
            <div className="text-sm text-gray-600">Total Policies</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {insurancePolicies.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Policies</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${calculateTotalCoverage().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Coverage</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${calculateTotalPremiums().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Annual Premiums</div>
          </div>
        </div>

        {/* Expiring Policies Alert */}
        {getExpiringPolicies().length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-800">Policies Expiring Within 6 Months</h4>
            </div>
            <div className="space-y-1">
              {getExpiringPolicies().map(policy => (
                <div key={policy.id} className="text-sm text-yellow-700">
                  • {policy.type} expires on {policy.endDate}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insurance Broker Information */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-3">Insurance Broker/Agent Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Broker/Agency Name</label>
              <input
                type="text"
                value={formData?.insuranceBroker || ''}
                onChange={(e) => onInputChange?.('insuranceBroker', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                placeholder="Broker name"
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData?.insuranceContact || ''}
                onChange={(e) => onInputChange?.('insuranceContact', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                placeholder="Contact name"
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData?.insurancePhone || ''}
                onChange={(e) => onInputChange?.('insurancePhone', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                placeholder="Phone number"
                disabled={locked}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'policies'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Insurance Policies
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'claims'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Claims History
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'assessment'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Risk Assessment
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Insurance Policies</h4>
                <button
                  type="button"
                  onClick={addInsurancePolicy}
                  disabled={locked}
                  className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Policy
                </button>
              </div>

              {insurancePolicies.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No insurance policies recorded yet.</p>
                  <p className="text-sm text-gray-500">Click "Add Policy" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insurancePolicies.map((policy) => (
                    <div key={policy.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(policy.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(policy.status)}`}>
                            {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePolicy(policy.id)}
                          disabled={locked}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Insurance Type</label>
                          <select
                            value={policy.type}
                            onChange={(e) => updatePolicy(policy.id, { type: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            disabled={locked}
                          >
                            <option value="">Select type</option>
                            {insuranceTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Insurance Provider</label>
                          <input
                            type="text"
                            value={policy.provider}
                            onChange={(e) => updatePolicy(policy.id, { provider: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            placeholder="Provider name"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Policy Number</label>
                          <input
                            type="text"
                            value={policy.policyNumber}
                            onChange={(e) => updatePolicy(policy.id, { policyNumber: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            placeholder="Policy number"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Coverage Amount</label>
                          <input
                            type="number"
                            value={policy.coverage}
                            onChange={(e) => updatePolicy(policy.id, { coverage: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            placeholder="$0"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Deductible</label>
                          <input
                            type="number"
                            value={policy.deductible}
                            onChange={(e) => updatePolicy(policy.id, { deductible: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            placeholder="$0"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Annual Premium</label>
                          <input
                            type="number"
                            value={policy.premium}
                            onChange={(e) => updatePolicy(policy.id, { premium: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            placeholder="$0"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Policy Start Date</label>
                          <input
                            type="date"
                            value={policy.startDate}
                            onChange={(e) => updatePolicy(policy.id, { startDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Policy End Date</label>
                          <input
                            type="date"
                            value={policy.endDate}
                            onChange={(e) => updatePolicy(policy.id, { endDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={policy.notes}
                          onChange={(e) => updatePolicy(policy.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                          rows={2}
                          placeholder="Additional policy details..."
                          disabled={locked}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              {/* Claims History */}
              <div>
                <h4 className="font-semibold mb-3">Claims History (Last 5 Years)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Claims Filed
                    </label>
                    <input
                      type="number"
                      value={formData?.claimsCount || ''}
                      onChange={(e) => onInputChange?.('claimsCount', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                      placeholder="0"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Claims Paid
                    </label>
                    <input
                      type="number"
                      value={formData?.claimsPaid || ''}
                      onChange={(e) => onInputChange?.('claimsPaid', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                      placeholder="$0"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Claims Details */}
              <div>
                <label className="block font-semibold mb-2">
                  Claims Summary
                </label>
                <textarea
                  value={formData?.claimsSummary || ''}
                  onChange={(e) => onInputChange?.('claimsSummary', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Describe any significant claims, lessons learned, and impact on operations..."
                  disabled={locked}
                />
              </div>

              {/* Claims Documentation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Claims Documentation
                </h4>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('claimsDocumentation', file);
                        toast.success('Claims documentation uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload claims history reports or summaries
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              {/* Coverage Assessment */}
              <div>
                <h4 className="font-semibold mb-3">Insurance Coverage Assessment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">
                      Coverage Adequacy Review
                    </label>
                    <textarea
                      value={formData?.coverageAssessment || ''}
                      onChange={(e) => onInputChange?.('coverageAssessment', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      placeholder="Assess whether current coverage is adequate for your organization's needs..."
                      disabled={locked}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold mb-2">
                      Insurance Gaps & Recommendations
                    </label>
                    <textarea
                      value={formData?.insuranceGaps || ''}
                      onChange={(e) => onInputChange?.('insuranceGaps', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      placeholder="Identify any coverage gaps and recommendations for improvement..."
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Annual Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Last Insurance Review Date
                  </label>
                  <input
                    type="date"
                    value={formData?.lastInsuranceReview || ''}
                    onChange={(e) => onInputChange?.('lastInsuranceReview', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    disabled={locked}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Next Review Scheduled
                  </label>
                  <input
                    type="date"
                    value={formData?.nextInsuranceReview || ''}
                    onChange={(e) => onInputChange?.('nextInsuranceReview', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Insurance Certificates */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Insurance Certificates
                </h4>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('insuranceCertificates', file);
                        toast.success('Insurance certificates uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                    disabled={locked}
                    className="block"
                    multiple
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload current certificates of insurance
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

export default InsuranceSection;