import React, { useState } from 'react';
import { 
  Menu, Settings, Save, Download, Upload, LogOut, User, 
  ChevronRight, Check, Clock, Circle, AlertCircle, X,
  FileText, Building2, Users, Briefcase, DollarSign,
  Target, BarChart3, Shield, Cpu, MessageSquare, ShieldAlert,
  FileCheck, MapPin, Info, UserCheck, Gift, HelpCircle
} from 'lucide-react';
import { User as UserType } from '../services/api';
import { SectionProgress } from '../types/NonprofitTypes';

interface ApplicationFrameworkProps {
  currentUser: UserType | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  sectionProgress: SectionProgress;
  onSave?: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  autoSaveEnabled?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
  lastSaved?: Date | null;
  isAutoSaving?: boolean;
}

const sections = [
  { id: 'basicInfo', label: 'Basic Information', required: true, icon: FileText },
  { id: 'narrative', label: 'Narrative', required: true, icon: FileText },
  { id: 'governance', label: 'Governance', required: true, icon: Building2 },
  { id: 'management', label: 'Management', required: true, icon: Briefcase },
  { id: 'financials', label: 'Financials', required: true, icon: DollarSign },
  { id: 'programs', label: 'Programs', required: true, icon: Target },
  { id: 'impact', label: 'Impact & Evaluation', required: true, icon: BarChart3 },
  { id: 'compliance', label: 'Compliance', required: true, icon: Shield },
  { id: 'technology', label: 'Technology', required: false, icon: Cpu },
  { id: 'communications', label: 'Communications', required: false, icon: MessageSquare },
  { id: 'riskManagement', label: 'Risk Management', required: false, icon: ShieldAlert },
  { id: 'insurance', label: 'Insurance', required: false, icon: FileCheck },
  { id: 'otherLocations', label: 'Other Locations', required: false, icon: MapPin },
  { id: 'additionalInfo', label: 'Additional Info', required: false, icon: Info },
  { id: 'leadershipDetails', label: 'Leadership Details', required: false, icon: UserCheck },
  { id: 'boardMemberDetails', label: 'Board Details', required: false, icon: Users },
  { id: 'staffDetails', label: 'Staff Details', required: false, icon: Users },
  { id: 'donations', label: 'Donations', required: false, icon: Gift },
  { id: 'references', label: 'References', required: false, icon: Users },
];

const ApplicationFramework: React.FC<ApplicationFrameworkProps> = ({
  currentUser,
  onLogout,
  children,
  activeSection,
  onSectionChange,
  sectionProgress,
  onSave,
  onExport,
  onImport,
  autoSaveEnabled = false,
  onAutoSaveToggle,
  lastSaved,
  isAutoSaving = false
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Navigation keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Arrow keys for section navigation
      if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        
        const currentIndex = sections.findIndex(s => s.id === activeSection);
        let newIndex;
        
        if (event.key === 'ArrowDown') {
          newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        }
        
        onSectionChange(sections[newIndex].id);
        
        // Smooth scroll to top of content
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      
      // Alt + number for quick section jump
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const sectionIndex = parseInt(event.key) - 1;
        if (sectionIndex < sections.length) {
          onSectionChange(sections[sectionIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, onSectionChange]);

  const getSectionIcon = (sectionId: string) => {
    const progress = sectionProgress[sectionId as keyof SectionProgress];
    if (progress === 100) return <Check className="w-4 h-4 text-green-500" />;
    if (progress > 0) return <Clock className="w-4 h-4 text-blue-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const calculateOverallProgress = () => {
    const progressValues = Object.values(sectionProgress);
    const total = progressValues.reduce((sum, val) => sum + val, 0);
    return Math.round(total / progressValues.length);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">CALAO Nonprofit Application</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Overall Progress */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Overall Progress:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="font-medium">{overallProgress}%</span>
            </div>

            {/* Action Buttons */}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Save (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Export (Ctrl+E)"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}

            {onImport && (
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
                  className="hidden"
                />
              </label>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">{currentUser?.name}</span>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
            <nav className="p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Application Sections
              </h2>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
                        : 'hover:bg-gray-100 text-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className={`w-4 h-4 ${
                        activeSection === section.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="text-sm font-medium">{section.label}</span>
                      {getSectionIcon(section.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Progress Bar */}
                      <div className="w-8 h-2 rounded-full bg-gray-200">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${sectionProgress[section.id as keyof typeof sectionProgress] || 0}%`,
                            backgroundColor: (() => {
                              const progress = sectionProgress[section.id as keyof typeof sectionProgress] || 0;
                              if (progress === 100) return '#10b981'; // green-500
                              if (progress >= 75) return '#3b82f6'; // blue-500  
                              if (progress >= 50) return '#f59e0b'; // yellow-500
                              if (progress > 0) return '#ef4444'; // red-500
                              return 'transparent';
                            })()
                          }}
                        />
                      </div>
                      {/* Completion Badge */}
                      {sectionProgress[section.id as keyof typeof sectionProgress] === 100 && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Special Sections */}
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-3">
                Resources
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => onSectionChange('contacts')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'contacts'
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Contact Manager</span>
                </button>
                <button
                  onClick={() => onSectionChange('projects')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'projects'
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-sm font-medium">Project Manager</span>
                </button>
                <button
                  onClick={() => onSectionChange('documents')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'documents'
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-sm font-medium">Document Manager</span>
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''} p-6`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={autoSaveEnabled}
                    onChange={(e) => onAutoSaveToggle?.(e.target.checked)}
                    className="rounded" 
                  />
                  <span className="text-sm">Enable auto-save</span>
                </label>
                {autoSaveEnabled && lastSaved && (
                  <p className="text-xs text-gray-500 ml-6">
                    Last saved: {lastSaved.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Show field hints</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Compact view</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable keyboard shortcuts</span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Ctrl+S: Save • Ctrl+E: Export • Ctrl+Shift+S: Toggle auto-save<br/>
                  Alt+↑/↓: Navigate sections • Alt+1-9: Jump to section
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFramework;