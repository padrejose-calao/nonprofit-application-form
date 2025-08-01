import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { 
  BarChart3, Users, Clock, FileText, 
  Download, RefreshCw, X,
  Activity, Target, Award, AlertTriangle
} from 'lucide-react';
import { analyticsService, AnalyticsData } from '../services/analyticsService';
import { toast } from 'react-toastify';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  organizationId
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'users' | 'trends'>('overview');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      await analyticsService.initialize(organizationId);
      
      let dateFilter;
      if (dateRange !== 'all') {
        const end = new Date();
        const start = new Date();
        
        switch (dateRange) {
          case 'week':
            start.setDate(start.getDate() - 7);
            break;
          case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
          case 'quarter':
            start.setMonth(start.getMonth() - 3);
            break;
        }
        
        dateFilter = { start, end };
      }
      
      const data = await analyticsService.getAnalytics(dateFilter);
      setAnalytics(data);
    } catch (error) {
      logger.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [organizationId, dateRange]);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, dateRange, loadAnalytics]);

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const blob = await analyticsService.exportAnalytics(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error('Export failed:', error);
      toast.error('Failed to export analytics');
    }
  };

  const generateReport = async (type: 'summary' | 'detailed' | 'executive') => {
    try {
      const report = await analyticsService.generateReport(type);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated`);
    } catch (error) {
      logger.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter' | 'all')}
              className="px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>
            
            {/* Export Options */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleExport('csv')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export as CSV"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export as PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sections'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Section Analysis
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User Activity
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Trends & Insights
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-900">
                          {analytics.overview.overallProgress}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-700">Overall Progress</p>
                      <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${analytics.overview.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-900">
                          {analytics.overview.completedSections}/{analytics.overview.totalSections}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-green-700">Sections Completed</p>
                      <p className="text-xs text-green-600 mt-1">
                        {analytics.overview.inProgressSections} in progress
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="w-8 h-8 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-900">
                          {analytics.overview.completedFields}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-purple-700">Fields Completed</p>
                      <p className="text-xs text-purple-600 mt-1">
                        of {analytics.overview.totalFields} total fields
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-2xl font-bold text-orange-900">
                          {Math.round(analytics.timeMetrics.totalTimeSpent / 60)}h
                        </span>
                      </div>
                      <p className="text-sm font-medium text-orange-700">Time Invested</p>
                      <p className="text-xs text-orange-600 mt-1">
                        {Math.round(analytics.timeMetrics.averageTimePerSection)} min avg/section
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Document Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Documents</span>
                          <span className="font-medium">{analytics.documentStats.totalDocuments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Size</span>
                          <span className="font-medium">
                            {(analytics.documentStats.totalSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">By Type</h4>
                          {Object.entries(analytics.documentStats.documentsByType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{type}</span>
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Field Analytics</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Most Edited Fields</h4>
                          {analytics.fieldAnalytics.mostEditedFields.slice(0, 5).map((field, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 truncate">{field.field}</span>
                              <span className="text-gray-900">{field.edits} edits</span>
                            </div>
                          ))}
                        </div>
                        {analytics.fieldAnalytics.validationErrors.length > 0 && (
                          <div className="pt-3 border-t">
                            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Validation Issues
                            </h4>
                            {analytics.fieldAnalytics.validationErrors.slice(0, 3).map((error, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{error.field}</span>
                                <span className="text-red-600">{error.errors} errors</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Report Generation */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => generateReport('summary')}
                        className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                      >
                        Summary Report
                      </button>
                      <button
                        onClick={() => generateReport('detailed')}
                        className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                      >
                        Detailed Report
                      </button>
                      <button
                        onClick={() => generateReport('executive')}
                        className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                      >
                        Executive Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Section Performance</h3>
                  <div className="space-y-3">
                    {analytics.sectionMetrics.map(section => (
                      <div key={section.sectionId} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{section.sectionName}</h4>
                          <span className="text-sm font-medium text-gray-600">
                            {section.progress}% complete
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              section.progress === 100 ? 'bg-green-500' :
                              section.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${section.progress}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Fields:</span>
                            <span className="ml-1 font-medium">
                              {section.completedFields}/{section.totalFields}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-1 font-medium">{section.timeSpent} min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Modified:</span>
                            <span className="ml-1 font-medium">
                              {new Date(section.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">By:</span>
                            <span className="ml-1 font-medium">{section.modifiedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">User Activity Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Total Edits</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Sections Worked On</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Avg Session Time</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.userActivity.map(user => (
                          <tr key={user.userId} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium">{user.userName}</span>
                              </div>
                            </td>
                            <td className="border px-4 py-2 text-center">{user.totalEdits}</td>
                            <td className="border px-4 py-2 text-center">{user.sectionsEdited.length}</td>
                            <td className="border px-4 py-2 text-center">{user.averageSessionTime} min</td>
                            <td className="border px-4 py-2 text-center">
                              {new Date(user.lastActive).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Peak Activity Hours */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Peak Activity Hours</h4>
                    <div className="space-y-2">
                      {analytics.timeMetrics.peakHours.map((hour, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-20">
                            {hour.hour > 12 ? `${hour.hour - 12} PM` : `${hour.hour} AM`}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full"
                              style={{ 
                                width: `${(hour.activity / analytics.timeMetrics.peakHours[0].activity) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{hour.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Completion Trends</h3>
                  
                  {/* Progress Chart */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Progress Over Time</h4>
                    <div className="h-64 flex items-end gap-1">
                      {analytics.completionTrends.slice(-30).map((trend, index) => {
                        const height = (trend.overallProgress / 100) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${trend.date}: ${trend.overallProgress}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{analytics.completionTrends[0]?.date}</span>
                      <span>{analytics.completionTrends[analytics.completionTrends.length - 1]?.date}</span>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-yellow-900 mb-3">Areas Needing Attention</h4>
                      <div className="space-y-2">
                        {analytics.fieldAnalytics.frequentlyEmptyFields.slice(0, 5).map((field, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-yellow-800">{field.field}</span>
                            <span className="text-yellow-900 font-medium">
                              {Math.round(field.emptyRate)}% empty
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-green-900 mb-3">Recent Achievements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <Award className="w-4 h-4" />
                          <span>{analytics.overview.completedSections} sections completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <FileText className="w-4 h-4" />
                          <span>{analytics.documentStats.totalDocuments} documents uploaded</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <Users className="w-4 h-4" />
                          <span>{analytics.userActivity.length} active contributors</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Analysis */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Time Investment Analysis</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Fastest vs Slowest Sections</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">
                              ⚡ {analytics.timeMetrics.fastestSection.name}
                            </span>
                            <span className="text-sm font-medium">
                              {analytics.timeMetrics.fastestSection.time} min
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-red-600">
                              🐌 {analytics.timeMetrics.slowestSection.name}
                            </span>
                            <span className="text-sm font-medium">
                              {analytics.timeMetrics.slowestSection.time} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Estimated Time to Complete</p>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(
                            (analytics.timeMetrics.averageTimePerSection * 
                            (analytics.overview.totalSections - analytics.overview.completedSections)) / 60
                          )} hours
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on average section completion time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;