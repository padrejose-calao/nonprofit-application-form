import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from './PermissionsLocker';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'board' | 'committee' | 'special' | 'annual';
  location: string;
  description?: string;
  agenda?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  committeeId?: string;
  minutes?: string;
  recordings?: {
    url: string;
    type: 'video' | 'audio';
    duration?: string;
  }[];
}

interface AttendanceRecord {
  meetingId: string;
  memberId: string;
  memberName: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
  proxy?: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

interface AttendanceTrackerProps {
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  members: Member[];
  onMeetingChange: (meetings: Meeting[]) => void;
  onAttendanceChange: (attendance: AttendanceRecord[]) => void;
  locked?: boolean;
  errors?: Record<string, string>;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  meetings = [],
  attendance = [],
  members = [],
  onMeetingChange,
  onAttendanceChange,
  locked = false,
  errors = {}
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const sectionLocked = locked || isLocked('attendanceTracker');
  const canEdit = checkPermission('write', 'attendanceTracker') && !sectionLocked;

  const [activeView, setActiveView] = useState<'meetings' | 'attendance' | 'analytics'>('meetings');
  const [_selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [_showMeetingModal, setShowMeetingModal] = useState(false);
  const [_showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [_attendanceFilter, _setAttendanceFilter] = useState<string>('all');

  // Analytics calculations
  const analytics = {
    totalMeetings: meetings.length,
    completedMeetings: meetings.filter(m => m.status === 'completed').length,
    upcomingMeetings: meetings.filter(m => {
      const meetingDate = new Date(m.date);
      return meetingDate > new Date() && m.status === 'scheduled';
    }).length,
    averageAttendance: (() => {
      const completedMeetings = meetings.filter(m => m.status === 'completed');
      if (completedMeetings.length === 0) return 0;
      
      const totalAttendanceRecords = completedMeetings.reduce((sum, meeting) => {
        return sum + attendance.filter(a => a.meetingId === meeting.id && a.status === 'present').length;
      }, 0);
      
      const totalPossibleAttendance = completedMeetings.length * members.filter(m => m.active).length;
      return totalPossibleAttendance > 0 ? (totalAttendanceRecords / totalPossibleAttendance) * 100 : 0;
    })(),
    memberAttendanceRates: members.map(member => {
      const memberAttendance = attendance.filter(a => a.memberId === member.id);
      const presentCount = memberAttendance.filter(a => a.status === 'present').length;
      const totalCount = memberAttendance.length;
      return {
        id: member.id,
        name: member.name,
        rate: totalCount > 0 ? (presentCount / totalCount) * 100 : 0,
        totalMeetings: totalCount,
        attended: presentCount
      };
    }).sort((a, b) => b.rate - a.rate),
    monthlyTrend: (() => {
      const last12Months = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthMeetings = meetings.filter(m => {
          const meetingDate = new Date(m.date);
          return meetingDate.getFullYear() === date.getFullYear() && 
                 meetingDate.getMonth() === date.getMonth() &&
                 m.status === 'completed';
        });
        
        const monthAttendance = monthMeetings.reduce((sum, meeting) => {
          return sum + attendance.filter(a => a.meetingId === meeting.id && a.status === 'present').length;
        }, 0);
        
        const totalPossible = monthMeetings.length * members.filter(m => m.active).length;
        
        last12Months.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          meetings: monthMeetings.length,
          attendanceRate: totalPossible > 0 ? (monthAttendance / totalPossible) * 100 : 0
        });
      }
      
      return last12Months;
    })()
  };

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || meeting.date.includes(dateFilter);
    const matchesType = typeFilter === 'all' || meeting.type === typeFilter;
    return matchesSearch && matchesDate && matchesType;
  });

  // Add new meeting
  const addNewMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: '',
      date: '',
      time: '',
      type: 'board',
      location: '',
      status: 'scheduled'
    };
    setEditingMeeting(newMeeting);
    setShowMeetingModal(true);
  };

  // Save meeting
  const _saveMeeting = (meeting: Meeting) => {
    const updatedMeetings = editingMeeting && meetings.find(m => m.id === editingMeeting.id)
      ? meetings.map(m => m.id === meeting.id ? meeting : m)
      : [...meetings, meeting];
    onMeetingChange(updatedMeetings);
    setShowMeetingModal(false);
    setEditingMeeting(null);
    toast.success('Meeting saved successfully');
  };

  // Delete meeting
  const deleteMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.filter(m => m.id !== meetingId);
    const updatedAttendance = attendance.filter(a => a.meetingId !== meetingId);
    onMeetingChange(updatedMeetings);
    onAttendanceChange(updatedAttendance);
    toast.success('Meeting deleted');
  };

  // Take attendance
  const takeAttendance = (meetingId: string) => {
    setSelectedMeeting(meetingId);
    setShowAttendanceModal(true);
  };

  // Update attendance record
  const _updateAttendance = (meetingId: string, memberId: string, status: AttendanceRecord['status'], notes?: string) => {
    const existingRecord = attendance.find(a => a.meetingId === meetingId && a.memberId === memberId);
    const member = members.find(m => m.id === memberId);
    
    if (existingRecord) {
      const updatedAttendance = attendance.map(a => 
        a.meetingId === meetingId && a.memberId === memberId 
          ? { ...a, status, notes, arrivalTime: status === 'present' ? new Date().toLocaleTimeString() : undefined }
          : a
      );
      onAttendanceChange(updatedAttendance);
    } else if (member) {
      const newRecord: AttendanceRecord = {
        meetingId,
        memberId,
        memberName: member.name,
        status,
        notes,
        arrivalTime: status === 'present' ? new Date().toLocaleTimeString() : undefined
      };
      onAttendanceChange([...attendance, newRecord]);
    }
  };

  // Export attendance data
  const exportAttendanceData = () => {
    const csvContent = [
      ['Meeting', 'Date', 'Member', 'Status', 'Notes'].join(','),
      ...attendance.map(record => {
        const meeting = meetings.find(m => m.id === record.meetingId);
        return [
          meeting?.title || 'Unknown Meeting',
          meeting?.date || '',
          record.memberName,
          record.status,
          record.notes || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendance report exported');
  };

  return (
    <div className="space-y-6">
      <SectionLock sectionId="attendanceTracker" position="top" />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Attendance Tracker</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAttendanceData}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {canEdit && (
              <button
                onClick={addNewMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Meeting
              </button>
            )}
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Total Meetings</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">{analytics.totalMeetings}</p>
            <p className="text-sm text-blue-600">{analytics.completedMeetings} completed</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Avg Attendance</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {analytics.averageAttendance.toFixed(1)}%
            </p>
            <p className="text-sm text-green-600">across all meetings</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Upcoming</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">{analytics.upcomingMeetings}</p>
            <p className="text-sm text-purple-600">scheduled meetings</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-orange-900">Active Members</h3>
            </div>
            <p className="text-2xl font-bold text-orange-700">{members.filter(m => m.active).length}</p>
            <p className="text-sm text-orange-600">tracking attendance</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {[
            { key: 'meetings', label: 'Meetings', icon: Calendar },
            { key: 'attendance', label: 'Attendance', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key as 'meetings' | 'attendance' | 'analytics')}
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
        {/* Meetings View */}
        {activeView === 'meetings' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="board">Board</option>
                <option value="committee">Committee</option>
                <option value="special">Special</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {/* Meetings List */}
            <div className="space-y-3">
              {filteredMeetings.map(meeting => {
                const meetingAttendance = attendance.filter(a => a.meetingId === meeting.id);
                const presentCount = meetingAttendance.filter(a => a.status === 'present').length;
                const totalMembers = members.filter(m => m.active).length;
                const attendanceRate = totalMembers > 0 ? (presentCount / totalMembers) * 100 : 0;

                return (
                  <div key={meeting.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{meeting.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                            meeting.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.type === 'board' ? 'bg-purple-100 text-purple-800' :
                            meeting.type === 'committee' ? 'bg-blue-100 text-blue-800' :
                            meeting.type === 'special' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {presentCount}/{totalMembers} attended 
                              {totalMembers > 0 && ` (${attendanceRate.toFixed(0)}%)`}
                            </span>
                          </div>
                        </div>

                        {meeting.description && (
                          <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                        )}

                        <p className="text-sm text-gray-500">
                          <strong>Location:</strong> {meeting.location}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {meeting.status === 'scheduled' && canEdit && (
                          <button
                            onClick={() => takeAttendance(meeting.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Take Attendance
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMeeting(meeting);
                                setShowMeetingModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this meeting?')) {
                                  deleteMeeting(meeting.id);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMeetings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || dateFilter || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by scheduling your first meeting.'
                  }
                </p>
                {canEdit && !searchTerm && !dateFilter && typeFilter === 'all' && (
                  <button
                    onClick={addNewMeeting}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule First Meeting
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Attendance View */}
        {activeView === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Attendance Records</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3">Meeting</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Member</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Arrival Time</th>
                    <th className="text-left p-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance
                    .sort((a, b) => {
                      const meetingA = meetings.find(m => m.id === a.meetingId);
                      const meetingB = meetings.find(m => m.id === b.meetingId);
                      return new Date(meetingB?.date || '').getTime() - new Date(meetingA?.date || '').getTime();
                    })
                    .slice(0, 50)
                    .map((record, index) => {
                      const meeting = meetings.find(m => m.id === record.meetingId);
                      return (
                        <tr key={`${record.meetingId}-${record.memberId}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">{meeting?.title || 'Unknown Meeting'}</td>
                          <td className="p-3">{meeting ? new Date(meeting.date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-3">{record.memberName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'excused' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">{record.arrivalTime || 'N/A'}</td>
                          <td className="p-3">{record.notes || '-'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Member Attendance Rates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Member Attendance Rates</h3>
              <div className="space-y-2">
                {analytics.memberAttendanceRates.map(member => (
                  <div key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">
                        {member.attended} of {member.totalMeetings} meetings
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            member.rate >= 80 ? 'bg-green-500' :
                            member.rate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${member.rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {member.rate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Attendance Trend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  {analytics.monthlyTrend.map((month, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{month.month}</h4>
                        <p className="text-sm text-gray-600">{month.meetings} meetings</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${month.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {month.attendanceRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Attendance Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Best Month:</span>
                      <span className="font-medium">
                        {analytics.monthlyTrend.reduce((best, month) => 
                          month.attendanceRate > best.attendanceRate ? month : best
                        ).month}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rate:</span>
                      <span className="font-medium">
                        {(analytics.monthlyTrend.reduce((sum, month) => sum + month.attendanceRate, 0) / 
                          analytics.monthlyTrend.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Meetings:</span>
                      <span className="font-medium">
                        {analytics.monthlyTrend.reduce((sum, month) => sum + month.meetings, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      <SectionLock sectionId="attendanceTracker" position="bottom" />
    </div>
  );
};

export default AttendanceTracker;