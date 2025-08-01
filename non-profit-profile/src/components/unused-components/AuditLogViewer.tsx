import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { 
  FileText, Download, Filter, User, Calendar, 
  Activity, CheckCircle, XCircle, Search,
  Clock, Shield, AlertTriangle, RefreshCw
} from 'lucide-react';
import { auditLogService, AuditLogEntry } from '../../services/auditLogService';

// Import missing icons
import { Plus, Edit2, Trash2, Eye, LogIn, LogOut } from 'lucide-react';

interface AuditLogViewerProps {
  organizationId: string;
  userId?: string;
  resourceId?: string;
  compact?: boolean;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  organizationId,
  userId,
  resourceId,
  compact = false
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    resource: '',
    result: '',
    days: 7
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState<unknown>(null);

  useEffect(() => {
    loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, userId, resourceId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filter.days);

      const filterOptions: unknown = {
        startDate,
        ...(filter.action && { action: filter.action }),
        ...(filter.resource && { resource: filter.resource }),
        ...(filter.result && { result: filter.result as 'success' | 'failure' }),
        ...(userId && { userId })
      };

      let logData: AuditLogEntry[];
      if (resourceId) {
        logData = await auditLogService.getResourceHistory(filter.resource || 'unknown', resourceId);
      } else {
        logData = await auditLogService.getAuditLogs(filterOptions as any);
      }

      // Apply search filter
      if (searchTerm) {
        logData = logData.filter(log => 
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setLogs(logData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

      // Get summary
      const report = await auditLogService.generateAuditReport(filterOptions as any);
      setSummary(report.summary);
    } catch (error) {
      logger.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filter.days);

      const data = await auditLogService.exportAuditLogs(format, { startDate });
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to export logs:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-500" />;
      case 'update': return <Edit2 className="w-4 h-4 text-blue-500" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-500" />;
      case 'export': return <Download className="w-4 h-4 text-purple-500" />;
      case 'login': return <LogIn className="w-4 h-4 text-green-500" />;
      case 'logout': return <LogOut className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-700 bg-green-100';
      case 'update': return 'text-blue-700 bg-blue-100';
      case 'delete': return 'text-red-700 bg-red-100';
      case 'view': return 'text-gray-700 bg-gray-100';
      case 'export': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
        {loading ? (
          <div className="text-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center gap-2 text-xs">
                {getActionIcon(log.action)}
                <span className="text-gray-600">
                  {log.userName} {log.action} {log.resource}
                </span>
                <span className="text-gray-400 ml-auto">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">No recent activity</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track all system activities and changes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary ? (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Total Actions</p>
              <p className="text-2xl font-semibold text-gray-900">{(summary as any).totalActions}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Successful</p>
              <p className="text-2xl font-semibold text-green-900">{(summary as any).successfulActions}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs text-red-600">Failed</p>
              <p className="text-2xl font-semibold text-red-900">{(summary as any).failedActions}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Active Users</p>
              <p className="text-2xl font-semibold text-blue-900">{(summary as any).uniqueUsers}</p>
            </div>
          </div>
        ) : null}

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-md flex items-center gap-2 ${
              showFilters ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadLogs}
            className="p-2 border rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={filter.days}
                onChange={(e) => setFilter({ ...filter, days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={filter.action}
                onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="export">Export</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Resource
              </label>
              <select
                value={filter.resource}
                onChange={(e) => setFilter({ ...filter, resource: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Resources</option>
                <option value="profile">Profile</option>
                <option value="contact">Contact</option>
                <option value="document">Document</option>
                <option value="settings">Settings</option>
                <option value="authentication">Authentication</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Result
              </label>
              <select
                value={filter.result}
                onChange={(e) => setFilter({ ...filter, result: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Results</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Loading audit logs...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                        <p className="text-xs text-gray-500">{log.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource}
                    {log.resourceId && (
                      <p className="text-xs text-gray-500">ID: {log.resourceId}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.changes && log.changes.length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:text-blue-800">
                          {log.changes.length} change(s)
                        </summary>
                        <div className="mt-2 space-y-1">
                          {log.changes.map((change, idx) => (
                            <p key={idx} className="text-xs text-gray-600">
                              {change.field}: {JSON.stringify(change.oldValue)} → {JSON.stringify(change.newValue)}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}
                    {log.errorMessage && (
                      <p className="text-xs text-red-600">{log.errorMessage}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.result === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && logs.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-600">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;