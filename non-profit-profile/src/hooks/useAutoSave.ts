import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { netlifySettingsService } from '../services/netlifySettingsService';
import { logger } from '../utils/logger';

interface AutoSaveOptions {
  delay?: number; // milliseconds
  key: string; // unique key for localStorage
  onSave?: (data: unknown) => Promise<void> | void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  showToast?: boolean;
  maxRetries?: number;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  saveCount: number;
  hasUnsavedChanges: boolean;
}

export const useAutoSave = <T extends Record<string, any>>(
  data: T,
  options: AutoSaveOptions
) => {
  const {
    delay = 2000,
    key,
    onSave,
    onError,
    enabled = true,
    showToast = true,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    saveCount: 0,
    hasUnsavedChanges: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<string>('');
  const initializedRef = useRef(false);

  // Initialize with saved data
  const getSavedData = useCallback(async (): Promise<T | null> => {
    try {
      const saved = await netlifySettingsService.getAutoSaveData(key);
      if (saved) {
        return saved as T;
      }
    } catch (error) {
      logger.warn('Failed to parse saved data:', error as any);
    }
    return null;
  }, [key]);

  // Save data function
  const saveData = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Save to Netlify settings
      await netlifySettingsService.setAutoSaveData(key, dataToSave);

      // Call custom save function if provided
      if (onSave) {
        await onSave(dataToSave);
      }

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        error: null,
        saveCount: prev.saveCount + 1,
        hasUnsavedChanges: false
      }));

      retryCountRef.current = 0;

      if (showToast) {
        toast.success('Auto-saved', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false
        });
      }
    } catch (error) {
      const saveError = error as Error;
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: saveError
      }));

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => saveData(dataToSave), 1000 * retryCountRef.current);
        
        if (showToast) {
          toast.warning(`Auto-save failed, retrying (${retryCountRef.current}/${maxRetries})...`, {
            position: 'bottom-right',
            autoClose: 3000
          });
        }
      } else {
        if (onError) {
          onError(saveError);
        }
        
        if (showToast) {
          toast.error('Auto-save failed. Changes saved locally only.', {
            position: 'bottom-right',
            autoClose: 5000
          });
        }
      }
    }
  }, [key, onSave, onError, enabled, showToast, maxRetries]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const currentData = JSON.stringify(data);
    
    // Only save if data has actually changed
    if (currentData === lastDataRef.current) {
      return;
    }

    lastDataRef.current = currentData;
    
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return saveData(data);
  }, [data, saveData]);

  // Clear saved data
  const clearSavedData = useCallback(async () => {
    await netlifySettingsService.removeAutoSaveData(key);
    setState(prev => ({
      ...prev,
      lastSaved: null,
      saveCount: 0,
      hasUnsavedChanges: false
    }));
  }, [key]);

  // Get last saved timestamp
  const getLastSavedTime = useCallback(async (): Promise<Date | null> => {
    try {
      const timestamp = await netlifySettingsService.getAutoSaveTimestamp(key);
      return timestamp ? new Date(timestamp) : null;
    } catch {
      return null;
    }
  }, [key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveNow,
    getSavedData,
    clearSavedData,
    getLastSavedTime
  };
};

// Hook for form recovery
export const useFormRecovery = <T extends Record<string, any>>(
  key: string,
  initialData: T
) => {
  const [data, setData] = useState<T>(initialData);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recoveredData, setRecoveredData] = useState<T | null>(null);

  useEffect(() => {
    const checkForRecovery = async () => {
      try {
        const saved = await netlifySettingsService.getAutoSaveData(key);
        const timestamp = await netlifySettingsService.getAutoSaveTimestamp(key);
        
        if (saved && timestamp) {
          const saveTime = new Date(timestamp);
          const timeDiff = Date.now() - saveTime.getTime();
          
          // Show recovery prompt if data was saved within last 24 hours
          if (timeDiff < 24 * 60 * 60 * 1000) {
            setRecoveredData(saved as T);
            setShowRecoveryPrompt(true);
          }
        }
      } catch (error) {
        logger.warn('Failed to check for recovered data:', error as any);
      }
    };
    checkForRecovery();
  }, [key]);

  const recoverData = useCallback(() => {
    if (recoveredData) {
      setData(recoveredData);
      setShowRecoveryPrompt(false);
      toast.success('Form data recovered successfully');
    }
  }, [recoveredData]);

  const dismissRecovery = useCallback(async () => {
    setShowRecoveryPrompt(false);
    await netlifySettingsService.removeAutoSaveData(key);
  }, [key]);

  return {
    data,
    setData,
    showRecoveryPrompt,
    recoverData,
    dismissRecovery,
    recoveredData
  };
};

// Type definitions for auto-save status
export interface AutoSaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasUnsavedChanges: boolean;
  onSaveNow?: () => void;
}

// Utility function to format relative time
export const formatRelativeTime = (date: Date | null | undefined): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Unknown';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default useAutoSave;