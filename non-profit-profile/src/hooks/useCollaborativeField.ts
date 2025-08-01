import { useState, useEffect, useCallback, useRef } from 'react';
import { collaborationService } from '../services/realtimeCollaborationService';

interface UseCollaborativeFieldOptions {
  sectionId: string;
  fieldId: string;
  initialValue: unknown;
  onChange: (value: unknown) => void;
  debounceMs?: number;
}

interface CollaborativeFieldState {
  value: unknown;
  isLocked: boolean;
  lockedBy?: string;
  hasRemoteUpdate: boolean;
  lastUpdatedBy?: string;
  conflictValue?: unknown;
}

export const useCollaborativeField = ({
  sectionId,
  fieldId,
  initialValue,
  onChange,
  debounceMs = 500
}: UseCollaborativeFieldOptions) => {
  const [state, setState] = useState<CollaborativeFieldState>({
    value: initialValue,
    isLocked: false,
    hasRemoteUpdate: false
  });

  const [localValue, setLocalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastValueRef = useRef(initialValue);

  // Check if field is locked
  useEffect(() => {
    const lockInfo = collaborationService.isFieldLocked(fieldId);
    setState(prev => ({
      ...prev,
      isLocked: lockInfo.locked,
      lockedBy: lockInfo.lockedBy
    }));
  }, [fieldId]);

  // Handle remote updates
  useEffect(() => {
    const handleFieldUpdate = (event: unknown) => {
      if ((event as any).fieldId === fieldId && (event as any).sectionId === sectionId) {
        // If we're not focused on this field, update immediately
        if (!isFocused) {
          setState(prev => ({
            ...prev,
            value: (event as any).data.value,
            lastUpdatedBy: (event as any).userName,
            hasRemoteUpdate: false
          }));
          setLocalValue((event as any).data.value);
          onChange((event as any).data.value);
        } else {
          // If focused, show conflict indicator
          setState(prev => ({
            ...prev,
            hasRemoteUpdate: true,
            conflictValue: (event as any).data.value,
            lastUpdatedBy: (event as any).userName
          }));
        }
      }
    };

    const handleFieldLocked = (lockedFieldId: string) => {
      if (lockedFieldId === fieldId) {
        const lockInfo = collaborationService.isFieldLocked(fieldId);
        setState(prev => ({
          ...prev,
          isLocked: lockInfo.locked,
          lockedBy: lockInfo.lockedBy
        }));
      }
    };

    const handleFieldUnlocked = (unlockedFieldId: string) => {
      if (unlockedFieldId === fieldId) {
        setState(prev => ({
          ...prev,
          isLocked: false,
          lockedBy: undefined
        }));
      }
    };

    collaborationService.on('fieldUpdated', handleFieldUpdate);
    collaborationService.on('fieldLocked', handleFieldLocked);
    collaborationService.on('fieldUnlocked', handleFieldUnlocked);

    return () => {
      collaborationService.off('fieldUpdated', handleFieldUpdate);
      collaborationService.off('fieldLocked', handleFieldLocked);
      collaborationService.off('fieldUnlocked', handleFieldUnlocked);
    };
  }, [fieldId, sectionId, isFocused, onChange]);

  // Handle local value changes with debouncing
  const handleLocalChange = useCallback((newValue: unknown) => {
    setLocalValue(newValue);
    setState(prev => ({ ...prev, value: newValue }));

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      // Only broadcast if value actually changed
      if (JSON.stringify(newValue) !== JSON.stringify(lastBroadcastValueRef.current)) {
        await collaborationService.updateField(sectionId, fieldId, newValue);
        lastBroadcastValueRef.current = newValue;
        onChange(newValue);
      }
    }, debounceMs);
  }, [sectionId, fieldId, onChange, debounceMs]);

  // Handle focus events
  const handleFocus = useCallback(async () => {
    setIsFocused(true);
    // Try to lock the field
    const locked = await collaborationService.lockField(fieldId);
    if (!locked) {
      // Field is already locked by someone else
      const lockInfo = collaborationService.isFieldLocked(fieldId);
      setState(prev => ({
        ...prev,
        isLocked: true,
        lockedBy: lockInfo.lockedBy
      }));
    }
  }, [fieldId]);

  const handleBlur = useCallback(async () => {
    setIsFocused(false);
    
    // Unlock the field
    await collaborationService.unlockField(fieldId);

    // If there was a remote update while we were editing, handle it
    if (state.hasRemoteUpdate && state.conflictValue !== undefined) {
      // For now, last write wins - in production, you might want to show a merge dialog
      setState(prev => ({
        ...prev,
        hasRemoteUpdate: false,
        conflictValue: undefined
      }));
    }

    // Ensure any pending changes are sent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      if (JSON.stringify(localValue) !== JSON.stringify(lastBroadcastValueRef.current)) {
        await collaborationService.updateField(sectionId, fieldId, localValue);
        lastBroadcastValueRef.current = localValue;
        onChange(localValue);
      }
    }
  }, [fieldId, sectionId, localValue, onChange, state.hasRemoteUpdate, state.conflictValue]);

  // Accept remote changes
  const acceptRemoteChanges = useCallback(() => {
    if (state.conflictValue !== undefined) {
      setLocalValue(state.conflictValue);
      setState(prev => ({
        ...prev,
        value: prev.conflictValue,
        hasRemoteUpdate: false,
        conflictValue: undefined
      }));
      onChange(state.conflictValue);
    }
  }, [state.conflictValue, onChange]);

  // Reject remote changes
  const rejectRemoteChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasRemoteUpdate: false,
      conflictValue: undefined
    }));
  }, []);

  return {
    value: localValue,
    onChange: handleLocalChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    isLocked: state.isLocked,
    lockedBy: state.lockedBy,
    hasConflict: state.hasRemoteUpdate,
    conflictValue: state.conflictValue,
    lastUpdatedBy: state.lastUpdatedBy,
    acceptRemoteChanges,
    rejectRemoteChanges
  };
};