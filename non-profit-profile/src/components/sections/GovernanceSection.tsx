import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Building2, Plus, Edit2, Trash2, Calendar,
  ChevronDown, ChevronUp, BarChart3, PieChart, Eye, EyeOff,
  FileText, Upload, Download, Clock, Check, X, UserPlus,
  Settings, Filter, Search, Save, RefreshCw, Layout, Grid
} from 'lucide-react';
import ContactSelector from '../ContactSelector';
import NarrativeEntryField from '../NarrativeEntryField';
import DocumentUploadField, { DocumentInfo } from '../DocumentUploadField';
import { toast } from 'react-toastify';
import ConfirmationDialog, { useConfirmation } from '../ConfirmationDialog';
import ModuleHeader from '../ModuleHeader';

interface BoardMember {
  contactId: string;
  contact: unknown; // From Contact Manager
  role: string;
  termStart: string;
  termEnd?: string;
  isIndefinite?: boolean;
  committees?: string[];
  isChair?: boolean;
  isCoChair?: boolean;
  attendance?: number;
}

interface Committee {
  id: string;
  name: string;
  type: 'board' | 'advisory' | 'standing' | 'ad-hoc' | 'user-defined';
  description?: string;
  members: BoardMember[];
  chair?: string;
  coChairs?: string[];
  meetingSchedule?: string;
  purpose?: string;
  bylaws?: unknown; // Document
}

interface GovernanceSectionProps {
  boardMembers: BoardMember[];
  committees: Committee[];
  contacts: unknown[];
  groups: string[]; // From Contact Manager groups
  narrativeFields: Record<string, unknown>;
  documents: Record<string, unknown>;
  onBoardMemberAdd: (member: BoardMember) => void;
  onBoardMemberUpdate: (contactId: string, updates: Partial<BoardMember>) => void;
  onBoardMemberRemove: (contactId: string) => void;
  onCommitteeAdd: (committee: Committee) => void;
  onCommitteeUpdate: (committeeId: string, updates: Partial<Committee>) => void;
  onCommitteeRemove: (committeeId: string) => void;
  onNarrativeChange: (fieldId: string, content: string) => void;
  onDocumentUpload: (fieldId: string, file: File) => void;
  className?: string;
  locked?: boolean;
}

const GovernanceSection: React.FC<GovernanceSectionProps> = ({
  boardMembers,
  committees,
  contacts,
  groups,
  narrativeFields,
  documents,
  onBoardMemberAdd,
  onBoardMemberUpdate,
  onBoardMemberRemove,
  onCommitteeAdd,
  onCommitteeUpdate,
  onCommitteeRemove,
  onNarrativeChange,
  onDocumentUpload,
  className = '',
  locked = false
}) => {
  const [selectedView, setSelectedView] = useState<'board' | 'committees' | 'meetings'>('board');
  const [visualizationMode, setVisualizationMode] = useState<'list' | 'stats' | 'chart'>('list');
  const [selectedCommittee, setSelectedCommittee] = useState<string>('all');
  const [_showDemographics, _setShowDemographics] = useState(true);
  const [hideNames, setHideNames] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [addingCommittee, setAddingCommittee] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [organizationStructureType, setOrganizationStructureType] = useState<string>('traditional');
  const [_customStructure, _setCustomStructure] = useState<unknown>({});
  const [showAttendanceTracker, setShowAttendanceTracker] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('board');
  const [isLocked, setIsLocked] = useState(locked);
  const [isDraft, setIsDraft] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Default committee types
  const defaultCommitteeTypes = [
    { id: 'advisory', name: 'Advisory Board', type: 'advisory' },
    { id: 'executive', name: 'Executive Committee', type: 'standing' },
    { id: 'finance', name: 'Finance Committee', type: 'standing' },
    { id: 'governance', name: 'Governance Committee', type: 'standing' },
    { id: 'audit', name: 'Audit Committee', type: 'standing' },
    { id: 'compensation', name: 'Compensation Committee', type: 'standing' },
    { id: 'fundraising', name: 'Fundraising Committee', type: 'standing' },
    { id: 'programs', name: 'Programs Committee', type: 'standing' },
    { id: 'nominating', name: 'Nominating Committee', type: 'standing' }
  ];

  // Organization structure types
  const structureTypes = [
    { id: 'traditional', name: 'Traditional Board Structure', description: 'Board of Directors with committees' },
    { id: 'working-board', name: 'Working Board', description: 'Board members actively involved in operations' },
    { id: 'policy-board', name: 'Policy Board', description: 'Board focuses on policy, staff handles operations' },
    { id: 'advisory-only', name: 'Advisory Only', description: 'Advisory board with no governing authority' },
    { id: 'collective', name: 'Collective/Cooperative', description: 'Shared leadership model' },
    { id: 'custom', name: 'Custom Structure', description: 'Define your own organizational structure' }
  ];

  // Get all board and committee heads
  const getAllHeads = () => {
    const heads: Array<{ name: string; role: string; committee: string }> = [];
    
    // Board chair/co-chairs
    const boardChairs = boardMembers.filter(m => m.isChair || m.isCoChair);
    boardChairs.forEach(chair => {
      heads.push({
        name: (chair.contact as any)?.name || 'Unknown',
        role: chair.isChair ? 'Board Chair' : 'Board Co-Chair',
        committee: 'Board of Directors'
      });
    });

    // Committee chairs
    committees.forEach(committee => {
      if (committee.chair) {
        const chairMember = boardMembers.find(m => m.contactId === committee.chair);
        if (chairMember) {
          heads.push({
            name: (chairMember.contact as any)?.name || 'Unknown',
            role: 'Chair',
            committee: committee.name
          });
        }
      }
      
      committee.coChairs?.forEach(coChairId => {
        const coChairMember = boardMembers.find(m => m.contactId === coChairId);
        if (coChairMember) {
          heads.push({
            name: (coChairMember.contact as any)?.name || 'Unknown',
            role: 'Co-Chair',
            committee: committee.name
          });
        }
      });
    });

    return heads;
  };

  // Calculate demographics
  const calculateDemographics = (members: BoardMember[]) => {
    const demographics = {
      total: members.length,
      gender: {} as Record<string, number>,
      ethnicity: {} as Record<string, number>,
      ageRange: {} as Record<string, number>,
      tenure: {} as Record<string, number>
    };

    members.forEach(member => {
      const contact = member.contact;
      if ((contact as any)?.demographics) {
        // Gender
        const gender = (contact as any).demographics.gender || 'Not Specified';
        demographics.gender[gender] = (demographics.gender[gender] || 0) + 1;

        // Ethnicity
        const ethnicity = (contact as any).demographics.ethnicity || 'Not Specified';
        demographics.ethnicity[ethnicity] = (demographics.ethnicity[ethnicity] || 0) + 1;

        // Age range
        if ((contact as any).demographics.age) {
          const age = (contact as any).demographics.age;
          let range = 'Not Specified';
          if (age < 30) range = 'Under 30';
          else if (age < 40) range = '30-39';
          else if (age < 50) range = '40-49';
          else if (age < 60) range = '50-59';
          else if (age < 70) range = '60-69';
          else range = '70+';
          demographics.ageRange[range] = (demographics.ageRange[range] || 0) + 1;
        }
      }

      // Tenure
      if (member.termStart) {
        const startYear = new Date(member.termStart).getFullYear();
        const currentYear = new Date().getFullYear();
        const years = currentYear - startYear;
        let tenureRange = '< 1 year';
        if (years >= 1 && years < 3) tenureRange = '1-3 years';
        else if (years >= 3 && years < 5) tenureRange = '3-5 years';
        else if (years >= 5 && years < 10) tenureRange = '5-10 years';
        else if (years >= 10) tenureRange = '10+ years';
        demographics.tenure[tenureRange] = (demographics.tenure[tenureRange] || 0) + 1;
      }
    });

    return demographics;
  };

  // Handle member term format
  const formatTerm = (member: BoardMember) => {
    if (member.isIndefinite) return 'Indefinite';
    if (!member.termStart) return 'Not specified';
    
    const start = new Date(member.termStart);
    const startYear = start.getFullYear();
    
    if (member.termEnd) {
      const end = new Date(member.termEnd);
      const endYear = end.getFullYear();
      return `${startYear} - ${endYear}`;
    }
    
    return `${startYear} - Present`;
  };

  // Helper to check if fields are disabled
  const isFieldDisabled = () => isLocked;

  // Handle export
  const handleExport = () => {
    console.log('Exporting governance data...');
    toast.info('Export functionality coming soon');
  };

  // Handle print
  const handlePrint = () => {
    console.log('Printing governance data...');
    toast.info('Print functionality coming soon');
  };

  // Handle trash
  const handleTrash = async () => {
    const confirmed = await confirm({
      title: 'Delete All Governance Data',
      message: 'Are you sure you want to delete all governance data? This action cannot be undone.',
      confirmText: 'Delete All',
      variant: 'danger',
      onConfirm: () => {
        // Clear all data
        boardMembers.forEach(member => onBoardMemberRemove(member.contactId));
        committees.forEach(committee => onCommitteeRemove(committee.id));
        toast.success('All governance data deleted');
      }
    });
  };

  // Tab configuration
  const tabs = [
    {
      key: 'board',
      label: 'Board Members',
      icon: Users,
      count: boardMembers.length
    },
    {
      key: 'committees',
      label: 'Committees',
      icon: Building2,
      count: committees.length
    },
    {
      key: 'meetings',
      label: 'Meetings',
      icon: Calendar
    }
  ];

  // Render board member row
  const renderBoardMemberRow = (member: BoardMember) => {
    const isEditing = editingMember === member.contactId;

    return (
      <div key={member.contactId} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
        {/* Member Info - 2/3 width */}
        <div className="flex-1 flex items-center space-x-4" style={{ flex: '0 0 66.666667%' }}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {(member.contact as any)?.avatar ? (
              <img src={(member.contact as any).avatar} alt={(member.contact as any).name} className="w-10 h-10 rounded-full" />
            ) : (
              <Users className="w-5 h-5 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {hideNames ? 'Member' : (member.contact as any)?.name || 'Unknown'}
              </h4>
              {member.isChair && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Chair</span>
              )}
              {member.isCoChair && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Co-Chair</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{member.role}</p>
            {member.committees && member.committees.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Committees: {member.committees.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Term - 1/3 width */}
        <div className="flex-none" style={{ width: '33.333333%' }}>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="date"
                value={member.termStart}
                onChange={(e) => onBoardMemberUpdate(member.contactId, { termStart: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                disabled={isFieldDisabled()}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={member.isIndefinite}
                  onChange={(e) => onBoardMemberUpdate(member.contactId, { isIndefinite: e.target.checked })}
                  className="w-4 h-4"
                  disabled={isFieldDisabled()}
                />
                <label className="text-sm text-gray-600">Indefinite</label>
              </div>
              {!member.isIndefinite && (
                <input
                  type="date"
                  value={member.termEnd || ''}
                  onChange={(e) => onBoardMemberUpdate(member.contactId, { termEnd: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  disabled={isFieldDisabled()}
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-700">{formatTerm(member)}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingMember(isEditing ? null : member.contactId)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded disabled:opacity-50"
            title={isEditing ? "Save" : "Edit"}
            disabled={isFieldDisabled()}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleRemoveMember(member.contactId)}
            className="p-1 text-gray-500 hover:text-red-600 rounded disabled:opacity-50"
            title="Remove"
            disabled={isFieldDisabled()}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Handle remove member
  const handleRemoveMember = async (contactId: string) => {
    const _confirmed = await confirm({
      title: 'Remove Board Member',
      message: 'Are you sure you want to remove this board member?',
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        onBoardMemberRemove(contactId);
        toast.success('Board member removed');
      }
    });
  };

  // Render visualization
  const renderVisualization = () => {
    if (visualizationMode === 'stats') {
      const demographics = calculateDemographics(boardMembers);
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Members */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Total Members</h4>
            <p className="text-2xl font-bold text-gray-900">{demographics.total}</p>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h4>
            <div className="space-y-1">
              {Object.entries(demographics.gender).map(([gender, count]) => (
                <div key={gender} className="flex justify-between text-sm">
                  <span className="text-gray-600">{gender}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenure */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Board Tenure</h4>
            <div className="space-y-1">
              {Object.entries(demographics.tenure).map(([range, count]) => (
                <div key={range} className="flex justify-between text-sm">
                  <span className="text-gray-600">{range}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Committees */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Committee Participation</h4>
            <p className="text-2xl font-bold text-gray-900">{committees.length}</p>
            <p className="text-sm text-gray-600">Active Committees</p>
          </div>
        </div>
      );
    }

    if (visualizationMode === 'chart') {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Structure</h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
            <p className="text-gray-500">
              Interactive org chart visualization would be rendered here
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`governance-section ${className}`}>
      {/* Module Header with CRUD */}
      <ModuleHeader
        title="Governance"
        subtitle="Board members, committees, and organizational structure"
        icon={Shield}
        iconColor="text-purple-600"
        sectionId="governance"
        tabs={tabs}
        activeTab={selectedView}
        onTabChange={(tab) => setSelectedView(tab as 'board' | 'committees' | 'meetings')}
        onLockToggle={setIsLocked}
        onDraftToggle={setIsDraft}
        onFinalToggle={setIsFinal}
        onExport={handleExport}
        onPrint={handlePrint}
        onTrash={handleTrash}
        locked={isLocked}
        isDraft={isDraft}
        isFinal={isFinal}
      />

      <div className="p-6 bg-white">
        {/* Organization Structure Type */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Organization Structure Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {structureTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setOrganizationStructureType(type.id)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  organizationStructureType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isFieldDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFieldDisabled()}
              >
                <h4 className="font-medium text-gray-900">{type.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVisualizationMode('list')}
              className={`p-2 rounded ${visualizationMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="List view"
            >
              <Layout className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisualizationMode('stats')}
              className={`p-2 rounded ${visualizationMode === 'stats' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Statistics view"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisualizationMode('chart')}
              className={`p-2 rounded ${visualizationMode === 'chart' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Chart view"
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Board Members View */}
        {selectedView === 'board' && (
          <div className="space-y-6">
            {/* Add Member Button */}
            {!addingMember && (
              <button
                onClick={() => setAddingMember(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isFieldDisabled()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Board Member
              </button>
            )}

            {/* Add Member Form */}
            {addingMember && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Board Member</h3>
                <ContactSelector
                  label="Select Contact"
                  value={null}
                  onChange={(contact) => {
                    if (contact && !(contact instanceof Array)) {
                      onBoardMemberAdd({
                        contactId: contact.id,
                        contact,
                        role: 'Board Member',
                        termStart: new Date().toISOString().split('T')[0],
                        committees: []
                      });
                      setAddingMember(false);
                      toast.success('Board member added');
                    }
                  }}
                  type="person"
                  showAddButton={true}
                  placeholder="Search for contact..."
                />
                <button
                  onClick={() => setAddingMember(false)}
                  className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Board Members List */}
            {visualizationMode === 'list' && (
              <div className="space-y-3">
                {boardMembers.length > 0 ? (
                  boardMembers.map(member => renderBoardMemberRow(member))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No board members added yet. Click "Add Board Member" to get started.
                  </div>
                )}
              </div>
            )}

            {/* Visualization */}
            {visualizationMode !== 'list' && renderVisualization()}
          </div>
        )}

        {/* Committees View */}
        {selectedView === 'committees' && (
          <div className="space-y-6">
            {/* Committee Selector */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCommittee}
                onChange={(e) => setSelectedCommittee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={isFieldDisabled()}
              >
                <option value="all">All Committees</option>
                {committees.map(committee => (
                  <option key={committee.id} value={committee.id}>{committee.name}</option>
                ))}
              </select>

              <button
                onClick={() => setAddingCommittee(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isFieldDisabled()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Committee
              </button>
            </div>

            {/* Add Committee Form */}
            {addingCommittee && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Committee</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Committee Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Select or create...</option>
                      {defaultCommitteeTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                      <option value="custom">Custom Committee</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setAddingCommittee(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle committee creation
                        setAddingCommittee(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Committee
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Committees List */}
            {selectedCommittee === 'all' ? (
              <div className="space-y-4">
                {committees.map(committee => (
                  <div key={committee.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900">{committee.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {committee.members.length} members
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                {/* Committee details */}
                <p className="text-gray-500">Committee details would be shown here</p>
              </div>
            )}
          </div>
        )}

        {/* Meetings View */}
        {selectedView === 'meetings' && (
          <div className="space-y-6">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Meeting management coming soon</p>
            </div>
          </div>
        )}

        {/* Board Demographics */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Board Demographics</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setHideNames(!hideNames)}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {hideNames ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {hideNames ? 'Show Names' : 'Hide Names'}
              </button>
            </div>
          </div>
          
          <NarrativeEntryField
            id="narrative-field-1"
            label=""
            value={(narrativeFields.boardDemographics as string) || ''}
            onChange={(content) => onNarrativeChange('boardDemographics', content)}
            placeholder="Board demographics automatically populate from the Board Manager. Use the Board Manager above to add board members with their demographic information."
            className="mb-4"
          />
        </div>

        {/* Board Chair Information */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Board & Committee Leadership</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              {getAllHeads().map((head, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{head.name}</span>
                    <span className="text-gray-600"> - {head.role}</span>
                  </div>
                  <span className="text-sm text-gray-500">{head.committee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Tracking */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Attendance Tracking</h3>
            <button
              onClick={() => setShowAttendanceTracker(!showAttendanceTracker)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isFieldDisabled()}
            >
              {showAttendanceTracker ? 'Hide' : 'Show'} Attendance Tracker
            </button>
          </div>
          
          {showAttendanceTracker && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <select
                  value={selectedMeetingType}
                  onChange={(e) => setSelectedMeetingType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={isFieldDisabled()}
                >
                  <option value="board">Board Meeting</option>
                  {committees.map(committee => (
                    <option key={committee.id} value={committee.id}>{committee.name} Meeting</option>
                  ))}
                </select>
                
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={isFieldDisabled()}
                >
                  Create Meeting
                </button>
                
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  disabled={isFieldDisabled()}
                >
                  Upload Minutes
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                Minutes creator interface would be displayed here
              </div>
            </div>
          )}
        </div>

        {/* Additional Narrative Fields */}
        <div className="space-y-8 mt-8">
          <NarrativeEntryField
            id="narrative-field-2"
            label="Board Information"
            value={(narrativeFields.boardInfo as string) || ''}
            onChange={(content) => onNarrativeChange('boardInfo', content)}
            placeholder="Auto-fills with available board information. You can edit and add additional details."
            required={true}
          />

          <DocumentUploadField
            label="Committee Bylaws or Policies and Procedures"
            value={documents.committeeBylaws as DocumentInfo | DocumentInfo[] | null}
            onChange={(files) => onDocumentUpload('committeeBylaws', files as any)}
            multiple={true}
            helpText="Upload bylaws or policies for boards and committees, or create new ones"
          />

          <NarrativeEntryField
            id="narrative-field-3"
            label="Board Compensation Policy"
            value={(narrativeFields.boardCompensationPolicy as string) || ''}
            onChange={(content) => onNarrativeChange('boardCompensationPolicy', content)}
            placeholder="Describe your board compensation policy, if applicable"
          />

          <NarrativeEntryField
            id="narrative-field-4"
            label="Board Election Process"
            value={(narrativeFields.boardElectionProcess as string) || ''}
            onChange={(content) => onNarrativeChange('boardElectionProcess', content)}
            placeholder="Describe your board election process and procedures"
          />

          <NarrativeEntryField
            id="narrative-field-5"
            label="Board Orientation Process"
            value={(narrativeFields.boardOrientationProcess as string) || ''}
            onChange={(content) => onNarrativeChange('boardOrientationProcess', content)}
            placeholder="Describe how new board members are oriented"
          />

          <NarrativeEntryField
            id="narrative-field-6"
            label="Board Evaluation Process"
            value={(narrativeFields.boardEvaluationProcess as string) || ''}
            onChange={(content) => onNarrativeChange('boardEvaluationProcess', content)}
            placeholder="Describe your board evaluation process"
          />

          <NarrativeEntryField
            id="narrative-field-7"
            label="Board Succession Planning"
            value={(narrativeFields.boardSuccessionPlanning as string) || ''}
            onChange={(content) => onNarrativeChange('boardSuccessionPlanning', content)}
            placeholder="Describe your board succession planning process"
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default GovernanceSection;