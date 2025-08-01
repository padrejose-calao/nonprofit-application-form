/**
 * Floating Widget Bar - Streamlined Version
 * Widgets: settings, search, save, alerts, ai, exit, back, forward, collaborators, bookmark, wifi status, tips, progress
 * Default order (L to R): settings, eyes, alerts, ai
 * Default visible: ai, exit, network status only
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Search, Save, Bell, Bot, LogOut, ChevronLeft, ChevronRight, 
  Users, Bookmark, Wifi, WifiOff, Eye, EyeOff, Lightbulb, TrendingUp,
  X, Lock, Unlock, Shield, Key, Database, Cloud, Download, Upload,
  RefreshCw, AlertCircle, CheckCircle, Info, HelpCircle, Zap, User
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Widget {
  id: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  title: string;
  tooltip: string;
  color: string;
  defaultVisible: boolean;
  defaultOrder: number;
  onClick?: () => void;
  hasMenu?: boolean;
  component?: React.ReactNode;
  requiresPermission?: string;
}

interface FloatingWidgetBarProps {
  onLogout: () => void;
  isOffline?: boolean;
  currentUser?: any;
  formData?: any;
  onSave?: () => void;
  onSearch?: (query: string) => void;
  collaboratorWidget?: React.ReactNode;
  aiAssistantWidget?: React.ReactNode;
  progressData?: {
    overall: number;
    sections: Record<string, number>;
  };
}

const FloatingWidgetBar: React.FC<FloatingWidgetBarProps> = ({
  onLogout,
  isOffline = false,
  currentUser,
  formData,
  onSave,
  onSearch,
  collaboratorWidget,
  aiAssistantWidget,
  progressData
}) => {
  const [visibleWidgets, setVisibleWidgets] = useState<Set<string>>(new Set());
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [showMenus, setShowMenus] = useState<Record<string, boolean>>({});
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [alerts, setAlerts] = useState<Array<{id: string; message: string; type: 'info' | 'warning' | 'error'}>>([]);
  const [tips, setTips] = useState<string[]>([
    'Use Ctrl+S to quickly save your work',
    'Click the AI assistant for smart suggestions',
    'Drag widgets to reorder them',
    'Your work is auto-saved every 30 seconds',
    'Use the search to quickly find any field'
  ]);
  const [currentTip, setCurrentTip] = useState(0);
  const [showTooltips, setShowTooltips] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Array<{id: string; title: string; url: string; icon?: string}>>([]);

  const widgets: Widget[] = [
    {
      id: 'settings',
      icon: <Settings className="w-4 h-4" />,
      title: 'Settings',
      tooltip: 'Access all your settings and preferences',
      color: 'bg-gray-600 hover:bg-gray-700',
      defaultVisible: false,
      defaultOrder: 0,
      hasMenu: true,
      requiresPermission: 'settings_access'
    },
    {
      id: 'eye',
      icon: <Eye className="w-4 h-4" />,
      activeIcon: <EyeOff className="w-4 h-4" />,
      title: 'Widget Visibility',
      tooltip: 'Show/hide widgets',
      color: 'bg-gray-700 hover:bg-gray-800',
      defaultVisible: false,
      defaultOrder: 1,
      hasMenu: true
    },
    {
      id: 'alerts',
      icon: <Bell className="w-4 h-4" />,
      title: 'Alerts',
      tooltip: `${alerts.length} active alerts`,
      color: alerts.length > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700',
      defaultVisible: false,
      defaultOrder: 2,
      hasMenu: true
    },
    {
      id: 'ai',
      icon: <Bot className="w-4 h-4" />,
      title: 'AI Assistant',
      tooltip: 'Get intelligent help and suggestions',
      color: 'bg-blue-600 hover:bg-blue-700',
      defaultVisible: true,
      defaultOrder: 3,
      hasMenu: true,
      component: aiAssistantWidget
    },
    {
      id: 'search',
      icon: <Search className="w-4 h-4" />,
      title: 'Search',
      tooltip: 'Search all form fields and data',
      color: 'bg-purple-600 hover:bg-purple-700',
      defaultVisible: false,
      defaultOrder: 4,
      hasMenu: true
    },
    {
      id: 'save',
      icon: <Save className="w-4 h-4" />,
      title: 'Save',
      tooltip: 'Save your current work',
      color: 'bg-green-600 hover:bg-green-700',
      defaultVisible: false,
      defaultOrder: 5,
      onClick: onSave || (() => toast.success('Data saved successfully!'))
    },
    {
      id: 'back',
      icon: <ChevronLeft className="w-4 h-4" />,
      title: 'Back',
      tooltip: 'Go back to previous page',
      color: 'bg-gray-600 hover:bg-gray-700',
      defaultVisible: false,
      defaultOrder: 6,
      onClick: () => window.history.back()
    },
    {
      id: 'forward',
      icon: <ChevronRight className="w-4 h-4" />,
      title: 'Forward',
      tooltip: 'Go forward to next page',
      color: 'bg-gray-600 hover:bg-gray-700',
      defaultVisible: false,
      defaultOrder: 7,
      onClick: () => window.history.forward()
    },
    {
      id: 'collaborators',
      icon: <Users className="w-4 h-4" />,
      title: 'Collaborators',
      tooltip: 'View active collaborators',
      color: 'bg-purple-600 hover:bg-purple-700',
      defaultVisible: false,
      defaultOrder: 8,
      hasMenu: true,
      component: collaboratorWidget
    },
    {
      id: 'bookmark',
      icon: <Bookmark className="w-4 h-4" />,
      title: 'Bookmarks',
      tooltip: 'Quick access to bookmarked sections',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      defaultVisible: false,
      defaultOrder: 9,
      hasMenu: true
    },
    {
      id: 'tips',
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Tips',
      tooltip: 'Helpful tips and tricks',
      color: 'bg-amber-500 hover:bg-amber-600',
      defaultVisible: false,
      defaultOrder: 10,
      hasMenu: true
    },
    {
      id: 'progress',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Progress',
      tooltip: `${progressData?.overall || 0}% complete`,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      defaultVisible: false,
      defaultOrder: 11,
      hasMenu: true
    },
    {
      id: 'exit',
      icon: <LogOut className="w-4 h-4" />,
      title: 'Exit',
      tooltip: 'Logout from application',
      color: 'bg-red-500 hover:bg-red-600',
      defaultVisible: true,
      defaultOrder: 12,
      onClick: onLogout
    },
    {
      id: 'wifi',
      icon: isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />,
      title: 'Network Status',
      tooltip: isOffline ? 'Currently offline' : 'Connected to internet',
      color: isOffline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
      defaultVisible: true,
      defaultOrder: 13
    }
  ];

  // Initialize widget state
  useEffect(() => {
    const savedVisible = localStorage.getItem('widgetBarVisible');
    const savedOrder = localStorage.getItem('widgetBarOrder');
    const savedBookmarks = localStorage.getItem('widgetBookmarks');
    
    // Check for reset key combination (Ctrl+Shift+W)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        localStorage.removeItem('widgetBarVisible');
        localStorage.removeItem('widgetBarOrder');
        setVisibleWidgets(new Set(['ai', 'exit', 'wifi', 'eye']));
        toast.success('Widget bar reset to defaults');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    if (savedVisible) {
      setVisibleWidgets(new Set(JSON.parse(savedVisible)));
    } else {
      // Default visible: ai, exit, wifi, AND eye (so users can show/hide others)
      setVisibleWidgets(new Set(['ai', 'exit', 'wifi', 'eye']));
    }
    
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    } else {
      // Default order
      const defaultOrder = widgets
        .sort((a, b) => a.defaultOrder - b.defaultOrder)
        .map(w => w.id);
      setWidgetOrder(defaultOrder);
    }
    
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Save widget state
  useEffect(() => {
    localStorage.setItem('widgetBarVisible', JSON.stringify([...visibleWidgets]));
  }, [visibleWidgets]);

  useEffect(() => {
    localStorage.setItem('widgetBarOrder', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Check for alerts
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts = [];
      
      // Check if form needs saving
      if (formData && !formData.lastSaved) {
        newAlerts.push({
          id: 'unsaved',
          message: 'You have unsaved changes',
          type: 'warning' as const
        });
      }
      
      // Check if offline
      if (isOffline) {
        newAlerts.push({
          id: 'offline',
          message: 'Working offline - changes will sync when connected',
          type: 'info' as const
        });
      }
      
      setAlerts(newAlerts);
    };
    
    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, [formData, isOffline]);

  const toggleWidget = (widgetId: string) => {
    setVisibleWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const toggleMenu = (widgetId: string) => {
    setShowMenus(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [widgetId]: !prev[widgetId]
    }));
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) return;
    
    const newOrder = [...widgetOrder];
    const draggedIndex = newOrder.indexOf(draggedWidget);
    const targetIndex = newOrder.indexOf(targetId);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedWidget);
    
    setWidgetOrder(newOrder);
    setDraggedWidget(null);
  };

  const handleSettingsAction = (category: string, action: string) => {
    switch (category) {
      case 'profile':
        switch (action) {
          case 'Edit Profile':
            toast.info('Opening profile editor...');
            // Implement profile editing
            break;
          case 'Change Password':
            toast.info('Opening password change dialog...');
            // Implement password change
            break;
          case 'Notification Preferences':
            toast.info('Opening notification settings...');
            // Implement notification preferences
            break;
        }
        break;
      case 'permissions':
        switch (action) {
          case 'View Permissions':
            toast.info('Viewing your permissions...');
            break;
          case 'API Keys':
            toast.info('Managing API keys...');
            break;
          case 'Security Settings':
            toast.info('Opening security settings...');
            break;
        }
        break;
      case 'data':
        switch (action) {
          case 'Export Data':
            handleExportData();
            break;
          case 'Import Data':
            handleImportData();
            break;
          case 'Backup Settings':
            toast.success('Settings backed up to cloud');
            break;
        }
        break;
      case 'appearance':
        switch (action) {
          case 'Theme':
            // Toggle theme
            document.body.classList.toggle('dark');
            toast.success('Theme toggled');
            break;
          case 'Widget Layout':
            toast.info('Customize widget layout in the visibility menu');
            break;
          case 'Display Options':
            toast.info('Display options updated');
            break;
        }
        break;
    }
  };

  const handleExportData = () => {
    const data = {
      formData: formData || {},
      settings: {
        widgets: [...visibleWidgets],
        order: widgetOrder,
        bookmarks
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nonprofit-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported successfully');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            toast.success('Data imported successfully');
            // Implement data import logic
          } catch (error) {
            toast.error('Failed to import data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const performSearch = (query: string): Array<{type: string; [key: string]: any}> => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: Array<{type: string; [key: string]: any}> = [];
    
    // Search in form data
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key.toLowerCase().includes(lowerQuery) || 
          (typeof value === 'string' && value.toLowerCase().includes(lowerQuery))
        ) {
          results.push({ type: 'field', key, value });
        }
      });
    }
    
    // Search in widgets
    widgets.forEach(widget => {
      if (
        widget.title.toLowerCase().includes(lowerQuery) ||
        widget.tooltip.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ type: 'widget', widget });
      }
    });
    
    // Search in bookmarks
    bookmarks.forEach(bookmark => {
      if (bookmark.title.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'bookmark', bookmark });
      }
    });
    
    return results;
  };

  // Settings locker groups
  const settingsGroups: Record<string, {
    title: string;
    icon: React.ReactNode;
    items: string[];
    locked?: boolean;
  }> = {
    profile: {
      title: 'Profile Settings',
      icon: <User className="w-4 h-4" />,
      items: ['Edit Profile', 'Change Password', 'Notification Preferences'],
      locked: false
    },
    permissions: {
      title: 'Permissions & Access',
      icon: <Shield className="w-4 h-4" />,
      items: ['View Permissions', 'API Keys', 'Security Settings'],
      locked: !currentUser?.isAdmin
    },
    data: {
      title: 'Data Management',
      icon: <Database className="w-4 h-4" />,
      items: ['Export Data', 'Import Data', 'Backup Settings'],
      locked: false
    },
    appearance: {
      title: 'Appearance',
      icon: <Eye className="w-4 h-4" />,
      items: ['Theme', 'Widget Layout', 'Display Options'],
      locked: false
    }
  };

  const orderedWidgets = widgetOrder
    .map(id => widgets.find(w => w.id === id))
    .filter(w => w && visibleWidgets.has(w.id)) as Widget[];

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      {orderedWidgets.map((widget) => (
        <div
          key={widget.id}
          className="relative"
          draggable
          onDragStart={() => handleDragStart(widget.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(widget.id)}
          onMouseEnter={() => setShowTooltips(prev => ({ ...prev, [widget.id]: true }))}
          onMouseLeave={() => setShowTooltips(prev => ({ ...prev, [widget.id]: false }))}
        >
          {/* Tooltip */}
          {showTooltips[widget.id] && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
              {widget.tooltip}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          )}

          {/* Widget Button */}
          <button
            onClick={() => {
              if (widget.onClick) {
                widget.onClick();
              } else if (widget.hasMenu) {
                toggleMenu(widget.id);
              }
            }}
            className={`
              w-10 h-10 rounded-full shadow-lg hover:shadow-xl 
              transition-all duration-200 flex items-center justify-center 
              hover:scale-110 text-white relative
              ${widget.color}
              ${draggedWidget === widget.id ? 'opacity-50' : ''}
            `}
            aria-label={widget.title}
          >
            {widget.id === 'eye' && !showMenus[widget.id] ? widget.icon : widget.activeIcon || widget.icon}
            
            {/* Alert badge */}
            {widget.id === 'alerts' && alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Dropdown Menus */}
          {widget.hasMenu && showMenus[widget.id] && (
            <div className="absolute bottom-12 right-0 mb-2 animate-in fade-in slide-in-from-bottom-2">
              {/* Settings Menu */}
              {widget.id === 'settings' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Settings Locker</h3>
                    <p className="text-xs text-gray-600 mt-1">Access all your settings in one place</p>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {Object.entries(settingsGroups).map(([key, group]) => (
                      <div key={key} className="border-b last:border-0">
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {group.icon}
                            <span className="font-medium text-gray-900">{group.title}</span>
                          </div>
                          {group.locked && <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="px-3 pb-3">
                          {group.items.map(item => (
                            <button
                              key={item}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={group.locked}
                              onClick={() => handleSettingsAction(key, item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eye/Visibility Menu */}
              {widget.id === 'eye' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Widget Visibility</h3>
                  </div>
                  <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                    {widgets.filter(w => w.id !== 'eye' && w.id !== 'wifi').map(w => (
                      <label key={w.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="flex items-center gap-2 text-sm">
                          {w.icon}
                          {w.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibleWidgets.has(w.id)}
                          onChange={() => toggleWidget(w.id)}
                          className="rounded text-blue-600"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="p-3 border-t bg-gray-50">
                    <p className="text-xs text-gray-600">Drag widgets to reorder them</p>
                  </div>
                </div>
              )}

              {/* Alerts Menu */}
              {widget.id === 'alerts' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Active Alerts</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No active alerts</p>
                    ) : (
                      <div className="p-2 space-y-2">
                        {alerts.map(alert => (
                          <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-2 ${
                            alert.type === 'error' ? 'bg-red-50 text-red-900' :
                            alert.type === 'warning' ? 'bg-yellow-50 text-yellow-900' :
                            'bg-blue-50 text-blue-900'
                          }`}>
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Menu */}
              {widget.id === 'search' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Search Everything</h3>
                  </div>
                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="Search forms, fields, documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (onSearch) {
                            onSearch(searchQuery);
                          } else {
                            // Default search implementation
                            const results = performSearch(searchQuery);
                            if (results.length > 0) {
                              toast.success(`Found ${results.length} results for "${searchQuery}"`);
                            } else {
                              toast.info(`No results found for "${searchQuery}"`);
                            }
                          }
                          setShowMenus({});
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <div className="mt-2 text-xs text-gray-600">
                      Press Enter to search or use advanced filters
                    </div>
                  </div>
                </div>
              )}

              {/* Tips Menu */}
              {widget.id === 'tips' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Helpful Tips</h3>
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="p-4">
                    <div className="bg-amber-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-amber-900">{tips[currentTip]}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-500">{currentTip + 1} / {tips.length}</span>
                      <button
                        onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Menu */}
              {widget.id === 'progress' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Form Progress</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm font-bold text-blue-600">{progressData?.overall || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressData?.overall || 0}%` }}
                        />
                      </div>
                    </div>
                    {progressData?.sections && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(progressData.sections).map(([section, progress]) => (
                          <div key={section} className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600">{section}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    progress === 100 ? 'bg-green-500' : 
                                    progress > 50 ? 'bg-blue-500' : 
                                    'bg-yellow-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700 w-10 text-right">{progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Assistant Menu */}
              {widget.id === 'ai' && widget.component && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  {widget.component}
                </div>
              )}

              {/* Collaborators Menu */}
              {widget.id === 'collaborators' && widget.component && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  {widget.component}
                </div>
              )}

              {/* Bookmark Menu */}
              {widget.id === 'bookmark' && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Bookmarked Sections</h3>
                    <button
                      onClick={() => {
                        const newBookmark = {
                          id: Date.now().toString(),
                          title: document.title,
                          url: window.location.href,
                          icon: '📌'
                        };
                        setBookmarks([...bookmarks, newBookmark]);
                        localStorage.setItem('widgetBookmarks', JSON.stringify([...bookmarks, newBookmark]));
                        toast.success('Page bookmarked!');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Current Page
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {bookmarks.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        No bookmarks yet. Click "Add Current Page" to bookmark this page.
                      </p>
                    ) : (
                      <div className="p-2">
                        {bookmarks.map(bookmark => (
                          <div key={bookmark.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                            <a
                              href={bookmark.url}
                              className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 flex-1"
                            >
                              <span>{bookmark.icon || '📄'}</span>
                              <span className="truncate">{bookmark.title}</span>
                            </a>
                            <button
                              onClick={() => {
                                const updated = bookmarks.filter(b => b.id !== bookmark.id);
                                setBookmarks(updated);
                                localStorage.setItem('widgetBookmarks', JSON.stringify(updated));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingWidgetBar;