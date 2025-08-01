import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, DollarSign, Calendar, Award, 
  Briefcase, Target, TrendingUp, UserCheck, Gift
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface StaffMember {
  id: string | number;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  donorRole: boolean;
  donationAmount?: number;
  email: string;
  phone: string;
}

interface ManagementData {
  fundraisingPlan: string;
  marketingPlan: string;
  volunteerRecruitment: string;
  organizationalChart: File | null;
  staffingPlan: string;
  successionPlan: string;
  developmentStrategy: string;
  donorRetention: string;
  [key: string]: unknown;
}

interface ManagementSectionProps {
  management: ManagementData;
  staffMembers: StaffMember[];
  errors: unknown;
  locked: boolean;
  onManagementChange: (field: string, value: unknown) => void;
  onStaffMembersChange: (members: StaffMember[]) => void;
  onShowStaffManager?: () => void;
  onFileUpload?: (field: string, file: File) => void;
}

const ManagementSection: React.FC<ManagementSectionProps> = ({
  management,
  staffMembers,
  errors,
  locked,
  onManagementChange,
  onStaffMembersChange,
  onShowStaffManager,
  onFileUpload
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fundraising' | 'staffing'>('overview');

  const calculateTotalSalary = () => {
    return staffMembers.reduce((total, staff) => total + (staff.salary || 0), 0);
  };

  const calculateTotalDonations = () => {
    return staffMembers
      .filter(s => s.donorRole)
      .reduce((total, staff) => total + (staff.donationAmount || 0), 0);
  };

  const addStaffMember = () => {
    const newStaff: StaffMember = {
      id: Date.now(),
      name: '',
      position: '',
      department: '',
      salary: 0,
      startDate: '',
      donorRole: false,
      email: '',
      phone: ''
    };
    onStaffMembersChange([...staffMembers, newStaff]);
  };

  const updateStaffMember = (id: string | number, updates: Partial<StaffMember>) => {
    onStaffMembersChange(staffMembers.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const removeStaffMember = (id: string | number) => {
    onStaffMembersChange(staffMembers.filter(s => s.id !== id));
    toast.info('Staff member removed');
  };

  return (
    <div className="space-y-6">
      {/* Staff Overview */}
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Staff & Management Overview
          </h3>
          {onShowStaffManager && (
            <button
              type="button"
              onClick={onShowStaffManager}
              disabled={locked}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Staff Manager
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{staffMembers.length}</div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${calculateTotalSalary().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Salary</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {staffMembers.filter(s => s.donorRole).length}
            </div>
            <div className="text-sm text-gray-600">Donor Staff</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${calculateTotalDonations().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Staff Donations</div>
          </div>
        </div>

        {/* Recent Staff */}
        {staffMembers.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-3">Recent Staff Members</h4>
            <div className="space-y-2">
              {staffMembers.slice(0, 3).map(staff => (
                <div key={staff.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{staff.name}</span>
                    {staff.donorRole && (
                      <Gift className="w-3 h-3 text-green-600 inline ml-2" />
                    )}
                  </div>
                  <div className="text-gray-600">{staff.position}</div>
                </div>
              ))}
              {staffMembers.length > 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  And {staffMembers.length - 3} more staff members...
                </p>
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
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Strategic Plans
            </button>
            <button
              onClick={() => setActiveTab('fundraising')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'fundraising'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Fundraising & Development
            </button>
            <button
              onClick={() => setActiveTab('staffing')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'staffing'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Staffing & HR
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Strategic Plans Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Marketing Plan */}
              <div>
                <label className="block font-semibold mb-2">
                  Marketing Plan <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={(management as any).marketingPlan || ''}
                  onChange={(content) => onManagementChange('marketingPlan', content)}
                  placeholder="Describe your marketing and outreach strategies..."
                  disabled={locked}
                  height={250}
                />
                {(errors as any).marketingPlan && (
                  <p className="text-red-600 text-sm mt-1">{(errors as any).marketingPlan}</p>
                )}
              </div>

              {/* Volunteer Recruitment */}
              <div>
                <label className="block font-semibold mb-2">
                  Volunteer Recruitment Strategy
                </label>
                <RichTextEditor
                  value={(management as any).volunteerRecruitment || ''}
                  onChange={(content) => onManagementChange('volunteerRecruitment', content)}
                  placeholder="How do you recruit and retain volunteers?"
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Organizational Chart */}
              <div>
                <label className="block font-semibold mb-2">
                  Organizational Chart
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('organizationalChart', file);
                        toast.success('Organizational chart uploaded');
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={locked}
                    className="block"
                  />
                  {management.organizationalChart && (
                    <span className="text-sm text-green-600">
                      Chart uploaded
                    </span>
                  )}
                </div>
                <small className="text-gray-500 block mt-1">
                  Upload your organizational structure diagram
                </small>
              </div>

              {/* Succession Plan */}
              <div>
                <label className="block font-semibold mb-2">
                  Succession Plan
                </label>
                <RichTextEditor
                  value={(management as any).successionPlan || ''}
                  onChange={(content) => onManagementChange('successionPlan', content)}
                  placeholder="Describe succession planning for key positions..."
                  disabled={locked}
                  height={200}
                />
              </div>
            </div>
          )}

          {/* Fundraising Tab */}
          {activeTab === 'fundraising' && (
            <div className="space-y-6">
              {/* Fundraising Plan */}
              <div>
                <label className="block font-semibold mb-2">
                  Fundraising Plan <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={(management as any).fundraisingPlan || ''}
                  onChange={(content) => onManagementChange('fundraisingPlan', content)}
                  placeholder="Describe your fundraising strategy and plan..."
                  disabled={locked}
                  height={300}
                />
                {(errors as any).fundraisingPlan && (
                  <p className="text-red-600 text-sm mt-1">{(errors as any).fundraisingPlan}</p>
                )}
              </div>

              {/* Development Strategy */}
              <div>
                <label className="block font-semibold mb-2">
                  Development Strategy <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={(management as any).developmentStrategy || ''}
                  onChange={(content) => onManagementChange('developmentStrategy', content)}
                  placeholder="Outline your resource development approach..."
                  disabled={locked}
                  height={250}
                />
                {(errors as any).developmentStrategy && (
                  <p className="text-red-600 text-sm mt-1">{(errors as any).developmentStrategy}</p>
                )}
              </div>

              {/* Donor Retention */}
              <div>
                <label className="block font-semibold mb-2">
                  Donor Retention Strategy
                </label>
                <RichTextEditor
                  value={(management as any).donorRetention || ''}
                  onChange={(content) => onManagementChange('donorRetention', content)}
                  placeholder="How do you maintain and grow donor relationships?"
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Fundraising Goals */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Fundraising Goals & Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Annual Fundraising Goal
                    </label>
                    <input
                      type="number"
                      value={(management as any).annualFundraisingGoal || ''}
                      onChange={(e) => onManagementChange('annualFundraisingGoal', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$0"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Major Gift Threshold
                    </label>
                    <input
                      type="number"
                      value={(management as any).majorGiftThreshold || ''}
                      onChange={(e) => onManagementChange('majorGiftThreshold', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$1,000"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Donor Retention Rate (%)
                    </label>
                    <input
                      type="number"
                      value={(management as any).donorRetentionRate || ''}
                      onChange={(e) => onManagementChange('donorRetentionRate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="75"
                      min="0"
                      max="100"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Cost to Raise $1
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={(management as any).costToRaiseDollar || ''}
                      onChange={(e) => onManagementChange('costToRaiseDollar', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.25"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staffing Tab */}
          {activeTab === 'staffing' && (
            <div className="space-y-6">
              {/* Staffing Plan */}
              <div>
                <label className="block font-semibold mb-2">
                  Staffing Plan
                </label>
                <RichTextEditor
                  value={(management as any).staffingPlan || ''}
                  onChange={(content) => onManagementChange('staffingPlan', content)}
                  placeholder="Describe your staffing structure and plans..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Staff List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Staff Members</h4>
                  <button
                    type="button"
                    onClick={addStaffMember}
                    disabled={locked}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </button>
                </div>

                {staffMembers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No staff members added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={staff.name}
                              onChange={(e) => updateStaffMember(staff.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Full name"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Position</label>
                            <input
                              type="text"
                              value={staff.position}
                              onChange={(e) => updateStaffMember(staff.id, { position: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Job title"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Department</label>
                            <input
                              type="text"
                              value={staff.department}
                              onChange={(e) => updateStaffMember(staff.id, { department: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Department"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Annual Salary</label>
                            <input
                              type="number"
                              value={staff.salary}
                              onChange={(e) => updateStaffMember(staff.id, { salary: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="$0"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={staff.startDate}
                              onChange={(e) => updateStaffMember(staff.id, { startDate: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                              disabled={locked}
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={staff.donorRole}
                                onChange={(e) => updateStaffMember(staff.id, { donorRole: e.target.checked })}
                                className="rounded"
                                disabled={locked}
                              />
                              <span className="text-sm">Is also a donor</span>
                            </label>
                          </div>
                          {staff.donorRole && (
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">
                                Annual Donation
                              </label>
                              <input
                                type="number"
                                value={staff.donationAmount || ''}
                                onChange={(e) => updateStaffMember(staff.id, { donationAmount: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="$0"
                                disabled={locked}
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeStaffMember(staff.id)}
                            disabled={locked}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HR Policies */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  HR Policies & Benefits
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(management as any).hasEmployeeHandbook || false}
                      onChange={(e) => onManagementChange('hasEmployeeHandbook', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Employee Handbook</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(management as any).offersHealthInsurance || false}
                      onChange={(e) => onManagementChange('offersHealthInsurance', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Health Insurance</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(management as any).offersRetirement || false}
                      onChange={(e) => onManagementChange('offersRetirement', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Retirement Plan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(management as any).performanceReviews || false}
                      onChange={(e) => onManagementChange('performanceReviews', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Annual Performance Reviews</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementSection;