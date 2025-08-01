import React from 'react';
import { Lock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useCollaborativeField } from '../hooks/useCollaborativeField';

interface CollaborativeInputProps {
  sectionId: string;
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const CollaborativeInput: React.FC<CollaborativeInputProps> = ({
  sectionId,
  fieldId,
  value: initialValue,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  label,
  error
}) => {
  const {
    value,
    onChange: handleCollaborativeChange,
    onFocus,
    onBlur,
    isLocked,
    lockedBy,
    hasConflict,
    conflictValue,
    lastUpdatedBy,
    acceptRemoteChanges,
    rejectRemoteChanges
  } = useCollaborativeField({
    sectionId,
    fieldId,
    initialValue,
    onChange: (value: unknown) => onChange(value as string),
    debounceMs: 300
  });

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value as string}
          onChange={(e) => handleCollaborativeChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={isLocked}
          className={`
            w-full px-3 py-2 border rounded-md transition-all
            ${isLocked 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : hasConflict
                  ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
        />

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white px-2 py-1 rounded">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Locked by {lockedBy}
            </span>
          </div>
        )}

        {/* Conflict Indicator */}
        {hasConflict && conflictValue !== undefined && (
          <div className="absolute -top-8 left-0 right-0 bg-yellow-50 border border-yellow-200 rounded p-2 shadow-sm z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-800">
                  {lastUpdatedBy} made changes
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={acceptRemoteChanges}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="Accept changes"
                >
                  <RefreshCw className="w-3 h-3 text-yellow-600" />
                </button>
                <button
                  onClick={rejectRemoteChanges}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="Keep your changes"
                >
                  <X className="w-3 h-3 text-yellow-600" />
                </button>
              </div>
            </div>
            {conflictValue && (
              <p className="text-xs text-yellow-700 mt-1">
                Their value: "{conflictValue as string}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && !isLocked && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Last Updated Info */}
      {lastUpdatedBy && !hasConflict && (
        <p className="mt-1 text-xs text-gray-500">
          Last updated by {lastUpdatedBy}
        </p>
      )}
    </div>
  );
};

export default CollaborativeInput;