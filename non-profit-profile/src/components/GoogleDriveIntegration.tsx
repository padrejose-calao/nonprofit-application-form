/**
 * Google Drive Integration Component
 * Handles Google Drive authentication and sync controls
 */

import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  FolderOpen,
  Shield,
  HardDrive,
  Users,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { googleDriveService, OrganizationProfile } from '../services/googleDriveService';
import { enhancedDocumentService } from '../services/enhancedDocumentService';

interface GoogleDriveIntegrationProps {
  organizationProfile: OrganizationProfile;
  onProfileUpdate: (profile: OrganizationProfile) => void;
}

const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({
  organizationProfile,
  onProfileUpdate
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [folderLink, setFolderLink] = useState<string | null>(null);
  const [storageQuota, setStorageQuota] = useState<{used: number, limit: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSignInStatus();
  }, []);

  useEffect(() => {
    googleDriveService.setCurrentProfile(organizationProfile);
    enhancedDocumentService.setCurrentProfile(organizationProfile);
    setFolderLink(googleDriveService.getOrganizationFolderLink());
  }, [organizationProfile]);

  const checkSignInStatus = async () => {
    try {
      // Check if Google Drive is available first
      if (!googleDriveService.isAvailable()) {
        logger.info('Google Drive not configured - skipping sign-in check');
        setIsLoading(false);
        return;
      }
      
      const signedIn = googleDriveService.isSignedIn();
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        const email = googleDriveService.getCurrentUserEmail();
        setUserEmail(email);
        
        // Get storage quota
        const quota = await googleDriveService.getStorageQuota();
        setStorageQuota(quota);
      }
    } catch (error) {
      logger.error('Failed to check sign-in status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const success = await googleDriveService.signIn();
      
      if (success) {
        setIsSignedIn(true);
        const email = googleDriveService.getCurrentUserEmail();
        setUserEmail(email);
        
        // Update organization profile
        const updatedProfile = {
          ...organizationProfile,
          googleAccountEmail: email || undefined,
          syncEnabled: true
        };
        onProfileUpdate(updatedProfile);
        
        // Create organization folder if it doesn't exist
        if (!organizationProfile.googleDriveFolderId) {
          await createOrganizationFolder();
        }
        
        // Get storage quota
        const quota = await googleDriveService.getStorageQuota();
        setStorageQuota(quota);
      }
    } catch (error) {
      logger.error('Sign in failed:', error);
      toast.error('Failed to sign in to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleDriveService.signOut();
      setIsSignedIn(false);
      setUserEmail(null);
      setStorageQuota(null);
      
      // Update organization profile
      const updatedProfile = {
        ...organizationProfile,
        googleAccountEmail: undefined,
        syncEnabled: false
      };
      onProfileUpdate(updatedProfile);
    } catch (error) {
      logger.error('Sign out failed:', error);
      toast.error('Failed to sign out from Google Drive');
    }
  };

  const createOrganizationFolder = async () => {
    try {
      const folder = await googleDriveService.createOrganizationFolder(organizationProfile.name);
      if (folder) {
        const updatedProfile = {
          ...organizationProfile,
          googleDriveFolderId: folder.id
        };
        onProfileUpdate(updatedProfile);
        setFolderLink(googleDriveService.getOrganizationFolderLink());
      }
    } catch (error) {
      logger.error('Failed to create organization folder:', error);
    }
  };

  const handleSyncDocuments = async () => {
    try {
      setIsSyncing(true);
      await enhancedDocumentService.syncAllToGoogleDrive();
      
      // Update last sync time
      const updatedProfile = {
        ...organizationProfile,
        lastSyncTime: new Date().toISOString()
      };
      onProfileUpdate(updatedProfile);
    } catch (error) {
      logger.error('Sync failed:', error);
      toast.error('Failed to sync documents');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageQuota || storageQuota.limit === 0) return 0;
    return (storageQuota.used / storageQuota.limit) * 100;
  };

  // Check if Google Drive is available
  if (!googleDriveService.isAvailable()) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Google Drive Not Configured</h3>
          <p className="text-sm">Google Drive integration is not available. Configure API credentials to enable this feature.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isSignedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isSignedIn ? (
                <Cloud className="h-6 w-6 text-green-600" />
              ) : (
                <CloudOff className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Google Drive Integration</h3>
              <p className="text-sm text-gray-500">
                {isSignedIn ? `Connected as ${userEmail}` : 'Connect to backup documents'}
              </p>
            </div>
          </div>
          
          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-md transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Connect Google Drive
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isSignedIn ? (
          <div className="space-y-6">
            {/* Organization Folder */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Organization Folder</span>
                </div>
                {folderLink && (
                  <a
                    href={folderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Documents are automatically organized in: <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {organizationProfile.name} - Nonprofit Profile Documents
                </code>
              </p>
              
              {!organizationProfile.googleDriveFolderId && (
                <button
                  onClick={createOrganizationFolder}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
                >
                  Create Organization Folder
                </button>
              )}
            </div>

            {/* Storage Quota */}
            {storageQuota && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <HardDrive className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Storage Usage</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{formatBytes(storageQuota.used)} used</span>
                    <span>{formatBytes(storageQuota.limit)} total</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getStoragePercentage() > 90 ? 'bg-red-500' :
                        getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {getStoragePercentage().toFixed(1)}% of your Google Drive storage is used
                </p>
              </div>
            )}

            {/* Sync Controls */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Document Sync</span>
                </div>
                <button
                  onClick={handleSyncDocuments}
                  disabled={isSyncing}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSyncing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Now'
                  )}
                </button>
              </div>
              
              {organizationProfile.lastSyncTime && (
                <p className="text-sm text-gray-600">
                  Last synced: {new Date(organizationProfile.lastSyncTime).toLocaleString()}
                </p>
              )}
              
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                {(() => {
                  const stats = enhancedDocumentService.getStorageStats();
                  return (
                    <>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{stats.totalDocuments}</div>
                        <div className="text-xs text-gray-500">Total Documents</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{stats.syncedCount}</div>
                        <div className="text-xs text-gray-500">Synced</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">{stats.pendingCount}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Automatic Backup</h4>
                  <p className="text-sm text-blue-700">Documents are automatically backed up to your Google Drive</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Team Access</h4>
                  <p className="text-sm text-green-700">Share organization folder with team members</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CloudOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Google Drive</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Back up your nonprofit documents to Google Drive for secure cloud storage and easy team collaboration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Secure Backup</h4>
                <p className="text-sm text-gray-600">Your documents are safely stored in Google Drive</p>
              </div>
              
              <div className="text-center p-4">
                <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Auto Sync</h4>
                <p className="text-sm text-gray-600">Changes sync automatically across all devices</p>
              </div>
              
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Team Access</h4>
                <p className="text-sm text-gray-600">Share documents with your team easily</p>
              </div>
            </div>
            
            <button
              onClick={handleSignIn}
              className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              Connect Google Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveIntegration;