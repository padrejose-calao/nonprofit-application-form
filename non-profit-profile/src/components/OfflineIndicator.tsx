import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSyncService';
import { logger } from '../utils/logger';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    syncing: 0,
    failed: 0,
    total: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsOffline(offlineSyncService.isOffline());
      setSyncStatus(offlineSyncService.getQueueStatus());
    };

    // Initial check
    checkStatus();

    // Listen for online/offline events
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);

    // Check periodically
    const interval = setInterval(checkStatus, 5000);

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.syncPendingChanges();
    } catch (error) {
      logger.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
      setSyncStatus(offlineSyncService.getQueueStatus());
    }
  };

  if (!isOffline && syncStatus.total === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all
          ${isOffline 
            ? 'bg-orange-500 text-white hover:bg-orange-600' 
            : syncStatus.failed > 0
              ? 'bg-red-500 text-white hover:bg-red-600'
              : syncStatus.pending > 0
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >
        {isOffline ? (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Offline Mode</span>
          </>
        ) : syncStatus.failed > 0 ? (
          <>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Sync Issues</span>
          </>
        ) : syncStatus.pending > 0 ? (
          <>
            <Cloud className="w-5 h-5" />
            <span className="font-medium">Syncing...</span>
          </>
        ) : (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Online</span>
          </>
        )}
        
        {syncStatus.total > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
            {syncStatus.pending + syncStatus.failed}
          </span>
        )}
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {isOffline ? 'Offline Mode' : 'Sync Status'}
              </h3>
              {isOffline ? (
                <CloudOff className="w-5 h-5 text-orange-500" />
              ) : (
                <Cloud className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <div className="p-4">
            {/* Connection Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Connection Status
                </span>
                <span className={`text-sm font-medium ${isOffline ? 'text-orange-600' : 'text-green-600'}`}>
                  {isOffline ? 'Offline' : 'Online'}
                </span>
              </div>
              {isOffline && (
                <p className="text-xs text-gray-600">
                  Your changes will be saved locally and synced when connection is restored.
                </p>
              )}
            </div>

            {/* Sync Queue Status */}
            {syncStatus.total > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Pending Changes
                </h4>
                <div className="space-y-2">
                  {syncStatus.pending > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Waiting to sync</span>
                      <span className="text-xs font-medium text-yellow-600">
                        {syncStatus.pending} items
                      </span>
                    </div>
                  )}
                  {syncStatus.syncing > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Currently syncing</span>
                      <span className="text-xs font-medium text-blue-600">
                        {syncStatus.syncing} items
                      </span>
                    </div>
                  )}
                  {syncStatus.failed > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Failed to sync</span>
                      <span className="text-xs font-medium text-red-600">
                        {syncStatus.failed} items
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Sync Button */}
            {!isOffline && syncStatus.total > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  ${isSyncing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}

            {/* Offline Mode Info */}
            {isOffline && (
              <div className="mt-4 p-3 bg-orange-50 rounded-md">
                <h4 className="text-sm font-medium text-orange-900 mb-1">
                  Working Offline
                </h4>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• All changes are saved locally</li>
                  <li>• Data will sync when reconnected</li>
                  <li>• You can continue working normally</li>
                </ul>
              </div>
            )}

            {/* Sync Failed Warning */}
            {syncStatus.failed > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <h4 className="text-sm font-medium text-red-900 mb-1">
                  Sync Issues Detected
                </h4>
                <p className="text-xs text-red-700">
                  Some changes couldn't be synced. They will be retried automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;