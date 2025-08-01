import React, { useState, useRef } from 'react';
import {
  Users,
  User,
  Calendar,
  Clock,
  Award,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from './PermissionsLocker';

interface BoardMember {
  id: string;
  name: string;
  position: string;
  role: 'chair' | 'vice_chair' | 'treasurer' | 'secretary' | 'member';
  email: string;
  phone: string;
  address?: string;
  termStart: string;
  termEnd: string;
  bio?: string;
  expertise: string[];
  committees: string[];
  attendance: {
    meetingId: string;
    date: string;
    present: boolean;
    excused?: boolean;
    notes?: string;
  }[];
  conflictOfInterest?: {
    hasConflicts: boolean;
    description?: string;
    lastUpdated: string;
  };
  skills: string[];
  contributions: {
    financial?: number;
    volunteer?: number;
    expertise?: string[];
  };
  status: 'active' | 'inactive' | 'emeritus';
  joinDate: string;
  photo?: string;
}

interface Committee {
  id: string;
  name: string;
  description: string;
  chairperson: string;
  members: string[];
  meetingFrequency: string;
  lastMeeting?: string;
  nextMeeting?: string;
}

interface BoardVisualizationProps {
  boardMembers: BoardMember[];
  committees: Committee[];
  onBoardMemberChange: (members: BoardMember[]) => void;
  onCommitteeChange: (committees: Committee[]) => void;
  locked?: boolean;
  errors?: Record<string, string>;
}

const BoardVisualization: React.FC<BoardVisualizationProps> = ({
  boardMembers = [],
  committees = [],
  onBoardMemberChange,
  onCommitteeChange,
  locked = false,
  errors = {}
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const sectionLocked = locked || isLocked('boardVisualization');
  const canEdit = checkPermission('write', 'boardVisualization') && !sectionLocked;

  const [activeView, setActiveView] = useState<'grid' | 'org_chart' | 'list'>('grid');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [_showMemberModal, setShowMemberModal] = useState(false);
  const [_showCommitteeModal, _setShowCommitteeModal] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [_editingCommittee, _setEditingCommittee] = useState<Committee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Analytics
  const boardAnalytics = {
    totalMembers: boardMembers.length,
    activeMembers: boardMembers.filter(m => m.status === 'active').length,
    averageAttendance: boardMembers.reduce((sum, member) => {
      const attended = member.attendance.filter(a => a.present).length;
      const total = member.attendance.length;
      return sum + (total > 0 ? attended / total : 0);
    }, 0) / Math.max(boardMembers.length, 1) * 100,
    upcomingTermExpirations: boardMembers.filter(m => {
      const termEnd = new Date(m.termEnd);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      return termEnd <= sixMonthsFromNow && termEnd >= new Date();
    }).length,
    committeeCount: committees.length,
    skillsDistribution: boardMembers.reduce((acc, member) => {
      member.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };

  // Filter members
  const filteredMembers = boardMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Add new member
  const addNewMember = () => {
    const newMember: BoardMember = {
      id: Date.now().toString(),
      name: '',
      position: '',
      role: 'member',
      email: '',
      phone: '',
      termStart: '',
      termEnd: '',
      expertise: [],
      committees: [],
      attendance: [],
      skills: [],
      contributions: {},
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    setEditingMember(newMember);
    setShowMemberModal(true);
  };

  // Save member
  const _saveMember = (member: BoardMember) => {
    const updatedMembers = editingMember?.id && boardMembers.find(m => m.id === editingMember.id)
      ? boardMembers.map(m => m.id === member.id ? member : m)
      : [...boardMembers, member];
    onBoardMemberChange(updatedMembers);
    setShowMemberModal(false);
    setEditingMember(null);
    toast.success('Board member saved successfully');
  };

  // Delete member
  const deleteMember = (memberId: string) => {
    const updatedMembers = boardMembers.filter(m => m.id !== memberId);
    onBoardMemberChange(updatedMembers);
    toast.success('Board member removed');
  };

  // Render member card
  const renderMemberCard = (member: BoardMember) => (
    <div
      key={member.id}
      className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors cursor-pointer"
      onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
    >
      {/* Member Photo */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.position}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            member.role === 'chair' ? 'bg-purple-100 text-purple-800' :
            member.role === 'vice_chair' ? 'bg-blue-100 text-blue-800' :
            member.role === 'treasurer' ? 'bg-green-100 text-green-800' :
            member.role === 'secretary' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {member.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {member.status === 'active' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {member.status === 'inactive' && <AlertCircle className="w-4 h-4 text-gray-400" />}
          {member.status === 'emeritus' && <Star className="w-4 h-4 text-gold-500" />}
        </div>
      </div>

      {/* Quick Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Term: {member.termStart} - {member.termEnd}</span>
        </div>
        {member.attendance.length > 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span>
              Attendance: {Math.round(
                (member.attendance.filter(a => a.present).length / member.attendance.length) * 100
              )}%
            </span>
          </div>
        )}
      </div>

      {/* Skills Tags */}
      {member.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {member.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
              +{member.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {selectedMember === member.id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                  {member.email}
                </a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                  {member.phone}
                </a>
              </div>
            )}
          </div>

          {/* Committees */}
          {member.committees.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Committees</h4>
              <div className="flex flex-wrap gap-1">
                {member.committees.map((committee, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                    {committee}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {member.bio && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Bio</h4>
              <p className="text-sm text-gray-600">{member.bio}</p>
            </div>
          )}

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingMember(member);
                  setShowMemberModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to remove this board member?')) {
                    deleteMember(member.id);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Org Chart View
  const renderOrgChart = () => (
    <div className="space-y-6">
      {/* Leadership */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Board Leadership</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['chair', 'vice_chair', 'treasurer', 'secretary'].map(role => {
            const member = boardMembers.find(m => m.role === role);
            return (
              <div key={role} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{role.replace('_', ' ').toUpperCase()}</h4>
                {member ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.position}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Vacant</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* General Members */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Board Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boardMembers.filter(m => m.role === 'member').map(renderMemberCard)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionLock sectionId="boardVisualization" position="top" />

      {/* Header with Analytics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Board Visualization</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={addNewMember}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Total Members</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">{boardAnalytics.totalMembers}</p>
            <p className="text-sm text-blue-600">{boardAnalytics.activeMembers} active</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Avg Attendance</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {boardAnalytics.averageAttendance.toFixed(1)}%
            </p>
            <p className="text-sm text-green-600">last 12 months</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-900">Term Expiring</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-700">
              {boardAnalytics.upcomingTermExpirations}
            </p>
            <p className="text-sm text-yellow-600">next 6 months</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Committees</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">{boardAnalytics.committeeCount}</p>
            <p className="text-sm text-purple-600">active committees</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="chair">Chair</option>
            <option value="vice_chair">Vice Chair</option>
            <option value="treasurer">Treasurer</option>
            <option value="secretary">Secretary</option>
            <option value="member">Member</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="emeritus">Emeritus</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'grid', label: 'Grid View', icon: Users },
            { key: 'org_chart', label: 'Org Chart', icon: Target },
            { key: 'list', label: 'List View', icon: User }
          ].map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  activeView === view.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeView === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map(renderMemberCard)}
          </div>
        )}

        {activeView === 'org_chart' && renderOrgChart()}

        {activeView === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Position</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Term</th>
                  <th className="text-left p-3">Attendance</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {member.name}
                      </div>
                    </td>
                    <td className="p-3">{member.position}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'chair' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'vice_chair' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'treasurer' ? 'bg-green-100 text-green-800' :
                        member.role === 'secretary' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">{member.termStart} - {member.termEnd}</td>
                    <td className="p-3">
                      {member.attendance.length > 0 ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          (member.attendance.filter(a => a.present).length / member.attendance.length) >= 0.8
                            ? 'bg-green-100 text-green-800'
                            : (member.attendance.filter(a => a.present).length / member.attendance.length) >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(
                            (member.attendance.filter(a => a.present).length / member.attendance.length) * 100
                          )}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {member.status === 'active' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {member.status === 'inactive' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                        {member.status === 'emeritus' && <Star className="w-4 h-4 text-gold-500" />}
                        <span className="capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {canEdit && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setShowMemberModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to remove this board member?')) {
                                deleteMember(member.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No board members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first board member.'
              }
            </p>
            {canEdit && !searchTerm && filterRole === 'all' && filterStatus === 'all' && (
              <button
                onClick={addNewMember}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Member
              </button>
            )}
          </div>
        )}
      </div>

      {sectionLocked && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This section is currently locked. Contact an administrator to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <SectionLock sectionId="boardVisualization" position="bottom" />
    </div>
  );
};

export default BoardVisualization;