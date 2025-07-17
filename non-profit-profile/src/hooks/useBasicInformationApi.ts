import { useState, useCallback, useEffect, useRef } from 'react';
import { BasicInformationFormData } from '../components/BasicInformation2/types';
import { BasicInformationApi, SaveResponse, ApiResponse } from '../services/api/basicInformationApi';

interface UseBasicInformationApiReturn {
  data: BasicInformationFormData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: Date | null;
  isDirty: boolean;
  saveData: (data: BasicInformationFormData) => Promise<void>;
  loadData: () => Promise<void>;
  autoSave: (data: BasicInformationFormData) => void;
  exportData: (format: 'pdf' | 'json' | 'csv', hideEmptyFields: boolean) => Promise<void>;
  uploadDocument: (file: File, section: string, fieldName: string) => Promise<{ url: string; id: string } | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  clearError: () => void;
}

const AUTOSAVE_DELAY = 30000; // 30 seconds

export const useBasicInformationApi = (organizationId?: string): UseBasicInformationApiReturn => {
  const [data, setData] = useState<BasicInformationFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [organizationId]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await BasicInformationApi.get(organizationId);
      
      if (response.success && response.data) {
        setData(response.data);
        lastSavedDataRef.current = JSON.stringify(response.data);
        setIsDirty(false);
      } else {
        setError(response.error || 'Failed to load data');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const saveData = useCallback(async (formData: BasicInformationFormData) => {
    setSaving(true);
    setError(null);

    try {
      const response = data 
        ? await BasicInformationApi.update(formData, organizationId)
        : await BasicInformationApi.save(formData);
      
      if (response.success) {
        setData(formData);
        setLastSaved(new Date());
        lastSavedDataRef.current = JSON.stringify(formData);
        setIsDirty(false);
      } else {
        setError(response.error || 'Failed to save data');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving data');
    } finally {
      setSaving(false);
    }
  }, [data, organizationId]);

  const autoSave = useCallback((formData: BasicInformationFormData) => {
    // Check if data has changed
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    setIsDirty(true);

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      const response = await BasicInformationApi.autoSave(formData);
      
      if (response.success) {
        setLastSaved(new Date());
        lastSavedDataRef.current = currentDataString;
        setIsDirty(false);
      }
    }, AUTOSAVE_DELAY);
  }, []);

  const exportData = useCallback(async (format: 'pdf' | 'json' | 'csv', hideEmptyFields: boolean) => {
    setError(null);

    try {
      const response = await BasicInformationApi.export(format, hideEmptyFields);
      
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `basic-information.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(response.error || 'Failed to export data');
      }
    } catch (err) {
      setError('An unexpected error occurred while exporting data');
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, section: string, fieldName: string) => {
    setError(null);

    try {
      const response = await BasicInformationApi.uploadDocument(file, section, fieldName);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to upload document');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred while uploading document');
      return null;
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    setError(null);

    try {
      const response = await BasicInformationApi.deleteDocument(documentId);
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to delete document');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting document');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    saving,
    error,
    lastSaved,
    isDirty,
    saveData,
    loadData,
    autoSave,
    exportData,
    uploadDocument,
    deleteDocument,
    clearError
  };
};