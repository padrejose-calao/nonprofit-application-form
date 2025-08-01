import { useState, useCallback, useEffect, useRef } from 'react';
import { BasicInformationFormData } from '../components/BasicInformation2/types';
import { netlifyFormService } from '../services/netlifyFormService';
import { useOrganization } from '../contexts/OrganizationContext';
import { toast } from 'react-hot-toast';
import { logger } from '../utils/logger';

interface UseNetlifyBasicInformationApiReturn {
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

// Helper function to format data for export
const handleExportFormat = async (data: unknown, format: string) => {
  if (format === 'json') {
    return data;
  } else if (format === 'csv') {
    return data; // Will be converted to CSV in the export function
  } else if (format === 'pdf') {
    // PDF export would need special handling - for now return JSON
    return data;
  }
  return data;
};

// Helper function to convert data to CSV
const convertToCSV = (data: unknown): string => {
  const rows: string[] = [];
  const addRow = (prefix: string, obj: unknown) => {
    for (const [key, value] of Object.entries(obj as any)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        addRow(`${prefix}${key}.`, value);
      } else if (Array.isArray(value)) {
        rows.push(`${prefix}${key},"${value.join('; ')}"`);
      } else {
        rows.push(`${prefix}${key},"${value || ''}"`);
      }
    }
  };
  
  addRow('', data);
  return rows.join('\n');
};

export const useNetlifyBasicInformationApi = (): UseNetlifyBasicInformationApiReturn => {
  const [data, setData] = useState<BasicInformationFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const { organizationId } = useOrganization();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Organization context is handled through the organizationId parameter
  // No need to set it in service as it's passed to methods directly

  // Load data on mount
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Real-time updates are handled through manual refresh
  // No subscription service available in current implementation

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
      const formData = await netlifyFormService.getFormData('basic-information');
      
      if (formData && Object.keys(formData).length > 0) {
        setData(formData as BasicInformationFormData);
        lastSavedDataRef.current = JSON.stringify(formData);
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      logger.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveData = useCallback(async (formData: BasicInformationFormData) => {
    setSaving(true);
    setError(null);

    try {
      await netlifyFormService.saveFormData('basic-information', formData);
      
      setData(formData);
      setLastSaved(new Date());
      lastSavedDataRef.current = JSON.stringify(formData);
      setIsDirty(false);
    } catch (err) {
      setError('Failed to save data. Please try again.');
      logger.error('Save error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const autoSave = useCallback((formData: BasicInformationFormData) => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Check if data has changed
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    setIsDirty(true);

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await netlifyFormService.saveFormData('basic-information', formData);
        setLastSaved(new Date());
        lastSavedDataRef.current = currentDataString;
        setIsDirty(false);
      } catch (err) {
        logger.error('Auto-save error:', err);
      }
    }, AUTOSAVE_DELAY);
  }, []);

  const exportData = useCallback(async (format: 'pdf' | 'json' | 'csv', hideEmptyFields: boolean) => {
    setError(null);

    try {
      // Export functionality - get form data and format it
      const formData = await netlifyFormService.getFormData('basic-information');
      const exportedData = await handleExportFormat(formData, format);
      
      // Handle download based on format
      const dataStr = format === 'json' 
        ? JSON.stringify(exportedData, null, 2)
        : format === 'csv' 
          ? convertToCSV(exportedData)
          : JSON.stringify(exportedData, null, 2);
      
      const mimeType = format === 'json' ? 'application/json' : 
                      format === 'csv' ? 'text/csv' : 'application/json';
      
      const blob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `basic-information-${new Date().toISOString()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      setError('Failed to export data. Please try again.');
      logger.error('Export error:', err);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, section: string, fieldName: string): Promise<{ url: string; id: string } | null> => {
    setError(null);

    try {
      // Use the existing upload-document function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);
      formData.append('fieldName', fieldName);
      formData.append('organizationId', organizationId);

      const response = await fetch('/.netlify/functions/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return { url: result.url, id: result.id };
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      logger.error('Upload error:', err);
      return null;
    }
  }, [organizationId]);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/.netlify/functions/delete-document?id=${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      setError('Failed to delete document. Please try again.');
      logger.error('Delete error:', err);
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
    clearError,
  };
};