import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, Save, Edit2, Download, Upload, FileText, 
  Eye, EyeOff, Maximize2, Minimize2, RotateCcw, 
  Check, X, Plus, Trash2, Settings, HelpCircle,
  Bold, Italic, Underline, Link, Image, List,
  AlignLeft, AlignCenter, AlignRight, Quote,
  Palette, Type, Zap, RefreshCw, File, Clipboard
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';
import { useAutoSave } from '../hooks/useAutoSave';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';

interface NarrativeEntryFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  supportingDocument?: {
    url?: string;
    name?: string;
    uploaded?: boolean;
  };
  onDocumentUpload?: (file: File) => void;
  onDocumentRemove?: () => void;
  onReadDocument?: (text: string) => void;
  wordCount?: boolean;
  characterCount?: boolean;
  maxWords?: number;
  maxCharacters?: number;
  enableVersioning?: boolean;
  enableAutoSave?: boolean;
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canExport?: boolean;
    canUpload?: boolean;
  };
  onExport?: (format: 'docx' | 'pdf' | 'txt') => void;
  templates?: string[];
  onTemplateSelect?: (template: string) => void;
  collaborative?: boolean;
  comments?: boolean;
  id?: string;
}

const NarrativeEntryField: React.FC<NarrativeEntryFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter your content here...',
  required = false,
  className = '',
  supportingDocument,
  onDocumentUpload,
  onDocumentRemove,
  onReadDocument,
  wordCount = true,
  characterCount = true,
  maxWords,
  maxCharacters,
  enableVersioning = true,
  enableAutoSave = true,
  permissions = {
    canEdit: true,
    canDelete: true,
    canExport: true,
    canUpload: true
  },
  onExport,
  templates = [],
  onTemplateSelect,
  collaborative = false,
  comments = false,
  id
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDocumentActions, setShowDocumentActions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [versions, setVersions] = useState<Array<{
    id: string;
    content: string;
    timestamp: Date;
    author: string;
  }>>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [documentProcessing, setDocumentProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Auto-save functionality
  const autoSave = useAutoSave(
    { content: value },
    {
      key: `narrative-field-${id || label}`,
      enabled: enableAutoSave,
      delay: 2000,
      onSave: async (data) => {
        // Save to backend or localStorage
        console.log('Auto-saving:', data);
      }
    }
  );

  // Calculate word and character counts
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const currentWordCount = getWordCount(value);
  const currentCharacterCount = getCharacterCount(value);

  // Check if limits are exceeded
  const wordsExceeded = maxWords ? currentWordCount > maxWords : false;
  const charactersExceeded = maxCharacters ? currentCharacterCount > maxCharacters : false;

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
  };

  // Handle document reading
  const handleReadDocument = async () => {
    if (!supportingDocument?.url) return;
    
    setDocumentProcessing(true);
    try {
      // Simulate document reading - in reality, this would call an API
      const response = await fetch(supportingDocument.url);
      const text = await response.text();
      
      if (onReadDocument) {
        onReadDocument(text);
      } else {
        // Default behavior: append to existing content
        onChange(value + '\n\n' + text);
      }
      
      toast.success('Document content inserted successfully');
    } catch (error) {
      toast.error('Failed to read document content');
    } finally {
      setDocumentProcessing(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(value + text);
      toast.success('Content pasted from clipboard');
    } catch (error) {
      toast.error('Failed to paste content');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (enableVersioning) {
      const newVersion = {
        id: Date.now().toString(),
        content: value,
        timestamp: new Date(),
        author: 'Current User' // Would come from auth context
      };
      setVersions(prev => [newVersion, ...prev]);
    }
    
    if (autoSave.saveNow) {
      await autoSave.saveNow();
    }
    
    toast.success('Content saved successfully');
  };

  // Handle export
  const handleExport = async (format: 'docx' | 'pdf' | 'txt') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export behavior
      const blob = new Blob([value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast.success(`Exported as ${format.toUpperCase()}`);
    setShowExportOptions(false);
  };

  // Handle clear content
  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Clear Content',
      message: 'Are you sure you want to clear all content? This action cannot be undone.',
      confirmText: 'Clear',
      variant: 'danger',
      onConfirm: () => {
        onChange('');
        toast.success('Content cleared');
      }
    });
  };

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      onChange(template);
    }
    setShowTemplates(false);
    toast.success('Template applied');
  };

  return (
    <div className={`narrative-entry-field ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {autoSave.hasUnsavedChanges && (
            <span className="text-xs text-yellow-600">Unsaved changes</span>
          )}
          {autoSave.lastSaved && (
            <span className="text-xs text-green-600">
              Saved {new Date(autoSave.lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          {/* Help */}
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          {/* Settings */}
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-1">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          {/* Paste */}
          <button
            onClick={handlePaste}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          
          {/* Save */}
          {permissions.canEdit && (
            <button
              onClick={handleSave}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Save content"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
          
          {/* Edit Toggle */}
          {permissions.canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded transition-colors ${
                isEditing 
                  ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title={isEditing ? 'Stop editing' : 'Start editing'}
            >
              {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}
          
          {/* Templates */}
          {templates.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Templates"
              >
                <File className="w-4 h-4" />
              </button>
              
              {showTemplates && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Templates</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Template {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Document Actions */}
          {permissions.canUpload && (
            <div className="relative">
              <button
                onClick={() => setShowDocumentActions(!showDocumentActions)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Document actions"
              >
                <Upload className="w-4 h-4" />
              </button>
              
              {showDocumentActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </button>
                    
                    {supportingDocument?.uploaded && (
                      <button
                        onClick={handleReadDocument}
                        disabled={documentProcessing}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
                      >
                        {documentProcessing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        Read & Insert
                      </button>
                    )}
                    
                    {supportingDocument?.uploaded && permissions.canDelete && (
                      <button
                        onClick={onDocumentRemove}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Document
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Export Options */}
          {permissions.canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Export options"
              >
                <Download className="w-4 h-4" />
              </button>
              
              {showExportOptions && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleExport('docx')}
                      className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors text-left"
                    >
                      Export DOCX
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors text-left"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={() => handleExport('txt')}
                      className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors text-left"
                    >
                      Export TXT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Clear */}
          {permissions.canDelete && (
            <button
              onClick={handleClear}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="Clear content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`border border-gray-200 border-t-0 ${isExpanded ? 'min-h-96' : 'min-h-32'} bg-white rounded-b-lg`}>
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={!permissions.canEdit || !isEditing}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {wordCount && (
            <span className={wordsExceeded ? 'text-red-500' : ''}>
              {currentWordCount} {maxWords && `/ ${maxWords}`} words
            </span>
          )}
          {characterCount && (
            <span className={charactersExceeded ? 'text-red-500' : ''}>
              {currentCharacterCount} {maxCharacters && `/ ${maxCharacters}`} characters
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {supportingDocument?.uploaded && (
            <span className="text-green-600">
              📄 {supportingDocument.name || 'Supporting document uploaded'}
            </span>
          )}
          
          {enableVersioning && versions.length > 0 && (
            <span>
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default NarrativeEntryField;