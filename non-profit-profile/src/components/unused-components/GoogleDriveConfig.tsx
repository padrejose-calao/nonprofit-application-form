import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useGoogleDriveBackup } from '../../hooks/useGoogleDriveBackup';
import GoogleOAuthButton from '../GoogleOAuthButton';
import { logger } from '../../utils/logger';

interface GoogleDriveConfigProps {
  className?: string;
}

const GoogleDriveConfig: React.FC<GoogleDriveConfigProps> = ({ className = '' }) => {
  const { status, backupNow, listBackups, isInitialized } = useGoogleDriveBackup();
  const [backupList, setBackupList] = useState<any[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);

  const loadBackupList = React.useCallback(async () => {
    setIsLoadingBackups(true);
    try {
      const backups = await listBackups();
      setBackupList(backups);
    } catch (error) {
      logger.error('Failed to load backups:', error);
    } finally {
      setIsLoadingBackups(false);
    }
  }, [listBackups]);

  // Load backup list when initialized
  useEffect(() => {
    if (isInitialized) {
      loadBackupList();
    }
  }, [isInitialized, loadBackupList]);

  const handleOAuthSuccess = () => {
    loadBackupList();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Drive Backup
        </h3>
        {isInitialized && (
          <button
            onClick={backupNow}
            disabled={status.isBackingUp}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {status.isBackingUp ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Backing up...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Backup Now
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-3">
          {isInitialized ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-700">Connected to Google Drive</span>
            </>
          ) : (
            <>
              <CloudOff className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500">Not connected</span>
            </>
          )}
        </div>

        {/* Last Backup Info */}
        {status.lastBackup && (
          <div className="text-sm text-gray-600">
            Last backup: {formatDate(status.lastBackup)}
          </div>
        )}

        {/* Error Display */}
        {status.error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        {/* OAuth Configuration */}
        {!isInitialized && (
          <GoogleOAuthButton 
            onSuccess={handleOAuthSuccess}
            className="mt-3"
          />
        )}

        {/* Recent Backups */}
        {isInitialized && backupList.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Backups</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backupList.slice(0, 5).map((backup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-700">{backup.dataType}</span>
                    <span className="text-gray-500 ml-2">
                      {formatDate(backup.metadata.timestamp)}
                    </span>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
            {!isLoadingBackups && (
              <button
                onClick={loadBackupList}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Refresh list
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveConfig;