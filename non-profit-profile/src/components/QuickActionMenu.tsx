import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Copy, Undo2, Redo2, Search, Settings, HelpCircle, 
  Keyboard, Moon, Sun, Download, Upload, RefreshCw, Zap,
  Eye, EyeOff, Grid, List, Filter, Star, Clock, Check
} from 'lucide-react';
import { toast } from 'react-toastify';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  badge?: string | number;
}

interface QuickActionMenuProps {
  actions?: QuickAction[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  trigger?: 'click' | 'hover' | 'keyboard';
  keyboardShortcut?: string;
  showShortcuts?: boolean;
  className?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'save',
    label: 'Save',
    icon: <Save className="w-4 h-4" />,
    shortcut: 'Ctrl+S',
    action: () => toast.success('Saved!'),
    variant: 'primary'
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: <Copy className="w-4 h-4" />,
    shortcut: 'Ctrl+C',
    action: () => navigator.clipboard.writeText(window.location.href)
  },
  {
    id: 'undo',
    label: 'Undo',
    icon: <Undo2 className="w-4 h-4" />,
    shortcut: 'Ctrl+Z',
    action: () => toast.info('Undo last action')
  },
  {
    id: 'redo',
    label: 'Redo',
    icon: <Redo2 className="w-4 h-4" />,
    shortcut: 'Ctrl+Y',
    action: () => toast.info('Redo last action')
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="w-4 h-4" />,
    shortcut: 'Ctrl+K',
    action: () => toast.info('Search functionality')
  },
  {
    id: 'help',
    label: 'Help',
    icon: <HelpCircle className="w-4 h-4" />,
    shortcut: 'F1',
    action: () => toast.info('Help documentation')
  }
];

const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  actions = defaultActions,
  position = 'top-right',
  trigger = 'click',
  keyboardShortcut = 'Alt+Q',
  showShortcuts = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter actions based on search term
  const filteredActions = actions.filter(action =>
    (action.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (action.shortcut || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle menu with shortcut
      if (event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setIsOpen(!isOpen);
        return;
      }

      // Handle action shortcuts when menu is open
      if (isOpen) {
        // Escape to close
        if (event.key === 'Escape') {
          setIsOpen(false);
          return;
        }

        // Check for action shortcuts
        actions.forEach(action => {
          if (action.shortcut && checkShortcut(event, action.shortcut)) {
            event.preventDefault();
            action.action();
            setIsOpen(false);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actions]);

  // Check if keyboard event matches shortcut
  const checkShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
    const keys = shortcut.toLowerCase().split('+');
    const eventKey = event.key.toLowerCase();

    return keys.every(key => {
      switch (key) {
        case 'ctrl':
          return event.ctrlKey;
        case 'alt':
          return event.altKey;
        case 'shift':
          return event.shiftKey;
        case 'meta':
          return event.metaKey;
        default:
          return eventKey === key;
      }
    });
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-0 right-0';
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 hover:bg-blue-50 hover:text-blue-700';
      case 'danger':
        return 'text-red-600 hover:bg-red-50 hover:text-red-700';
      case 'success':
        return 'text-green-600 hover:bg-green-50 hover:text-green-700';
      default:
        return 'text-gray-600 hover:bg-gray-50 hover:text-gray-700';
    }
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} m-4 ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title={`Quick Actions (${keyboardShortcut})`}
      >
        <Zap className="w-5 h-5 text-gray-600" />
      </button>

      {/* Action Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              {showShortcuts && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {keyboardShortcut}
                </span>
              )}
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredActions.length > 0 ? (
              <div className="p-2">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (!action.disabled) {
                        action.action();
                        setIsOpen(false);
                      }
                    }}
                    disabled={action.disabled}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                      action.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : `${getVariantClasses(action.variant)} cursor-pointer`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {action.icon}
                      <span className="font-medium">{action.label}</span>
                      {action.badge && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    {action.shortcut && showShortcuts && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {action.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No actions found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{filteredActions.length} action{filteredActions.length !== 1 ? 's' : ''}</span>
              <span>Press Esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Preset action configurations
export const createSaveActions = (onSave: () => void, onSaveAs?: () => void): QuickAction[] => [
  {
    id: 'save',
    label: 'Save',
    icon: <Save className="w-4 h-4" />,
    shortcut: 'Ctrl+S',
    action: onSave,
    variant: 'primary'
  },
  ...(onSaveAs ? [{
    id: 'save-as',
    label: 'Save As...',
    icon: <Download className="w-4 h-4" />,
    shortcut: 'Ctrl+Shift+S',
    action: onSaveAs
  }] : [])
];

export const createViewActions = (
  viewMode: string,
  onViewChange: (mode: string) => void
): QuickAction[] => [
  {
    id: 'grid-view',
    label: 'Grid View',
    icon: <Grid className="w-4 h-4" />,
    action: () => onViewChange('grid'),
    variant: viewMode === 'grid' ? 'primary' : 'default'
  },
  {
    id: 'list-view',
    label: 'List View',
    icon: <List className="w-4 h-4" />,
    action: () => onViewChange('list'),
    variant: viewMode === 'list' ? 'primary' : 'default'
  }
];

export const createThemeActions = (
  isDark: boolean,
  onToggle: () => void
): QuickAction[] => [
  {
    id: 'theme-toggle',
    label: isDark ? 'Light Mode' : 'Dark Mode',
    icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
    shortcut: 'Ctrl+Shift+D',
    action: onToggle
  }
];

export default QuickActionMenu;