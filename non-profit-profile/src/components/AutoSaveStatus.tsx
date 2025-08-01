import React from 'react';
import { AutoSaveStatusProps, formatRelativeTime } from '../hooks/useAutoSave';

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({ 
  isSaving, 
  lastSaved, 
  error, 
  hasUnsavedChanges, 
  onSaveNow 
}) => {
  const getStatusText = () => {
    if (isSaving) return 'Saving...';
    if (error) return 'Save failed';
    if (hasUnsavedChanges) return 'Unsaved changes';
    if (lastSaved) return `Saved ${formatRelativeTime(lastSaved)}`;
    return 'No changes';
  };

  const getStatusColor = () => {
    if (isSaving) return 'text-blue-600';
    if (error) return 'text-red-600';
    if (hasUnsavedChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className={getStatusColor()}>{getStatusText()}</span>
      {error && onSaveNow && (
        <button
          onClick={onSaveNow}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default AutoSaveStatus;