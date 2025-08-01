import React, { useState } from 'react';
import {

  Save,
  Search,
  Download,
  Upload,
  HelpCircle,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Keyboard,
} from 'lucide-react';

interface QuickActionsPanelProps {
  onSave: () => void;
  onSearch: () => void;
  onExport: () => void;
  onImport: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onPreview: () => void;
  onShowKeyboardShortcuts: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onSave,
  onSearch,
  onExport,
  onImport,
  onHelp,
  onSettings,
  onPreview,
  onShowKeyboardShortcuts,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const actions = [
    {
      icon: Save,
      label: 'Save',
      onClick: onSave,
      shortcut: 'Ctrl+S',
      color: 'text-green-600 hover:bg-green-50',
    },
    {
      icon: Search,
      label: 'Search',
      onClick: onSearch,
      shortcut: 'Ctrl+F',
      color: 'text-blue-600 hover:bg-blue-50',
    },
    {
      icon: Eye,
      label: 'Preview',
      onClick: onPreview,
      shortcut: 'Ctrl+P',
      color: 'text-purple-600 hover:bg-purple-50',
    },
    {
      icon: Download,
      label: 'Export',
      onClick: onExport,
      shortcut: 'Ctrl+E',
      color: 'text-orange-600 hover:bg-orange-50',
    },
    {
      icon: Upload,
      label: 'Import',
      onClick: onImport,
      shortcut: 'Ctrl+I',
      color: 'text-indigo-600 hover:bg-indigo-50',
    },
    {
      icon: Keyboard,
      label: 'Shortcuts',
      onClick: onShowKeyboardShortcuts,
      shortcut: '?',
      color: 'text-gray-600 hover:bg-gray-50',
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
      shortcut: 'Alt+S',
      color: 'text-gray-600 hover:bg-gray-50',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      onClick: onHelp,
      shortcut: 'F1',
      color: 'text-gray-600 hover:bg-gray-50',
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-700">Quick Actions</span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md
                  transition-all duration-200 text-left
                  ${action.color}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={`${action.label} (${action.shortcut})`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1">{action.label}</span>
                    <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                      {action.shortcut}
                    </kbd>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        {!isCollapsed && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="bg-gray-200 px-1 rounded">?</kbd> for all shortcuts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
