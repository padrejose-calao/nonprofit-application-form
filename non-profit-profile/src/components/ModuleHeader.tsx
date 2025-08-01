import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  FileCheck, 
  FileText, 
  Download,
  Printer,
  Trash2,
  Mail,
  FileImage,
  ChevronDown,
  LucideIcon
} from 'lucide-react';
import { SectionLock } from './PermissionsManager';
import { toast } from 'react-toastify';

interface Tab {
  key: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  sectionId: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLockToggle?: (locked: boolean) => void;
  onDraftToggle?: (isDraft: boolean) => void;
  onFinalToggle?: (isFinal: boolean) => void;
  onExport?: () => void;
  onPrint?: () => void;
  onTrash?: () => void;
  locked?: boolean;
  isDraft?: boolean;
  isFinal?: boolean;
  showStatusButtons?: boolean;
  showLockButtons?: boolean;
  showCrudLock?: boolean;
  className?: string;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  sectionId,
  tabs = [],
  activeTab,
  onTabChange,
  onLockToggle,
  onDraftToggle,
  onFinalToggle,
  onExport,
  onPrint,
  onTrash,
  locked = false,
  isDraft = false,
  isFinal = false,
  showStatusButtons = true,
  showLockButtons = true,
  showCrudLock = true,
  className = ''
}) => {
  const [isLocked, setIsLocked] = useState(locked);
  const [isDraftLocal, setIsDraftLocal] = useState(isDraft);
  const [isFinalLocal, setIsFinalLocal] = useState(isFinal);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLockToggle = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    onLockToggle?.(newLocked);
    toast.success(newLocked ? 'Section locked' : 'Section unlocked');
  };

  const handleDraftToggle = () => {
    if (!isFinalLocal) {
      const newDraft = !isDraftLocal;
      setIsDraftLocal(newDraft);
      onDraftToggle?.(newDraft);
      if (newDraft) {
        toast.info('Marked as draft');
      }
    } else {
      toast.warning('Cannot mark as draft when final');
    }
  };

  const handleFinalToggle = () => {
    if (!isDraftLocal) {
      const newFinal = !isFinalLocal;
      setIsFinalLocal(newFinal);
      onFinalToggle?.(newFinal);
      if (newFinal) {
        toast.success('Marked as final');
      }
    } else {
      toast.warning('Cannot mark as final when draft');
    }
  };

  const handleExportPDF = () => {
    onExport?.();
    toast.success('PDF export started');
    setShowExportDropdown(false);
  };

  const handleExportTIFF = () => {
    toast.success('TIFF export started');
    setShowExportDropdown(false);
  };

  const handleShareEmail = () => {
    toast.success('Email share initiated');
    setShowExportDropdown(false);
  };

  const handlePrint = () => {
    onPrint?.();
    window.print();
    toast.info('Preparing for print...');
  };

  const handleTrash = () => {
    onTrash?.();
    toast.success('Data moved to trash');
  };

  return (
    <div className={`bg-white shadow-sm ${className}`}>
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Icon className={`w-6 h-6 mr-2 ${iconColor}`} />
              {title}
            </h2>
          </div>
          
          {/* CRUD Action Buttons */}
          <div className="flex items-center gap-2">
            {showStatusButtons && (
              <>
                {/* Lock/Unlock Button - Show in CRUD unless specifically disabled */}
                {showCrudLock && (
                  <div className="relative group">
                    <button
                      onClick={handleLockToggle}
                      className={`p-2 rounded-lg transition-colors ${
                        isLocked 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isLocked ? 'Click to unlock and allow editing' : 'Click to lock and prevent editing'}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {isLocked ? 'Unlock Section' : 'Lock Section'}
                    </div>
                  </div>
                )}

                {/* Draft Button */}
                <div className="relative group">
                  <button
                    onClick={handleDraftToggle}
                    className={`p-2 rounded-lg transition-colors ${
                      isDraftLocal 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isFinalLocal ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isDraftLocal ? 'Currently marked as draft' : 'Mark as draft version'}
                    disabled={isFinalLocal}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {isDraftLocal ? 'Remove Draft Status' : 'Mark as Draft'}
                  </div>
                </div>

                {/* Final Button */}
                <div className="relative group">
                  <button
                    onClick={handleFinalToggle}
                    className={`p-2 rounded-lg transition-colors ${
                      isFinalLocal 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isDraftLocal ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFinalLocal ? 'Currently marked as final' : 'Mark as final version'}
                    disabled={isDraftLocal}
                  >
                    <FileCheck className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {isFinalLocal ? 'Remove Final Status' : 'Mark as Final'}
                  </div>
                </div>

                {/* Export Dropdown */}
                <div className="relative" ref={exportDropdownRef}>
                  <div className="relative group">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                      title="Export options"
                    >
                      <Download className="w-4 h-4" />
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Export Options
                    </div>
                  </div>
                  
                  {/* Export Dropdown Menu */}
                  {showExportDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <button
                          onClick={handleExportPDF}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                          title="Download as PDF file"
                        >
                          <Download className="w-4 h-4" />
                          Download as PDF
                        </button>
                        <button
                          onClick={handleExportTIFF}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                          title="Download as TIFF image"
                        >
                          <FileImage className="w-4 h-4" />
                          Download as TIFF
                        </button>
                        <button
                          onClick={handleShareEmail}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                          title="Share via email"
                        >
                          <Mail className="w-4 h-4" />
                          Share to Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Print Button */}
                <div className="relative group">
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Print section"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Print Section
                  </div>
                </div>

                {/* Trash Button */}
                <div className="relative group">
                  <button
                    onClick={handleTrash}
                    className="p-2 bg-gray-100 text-gray-700 hover:bg-red-200 hover:text-red-700 rounded-lg transition-colors"
                    title="Move data to trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Move to Trash
                  </div>
                </div>
              </>
            )}
            
            {/* RBAC Section Lock - Only show when showLockButtons is true */}
            {showLockButtons && (
              <div className="ml-2 pl-2 border-l border-gray-300">
                <SectionLock resourceId={sectionId} />
              </div>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        {tabs.length > 0 && activeTab && onTabChange && (
          <div className="flex gap-1 -mb-6 pb-0">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleHeader;