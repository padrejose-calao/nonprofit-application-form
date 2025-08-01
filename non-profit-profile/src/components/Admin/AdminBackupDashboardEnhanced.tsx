/**
 * Enhanced Admin Backup Dashboard
 * Manages dual Google account backups and Google Workspace integration
 */

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  HardDrive,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  FileText,
  BarChart3,
  Shield,
  Globe,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { universalBackupService, BackupLocation, AdminBackupConfig } from '../../services/universalBackupService';
import { googleWorkspaceService } from '../../services/googleWorkspaceService';
import { storageService } from '../../services/storageService';
import { logger } from '../../utils/logger';

interface BackupAccount {
  email: string;
  type: 'personal' | 'workspace';
  isConnected: boolean;
  lastBackup?: string;
  spaceUsed?: number;
  spaceLimit?: number;
  folderId?: string;
  folderUrl?: string;
}

const AdminBackupDashboardEnhanced: React.FC = () => {
  const [primaryAccount, setPrimaryAccount] = useState<BackupAccount | null>(null);
  const [secondaryAccount, setSecondaryAccount] = useState<BackupAccount | null>(null);
  const [backupLocations, setBackupLocations] = useState<BackupLocation[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminBackupConfig | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: false,
    interval: 24, // hours
    lastRun: null as string | null,
    nextRun: null as string | null
  });
  const [workspaceFeatures, setWorkspaceFeatures] = useState({
    sheetsExport: true,
    formsIntegration: true,
    docsTemplates: true,
    sharedDrives: false
  });

  // useEffect will be added after function declarations

  const loadBackupConfiguration = async () => {
    try {
      const config = await universalBackupService.getAdminConfig();
      if (config) {
        setAdminConfig(config);
        
        // Set primary account
        if (config.primaryGoogleAccount.email) {
          setPrimaryAccount({
            email: config.primaryGoogleAccount.email,
            type: config.primaryGoogleAccount.isWorkspace ? 'workspace' : 'personal',
            isConnected: false // Will be checked separately
          });
        }
        
        // Set secondary account
        if (config.secondaryGoogleAccount.email) {
          setSecondaryAccount({
            email: config.secondaryGoogleAccount.email,
            type: config.secondaryGoogleAccount.isWorkspace ? 'workspace' : 'personal',
            isConnected: false // Will be checked separately
          });
        }
      }
    } catch (error) {
      logger.error('Failed to load backup configuration:', error);
    }
  };

  const loadBackupLocations = async () => {
    const locations = await universalBackupService.getBackupLocations();
    setBackupLocations(locations);
  };

  const checkBackupSchedule = async () => {
    const schedule = await storageService.get('admin-backup-schedule');
    if (schedule) {
      setBackupSchedule(schedule);
      
      // Calculate next run time
      if (schedule.lastRun && schedule.enabled) {
        const lastRun = new Date(schedule.lastRun);
        const nextRun = new Date(lastRun.getTime() + schedule.interval * 60 * 60 * 1000);
        setBackupSchedule(prev => ({ ...prev, nextRun: nextRun.toISOString() }));
      }
    }
  };

  // Add useEffect after all function declarations
  useEffect(() => {
    loadBackupConfiguration();
    loadBackupLocations();
    checkBackupSchedule();
  }, []);

  const connectGoogleAccount = async (isPrimary: boolean) => {
    try {
      await googleWorkspaceService.signIn();
      
      const email = googleWorkspaceService.isSignedIn() ? 
        'user@example.com' : ''; // Get actual email from auth
      
      const account: BackupAccount = {
        email,
        type: 'workspace', // Detect from domain
        isConnected: true,
        lastBackup: new Date().toISOString()
      };
      
      if (isPrimary) {
        setPrimaryAccount(account);
      } else {
        setSecondaryAccount(account);
      }
      
      toast.success(`${isPrimary ? 'Primary' : 'Secondary'} account connected`);
    } catch (error) {
      logger.error('Failed to connect account:', error);
      toast.error('Failed to connect Google account');
    }
  };

  const performDualBackup = async () => {
    if (!primaryAccount?.isConnected || !secondaryAccount?.isConnected) {
      toast.error('Both Google accounts must be connected for redundancy backup');
      return;
    }
    
    setIsBackingUp(true);
    try {
      // Get credentials for both accounts
      const primaryCreds = {}; // Get from auth
      const secondaryCreds = {}; // Get from auth
      
      // Perform backup: Netlify (primary) + Dual Google (redundancy)
      await universalBackupService.performAdminDualBackup(primaryCreds, secondaryCreds);
      
      // Update last backup time
      const now = new Date().toISOString();
      setPrimaryAccount(prev => prev ? { ...prev, lastBackup: now } : null);
      setSecondaryAccount(prev => prev ? { ...prev, lastBackup: now } : null);
      
      // Update schedule
      const updatedSchedule = { ...backupSchedule, lastRun: now };
      setBackupSchedule(updatedSchedule);
      await storageService.set('admin-backup-schedule', updatedSchedule);
      
      toast.success('Complete backup successful: Netlify (primary) + Dual Google (redundancy)');
    } catch (error) {
      logger.error('Backup failed:', error);
      toast.error('Backup failed - check if Netlify is accessible');
    } finally {
      setIsBackingUp(false);
    }
  };

  const toggleBackupSchedule = async () => {
    const updated = { ...backupSchedule, enabled: !backupSchedule.enabled };
    setBackupSchedule(updated);
    await storageService.set('admin-backup-schedule', updated);
    
    if (updated.enabled) {
      toast.success('Automatic backup enabled');
    } else {
      toast('Automatic backup disabled');
    }
  };

  const exportAllProfilesToSheets = async () => {
    try {
      const profiles = await universalBackupService.getAllProfiles();
      
      for (const profile of profiles) {
        await universalBackupService.exportToGoogleSheets(profile.id);
      }
      
      toast.success('All profiles exported to Google Sheets');
    } catch (error) {
      logger.error('Export failed:', error);
      toast.error('Failed to export profiles');
    }
  };

  const createOrganizationForm = async (formType: string) => {
    try {
      const url = await universalBackupService.createDataCollectionForm('current-profile-id', formType);
      window.open(url, '_blank');
      toast.success('Form created successfully');
    } catch (error) {
      logger.error('Failed to create form:', error);
      toast.error('Failed to create form');
    }
  };

  const renderAccountCard = (account: BackupAccount | null, isPrimary: boolean) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {isPrimary ? 'Primary' : 'Secondary'} Backup Account
          </h3>
          {account?.type === 'workspace' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              Workspace
            </span>
          )}
        </div>
        
        {account ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium">{account.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium flex items-center gap-1 ${
                account.isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {account.isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Disconnected
                  </>
                )}
              </span>
            </div>
            
            {account.lastBackup && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup:</span>
                <span className="text-sm">
                  {new Date(account.lastBackup).toLocaleString()}
                </span>
              </div>
            )}
            
            {account.folderUrl && (
              <a
                href={account.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <FolderOpen className="h-4 w-4" />
                View Backup Folder
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No account connected</p>
            <button
              onClick={() => connectGoogleAccount(isPrimary)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Connect Google Account
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Admin Backup Dashboard
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button
            onClick={performDualBackup}
            disabled={isBackingUp || !primaryAccount?.isConnected || !secondaryAccount?.isConnected}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              isBackingUp || !primaryAccount?.isConnected || !secondaryAccount?.isConnected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Backing Up...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Backup Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backup Architecture Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Backup Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <strong>Primary:</strong> Netlify Storage
              <p className="text-xs text-gray-600">Fast, serverless, always available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <strong>Secondary:</strong> Google Drive #1
              <p className="text-xs text-gray-600">First redundancy layer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <strong>Tertiary:</strong> Google Drive #2
              <p className="text-xs text-gray-600">Second redundancy layer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Schedule Status */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className={`h-5 w-5 ${backupSchedule.enabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <h4 className="font-medium">Automatic Backup</h4>
              <p className="text-sm text-gray-600">
                {backupSchedule.enabled
                  ? `Every ${backupSchedule.interval} hours to all locations`
                  : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {backupSchedule.nextRun && backupSchedule.enabled && (
              <span className="text-sm text-gray-500">
                Next: {new Date(backupSchedule.nextRun).toLocaleString()}
              </span>
            )}
            
            <button
              onClick={toggleBackupSchedule}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                backupSchedule.enabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  backupSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Dual Account Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderAccountCard(primaryAccount, true)}
        {renderAccountCard(secondaryAccount, false)}
      </div>

      {/* Google Workspace Features */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          Google Workspace Integration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={exportAllProfilesToSheets}
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
          >
            <BarChart3 className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium">Export to Sheets</span>
            <span className="text-xs text-gray-500">All profiles</span>
          </button>
          
          <button
            onClick={() => createOrganizationForm('board_update')}
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium">Board Update Form</span>
            <span className="text-xs text-gray-500">Google Forms</span>
          </button>
          
          <button
            onClick={() => createOrganizationForm('program_impact')}
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
          >
            <FileText className="h-8 w-8 text-orange-600" />
            <span className="text-sm font-medium">Impact Report Form</span>
            <span className="text-xs text-gray-500">Google Forms</span>
          </button>
          
          <button
            onClick={() => createOrganizationForm('volunteer_application')}
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2"
          >
            <Users className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium">Volunteer Form</span>
            <span className="text-xs text-gray-500">Google Forms</span>
          </button>
        </div>
      </div>

      {/* Backup Locations Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">All Backup Locations</h3>
        
        <div className="space-y-3">
          {backupLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {location.type === 'netlify' && <HardDrive className="h-5 w-5 text-blue-600" />}
                {location.type === 'google_drive' && <Cloud className="h-5 w-5 text-green-600" />}
                {location.type === 'google_workspace' && <Globe className="h-5 w-5 text-purple-600" />}
                
                <div>
                  <h4 className="font-medium">{location.name}</h4>
                  <p className="text-sm text-gray-500">
                    {location.status === 'active' ? 'Active' : 'Inactive'}
                    {location.lastBackup && ` • Last: ${new Date(location.lastBackup).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {location.folderUrl && (
                  <a
                    href={location.folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                
                <span className={`h-2 w-2 rounded-full ${
                  location.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Backup Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Backup Interval (hours)
                </label>
                <input
                  type="number"
                  value={backupSchedule.interval}
                  onChange={(e) => setBackupSchedule(prev => ({
                    ...prev,
                    interval: parseInt(e.target.value) || 24
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="168"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Workspace Features
                </label>
                
                {Object.entries(workspaceFeatures).map(([key, enabled]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setWorkspaceFeatures(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await storageService.set('admin-backup-schedule', backupSchedule);
                  await storageService.set('workspace-features', workspaceFeatures);
                  setShowSettings(false);
                  toast.success('Settings saved');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackupDashboardEnhanced;