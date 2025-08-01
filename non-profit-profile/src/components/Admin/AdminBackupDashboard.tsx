/**
 * Admin Backup Dashboard
 * Comprehensive backup management for administrators
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cloud,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Upload,
  HardDrive,
  Clock,
  Zap,
  Database,
  Globe,
  Folder
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { universalBackupService, BackupLocation, AdminBackupConfig } from '../../services/universalBackupService';
import { googleDriveService } from '../../services/googleDriveService';
import { logger } from '../../utils/logger';

interface AdminBackupDashboardProps {
  currentUser: {
    role: string;
    email: string;
  };
}

const AdminBackupDashboard: React.FC<AdminBackupDashboardProps> = ({ currentUser }) => {
  const [backupLocations, setBackupLocations] = useState<BackupLocation[]>([]);
  const [backupStats, setBackupStats] = useState<any>(null);
  const [connectivityStatus, setConnectivityStatus] = useState<{[key: string]: boolean}>({});
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [adminConfig, setAdminConfig] = useState<AdminBackupConfig>({
    primaryGoogleAccount: {
      email: '',
      isWorkspace: false
    },
    secondaryGoogleAccount: {
      email: '',
      isWorkspace: false
    },
    autoBackupInterval: 60, // 1 hour
    retentionDays: 30,
    enableRealTimeSync: true,
    backupTypes: {
      documents: true,
      profiles: true,
      configurations: true,
      logs: false
    },
    backupHierarchy: {
      primary: 'netlify',
      secondary: 'google_drive_1',
      tertiary: 'google_drive_2'
    }
  });

  useEffect(() => {
    loadBackupData();
    const interval = setInterval(loadBackupData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBackupData = async () => {
    try {
      const locations = universalBackupService.getBackupStatus();
      const stats = universalBackupService.getBackupStats();
      
      setBackupLocations(locations);
      setBackupStats(stats);
    } catch (error) {
      logger.error('Failed to load backup data:', error);
    }
  };

  const testConnectivity = async () => {
    setIsTestingConnectivity(true);
    try {
      const results = await universalBackupService.testBackupConnectivity();
      setConnectivityStatus(results);
      
      const successful = Object.values(results).filter(Boolean).length;
      const total = Object.values(results).length;
      
      if (successful === total) {
        toast.success('All backup locations are connected');
      } else {
        toast(`${successful}/${total} backup locations are connected`, { icon: '⚠️' });
      }
    } catch (error) {
      logger.error('Connectivity test failed:', error);
      toast.error('Failed to test backup connectivity');
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const handleConfigSave = () => {
    universalBackupService.configureAdminBackup(adminConfig);
    setShowConfigModal(false);
    loadBackupData();
  };

  const handleBackupNow = async () => {
    try {
      await universalBackupService.backupApplicationConfig();
      toast.success('Manual backup initiated');
      loadBackupData();
    } catch (error) {
      logger.error('Manual backup failed:', error);
      toast.error('Failed to start manual backup');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'inactive':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'netlify':
        return <Server className="h-6 w-6 text-blue-600" />;
      case 'google_drive':
        return <Cloud className="h-6 w-6 text-green-600" />;
      case 'google_workspace':
        return <Globe className="h-6 w-6 text-orange-600" />;
      default:
        return <HardDrive className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <XCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-medium text-red-900">Access Denied</h3>
            <p className="text-red-700">You need administrator privileges to access the backup dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Backup Dashboard</h1>
              <p className="text-gray-600">Universal backup management and monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={testConnectivity}
              disabled={isTestingConnectivity}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-md transition-colors disabled:opacity-50"
            >
              {isTestingConnectivity ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 inline mr-2" />
                  Test Connectivity
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Configure
            </button>
            
            <button
              onClick={handleBackupNow}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Backup Now
            </button>
          </div>
        </div>
      </div>

      {/* Backup Statistics */}
      {backupStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900">{backupStats.totalLocations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Backups</p>
                <p className="text-2xl font-bold text-gray-900">{backupStats.activeLocations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Queue Size</p>
                <p className="text-2xl font-bold text-gray-900">{backupStats.queueSize}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(backupStats.totalBackupSize)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Locations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Backup Locations</h2>
          <p className="text-sm text-gray-600">Monitor and manage all backup destinations</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {backupLocations.map((location) => (
              <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getLocationTypeIcon(location.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600">
                        {location.accountEmail && `Account: ${location.accountEmail}`}
                        {location.type === 'netlify' && 'Netlify Functions Storage'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(location.status)}
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {location.status}
                      </span>
                    </div>
                    
                    {connectivityStatus[location.id] !== undefined && (
                      <div className="flex items-center space-x-1">
                        {connectivityStatus[location.id] ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {connectivityStatus[location.id] ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {location.lastBackup && (
                  <div className="mt-3 text-sm text-gray-600">
                    Last backup: {new Date(location.lastBackup).toLocaleString()}
                  </div>
                )}
                
                {location.spaceUsed && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{formatBytes(location.spaceUsed)} used</span>
                      {location.spaceLimit && (
                        <span>{formatBytes(location.spaceLimit)} total</span>
                      )}
                    </div>
                    {location.spaceLimit && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((location.spaceUsed / location.spaceLimit) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
                
                {location.folderUrl && (
                  <div className="mt-3">
                    <a
                      href={location.folderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Folder className="h-4 w-4" />
                      <span>Open in Google Drive</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Backup Configuration</h3>
              <p className="text-sm text-gray-600">Configure admin backup settings</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Primary Google Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Google Account
                </label>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={adminConfig.primaryGoogleAccount.email}
                    onChange={(e) => setAdminConfig({
                      ...adminConfig,
                      primaryGoogleAccount: {
                        ...adminConfig.primaryGoogleAccount,
                        email: e.target.value
                      }
                    })}
                    placeholder="admin@organization.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={adminConfig.primaryGoogleAccount.isWorkspace}
                      onChange={(e) => setAdminConfig({
                        ...adminConfig,
                        primaryGoogleAccount: {
                          ...adminConfig.primaryGoogleAccount,
                          isWorkspace: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Google Workspace Account</span>
                  </label>
                </div>
              </div>

              {/* Secondary Google Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Google Account (Backup)
                </label>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={adminConfig.secondaryGoogleAccount.email}
                    onChange={(e) => setAdminConfig({
                      ...adminConfig,
                      secondaryGoogleAccount: {
                        ...adminConfig.secondaryGoogleAccount,
                        email: e.target.value
                      }
                    })}
                    placeholder="backup@organization.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={adminConfig.secondaryGoogleAccount.isWorkspace}
                      onChange={(e) => setAdminConfig({
                        ...adminConfig,
                        secondaryGoogleAccount: {
                          ...adminConfig.secondaryGoogleAccount,
                          isWorkspace: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Google Workspace Account</span>
                  </label>
                </div>
              </div>

              {/* Backup Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Backup Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={adminConfig.autoBackupInterval}
                    onChange={(e) => setAdminConfig({
                      ...adminConfig,
                      autoBackupInterval: parseInt(e.target.value) || 60
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Days
                  </label>
                  <input
                    type="number"
                    value={adminConfig.retentionDays}
                    onChange={(e) => setAdminConfig({
                      ...adminConfig,
                      retentionDays: parseInt(e.target.value) || 30
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Backup Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Backup Types
                </label>
                <div className="space-y-2">
                  {Object.entries(adminConfig.backupTypes).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setAdminConfig({
                          ...adminConfig,
                          backupTypes: {
                            ...adminConfig.backupTypes,
                            [key]: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Real-time Sync */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={adminConfig.enableRealTimeSync}
                    onChange={(e) => setAdminConfig({
                      ...adminConfig,
                      enableRealTimeSync: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Real-time Sync</span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Automatically backup changes as they occur
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfigSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackupDashboard;