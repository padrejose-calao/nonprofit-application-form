import React, { useState } from 'react';
import { 
  UserCheck, Plus, Trash2, Award, Calendar, Mail, Phone,
  FileText, Building, Users, Target, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface LeadershipMember {
  id: string | number;
  name: string;
  title: string;
  department: string;
  yearsWithOrg: number;
  yearsInRole: number;
  email: string;
  phone: string;
  linkedin: string;
  education: string;
  expertise: string;
  achievements: string;
  responsibilities: string;
  bio: string;
  photo: File | null;
}

interface LeadershipDetailsSectionProps {
  leadershipMembers: LeadershipMember[];
  errors: unknown;
  locked: boolean;
  onLeadershipMembersChange: (members: LeadershipMember[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: unknown;
  onInputChange?: (field: string, value: unknown) => void;
}

const LeadershipDetailsSection: React.FC<LeadershipDetailsSectionProps> = ({
  leadershipMembers,
  errors,
  locked,
  onLeadershipMembersChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [expandedMember, setExpandedMember] = useState<string | number | null>(null);

  const addLeadershipMember = () => {
    const newMember: LeadershipMember = {
      id: Date.now(),
      name: '',
      title: '',
      department: '',
      yearsWithOrg: 0,
      yearsInRole: 0,
      email: '',
      phone: '',
      linkedin: '',
      education: '',
      expertise: '',
      achievements: '',
      responsibilities: '',
      bio: '',
      photo: null
    };
    onLeadershipMembersChange([...leadershipMembers, newMember]);
  };

  const updateMember = (id: string | number, updates: Partial<LeadershipMember>) => {
    onLeadershipMembersChange(leadershipMembers.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const removeMember = (id: string | number) => {
    onLeadershipMembersChange(leadershipMembers.filter(member => member.id !== id));
    toast.info('Leadership member removed');
  };

  return (
    <div className="space-y-6">
      {/* Leadership Overview */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <UserCheck className="w-5 h-5 mr-2" />
          Leadership Team Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{leadershipMembers.length}</div>
            <div className="text-sm text-gray-600">Leadership Members</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {leadershipMembers.length > 0 ? 
                Math.round(leadershipMembers.reduce((sum, m) => sum + m.yearsWithOrg, 0) / leadershipMembers.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Years with Org</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(leadershipMembers.map(m => m.department)).size}
            </div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
        </div>

        {/* Leadership Philosophy */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-3">Leadership Philosophy & Approach</h4>
          <textarea
            value={(formData as any)?.leadershipPhilosophy || ''}
            onChange={(e) => onInputChange?.('leadershipPhilosophy', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe your organization's leadership philosophy and management approach..."
            disabled={locked}
          />
        </div>
      </div>

      {/* Leadership Members */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold">Leadership Team Members</h4>
          <button
            type="button"
            onClick={addLeadershipMember}
            disabled={locked}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Leader
          </button>
        </div>

        {leadershipMembers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No leadership members added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leadershipMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(member.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Full name"
                        disabled={locked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Title/Position</label>
                      <input
                        type="text"
                        value={member.title}
                        onChange={(e) => updateMember(member.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Executive Director, etc."
                        disabled={locked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={member.department}
                        onChange={(e) => updateMember(member.id, { department: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Department"
                        disabled={locked}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => setExpandedMember(
                        expandedMember === member.id ? null : member.id
                      )}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {expandedMember === member.id ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      disabled={locked}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedMember === member.id && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Experience & Tenure */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Years with Organization</label>
                        <input
                          type="number"
                          value={member.yearsWithOrg}
                          onChange={(e) => updateMember(member.id, { yearsWithOrg: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Years in Current Role</label>
                        <input
                          type="number"
                          value={member.yearsInRole}
                          onChange={(e) => updateMember(member.id, { yearsInRole: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          disabled={locked}
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(member.id, { email: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="email@example.com"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => updateMember(member.id, { phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Phone number"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={member.linkedin}
                          onChange={(e) => updateMember(member.id, { linkedin: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="LinkedIn URL"
                          disabled={locked}
                        />
                      </div>
                    </div>

                    {/* Education & Expertise */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Education & Qualifications</label>
                        <textarea
                          value={member.education}
                          onChange={(e) => updateMember(member.id, { education: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Degrees, certifications, relevant education..."
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Areas of Expertise</label>
                        <textarea
                          value={member.expertise}
                          onChange={(e) => updateMember(member.id, { expertise: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Professional expertise and specializations..."
                          disabled={locked}
                        />
                      </div>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Key Responsibilities</label>
                      <textarea
                        value={member.responsibilities}
                        onChange={(e) => updateMember(member.id, { responsibilities: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Primary responsibilities and duties in current role..."
                        disabled={locked}
                      />
                    </div>

                    {/* Achievements */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Notable Achievements</label>
                      <textarea
                        value={member.achievements}
                        onChange={(e) => updateMember(member.id, { achievements: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Awards, recognition, significant accomplishments..."
                        disabled={locked}
                      />
                    </div>

                    {/* Biography */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Professional Biography</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateMember(member.id, { bio: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Professional background and biography..."
                        disabled={locked}
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Professional Photo</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateMember(member.id, { photo: file });
                            toast.success('Photo uploaded');
                          }
                        }}
                        accept=".jpg,.jpeg,.png"
                        disabled={locked}
                        className="block"
                      />
                      {member.photo && (
                        <div className="text-sm text-green-600 mt-1">
                          Photo uploaded: {member.photo.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leadership Development */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-semibold mb-4 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Leadership Development & Succession Planning
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">
              Leadership Development Programs
            </label>
            <textarea
              value={(formData as any)?.leadershipDevelopment || ''}
              onChange={(e) => onInputChange?.('leadershipDevelopment', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe leadership development initiatives and training programs..."
              disabled={locked}
            />
          </div>
          
          <div>
            <label className="block font-semibold mb-2">
              Succession Planning Strategy
            </label>
            <textarea
              value={(formData as any)?.successionPlanning || ''}
              onChange={(e) => onInputChange?.('successionPlanning', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="How does your organization plan for leadership transitions?"
              disabled={locked}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Leadership Diversity & Inclusion
            </label>
            <textarea
              value={(formData as any)?.leadershipDiversity || ''}
              onChange={(e) => onInputChange?.('leadershipDiversity', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe efforts to promote diversity and inclusion in leadership..."
              disabled={locked}
            />
          </div>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center">
          <Building className="w-4 h-4 mr-2" />
          Organizational Structure
        </h4>
        <div>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileUpload) {
                onFileUpload('organizationalChart', file);
                toast.success('Organizational chart uploaded');
              }
            }}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
            disabled={locked}
            className="block"
          />
          <small className="text-gray-500 block mt-1">
            Upload your organizational chart showing leadership structure
          </small>
        </div>
      </div>
    </div>
  );
};

export default LeadershipDetailsSection;