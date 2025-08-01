import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Save,
  Edit2,
  Download,
  Upload,
  FileText,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Info,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { usePermissions } from './PermissionsLocker';

interface StandardizedNarrativeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  wordLimit?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  sectionId?: string;
  fieldId: string;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  showReadingTime?: boolean;
  allowFormatting?: boolean;
  templates?: {
    name: string;
    content: string;
    description?: string;
  }[];
  suggestions?: string[];
  autoSave?: boolean;
  collaborativeEditing?: boolean;
  versionHistory?: boolean;
}

const StandardizedNarrativeField: React.FC<StandardizedNarrativeFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  minLength,
  wordLimit,
  required = false,
  disabled = false,
  error,
  helpText,
  sectionId,
  fieldId,
  showWordCount = true,
  showCharacterCount = true,
  showReadingTime = false,
  allowFormatting = false,
  templates = [],
  suggestions = [],
  autoSave = false,
  collaborativeEditing = false,
  versionHistory = false
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const canEdit = checkPermission('write', sectionId) && !disabled && !isLocked(sectionId || '');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [collaborators, _setCollaborators] = useState<string[]>([]);
  const [versions, setVersions] = useState<{
    id: string;
    content: string;
    timestamp: Date;
    author: string;
  }[]>([]);

  // Text statistics
  const stats = {
    characters: value.length,
    words: value.trim().split(/\s+/).filter(word => word.length > 0).length,
    paragraphs: value.split('\n\n').filter(p => p.trim().length > 0).length,
    readingTime: Math.max(1, Math.ceil(value.trim().split(/\s+/).length / 200)) // 200 WPM average
  };

  // Validation
  const _isValid = () => {
    if (required && !value.trim()) return false;
    if (minLength && value.length < minLength) return false;
    if (maxLength && value.length > maxLength) return false;
    if (wordLimit && stats.words > wordLimit) return false;
    return true;
  };

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !canEdit || !value.trim()) return;

    const timeoutId = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        
        // Add to version history
        if (versionHistory) {
          const newVersion = {
            id: Date.now().toString(),
            content: value,
            timestamp: new Date(),
            author: 'Current User' // This would come from user context
          };
          setVersions(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
        }
      } catch (error) {
        setAutoSaveStatus('error');
        toast.error('Auto-save failed');
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [value, autoSave, canEdit, versionHistory]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 600)}px`;
    }
  }, [value]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Export functions
  const exportToPDF = async () => {
    // This would integrate with a PDF generation service
    toast.info('PDF export feature coming soon');
  };

  const _exportToDOCX = async () => {
    // This would integrate with a DOCX generation service
    toast.info('DOCX export feature coming soon');
  };

  // Template insertion
  const insertTemplate = (template: { name: string; content: string; description?: string }) => {
    onChange(template.content);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" inserted`);
  };

  // Suggestion application
  const applySuggestion = (suggestion: string) => {
    onChange(value + (value.endsWith('\n') ? '' : '\n') + suggestion);
    setShowSuggestions(false);
    toast.success('Suggestion applied');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {collaborativeEditing && collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              {collaborators.slice(0, 3).map((collaborator, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600"
                  title={`${collaborator} is editing`}
                >
                  {collaborator.charAt(0).toUpperCase()}
                </div>
              ))}
              {collaborators.length > 3 && (
                <span className="text-xs text-gray-500">+{collaborators.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Auto-save status */}
          {autoSave && (
            <div className="flex items-center gap-1 text-xs">
              {autoSaveStatus === 'saving' && (
                <>
                  <Clock className="w-3 h-3 text-gray-400 animate-spin" />
                  <span className="text-gray-500">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && lastSaved && (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Save failed</span>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={copyToClipboard}
              disabled={!value.trim()}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={exportToPDF}
              disabled={!value.trim()}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Export to PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            {templates.length > 0 && (
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Insert template"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            {suggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Show suggestions"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Help text */}
      {helpText && (
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>{helpText}</p>
        </div>
      )}

      {/* Templates dropdown */}
      {showTemplates && templates.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
          <div className="p-2 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900">Templates</h4>
          </div>
          <div className="p-2 space-y-1">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template)}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
                disabled={!canEdit}
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                {template.description && (
                  <div className="text-gray-600">{template.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
          <div className="p-2 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900">Suggestions</h4>
          </div>
          <div className="p-2 space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                disabled={!canEdit}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!canEdit}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${!canEdit ? 'bg-gray-50 text-gray-500' : 'bg-white'} ${
            isExpanded ? 'min-h-96' : 'min-h-24'
          }`}
          style={{
            minHeight: isExpanded ? '24rem' : '6rem',
            maxHeight: '40rem'
          }}
        />

        {/* Character/word limits indicator */}
        {(maxLength || wordLimit) && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {maxLength && (
              <span className={value.length > maxLength ? 'text-red-500 font-medium' : ''}>
                {value.length}/{maxLength}
              </span>
            )}
            {maxLength && wordLimit && <span className="mx-1">|</span>}
            {wordLimit && (
              <span className={stats.words > wordLimit ? 'text-red-500 font-medium' : ''}>
                {stats.words}/{wordLimit} words
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      {(showWordCount || showCharacterCount || showReadingTime) && value.trim() && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {showCharacterCount && <span>{stats.characters} characters</span>}
          {showWordCount && <span>{stats.words} words</span>}
          <span>{stats.paragraphs} paragraphs</span>
          {showReadingTime && <span>~{stats.readingTime} min read</span>}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Version history */}
      {versionHistory && versions.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            Version History ({versions.length} versions)
          </summary>
          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{version.author}</span>
                  <span className="text-gray-500 ml-2">
                    {version.timestamp.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onChange(version.content)}
                  disabled={!canEdit}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Restore this version"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Validation feedback */}
      {required && !value.trim() && (
        <div className="text-sm text-amber-600">This field is required</div>
      )}
      {minLength && value.length > 0 && value.length < minLength && (
        <div className="text-sm text-amber-600">
          Minimum length: {value.length}/{minLength} characters
        </div>
      )}
      {wordLimit && stats.words > wordLimit && (
        <div className="text-sm text-red-600">
          Word limit exceeded: {stats.words}/{wordLimit} words
        </div>
      )}
    </div>
  );
};

export default StandardizedNarrativeField;