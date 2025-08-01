import { Save, Check, AlertCircle, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { autoSaveEventService } from '../services/autoSaveEventService';

type AutoSaveState = {
  lastSaved?: Date;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError?: string;
  autoSaveInterval: number;
};

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  saveError?: string;
  autoSaveInterval?: number; // in seconds
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSaved: propLastSaved,
  isSaving: propIsSaving,
  hasUnsavedChanges: propHasUnsavedChanges,
  saveError: propSaveError,
  autoSaveInterval: propAutoSaveInterval,
} = {}) => {
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: propLastSaved,
    isSaving: propIsSaving || false,
    hasUnsavedChanges: propHasUnsavedChanges || false,
    saveError: propSaveError,
    autoSaveInterval: propAutoSaveInterval || 30
  });
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    // If no props provided, subscribe to global auto-save events
    if (propLastSaved === undefined && propIsSaving === undefined) {
      const unsubscribe = autoSaveEventService.subscribe(newState => {
        setState(prevState => ({
          ...prevState,
          ...newState,
          autoSaveInterval: newState.autoSaveInterval || prevState.autoSaveInterval
        }));
      });
      return unsubscribe;
    } else {
      // Use props if provided (for backward compatibility)
      setState({
        lastSaved: propLastSaved,
        isSaving: propIsSaving || false,
        hasUnsavedChanges: propHasUnsavedChanges || false,
        saveError: propSaveError,
        autoSaveInterval: propAutoSaveInterval || 30
      });
    }
  }, [propLastSaved, propIsSaving, propHasUnsavedChanges, propSaveError, propAutoSaveInterval]);

  useEffect(() => {
    if (!state.lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - state.lastSaved!.getTime()) / 1000);

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
  }, [state.lastSaved]);

  // Compact design to match AI icon height (h-14)
  if (state.saveError) {
    return (
      <div className="h-full flex items-center bg-red-50 border border-red-200 rounded-full px-4 shadow-lg">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error</span>
        </div>
      </div>
    );
  }

  if (state.isSaving) {
    return (
      <div className="h-full flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 shadow-lg">
        <div className="flex items-center space-x-2 text-blue-700">
          <Save className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      </div>
    );
  }

  if (state.hasUnsavedChanges) {
    return (
      <div className="h-full flex items-center bg-yellow-50 border border-yellow-200 rounded-full px-4 shadow-lg group relative">
        <div className="flex items-center space-x-2 text-yellow-700">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">Unsaved</span>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Auto-save in {state.autoSaveInterval}s • Press Ctrl+S to save now
        </div>
      </div>
    );
  }

  if (state.lastSaved) {
    return (
      <div className="h-full flex items-center bg-green-50 border border-green-200 rounded-full px-4 shadow-lg group relative">
        <div className="flex items-center space-x-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Saved</span>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Last saved {timeAgo}
        </div>
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
