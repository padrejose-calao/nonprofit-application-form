/**
 * Hook for managing Google Drive backup integration
 */

import { useState, useEffect, useCallback } from 'react';
import { googleDriveBackupService } from '../services/googleDriveBackupService';
import { useNotification } from './useNotification';
import { logger } from '../utils/logger';

interface BackupStatus {
  isConfigured: boolean;
  isBackingUp: boolean;
  lastBackup: string | null;
  lastRestore: string | null;
  error: string | null;
}

interface UseGoogleDriveBackupReturn {
  status: BackupStatus;
  configureAccess: (accessToken: string) => Promise<boolean>;
  backupNow: () => Promise<void>;
  backupData: (dataType: string, data: unknown) => Promise<boolean>;
  restoreData: (dataType: string, version?: string) => Promise<unknown>;
  listBackups: (dataType?: string) => Promise<any[]>;
  isInitialized: boolean;
}

export const useGoogleDriveBackup = (): UseGoogleDriveBackupReturn => {
  const { addNotification } = useNotification();
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<BackupStatus>({
    isConfigured: false,
    isBackingUp: false,
    lastBackup: null,
    lastRestore: null,
    error: null
  });

  // Initialize on mount
  useEffect(() => {
    const initializeBackup = async () => {
      try {
        const initialized = await googleDriveBackupService.initialize();
        setIsInitialized(initialized);
        setStatus(prev => ({ ...prev, isConfigured: initialized }));
        
        if (initialized) {
          addNotification({
            id: 'gdrive-init',
            type: 'success',
            title: 'Google Drive Backup',
            message: 'Backup service initialized successfully',
            duration: 3000
          });
        }
      } catch (error) {
        logger.error('Failed to initialize Google Drive backup:', error);
        setStatus(prev => ({ 
          ...prev, 
          error: 'Failed to initialize backup service' 
        }));
      }
    };

    initializeBackup();
  }, [addNotification]);

  // Configure Google Drive access
  const configureAccess = useCallback(async (accessToken: string): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, error: null }));
      
      const success = await googleDriveBackupService.configureAccess(accessToken);
      
      if (success) {
        setIsInitialized(true);
        setStatus(prev => ({ ...prev, isConfigured: true }));
        
        addNotification({
          id: 'gdrive-config',
          type: 'success',
          title: 'Google Drive Connected',
          message: 'Your data will now be backed up to Google Drive',
          duration: 5000
        });
      } else {
        throw new Error('Invalid or expired access token');
      }
      
      return success;
    } catch (error) {
      const errorMsg = (error as Error).message || 'Failed to configure Google Drive access';
      setStatus(prev => ({ ...prev, error: errorMsg }));
      
      addNotification({
        id: 'gdrive-config-error',
        type: 'error',
        title: 'Configuration Failed',
        message: errorMsg,
        duration: 5000
      });
      
      return false;
    }
  }, [addNotification]);

  // Backup all data now
  const backupNow = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      addNotification({
        id: 'backup-not-configured',
        type: 'warning',
        title: 'Backup Not Configured',
        message: 'Please configure Google Drive access first',
        duration: 5000
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isBackingUp: true, error: null }));
      
      addNotification({
        id: 'backup-started',
        type: 'info',
        title: 'Backup Started',
        message: 'Backing up all data to Google Drive...',
        duration: 3000
      });

      const results = await googleDriveBackupService.backupAll();
      
      // Check results
      const failures = Array.from(results.entries()).filter(([_, result]) => !result.success);
      const timestamp = new Date().toISOString();
      
      if (failures.length === 0) {
        setStatus(prev => ({ ...prev, lastBackup: timestamp }));
        
        addNotification({
          id: 'backup-success',
          type: 'success',
          title: 'Backup Complete',
          message: `All data successfully backed up to Google Drive`,
          duration: 5000
        });
      } else {
        const errorMsg = `Backup completed with ${failures.length} errors`;
        setStatus(prev => ({ ...prev, lastBackup: timestamp, error: errorMsg }));
        
        addNotification({
          id: 'backup-partial',
          type: 'warning',
          title: 'Backup Partially Complete',
          message: errorMsg,
          duration: 5000
        });
      }
    } catch (error) {
      const errorMsg = (error as Error).message || 'Backup failed';
      setStatus(prev => ({ ...prev, error: errorMsg }));
      
      addNotification({
        id: 'backup-error',
        type: 'error',
        title: 'Backup Failed',
        message: errorMsg,
        duration: 5000
      });
    } finally {
      setStatus(prev => ({ ...prev, isBackingUp: false }));
    }
  }, [isInitialized, addNotification]);

  // Backup specific data
  const backupData = useCallback(async (dataType: string, data: unknown): Promise<boolean> => {
    if (!isInitialized) {
      logger.warn('Google Drive backup not initialized');
      return false;
    }

    try {
      const result = await googleDriveBackupService.backup(dataType, data);
      
      if (result.success) {
        logger.debug(`✅ ${dataType} backed up to Google Drive`);
      } else {
        logger.error(`Failed to backup ${dataType}:`, result.error);
      }
      
      return result.success;
    } catch (error) {
      logger.error(`Error backing up ${dataType}:`, error);
      return false;
    }
  }, [isInitialized]);

  // Restore specific data
  const restoreData = useCallback(async (dataType: string, version?: string): Promise<unknown> => {
    if (!isInitialized) {
      addNotification({
        id: 'restore-not-configured',
        type: 'warning',
        title: 'Backup Not Configured',
        message: 'Please configure Google Drive access first',
        duration: 5000
      });
      return null;
    }

    try {
      setStatus(prev => ({ ...prev, error: null }));
      
      const result = await googleDriveBackupService.restore(dataType, version);
      
      if (result.success) {
        const timestamp = new Date().toISOString();
        setStatus(prev => ({ ...prev, lastRestore: timestamp }));
        
        addNotification({
          id: 'restore-success',
          type: 'success',
          title: 'Data Restored',
          message: `${dataType} restored successfully from Google Drive`,
          duration: 5000
        });
        
        return result.data;
      } else {
        throw new Error(result.error || 'Restore failed');
      }
    } catch (error) {
      const errorMsg = (error as Error).message || 'Restore failed';
      setStatus(prev => ({ ...prev, error: errorMsg }));
      
      addNotification({
        id: 'restore-error',
        type: 'error',
        title: 'Restore Failed',
        message: errorMsg,
        duration: 5000
      });
      
      return null;
    }
  }, [isInitialized, addNotification]);

  // List available backups
  const listBackups = useCallback(async (dataType?: string): Promise<any[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      return await googleDriveBackupService.listBackups(dataType);
    } catch (error) {
      logger.error('Failed to list backups:', error);
      return [];
    }
  }, [isInitialized]);

  return {
    status,
    configureAccess,
    backupNow,
    backupData,
    restoreData,
    listBackups,
    isInitialized
  };
};