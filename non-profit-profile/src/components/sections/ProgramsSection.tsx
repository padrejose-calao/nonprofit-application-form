import React, { useState } from 'react';
import { 
  Target, Plus, Trash2, Users, Calendar, DollarSign, 
  BarChart3, FileText, MapPin, Clock, CheckCircle,
  Activity, TrendingUp, Award, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface Program {
  id: string | number;
  name: string;
  description: string;
  targetAudience: string;
  geographic: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned';
  budget: number;
  served: number;
  outcomes: string;
  metrics: string;
  partners: string;
  funding: string;
}

interface ProgramsSectionProps {
  programs: Program[];
  errors: unknown;
  locked: boolean;
  onProgramsChange: (programs: Program[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: unknown;
  onInputChange?: (field: string, value: unknown) => void;
}

const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programs,
  errors,
  locked,
  onProgramsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'outcomes'>('overview');
  const [expandedProgram, setExpandedProgram] = useState<string | number | null>(null);

  const addProgram = () => {
    const newProgram: Program = {
      id: Date.now(),
      name: '',
      description: '',
      targetAudience: '',
      geographic: '',
      startDate: '',
      endDate: '',
      status: 'active',
      budget: 0,
      served: 0,
      outcomes: '',
      metrics: '',
      partners: '',
      funding: ''
    };
    onProgramsChange([...programs, newProgram]);
  };

  const updateProgram = (id: string | number, updates: Partial<Program>) => {
    onProgramsChange(programs.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const removeProgram = (id: string | number) => {
    onProgramsChange(programs.filter(p => p.id !== id));
    toast.info('Program removed');
  };

  const calculateTotalBudget = () => {
    return programs.reduce((total, program) => total + (program.budget || 0), 0);
  };

  const calculateTotalServed = () => {
    return programs.reduce((total, program) => total + (program.served || 0), 0);
  };

  const getActivePrograms = () => {
    return programs.filter(p => p.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Programs Overview */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Programs Overview
        </h3>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{programs.length}</div>
            <div className="text-sm text-gray-600">Total Programs</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{getActivePrograms()}</div>
            <div className="text-sm text-gray-600">Active Programs</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {calculateTotalServed().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">People Served</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${calculateTotalBudget().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
        </div>

        {/* Recent Programs */}
        {programs.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-3">Active Programs</h4>
            <div className="space-y-2">
              {programs.filter(p => p.status === 'active').slice(0, 3).map(program => (
                <div key={program.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{program.name}</span>
                    {program.targetAudience && (
                      <span className="text-sm text-gray-600 ml-2">
                        • {program.targetAudience}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {program.served} served
                  </div>
                </div>
              ))}
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
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Program Strategy
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'programs'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Programs List
            </button>
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'outcomes'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Outcomes & Metrics
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Program Strategy Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Program Development Process */}
              <div>
                <label className="block font-semibold mb-2">
                  Program Development Process <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={(formData as any)?.programDevelopment || ''}
                  onChange={(content) => onInputChange?.('programDevelopment', content)}
                  placeholder="Describe how your organization develops new programs..."
                  disabled={locked}
                  height={200}
                />
                {(errors as any)?.programDevelopment && (
                  <p className="text-red-600 text-sm mt-1">{(errors as any).programDevelopment}</p>
                )}
              </div>

              {/* Theory of Change */}
              <div>
                <label className="block font-semibold mb-2">
                  Theory of Change
                </label>
                <RichTextEditor
                  value={(formData as any)?.theoryOfChange || ''}
                  onChange={(content) => onInputChange?.('theoryOfChange', content)}
                  placeholder="Explain your organization's theory of change..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Evidence-Based Practices */}
              <div>
                <label className="block font-semibold mb-2">
                  Evidence-Based Practices
                </label>
                <RichTextEditor
                  value={(formData as any)?.evidenceBasedPractices || ''}
                  onChange={(content) => onInputChange?.('evidenceBasedPractices', content)}
                  placeholder="Describe the evidence-based practices you use..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Program Documents */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Program Documents</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program Portfolio
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('programPortfolio', file);
                          toast.success('Program portfolio uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logic Models
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('logicModels', file);
                          toast.success('Logic models uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Programs List Tab */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Current Programs</h4>
                <button
                  type="button"
                  onClick={addProgram}
                  disabled={locked}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Program
                </button>
              </div>

              {programs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No programs added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map((program) => (
                    <div key={program.id} className="border rounded-lg">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={program.name}
                              onChange={(e) => updateProgram(program.id, { name: e.target.value })}
                              className="text-lg font-medium w-full px-3 py-1 border rounded focus:ring-2 focus:ring-purple-500"
                              placeholder="Program Name"
                              disabled={locked}
                            />
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => setExpandedProgram(
                                expandedProgram === program.id ? null : program.id
                              )}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {expandedProgram === program.id ? 'Collapse' : 'Expand'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProgram(program.id)}
                              disabled={locked}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Status</label>
                            <select
                              value={program.status}
                              onChange={(e) => updateProgram(program.id, { status: e.target.value as 'active' | 'completed' | 'planned' })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                              disabled={locked}
                            >
                              <option value="planned">Planned</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Budget</label>
                            <input
                              type="number"
                              value={program.budget}
                              onChange={(e) => updateProgram(program.id, { budget: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                              placeholder="$0"
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">People Served</label>
                            <input
                              type="number"
                              value={program.served}
                              onChange={(e) => updateProgram(program.id, { served: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                              placeholder="0"
                              disabled={locked}
                            />
                          </div>
                        </div>

                        {expandedProgram === program.id && (
                          <div className="space-y-3 mt-4 pt-4 border-t">
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Description</label>
                              <textarea
                                value={program.description}
                                onChange={(e) => updateProgram(program.id, { description: e.target.value })}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="Program description..."
                                disabled={locked}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Target Audience</label>
                                <input
                                  type="text"
                                  value={program.targetAudience}
                                  onChange={(e) => updateProgram(program.id, { targetAudience: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                  placeholder="e.g., Youth ages 12-18"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Geographic Area</label>
                                <input
                                  type="text"
                                  value={program.geographic}
                                  onChange={(e) => updateProgram(program.id, { geographic: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                  placeholder="e.g., Downtown district"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                                <input
                                  type="date"
                                  value={program.startDate}
                                  onChange={(e) => updateProgram(program.id, { startDate: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">End Date</label>
                                <input
                                  type="date"
                                  value={program.endDate}
                                  onChange={(e) => updateProgram(program.id, { endDate: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                  disabled={locked}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Partners</label>
                              <input
                                type="text"
                                value={program.partners}
                                onChange={(e) => updateProgram(program.id, { partners: e.target.value })}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                placeholder="Partner organizations..."
                                disabled={locked}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Funding Sources</label>
                              <input
                                type="text"
                                value={program.funding}
                                onChange={(e) => updateProgram(program.id, { funding: e.target.value })}
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                placeholder="Grants, donations, etc..."
                                disabled={locked}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outcomes Tab */}
          {activeTab === 'outcomes' && (
            <div className="space-y-6">
              {/* Outcome Measurement */}
              <div>
                <label className="block font-semibold mb-2">
                  Outcome Measurement Approach <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={(formData as any)?.outcomeMeasurement || ''}
                  onChange={(content) => onInputChange?.('outcomeMeasurement', content)}
                  placeholder="Describe how you measure program outcomes..."
                  disabled={locked}
                  height={200}
                />
                {(errors as any)?.outcomeMeasurement && (
                  <p className="text-red-600 text-sm mt-1">{(errors as any).outcomeMeasurement}</p>
                )}
              </div>

              {/* Data Collection */}
              <div>
                <label className="block font-semibold mb-2">
                  Data Collection Methods
                </label>
                <RichTextEditor
                  value={(formData as any)?.dataCollection || ''}
                  onChange={(content) => onInputChange?.('dataCollection', content)}
                  placeholder="Explain your data collection methods and tools..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Program Outcomes by Program */}
              {programs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Program-Specific Outcomes</h4>
                  <div className="space-y-4">
                    {programs.map((program) => (
                      <div key={program.id} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">{program.name || 'Unnamed Program'}</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Key Outcomes
                            </label>
                            <textarea
                              value={program.outcomes}
                              onChange={(e) => updateProgram(program.id, { outcomes: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                              rows={2}
                              placeholder="List key outcomes achieved..."
                              disabled={locked}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Performance Metrics
                            </label>
                            <textarea
                              value={program.metrics}
                              onChange={(e) => updateProgram(program.id, { metrics: e.target.value })}
                              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                              rows={2}
                              placeholder="Key performance indicators..."
                              disabled={locked}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Stories */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Success Stories & Case Studies
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Success Stories
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('successStories', file);
                        toast.success('Success stories uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Include testimonials, case studies, and impact stories
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

export default ProgramsSection;