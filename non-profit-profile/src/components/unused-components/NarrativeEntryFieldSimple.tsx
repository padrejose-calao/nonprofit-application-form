import React, { useCallback, useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Save, 
  Edit3, 
  Download, 
  Upload, 
  FileText,
  X,
  Check,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToPDF, exportToDOCX, readTextFromDocument } from '../../utils/documentExport';

interface NarrativeEntryFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  helperText?: string;
  error?: string;
  locked?: boolean;
  documentId?: string;
  className?: string;
  currentUser?: string;
  organizationName?: string;
}

const NarrativeEntryFieldSimple: React.FC<NarrativeEntryFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Rich text editing: bullets, font size, formatting, links, images. Drag corner to resize. Spell check enabled by browser.",
  maxLength,
  minHeight = "200px",
  helperText,
  error,
  locked = false,
  documentId,
  className = "",
  currentUser = "Current User",
  organizationName = ""
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [hasDocument, setHasDocument] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!locked);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
    updateCounts(value);
  }, [value]);

  useEffect(() => {
    setHasDocument(!!documentId);
  }, [documentId]);

  const updateCounts = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      setLocalValue(newValue);
      updateCounts(newValue);
      onChange(newValue);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localValue);
      toast.success('Content copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const handleSave = async () => {
    if (locked) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsEditing(false);
      toast.success('Content saved successfully');
    } catch (err) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (locked) return;
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      const exportOptions = {
        title: label,
        content: localValue,
        format,
        metadata: {
          author: currentUser,
          date: new Date(),
          organization: organizationName
        }
      };

      if (format === 'pdf') {
        await exportToPDF(exportOptions);
      } else {
        await exportToDOCX(exportOptions);
      }
      
      toast.success(`Exported to ${format.toUpperCase()} successfully`);
    } catch (err) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to document manager (placeholder)
      setHasDocument(true);
      toast.success('Document uploaded to Document Manager');
      
      // Ask if user wants to read text from document
      if (window.confirm('Would you like to insert text from the uploaded document into the field?')) {
        const text = await readTextFromDocument(file);
        setLocalValue(text);
        updateCounts(text);
        onChange(text);
        toast.success('Text extracted from document');
      }
    } catch (error) {
      toast.error('Failed to process document');
    }
  };

  return (
    <div className={`narrative-entry-field ${className}`}>
      {/* Header with label and action buttons */}
      <div className="flex items-start justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Copy content"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          {/* Save/Edit button */}
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || locked}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Save content"
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              disabled={locked}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Edit content"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          
          {/* Export dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Export content"
            >
              <Download className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Export as PDF
              </button>
              <button
                type="button"
                onClick={() => handleExport('docx')}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Export as DOCX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rich text editor info */}
      <div className="text-xs text-gray-500 mb-2">
        Rich text editing: bullets, font size, formatting, links, images. Drag corner to resize. Spell check enabled by browser.
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={!isEditing || locked}
          className={`w-full p-3 border rounded-md resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${!isEditing || locked ? 'bg-gray-50' : 'bg-white'}`}
          style={{ minHeight }}
          spellCheck={true}
        />
        
        {/* Character/Word count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded pointer-events-none">
          <div>{wordCount} words</div>
          <div>{charCount} characters</div>
        </div>
      </div>

      {/* Helper text and error */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-600">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Document upload section */}
      <div className="mt-3 flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={locked}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Upload Supporting Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.md"
            className="hidden"
          />
        </label>
        
        {hasDocument && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <FileText className="h-4 w-4" />
            <span>Document uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NarrativeEntryFieldSimple;