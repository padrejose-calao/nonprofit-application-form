import React, { useState } from 'react';
import { 
  Users, Plus, Edit, Trash2, Calendar, Clock, FileText, 
  Check, AlertCircle, ChevronRight, Building2, UserCheck, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import { BoardMember, Committee, BoardMeeting, Contact } from '../../types/NonprofitTypes';
import ModuleHeader from '../ModuleHeader';

interface GovernanceSectionProps {
  boardMembers: BoardMember[];
  committees: Committee[];
  boardMeetings: BoardMeeting[];
  contacts: Contact[];
  errors: unknown;
  locked: boolean;
  onBoardMembersChange: (members: BoardMember[]) => void;
  onCommitteesChange: (committees: Committee[]) => void;
  onBoardMeetingsChange: (meetings: BoardMeeting[]) => void;
  onShowContactManager: () => void;
  onInputChange: (field: string, value: unknown) => void;
  formData: unknown;
}

const GovernanceSection: React.FC<GovernanceSectionProps> = ({
  boardMembers,
  committees,
  boardMeetings,
  contacts,
  errors,
  locked,
  onBoardMembersChange,
  onCommitteesChange,
  onBoardMeetingsChange,
  onShowContactManager,
  onInputChange,
  formData
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'committees' | 'meetings'>('board');
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [isLocked, setIsLocked] = useState(locked);
  const [isDraft, setIsDraft] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [newMeeting, setNewMeeting] = useState<BoardMeeting>({
    id: '',
    date: '',
    type: 'regular',
    attendees: [],
    topics: '',
    minutes: '',
    uploaded: false,
    agenda: '',
    quorum: false,
    decisions: []
  });

  const boardMemberCount = contacts.filter(c => c.groups?.includes('board')).length;

  const _addBoardMember = () => {
    const newMember: BoardMember = {
      id: Date.now(),
      name: '',
      role: '',
      retained: true,
      title: '',
      email: '',
      phone: '',
      termStart: '',
      termEnd: '',
      bio: '',
      expertise: '',
      conflicts: '',
      attendance: [],
      committees: []
    };
    onBoardMembersChange([...boardMembers, newMember]);
  };

  const _removeBoardMember = (id: string | number) => {
    onBoardMembersChange(boardMembers.filter(m => m.id !== id));
    toast.info('Board member removed');
  };

  const _updateBoardMember = (id: string | number, updates: Partial<BoardMember>) => {
    onBoardMembersChange(boardMembers.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const addCommittee = () => {
    const newCommittee: Committee = {
      id: Date.now(),
      name: '',
      members: [],
      description: '',
      chair: '',
      meetings: []
    };
    onCommitteesChange([...committees, newCommittee]);
  };

  const removeCommittee = (id: string | number) => {
    onCommitteesChange(committees.filter(c => c.id !== id));
    toast.info('Committee removed');
  };

  const updateCommittee = (id: string | number, updates: Partial<Committee>) => {
    onCommitteesChange(committees.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const saveMeeting = () => {
    if (!newMeeting.date || !newMeeting.type) {
      toast.error('Please fill in required meeting details');
      return;
    }

    const meeting: BoardMeeting = {
      ...newMeeting,
      id: Date.now().toString()
    };

    onBoardMeetingsChange([...boardMeetings, meeting]);
    setShowAddMeeting(false);
    setNewMeeting({
      id: '',
      date: '',
      type: 'regular',
      attendees: [],
      topics: '',
      minutes: '',
      uploaded: false,
      agenda: '',
      quorum: false,
      decisions: []
    });
    toast.success('Board meeting added');
  };

  const removeMeeting = (id: string) => {
    onBoardMeetingsChange(boardMeetings.filter(m => m.id !== id));
    toast.info('Meeting removed');
  };

  const handleExport = () => {
    // Implementation for exporting governance data
    console.log('Exporting governance data...');
  };

  const handlePrint = () => {
    // Custom print implementation if needed
    console.log('Printing governance information...');
  };

  // Tab configuration for ModuleHeader
  const tabs = [
    {
      key: 'board',
      label: 'Board Members',
      icon: Users,
      count: boardMemberCount
    },
    {
      key: 'committees',
      label: 'Committees',
      icon: Building2,
      count: committees.length
    },
    {
      key: 'meetings',
      label: 'Board Meetings',
      icon: Calendar,
      count: boardMeetings.length
    }
  ];

  const isFieldDisabled = () => isLocked;

  return (
    <div className="relative">
      {/* Standardized Module Header */}
      <ModuleHeader
        title="Governance"
        subtitle="Board members, committees, and meetings"
        icon={Shield}
        iconColor="text-purple-600"
        sectionId="governance"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'board' | 'committees' | 'meetings')}
        onLockToggle={setIsLocked}
        onDraftToggle={setIsDraft}
        onFinalToggle={setIsFinal}
        onExport={handleExport}
        onPrint={handlePrint}
        locked={isLocked}
        isDraft={isDraft}
        isFinal={isFinal}
      />

      <div className="p-6 bg-white">
        {/* Board Members Tab */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            {/* Board Member Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Board Members from Contacts: {boardMemberCount}
                  </span>
                </div>
                <button
                  onClick={onShowContactManager}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isFieldDisabled()}
                >
                  Manage Board Members in Contacts
                </button>
              </div>
            </div>

            {/* Board Members List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Board Member Details</h3>
                <button
                  onClick={_addBoardMember}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isFieldDisabled()}
                >
                  <Plus className="w-4 h-4" />
                  Add Board Member
                </button>
              </div>

              {boardMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No board members added yet.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add board members from your contacts or create new ones.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => _updateBoardMember(member.id, { name: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            placeholder="Board member name"
                            disabled={isFieldDisabled()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role/Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => _updateBoardMember(member.id, { role: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            placeholder="e.g., Chair, Vice Chair, Secretary"
                            disabled={isFieldDisabled()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={member.email || ''}
                            onChange={(e) => _updateBoardMember(member.id, { email: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            placeholder="board.member@example.com"
                            disabled={isFieldDisabled()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={member.phone || ''}
                            onChange={(e) => _updateBoardMember(member.id, { phone: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            placeholder="(555) 123-4567"
                            disabled={isFieldDisabled()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Term Start
                          </label>
                          <input
                            type="date"
                            value={member.termStart || ''}
                            onChange={(e) => _updateBoardMember(member.id, { termStart: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            disabled={isFieldDisabled()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Term End
                          </label>
                          <input
                            type="date"
                            value={member.termEnd || ''}
                            onChange={(e) => _updateBoardMember(member.id, { termEnd: e.target.value })}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                            disabled={isFieldDisabled()}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => _removeBoardMember(member.id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 disabled:opacity-50"
                          disabled={isFieldDisabled()}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Committees Tab */}
        {activeTab === 'committees' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Committees</h3>
              <button
                onClick={addCommittee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isFieldDisabled()}
              >
                <Plus className="w-4 h-4" />
                Add Committee
              </button>
            </div>

            {committees.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No committees created yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create committees to organize board work.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {committees.map((committee) => (
                  <div key={committee.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Committee Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={committee.name}
                          onChange={(e) => updateCommittee(committee.id, { name: e.target.value })}
                          className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                          placeholder="e.g., Finance Committee"
                          disabled={isFieldDisabled()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Committee Chair
                        </label>
                        <input
                          type="text"
                          value={committee.chair || ''}
                          onChange={(e) => updateCommittee(committee.id, { chair: e.target.value })}
                          className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                          placeholder="Chair person name"
                          disabled={isFieldDisabled()}
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={committee.description || ''}
                          onChange={(e) => updateCommittee(committee.id, { description: e.target.value })}
                          className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                          rows={2}
                          placeholder="Committee purpose and responsibilities"
                          disabled={isFieldDisabled()}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => removeCommittee(committee.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 disabled:opacity-50"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Board Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Board Meetings</h3>
              <button
                onClick={() => setShowAddMeeting(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isFieldDisabled()}
              >
                <Plus className="w-4 h-4" />
                Add Meeting
              </button>
            </div>

            {showAddMeeting && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-gray-900 mb-4">Add New Meeting</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMeeting.type}
                      onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as 'regular' | 'special' | 'annual' })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="regular">Regular Meeting</option>
                      <option value="special">Special Meeting</option>
                      <option value="annual">Annual Meeting</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topics/Agenda
                    </label>
                    <textarea
                      value={newMeeting.topics}
                      onChange={(e) => setNewMeeting({ ...newMeeting, topics: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows={2}
                      placeholder="Main topics discussed"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newMeeting.quorum}
                        onChange={(e) => setNewMeeting({ ...newMeeting, quorum: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Quorum Met</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddMeeting(false)}
                    className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMeeting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Meeting
                  </button>
                </div>
              </div>
            )}

            {boardMeetings.length === 0 && !showAddMeeting ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No board meetings recorded yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start tracking your board meetings and minutes.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {boardMeetings.map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-medium text-gray-900">
                            {new Date(meeting.date).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            meeting.type === 'annual' ? 'bg-purple-100 text-purple-700' :
                            meeting.type === 'special' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Meeting
                          </span>
                          {meeting.quorum && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="w-3 h-3" />
                              Quorum Met
                            </span>
                          )}
                        </div>
                        {meeting.topics && (
                          <p className="text-sm text-gray-600">{meeting.topics}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceSection;