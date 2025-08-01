import React, { useState } from 'react';
import { 
  Users, Plus, Edit, Trash2, Calendar, Clock, FileText, 
  Check, AlertCircle, ChevronRight, Building2, UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { BoardMember, Committee, BoardMeeting, Contact } from '../../types/NonprofitTypes';

interface GovernanceSectionProps {
  boardMembers: BoardMember[];
  committees: Committee[];
  boardMeetings: BoardMeeting[];
  contacts: Contact[];
  errors: any;
  locked: boolean;
  onBoardMembersChange: (members: BoardMember[]) => void;
  onCommitteesChange: (committees: Committee[]) => void;
  onBoardMeetingsChange: (meetings: BoardMeeting[]) => void;
  onShowContactManager: () => void;
  onInputChange: (field: string, value: any) => void;
  formData: any;
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

  const addBoardMember = () => {
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

  const removeBoardMember = (id: string | number) => {
    onBoardMembersChange(boardMembers.filter(m => m.id !== id));
    toast.info('Board member removed');
  };

  const updateBoardMember = (id: string | number, updates: Partial<BoardMember>) => {
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
    const meeting = {
      ...newMeeting,
      id: Date.now().toString()
    };
    onBoardMeetingsChange([...boardMeetings, meeting]);
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
    setShowAddMeeting(false);
    toast.success('Meeting added successfully');
  };

  const removeMeeting = (id: string) => {
    onBoardMeetingsChange(boardMeetings.filter(m => m.id !== id));
    toast.info('Meeting removed');
  };

  return (
    <div className="space-y-6">
      {/* Board Overview */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Board of Directors Overview
          </h3>
          <button
            type="button"
            onClick={onShowContactManager}
            disabled={locked}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Board Members
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{boardMemberCount}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.groups?.includes('board') && (c.boardInfo?.role || '').toLowerCase().includes('chair')).length}
            </div>
            <div className="text-sm text-gray-600">Chairs</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{committees.length}</div>
            <div className="text-sm text-gray-600">Committees</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{boardMeetings.length}</div>
            <div className="text-sm text-gray-600">Meetings</div>
          </div>
        </div>

        {/* Board Members List */}
        {boardMemberCount > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-3">Current Board Members</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contacts.filter(c => c.groups?.includes('board')).slice(0, 6).map(contact => (
                <div key={contact.id} className="border rounded p-3">
                  <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                  <div className="text-sm text-gray-600">{contact.boardInfo?.role || 'Board Member'}</div>
                  {contact.email && <div className="text-xs text-gray-500">{contact.email}</div>}
                  {contact.boardInfo?.committees && contact.boardInfo.committees.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {contact.boardInfo.committees.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {boardMemberCount > 6 && (
              <p className="text-sm text-gray-600 mt-3">
                And {boardMemberCount - 6} more members...
              </p>
            )}
          </div>
        )}

        {boardMemberCount === 0 && (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No board members added yet.</p>
            <p className="text-sm text-gray-500">Click "Manage Board Members" to add members.</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'board' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Board Composition
            </button>
            <button
              onClick={() => setActiveTab('committees')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'committees' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Committees
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'meetings' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Meetings & Minutes
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Board Composition Tab */}
          {activeTab === 'board' && (
            <div className="space-y-6">
              {/* Board Size */}
              <div>
                <label htmlFor="boardSize" className="block font-semibold mb-2">
                  Board Size <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Minimum</label>
                    <input
                      type="number"
                      value={formData.boardSizeMin || ''}
                      onChange={(e) => onInputChange('boardSizeMin', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                      min="1"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Maximum</label>
                    <input
                      type="number"
                      value={formData.boardSizeMax || ''}
                      onChange={(e) => onInputChange('boardSizeMax', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="15"
                      min="1"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Current</label>
                    <input
                      type="number"
                      value={boardMemberCount}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                {errors.boardSize && <p className="text-red-600 text-sm mt-1">{errors.boardSize}</p>}
              </div>

              {/* Board Term Limits */}
              <div>
                <label className="block font-semibold mb-2">Board Term Limits</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Term Length (years)</label>
                    <input
                      type="number"
                      value={formData.boardTermLength || ''}
                      onChange={(e) => onInputChange('boardTermLength', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                      min="1"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Term Limit</label>
                    <input
                      type="number"
                      value={formData.boardTermLimit || ''}
                      onChange={(e) => onInputChange('boardTermLimit', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2"
                      min="0"
                      disabled={locked}
                    />
                    <small className="text-gray-500">0 = no limit</small>
                  </div>
                </div>
              </div>

              {/* Meeting Frequency */}
              <div>
                <label htmlFor="meetingFrequency" className="block font-semibold mb-2">
                  Meeting Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  id="meetingFrequency"
                  value={formData.meetingFrequency || ''}
                  onChange={(e) => onInputChange('meetingFrequency', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={locked}
                >
                  <option value="">Select frequency</option>
                  <option value="monthly">Monthly</option>
                  <option value="bimonthly">Bi-monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semiannually">Semi-annually</option>
                  <option value="annually">Annually</option>
                  <option value="as-needed">As Needed</option>
                </select>
                {errors.meetingFrequency && <p className="text-red-600 text-sm mt-1">{errors.meetingFrequency}</p>}
              </div>

              {/* Quorum Requirements */}
              <div>
                <label htmlFor="quorumRequirement" className="block font-semibold mb-2">
                  Quorum Requirement
                </label>
                <input
                  type="text"
                  id="quorumRequirement"
                  value={formData.quorumRequirement || ''}
                  onChange={(e) => onInputChange('quorumRequirement', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Simple majority (50% + 1)"
                  disabled={locked}
                />
              </div>
            </div>
          )}

          {/* Committees Tab */}
          {activeTab === 'committees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Board Committees</h4>
                <button
                  type="button"
                  onClick={addCommittee}
                  disabled={locked}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Committee
                </button>
              </div>

              {committees.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No committees added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {committees.map((committee) => (
                    <div key={committee.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Committee Name
                          </label>
                          <input
                            type="text"
                            value={committee.name}
                            onChange={(e) => updateCommittee(committee.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Finance Committee"
                            disabled={locked}
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
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Chair name"
                            disabled={locked}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={committee.description || ''}
                            onChange={(e) => updateCommittee(committee.id, { description: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Committee purpose and responsibilities"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeCommittee(committee.id)}
                          disabled={locked}
                          className="text-red-600 hover:text-red-800 text-sm"
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

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Board Meetings & Minutes</h4>
                <button
                  type="button"
                  onClick={() => setShowAddMeeting(true)}
                  disabled={locked}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Meeting
                </button>
              </div>

              {/* Board Attendance (Attendance Sheets) */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">
                  Board Meeting Attendance Records
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">
                      Upload attendance sheets from board meetings
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddMeeting(true)}
                      disabled={locked}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Create Meeting
                    </button>
                  </div>
                  
                  {boardMeetings.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Recent Meetings:</h5>
                      {boardMeetings.slice(-3).map(meeting => (
                        <div key={meeting.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{meeting.date}</span>
                            <span className="text-xs text-gray-500">({meeting.type})</span>
                          </div>
                          {meeting.quorum && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Quorum Met
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onInputChange('boardAttendance', file);
                        toast.success('Attendance sheet uploaded');
                      }
                    }}
                    disabled={locked}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    multiple
                  />
                  <small className="text-gray-500 block mt-1">
                    Accepted formats: PDF, Word, Excel
                  </small>
                </div>
              </div>

              {/* Meetings List */}
              {boardMeetings.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No meetings recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {boardMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{meeting.date}</div>
                          <div className="text-sm text-gray-600 capitalize">{meeting.type} Meeting</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {meeting.uploaded && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              <FileText className="w-3 h-3 inline mr-1" />
                              Minutes Uploaded
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMeeting(meeting.id)}
                            disabled={locked}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p><strong>Topics:</strong> {meeting.topics}</p>
                        {meeting.agenda && <p><strong>Agenda:</strong> {meeting.agenda}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Meeting Modal */}
      {showAddMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Board Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newMeeting.type}
                  onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Regular</option>
                  <option value="special">Special</option>
                  <option value="annual">Annual</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                <textarea
                  value={newMeeting.topics}
                  onChange={(e) => setNewMeeting({ ...newMeeting, topics: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Main topics discussed"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newMeeting.quorum}
                    onChange={(e) => setNewMeeting({ ...newMeeting, quorum: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Quorum was met</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddMeeting(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
        </div>
      )}
    </div>
  );
};

export default GovernanceSection;