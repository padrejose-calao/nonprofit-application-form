import React, { useCallback, useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Clipboard, 
  Download, 
  Save, 
  History, 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Undo,
  Redo,
  FileText,
  Clock,
  User,
  Paperclip,
  Table,
  Plus,
  Star,
  Check,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  X,
  Upload,
  FileUp,
  FolderOpen,
  RefreshCw,
  Layout,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useConfirmation } from './ConfirmationDialog';

interface NarrativeVariation {
  id: string;
  type: 'short' | 'long' | 'executive' | 'technical' | 'public' | 'custom';
  label: string;
  content: string;
  isMain: boolean;
  attachments: NarrativeAttachment[];
  images: NarrativeImage[];
  tables: NarrativeTable[];
  lastModified: Date;
  modifiedBy: string;
}

interface NarrativeAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface NarrativeImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
  position: 'inline' | 'float-left' | 'float-right' | 'center';
}

interface NarrativeTable {
  id: string;
  rows: number;
  columns: number;
  headers: string[];
  data: string[][];
  caption?: string;
}

interface NarrativeVersion {
  id: string;
  variations: NarrativeVariation[];
  timestamp: Date;
  author: string;
  versionNumber: number;
}

interface NarrativeEntryFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, variationId?: string) => void;
  onVariationsChange?: (variations: NarrativeVariation[]) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  maxWords?: number;
  wordCount?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
  autoSave?: boolean;
  showVersionHistory?: boolean;
  currentUser?: string;
  allowVariations?: boolean;
  allowAttachments?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  permissions?: {
    canEdit?: boolean;
    canView?: boolean;
  };
}

const NarrativeEntryField: React.FC<NarrativeEntryFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onVariationsChange,
  placeholder = 'Enter your narrative here...',
  required = false,
  maxLength,
  minLength,
  maxWords,
  wordCount = false,
  className = '',
  error,
  helpText,
  autoSave = true,
  showVersionHistory = true,
  currentUser = 'Current User',
  allowVariations = true,
  allowAttachments = true,
  allowImages = true,
  allowTables = true,
  permissions
}) => {
  const [variations, setVariations] = useState<NarrativeVariation[]>([
    {
      id: 'main',
      type: 'long',
      label: 'Full Narrative',
      content: value,
      isMain: true,
      attachments: [],
      images: [],
      tables: [],
      lastModified: new Date(),
      modifiedBy: currentUser
    }
  ]);
  const [activeVariationId, setActiveVariationId] = useState('main');
  const [versions, setVersions] = useState<NarrativeVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, columns: 3 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [_undoStack, setUndoStack] = useState<string[]>([value]);
  const [currentUndoIndex, setCurrentUndoIndex] = useState(0);
  const [_isEditing, _setIsEditing] = useState(false);
  const [_isExpanded, _setIsExpanded] = useState(false);
  const [_showDocumentActions, _setShowDocumentActions] = useState(false);
  const [_showExportOptions, _setShowExportOptions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [documentProcessing, setDocumentProcessing] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  const activeVariation = variations.find(v => v.id === activeVariationId) || variations[0];

  // Template definitions
  const templates = [
    { id: 'mission', name: 'Mission Statement', content: 'Our mission is to [purpose] by [method] for [beneficiaries].' },
    { id: 'vision', name: 'Vision Statement', content: 'We envision a world where [desired future state].' },
    { id: 'impact', name: 'Impact Story', content: 'In [year], we [achievement]. This resulted in [outcome] for [number] of [beneficiaries].' },
    { id: 'program', name: 'Program Description', content: 'Our [program name] program provides [services] to [target population]. Through [approach], we achieve [outcomes].' },
    { id: 'annual', name: 'Annual Report Intro', content: 'Dear Friends,\n\nAs we reflect on [year], we are grateful for [accomplishments]. With your support, we [key achievements].\n\nLooking ahead, we are excited to [future plans].\n\nSincerely,\n[Name]\n[Title]' }
  ];

  // Auto-save functionality
  const saveVersion = useCallback(() => {
    const newVersion: NarrativeVersion = {
      id: Date.now().toString(),
      variations: [...variations],
      timestamp: new Date(),
      author: currentUser,
      versionNumber: versions.length + 1
    };
    
    setVersions(prev => [...prev, newVersion]);
    setLastSaved(new Date());
    
    if (autoSave) {
      toast.success('Auto-saved', { autoClose: 1000 });
    }
  }, [variations, versions.length, currentUser, autoSave]);

  // Handle text change with undo/redo support
  const handleChange = (newValue: string) => {
    const updatedVariations = variations.map(v => 
      v.id === activeVariationId 
        ? { ...v, content: newValue, lastModified: new Date(), modifiedBy: currentUser }
        : v
    );
    setVariations(updatedVariations);
    
    if (activeVariation.isMain) {
      onChange(newValue);
    }
    
    if (onVariationsChange) {
      onVariationsChange(updatedVariations);
    }
    
    // Update undo stack
    setUndoStack(prev => [...prev.slice(0, currentUndoIndex + 1), newValue]);
    setCurrentUndoIndex(prev => prev + 1);
  };

  // Add new variation
  const addVariation = (type: string, label: string) => {
    const newVariation: NarrativeVariation = {
      id: Date.now().toString(),
      type: type as any,
      label,
      content: '',
      isMain: false,
      attachments: [],
      images: [],
      tables: [],
      lastModified: new Date(),
      modifiedBy: currentUser
    };
    
    const updatedVariations = [...variations, newVariation];
    setVariations(updatedVariations);
    setActiveVariationId(newVariation.id);
    
    if (onVariationsChange) {
      onVariationsChange(updatedVariations);
    }
    
    toast.success(`Added ${label} variation`);
  };

  // Set main variation
  const setMainVariation = (variationId: string) => {
    const updatedVariations = variations.map(v => ({
      ...v,
      isMain: v.id === variationId
    }));
    setVariations(updatedVariations);
    
    const mainVariation = updatedVariations.find(v => v.isMain);
    if (mainVariation) {
      onChange(mainVariation.content);
    }
    
    if (onVariationsChange) {
      onVariationsChange(updatedVariations);
    }
    
    toast.success('Main narrative updated');
  };

  // Handle file attachment
  const handleFileAttachment = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: NarrativeAttachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      uploadedBy: currentUser
    }));

    const updatedVariations = variations.map(v => 
      v.id === activeVariationId 
        ? { ...v, attachments: [...v.attachments, ...newAttachments] }
        : v
    );
    setVariations(updatedVariations);
    
    if (onVariationsChange) {
      onVariationsChange(updatedVariations);
    }
    
    toast.success(`${files.length} file(s) attached`);
  }, [variations, activeVariationId, onVariationsChange]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: NarrativeImage = {
          id: Date.now().toString() + Math.random(),
          url: event.target?.result as string,
          alt: file.name,
          caption: '',
          position: 'inline'
        };

        const updatedVariations = variations.map(v => 
          v.id === activeVariationId 
            ? { ...v, images: [...v.images, newImage] }
            : v
        );
        setVariations(updatedVariations);
        
        if (onVariationsChange) {
          onVariationsChange(updatedVariations);
        }
      };
      reader.readAsDataURL(file);
    });
    
    toast.success(`${files.length} image(s) added`);
  }, [variations, activeVariationId, onVariationsChange]);

  // Add table
  const addTable = () => {
    const newTable: NarrativeTable = {
      id: Date.now().toString(),
      rows: tableConfig.rows,
      columns: tableConfig.columns,
      headers: Array(tableConfig.columns).fill('').map((_, i) => `Header ${i + 1}`),
      data: Array(tableConfig.rows).fill(null).map(() => Array(tableConfig.columns).fill('')),
      caption: 'New Table'
    };

    const updatedVariations = variations.map(v => 
      v.id === activeVariationId 
        ? { ...v, tables: [...v.tables, newTable] }
        : v
    );
    setVariations(updatedVariations);
    
    if (onVariationsChange) {
      onVariationsChange(updatedVariations);
    }
    
    setShowTableDialog(false);
    toast.success('Table added');
  };

  // Copy functionality
  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      toast.success('Copied to clipboard');
    }
  };

  // Paste functionality
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cursorPos = textareaRef.current?.selectionStart || 0;
      const newValue = activeVariation.content.slice(0, cursorPos) + text + activeVariation.content.slice(cursorPos);
      handleChange(newValue);
      toast.success('Pasted from clipboard');
    } catch (err) {
      toast.error('Failed to paste from clipboard');
    }
  };

  // Export functionality
  const handleExport = (format: 'txt' | 'md' | 'html' | 'json') => {
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    switch (format) {
      case 'json':
        content = JSON.stringify(variations, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'md':
        content = `# ${label}\n\n`;
        variations.forEach(v => {
          content += `## ${v.label}${v.isMain ? ' (Main)' : ''}\n\n${v.content}\n\n`;
          if (v.attachments.length > 0) {
            content += '### Attachments\n';
            v.attachments.forEach(a => content += `- ${a.name} (${(a.size / 1024).toFixed(2)} KB)\n`);
            content += '\n';
          }
        });
        content += `---\n*Exported on ${new Date().toLocaleString()}*`;
        mimeType = 'text/markdown';
        extension = 'md';
        break;
      case 'html':
        content = `<!DOCTYPE html>
<html>
<head>
  <title>${label}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    .variation { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .main { background-color: #f0f8ff; border-color: #0066cc; }
    .attachments { margin-top: 20px; }
    .attachment { display: inline-block; margin-right: 10px; padding: 5px 10px; background: #eee; border-radius: 4px; }
    img { max-width: 100%; height: auto; margin: 10px 0; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${label}</h1>`;
        
        variations.forEach(v => {
          content += `
  <div class="variation ${v.isMain ? 'main' : ''}">
    <h2>${v.label}${v.isMain ? ' <span style="color: #0066cc;">(Main)</span>' : ''}</h2>
    <div>${v.content.replace(/\n/g, '<br>')}</div>`;
          
          if (v.images.length > 0) {
            content += '<h3>Images</h3>';
            v.images.forEach(img => {
              content += `<figure>
                <img src="${img.url}" alt="${img.alt}" />
                ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
              </figure>`;
            });
          }
          
          if (v.tables.length > 0) {
            content += '<h3>Tables</h3>';
            v.tables.forEach(table => {
              content += '<table><thead><tr>';
              table.headers.forEach(h => content += `<th>${h}</th>`);
              content += '</tr></thead><tbody>';
              table.data.forEach(row => {
                content += '<tr>';
                row.forEach(cell => content += `<td>${cell}</td>`);
                content += '</tr>';
              });
              content += '</tbody></table>';
              if (table.caption) content += `<p><em>${table.caption}</em></p>`;
            });
          }
          
          if (v.attachments.length > 0) {
            content += '<div class="attachments"><h3>Attachments</h3>';
            v.attachments.forEach(a => content += `<span class="attachment">${a.name}</span>`);
            content += '</div>';
          }
          
          content += '</div>';
        });
        
        content += `
  <hr>
  <p><em>Exported on ${new Date().toLocaleString()}</em></p>
</body>
</html>`;
        mimeType = 'text/html';
        extension = 'html';
        break;
      default:
        variations.forEach(v => {
          content += `${v.label}${v.isMain ? ' (Main)' : ''}\n${'='.repeat(v.label.length)}\n\n${v.content}\n\n`;
        });
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}-${new Date().toISOString().split('T')[0]}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${extension.toUpperCase()}`);
  };

  // Apply formatting
  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = activeVariation.content.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'numbered-list':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'code-block':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
    }

    const newValue = activeVariation.content.substring(0, start) + formattedText + activeVariation.content.substring(end);
    handleChange(newValue);
    
    // Restore selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + formattedText.length);
      }
    }, 0);
  };

  // Handle file upload for document reading
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        
        if (file.type === 'text/plain' || file.type === 'text/markdown') {
          handleChange(content);
          toast.success('Document imported successfully');
        } else if (file.type === 'application/json') {
          try {
            const jsonData = JSON.parse(content);
            if (jsonData.variations) {
              setVariations(jsonData.variations);
              if (jsonData.variations[0]) {
                handleChange(jsonData.variations[0].content);
              }
            } else if (jsonData.content) {
              handleChange(jsonData.content);
            }
            toast.success('Document imported successfully');
          } catch (err) {
            toast.error('Invalid JSON format');
          }
        } else {
          toast.error('Unsupported file format. Please use TXT, MD, or JSON files.');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to read document');
    } finally {
      setDocumentProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle reading document content
  const handleReadDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json';
    input.onchange = (e) => handleFileUpload(e as any);
    input.click();
  };

  // Handle clear content
  const handleClear = async () => {
    const _confirmed = await confirm({
      title: 'Clear Content',
      message: 'Are you sure you want to clear all content? This action cannot be undone.',
      confirmText: 'Clear',
      variant: 'danger',
      onConfirm: () => {
        handleChange('');
        toast.success('Content cleared');
      }
    });
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const currentContent = activeVariation.content;
      const newContent = currentContent ? `${currentContent}\n\n${template.content}` : template.content;
      handleChange(newContent);
      setShowTemplates(false);
      toast.success(`Template "${template.name}" applied`);
    }
  };

  // Get character and word counts
  const getCharacterCount = () => activeVariation.content.length;
  const getWordCount = () => {
    const text = activeVariation.content.trim();
    return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  const characterCount = getCharacterCount();
  const isOverLimit = maxLength && characterCount > maxLength;
  const isUnderLimit = minLength && characterCount < minLength;
  
  // Calculate word count
  const wordCountValue = getWordCount();
  const isOverWordLimit = maxWords && wordCountValue > maxWords;
  
  // Check if editing is allowed
  const canEdit = permissions?.canEdit !== false;

  return (
    <div className={`narrative-entry-field ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <span className={isOverLimit ? 'text-red-500' : isUnderLimit ? 'text-orange-500' : ''}>
            {characterCount}{maxLength ? `/${maxLength}` : ''} characters
          </span>
          {(wordCount || maxWords) && (
            <>
              <span className="mx-1">•</span>
              <span className={isOverWordLimit ? 'text-red-500' : ''}>
                {wordCountValue}{maxWords ? `/${maxWords}` : ''} words
              </span>
            </>
          )}
        </div>
      </div>

      {/* Variation Tabs */}
      {allowVariations && (
        <div className="flex items-center gap-2 mb-2 border-b">
          {variations.map(variation => (
            <button
              key={variation.id}
              type="button"
              onClick={() => setActiveVariationId(variation.id)}
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                activeVariationId === variation.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {variation.label}
              {variation.isMain && (
                <Star className="w-3 h-3 inline ml-1 text-yellow-500 fill-current" />
              )}
            </button>
          ))}
          <div className="relative group ml-auto">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Add variation"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                type="button"
                onClick={() => addVariation('short', 'Short Answer')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Short Answer
              </button>
              <button
                type="button"
                onClick={() => addVariation('executive', 'Executive Summary')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Executive Summary
              </button>
              <button
                type="button"
                onClick={() => addVariation('technical', 'Technical Details')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Technical Details
              </button>
              <button
                type="button"
                onClick={() => addVariation('public', 'Public Version')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Public Version
              </button>
              <button
                type="button"
                onClick={() => {
                  const label = prompt('Enter variation name:');
                  if (label) addVariation('custom', label);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-t"
              >
                Custom...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('link')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('list')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('numbered-list')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1" />
          
          {/* Headings */}
          <button
            type="button"
            onClick={() => applyFormat('h1')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('h2')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('h3')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('quote')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('code')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1" />
          
          {/* Media buttons */}
          {allowImages && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Insert Image"
            >
              <Image className="w-4 h-4" />
            </button>
          )}
          {allowTables && (
            <button
              type="button"
              onClick={() => setShowTableDialog(true)}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Insert Table"
            >
              <Table className="w-4 h-4" />
            </button>
          )}
          {allowAttachments && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Copy/Paste */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePaste}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Paste"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1" />
          
          {/* Document Actions */}
          <button
            type="button"
            onClick={handleReadDocument}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Import Document"
            disabled={documentProcessing}
          >
            <Upload className="w-4 h-4" />
          </button>
          
          {/* Templates */}
          <div className="relative group">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Templates"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Layout className="w-4 h-4" />
            </button>
            {showTemplates && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {templates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-red-600"
            title="Clear Content"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-gray-300 mx-1" />
          
          {/* Save/Export */}
          <button
            type="button"
            onClick={saveVersion}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Save Version"
          >
            <Save className="w-4 h-4" />
          </button>
          
          <div className="relative group">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                type="button"
                onClick={() => handleExport('txt')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as TXT
              </button>
              <button
                type="button"
                onClick={() => handleExport('md')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as MD
              </button>
              <button
                type="button"
                onClick={() => handleExport('html')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Export as HTML
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-t"
              >
                Export as JSON
              </button>
            </div>
          </div>
          
          {showVersionHistory && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded transition-colors ${showHistory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
                title="Version History"
              >
                <History className="w-4 h-4" />
              </button>
            </>
          )}
          
          {allowVariations && variations.length > 1 && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => setMainVariation(activeVariationId)}
                disabled={activeVariation.isMain}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeVariation.isMain 
                    ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed' 
                    : 'hover:bg-yellow-50 text-gray-700'
                }`}
                title="Set as main narrative"
              >
                {activeVariation.isMain ? (
                  <>
                    <Star className="w-3 h-3 inline mr-1 fill-current" />
                    Main
                  </>
                ) : (
                  'Set as Main'
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileAttachment}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleImageUpload}
        accept="image/*"
      />

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        value={activeVariation.content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 border-x border-b ${
          activeVariation.images.length > 0 || activeVariation.tables.length > 0 || activeVariation.attachments.length > 0
            ? ''
            : 'rounded-b-lg'
        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
        rows={8}
        maxLength={maxLength}
        required={required && activeVariation.isMain}
        disabled={!canEdit}
      />

      {/* Media Preview Section */}
      {(activeVariation.images.length > 0 || activeVariation.tables.length > 0) && (
        <div className="border-x border-b border-gray-200 p-3 bg-gray-50">
          {/* Images */}
          {activeVariation.images.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
              <div className="grid grid-cols-4 gap-2">
                {activeVariation.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedVariations = variations.map(v => 
                          v.id === activeVariationId 
                            ? { ...v, images: v.images.filter(i => i.id !== img.id) }
                            : v
                        );
                        setVariations(updatedVariations);
                        if (onVariationsChange) onVariationsChange(updatedVariations);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables */}
          {activeVariation.tables.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tables</h4>
              <div className="space-y-2">
                {activeVariation.tables.map(table => (
                  <div key={table.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="text-sm">
                      {table.caption || `Table (${table.rows}x${table.columns})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedVariations = variations.map(v => 
                          v.id === activeVariationId 
                            ? { ...v, tables: v.tables.filter(t => t.id !== table.id) }
                            : v
                        );
                        setVariations(updatedVariations);
                        if (onVariationsChange) onVariationsChange(updatedVariations);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attachments Section */}
      {activeVariation.attachments.length > 0 && (
        <div className="border-x border-b border-gray-200 rounded-b-lg p-3 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
          <div className="space-y-1">
            {activeVariation.attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{attachment.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(attachment.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updatedVariations = variations.map(v => 
                      v.id === activeVariationId 
                        ? { ...v, attachments: v.attachments.filter(a => a.id !== attachment.id) }
                        : v
                    );
                    setVariations(updatedVariations);
                    if (onVariationsChange) onVariationsChange(updatedVariations);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help text and error */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
        onChange={handleFileAttachment}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableConfig.rows}
                  onChange={(e) => setTableConfig(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableConfig.columns}
                  onChange={(e) => setTableConfig(prev => ({ ...prev, columns: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={addTable}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default NarrativeEntryField;