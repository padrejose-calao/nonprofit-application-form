/**
 * Floating Widget Manager V2
 * Bottom right order (R to L): Eye, Brain (AI), Logout, Back, Forward, Persons, Bookmark
 * Each icon: 42x42px circle (25% bigger than 28px), 36px spacing, eye icon controls visibility
 */

import React, { useState, useEffect } from 'react';
import { 
  Eye, Bot, LogOut, ChevronLeft, ChevronRight, Users, 
  Bookmark, X, Wifi, WifiOff, Plus, Settings, HelpCircle,
  MessageCircle, Bell, Calendar, FileText, Save, Search
} from 'lucide-react';
import { SimpleTooltip } from './Tooltip';
import { toast } from 'react-toastify';

interface FloatingButton {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  dismissible: boolean;
  onClick?: () => void;
  hasMenu?: boolean;
  component?: React.ReactNode;
}

interface FloatingWidgetManagerV2Props {
  onLogout: () => void;
  onBookmark?: () => void;
  isOffline?: boolean;
  currentModule?: string;
  collaboratorWidget?: React.ReactNode;
  aiAssistantWidget?: React.ReactNode;
}

const FloatingWidgetManagerV2: React.FC<FloatingWidgetManagerV2Props> = ({
  onLogout,
  onBookmark,
  isOffline = false,
  currentModule,
  collaboratorWidget,
  aiAssistantWidget
}) => {
  const [hiddenButtons, setHiddenButtons] = useState<Set<string>>(new Set());
  const [showMenus, setShowMenus] = useState<Record<string, boolean>>({});
  const [bookmarkedModules, setBookmarkedModules] = useState<string[]>([]);

  // Default hidden widgets
  const defaultHiddenWidgets = new Set(['help', 'messages', 'notifications', 'calendar', 'documents', 'save', 'search', 'settings']);

  // Load hidden buttons and bookmarks from localStorage
  useEffect(() => {
    const savedHidden = localStorage.getItem('hiddenFloatingButtons');
    if (savedHidden) {
      setHiddenButtons(new Set(JSON.parse(savedHidden)));
    } else {
      // If no saved state, use default hidden widgets
      setHiddenButtons(defaultHiddenWidgets);
    }

    const savedBookmarks = localStorage.getItem('bookmarkedModules');
    if (savedBookmarks) {
      setBookmarkedModules(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save hidden buttons to localStorage
  useEffect(() => {
    localStorage.setItem('hiddenFloatingButtons', JSON.stringify([...hiddenButtons]));
  }, [hiddenButtons]);

  const toggleMenu = (buttonId: string) => {
    setShowMenus(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [buttonId]: !prev[buttonId]
    }));
  };

  const dismissButton = (buttonId: string) => {
    setHiddenButtons(prev => new Set(prev).add(buttonId));
  };

  const addBookmark = (module: string) => {
    const updated = [...bookmarkedModules, module];
    setBookmarkedModules(updated);
    localStorage.setItem('bookmarkedModules', JSON.stringify(updated));
  };

  const removeBookmark = (module: string) => {
    const updated = bookmarkedModules.filter(m => m !== module);
    setBookmarkedModules(updated);
    localStorage.setItem('bookmarkedModules', JSON.stringify(updated));
  };

  // Define buttons in the exact order specified (will be reversed for right-to-left display)
  const buttons: FloatingButton[] = [
    {
      id: 'bookmark',
      icon: <Bookmark className="w-4 h-4" />,
      title: 'Quick Links',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      dismissible: false,
      hasMenu: true,
      onClick: onBookmark
    },
    {
      id: 'collaborators',
      icon: <Users className="w-4 h-4" />,
      title: 'Active Collaborators',
      color: 'bg-purple-600 hover:bg-purple-700',
      dismissible: true,
      hasMenu: true,
      component: collaboratorWidget
    },
    {
      id: 'forward',
      icon: <ChevronRight className="w-4 h-4" />,
      title: 'Forward',
      color: 'bg-gray-600 hover:bg-gray-700',
      dismissible: false,
      onClick: () => window.history.forward()
    },
    {
      id: 'back',
      icon: <ChevronLeft className="w-4 h-4" />,
      title: 'Back',
      color: 'bg-gray-600 hover:bg-gray-700',
      dismissible: false,
      onClick: () => window.history.back()
    },
    {
      id: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      title: 'Logout',
      color: 'bg-red-500 hover:bg-red-600',
      dismissible: false,
      onClick: onLogout
    },
    {
      id: 'ai-assistant',
      icon: <Bot className="w-4 h-4" />,
      title: 'AI Assistant',
      color: 'bg-blue-600 hover:bg-blue-700',
      dismissible: true,
      hasMenu: true,
      component: aiAssistantWidget
    },
    {
      id: 'visibility',
      icon: <Eye className="w-4 h-4" />,
      title: 'Widget Settings',
      color: 'bg-gray-700 hover:bg-gray-800',
      dismissible: false,
      hasMenu: true
    },
    // Additional widgets (hidden by default)
    {
      id: 'help',
      icon: <HelpCircle className="w-4 h-4" />,
      title: 'Help & Support',
      color: 'bg-purple-500 hover:bg-purple-600',
      dismissible: true,
      onClick: () => toast.info('Help center coming soon!')
    },
    {
      id: 'messages',
      icon: <MessageCircle className="w-4 h-4" />,
      title: 'Messages',
      color: 'bg-green-500 hover:bg-green-600',
      dismissible: true,
      hasMenu: true
    },
    {
      id: 'notifications',
      icon: <Bell className="w-4 h-4" />,
      title: 'Notifications',
      color: 'bg-orange-500 hover:bg-orange-600',
      dismissible: true,
      hasMenu: true
    },
    {
      id: 'calendar',
      icon: <Calendar className="w-4 h-4" />,
      title: 'Calendar',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      dismissible: true,
      onClick: () => toast.info('Calendar integration coming soon!')
    },
    {
      id: 'documents',
      icon: <FileText className="w-4 h-4" />,
      title: 'Documents',
      color: 'bg-teal-500 hover:bg-teal-600',
      dismissible: true,
      onClick: () => toast.info('Document manager coming soon!')
    },
    {
      id: 'save',
      icon: <Save className="w-4 h-4" />,
      title: 'Quick Save',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      dismissible: true,
      onClick: () => toast.success('Data saved!')
    },
    {
      id: 'search',
      icon: <Search className="w-4 h-4" />,
      title: 'Search',
      color: 'bg-pink-500 hover:bg-pink-600',
      dismissible: true,
      onClick: () => toast.info('Search coming soon!')
    },
    {
      id: 'settings',
      icon: <Settings className="w-4 h-4" />,
      title: 'Settings',
      color: 'bg-gray-600 hover:bg-gray-700',
      dismissible: true,
      onClick: () => toast.info('Settings panel coming soon!')
    }
  ];

  const visibleButtons = buttons.filter(btn => !hiddenButtons.has(btn.id));

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2.5 z-50">
      {visibleButtons.reverse().map((button, index) => (
        <div key={button.id} className="relative">
          {/* Main Button - 42x42px (25% bigger) */}
          <SimpleTooltip content={button.title}>
            <button
              onClick={() => {
                if (button.onClick) {
                  button.onClick();
                } else if (button.hasMenu) {
                  toggleMenu(button.id);
                }
              }}
              className={`
                w-11 h-11 rounded-full shadow-lg hover:shadow-xl 
                transition-all duration-200 flex items-center justify-center 
                hover:scale-110 text-white relative
                ${button.color}
              `}
              aria-label={button.title}
              type="button"
            >
              {button.icon}
              
            </button>
          </SimpleTooltip>

          {/* Dropdown Menus */}
          {button.hasMenu && showMenus[button.id] && (
            <div className="absolute bottom-12 right-0 mb-1">
              {/* Visibility Settings Menu */}
              {button.id === 'visibility' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-64 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">Widget Visibility</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {buttons.filter(b => b.dismissible).map(btn => (
                      <label key={btn.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="flex items-center gap-2 text-sm">
                          {btn.icon && React.isValidElement(btn.icon) ? React.cloneElement(btn.icon as React.ReactElement<any>, { className: 'w-3 h-3' }) : btn.icon}
                          {btn.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={!hiddenButtons.has(btn.id)}
                          onChange={() => {
                            if (hiddenButtons.has(btn.id)) {
                              setHiddenButtons(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(btn.id);
                                return newSet;
                              });
                            } else {
                              dismissButton(btn.id);
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmark Menu */}
              {button.id === 'bookmark' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">Quick Links</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {bookmarkedModules.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        No bookmarks yet. Click the star icon in any module header to bookmark it.
                      </p>
                    ) : (
                      <div className="p-2">
                        {bookmarkedModules.map(module => (
                          <div key={module} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <span className="text-sm text-gray-900">{module}</span>
                            <button
                              onClick={() => removeBookmark(module)}
                              className="text-red-500 hover:text-red-700 p-1"
                              aria-label={`Remove ${module} bookmark`}
                              type="button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {currentModule && !bookmarkedModules.includes(currentModule) && (
                    <div className="p-3 border-t">
                      <button 
                        onClick={() => addBookmark(currentModule)}
                        className="w-full flex items-center justify-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        type="button"
                      >
                        <Plus className="w-3 h-3" />
                        Bookmark Current Module
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom component menus */}
              {button.component && (
                <div>{button.component}</div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Connection Status Indicator (always visible, not dismissible) */}
      <div className="relative">
        <SimpleTooltip content={`Connection: ${isOffline ? 'Offline' : 'Online'}`}>
          <button
            className={`
              w-11 h-11 rounded-full shadow-lg hover:shadow-xl 
              transition-all duration-200 flex items-center justify-center 
              hover:scale-110 text-white
              ${isOffline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            `}
            aria-label={`Connection status: ${isOffline ? 'Offline' : 'Online'}`}
            type="button"
            disabled
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </button>
        </SimpleTooltip>
      </div>
    </div>
  );
};

export default FloatingWidgetManagerV2;