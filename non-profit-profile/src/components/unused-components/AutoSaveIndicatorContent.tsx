import { Save, Check, AlertCircle, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface AutoSaveIndicatorContentProps {
  lastSaved?: Date;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  saveError?: string;
  autoSaveInterval?: number; // in seconds
}

const AutoSaveIndicatorContent: React.FC<AutoSaveIndicatorContentProps> = ({
  lastSaved,
  isSaving = false,
  hasUnsavedChanges = false,
  saveError,
  autoSaveInterval = 30,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

      if (diff < 60) {
        setTimeAgo('just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (saveError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Save failed</span>
        </div>
        <p className="text-xs text-red-600 mt-1">{saveError}</p>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-blue-700">
          <Save className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-yellow-700">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Unsaved changes</span>
        </div>
        <p className="text-xs text-yellow-600 mt-1">
          Auto-save in {autoSaveInterval}s • Press Ctrl+S to save now
        </p>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-green-700">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">All changes saved</span>
        </div>
        <p className="text-xs text-green-600 mt-1">Last saved {timeAgo}</p>
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicatorContent;