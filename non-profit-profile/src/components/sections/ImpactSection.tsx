import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, Award, Calendar,
  FileText, Globe, Activity, Zap, PieChart, ArrowUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface ImpactMetric {
  id: string | number;
  category: string;
  metric: string;
  baseline: string;
  current: string;
  target: string;
  year: number;
  description: string;
}

interface ImpactSectionProps {
  impactMetrics: ImpactMetric[];
  errors: any;
  locked: boolean;
  onImpactMetricsChange: (metrics: ImpactMetric[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

const ImpactSection: React.FC<ImpactSectionProps> = ({
  impactMetrics,
  errors,
  locked,
  onImpactMetricsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'evaluation' | 'metrics' | 'reporting'>('evaluation');
  const currentYear = new Date().getFullYear();

  const metricCategories = [
    'Output', 'Outcome', 'Impact', 'Efficiency', 'Quality', 'Reach'
  ];

  const addMetric = () => {
    const newMetric: ImpactMetric = {
      id: Date.now(),
      category: 'Output',
      metric: '',
      baseline: '',
      current: '',
      target: '',
      year: currentYear,
      description: ''
    };
    onImpactMetricsChange([...impactMetrics, newMetric]);
  };

  const updateMetric = (id: string | number, updates: Partial<ImpactMetric>) => {
    onImpactMetricsChange(impactMetrics.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const removeMetric = (id: string | number) => {
    onImpactMetricsChange(impactMetrics.filter(m => m.id !== id));
    toast.info('Metric removed');
  };

  const getMetricsByCategory = (category: string) => {
    return impactMetrics.filter(m => m.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <div className="bg-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Impact & Evaluation Overview
        </h3>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">{impactMetrics.length}</div>
            <div className="text-sm text-gray-600">Total Metrics</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {impactMetrics.filter(m => m.current && m.target && parseFloat(m.current) >= parseFloat(m.target)).length}
            </div>
            <div className="text-sm text-gray-600">Targets Met</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metricCategories.filter(cat => getMetricsByCategory(cat).length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Categories Tracked</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentYear}
            </div>
            <div className="text-sm text-gray-600">Reporting Year</div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Key Achievements
          </h4>
          <div className="space-y-2">
            {impactMetrics
              .filter(m => m.current && m.target && parseFloat(m.current) >= parseFloat(m.target))
              .slice(0, 3)
              .map(metric => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm">{metric.metric}</span>
                  <span className="text-sm font-medium text-green-600">
                    {metric.current} / {metric.target} achieved
                  </span>
                </div>
              ))}
            {impactMetrics.filter(m => m.current && m.target && parseFloat(m.current) >= parseFloat(m.target)).length === 0 && (
              <p className="text-sm text-gray-500">No targets met yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'evaluation'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Evaluation Framework
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'metrics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Impact Metrics
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reporting'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Reporting & Communication
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Evaluation Framework Tab */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              {/* Evaluation Philosophy */}
              <div>
                <label className="block font-semibold mb-2">
                  Evaluation Philosophy <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData?.evaluationPhilosophy || ''}
                  onChange={(content) => onInputChange?.('evaluationPhilosophy', content)}
                  placeholder="Describe your organization's approach to evaluation..."
                  disabled={locked}
                  height={200}
                />
                {errors?.evaluationPhilosophy && (
                  <p className="text-red-600 text-sm mt-1">{errors.evaluationPhilosophy}</p>
                )}
              </div>

              {/* Data Systems */}
              <div>
                <label className="block font-semibold mb-2">
                  Data Management Systems
                </label>
                <RichTextEditor
                  value={formData?.dataManagementSystems || ''}
                  onChange={(content) => onInputChange?.('dataManagementSystems', content)}
                  placeholder="Describe your data collection and management systems..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Evaluation Methods */}
              <div>
                <label className="block font-semibold mb-2">
                  Evaluation Methods
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData?.usesQuantitativeMethods || false}
                      onChange={(e) => onInputChange?.('usesQuantitativeMethods', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Quantitative Methods (surveys, metrics, statistics)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData?.usesQualitativeMethods || false}
                      onChange={(e) => onInputChange?.('usesQualitativeMethods', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Qualitative Methods (interviews, focus groups, observations)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData?.usesMixedMethods || false}
                      onChange={(e) => onInputChange?.('usesMixedMethods', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">Mixed Methods Approach</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData?.usesExternalEvaluation || false}
                      onChange={(e) => onInputChange?.('usesExternalEvaluation', e.target.checked)}
                      className="rounded"
                      disabled={locked}
                    />
                    <span className="text-sm">External/Third-Party Evaluation</span>
                  </label>
                </div>
              </div>

              {/* Evaluation Documents */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Evaluation Documents</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Evaluation Reports
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('evaluationReports', file);
                          toast.success('Evaluation reports uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact Assessment
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('impactAssessment', file);
                          toast.success('Impact assessment uploaded');
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

          {/* Impact Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Performance Metrics</h4>
                <button
                  type="button"
                  onClick={addMetric}
                  disabled={locked}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center gap-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  Add Metric
                </button>
              </div>

              {/* Metrics by Category */}
              {metricCategories.map(category => {
                const categoryMetrics = getMetricsByCategory(category);
                if (categoryMetrics.length === 0 && impactMetrics.length > 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                      <PieChart className="w-4 h-4 mr-2" />
                      {category} Metrics
                    </h5>
                    {categoryMetrics.length === 0 ? (
                      <p className="text-sm text-gray-500 ml-6">No {category.toLowerCase()} metrics defined</p>
                    ) : (
                      <div className="space-y-3">
                        {categoryMetrics.map((metric) => (
                          <div key={metric.id} className="border rounded-lg p-4 ml-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="md:col-span-2">
                                <label className="block text-sm text-gray-700 mb-1">Metric Name</label>
                                <input
                                  type="text"
                                  value={metric.metric}
                                  onChange={(e) => updateMetric(metric.id, { metric: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder="e.g., Number of clients served"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Category</label>
                                <select
                                  value={metric.category}
                                  onChange={(e) => updateMetric(metric.id, { category: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  disabled={locked}
                                >
                                  {metricCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Year</label>
                                <input
                                  type="number"
                                  value={metric.year}
                                  onChange={(e) => updateMetric(metric.id, { year: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder={currentYear.toString()}
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Baseline</label>
                                <input
                                  type="text"
                                  value={metric.baseline}
                                  onChange={(e) => updateMetric(metric.id, { baseline: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Starting value"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Current</label>
                                <input
                                  type="text"
                                  value={metric.current}
                                  onChange={(e) => updateMetric(metric.id, { current: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Current value"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Target</label>
                                <input
                                  type="text"
                                  value={metric.target}
                                  onChange={(e) => updateMetric(metric.id, { target: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Goal value"
                                  disabled={locked}
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeMetric(metric.id)}
                                  disabled={locked}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={metric.description}
                                  onChange={(e) => updateMetric(metric.id, { description: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  rows={2}
                                  placeholder="Brief description of this metric..."
                                  disabled={locked}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {impactMetrics.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No metrics defined yet.</p>
                  <p className="text-sm text-gray-500">Click "Add Metric" to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* Reporting Tab */}
          {activeTab === 'reporting' && (
            <div className="space-y-6">
              {/* Stakeholder Reporting */}
              <div>
                <label className="block font-semibold mb-2">
                  Stakeholder Reporting
                </label>
                <RichTextEditor
                  value={formData?.stakeholderReporting || ''}
                  onChange={(content) => onInputChange?.('stakeholderReporting', content)}
                  placeholder="Describe how you report impact to different stakeholders..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Communication Strategy */}
              <div>
                <label className="block font-semibold mb-2">
                  Impact Communication Strategy
                </label>
                <RichTextEditor
                  value={formData?.impactCommunication || ''}
                  onChange={(content) => onInputChange?.('impactCommunication', content)}
                  placeholder="How do you communicate your impact to the community?"
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Reporting Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Board Reporting Frequency
                  </label>
                  <select
                    value={formData?.boardReportingFrequency || ''}
                    onChange={(e) => onInputChange?.('boardReportingFrequency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={locked}
                  >
                    <option value="">Select frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Public Reporting Frequency
                  </label>
                  <select
                    value={formData?.publicReportingFrequency || ''}
                    onChange={(e) => onInputChange?.('publicReportingFrequency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={locked}
                  >
                    <option value="">Select frequency</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
              </div>

              {/* Learning & Improvement */}
              <div>
                <label className="block font-semibold mb-2">
                  Learning & Continuous Improvement
                </label>
                <RichTextEditor
                  value={formData?.continuousImprovement || ''}
                  onChange={(content) => onInputChange?.('continuousImprovement', content)}
                  placeholder="How do you use evaluation findings to improve programs?"
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Impact Report Upload */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Annual Impact Report
                </h4>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('annualImpactReport', file);
                        toast.success('Annual impact report uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload your most recent annual impact report
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

export default ImpactSection;