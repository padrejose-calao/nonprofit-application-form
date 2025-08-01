/**
 * Floating Widget Manager
 * Manages positioning and z-index of all floating UI elements to prevent overlap
 * Bottom right shows: Collaborators (persons icon), AI, and Eye (visibility settings)
 */

import React, { useState, useEffect } from 'react';
import { Eye, Plus, Users, Bot, ChevronUp, ChevronDown, Wifi } from 'lucide-react';

export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface FloatingWidget {
  id: string;
  component: React.ReactNode;
  position: WidgetPosition;
  dismissible?: boolean;
  priority?: number;
  icon?: React.ReactNode;
  showInMenu?: boolean; // Whether to show in the eye menu
}

interface FloatingWidgetManagerProps {
  widgets: FloatingWidget[];
  onDismiss?: (widgetId: string) => void;
}

const FloatingWidgetManager: React.FC<FloatingWidgetManagerProps> = ({ widgets }) => {
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [minimizedWidgets, setMinimizedWidgets] = useState<Set<string>>(new Set());

  // Load hidden widgets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hiddenFloatingWidgets');
    if (saved) {
      setHiddenWidgets(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save hidden widgets to localStorage
  useEffect(() => {
    localStorage.setItem('hiddenFloatingWidgets', JSON.stringify([...hiddenWidgets]));
  }, [hiddenWidgets]);

  const toggleWidgetVisibility = (widgetId: string) => {
    setHiddenWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const toggleMinimized = (widgetId: string) => {
    setMinimizedWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  // Get active widgets
  const activeWidgets = widgets.filter(w => !hiddenWidgets.has(w.id));

  // Special handling for core widgets
  const collaboratorWidget = activeWidgets.find(w => w.id === 'collaboration');
  const aiWidget = activeWidgets.find(w => w.id === 'ai-assistant');
  const offlineWidget = activeWidgets.find(w => w.id === 'offline-indicator');
  const otherWidgets = activeWidgets.filter(w => 
    w.id !== 'collaboration' && 
    w.id !== 'ai-assistant' && 
    w.id !== 'offline-indicator' && 
    w.showInMenu !== false
  );

  return (
    <>
      {/* Offline Indicator (leftmost) - spacing: right-48 (192px) */}
      {offlineWidget && (
        <div
          className="fixed bottom-4 transition-all duration-300 z-40"
          style={{ right: '192px' }}
        >
          {offlineWidget.component}
        </div>
      )}

      {/* Collaborators Widget - spacing: right-32 (128px) */}
      {collaboratorWidget && (
        <div
          className="fixed bottom-4 transition-all duration-300 z-40"
          style={{ right: '128px' }}
        >
          <div className="relative">
            <button
              onClick={() => toggleMinimized('collaboration')}
              className="bg-purple-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
              title="Active Collaborators"
            >
              <Users className="w-6 h-6" />
            </button>
            {!minimizedWidgets.has('collaboration') && (
              <div className="absolute bottom-16 right-0 mb-2">
                {collaboratorWidget.component}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant - spacing: right-16 (64px) */}
      {aiWidget && (
        <div
          className="fixed bottom-4 transition-all duration-300 z-40"
          style={{ right: '64px' }}
        >
          {aiWidget.component}
        </div>
      )}

      {/* Eye/Visibility Settings (rightmost) - spacing: right-4 (16px) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
          className="bg-gray-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
          title="Widget Visibility Settings"
        >
          <Eye className="w-6 h-6" />
        </button>

        {/* Visibility Menu */}
        {showVisibilityMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-64 overflow-hidden">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm">Widget Visibility</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {/* Core widgets */}
              <div className="p-2 border-b">
                <div className="text-xs font-medium text-gray-500 mb-2">Core Widgets</div>
                
                {/* Collaborators toggle */}
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <span className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                    Collaborators
                  </span>
                  <input
                    type="checkbox"
                    checked={!hiddenWidgets.has('collaboration')}
                    onChange={() => toggleWidgetVisibility('collaboration')}
                    className="rounded text-blue-600"
                  />
                </label>

                {/* AI Assistant toggle */}
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <span className="flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-blue-600" />
                    AI Assistant
                  </span>
                  <input
                    type="checkbox"
                    checked={!hiddenWidgets.has('ai-assistant')}
                    onChange={() => toggleWidgetVisibility('ai-assistant')}
                    className="rounded text-blue-600"
                  />
                </label>

                {/* Offline Indicator toggle */}
                <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <span className="flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-green-600" />
                    Connection Status
                  </span>
                  <input
                    type="checkbox"
                    checked={!hiddenWidgets.has('offline-indicator')}
                    onChange={() => toggleWidgetVisibility('offline-indicator')}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>

              {/* Other widgets */}
              {otherWidgets.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Additional Widgets</div>
                  {otherWidgets.map(widget => (
                    <label 
                      key={widget.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {widget.icon || <div className="w-4 h-4 bg-gray-400 rounded" />}
                        {widget.id.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <input
                        type="checkbox"
                        checked={!hiddenWidgets.has(widget.id)}
                        onChange={() => toggleWidgetVisibility(widget.id)}
                        className="rounded text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Add more widgets button */}
              <div className="p-2 border-t">
                <button className="w-full flex items-center justify-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Plus className="w-4 h-4" />
                  Add More Widgets
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render other visible widgets */}
      {otherWidgets
        .filter(w => !hiddenWidgets.has(w.id))
        .map((widget, index) => (
          <div
            key={widget.id}
            className="fixed transition-all duration-300 z-30"
            style={{
              bottom: '16px',
              right: `${240 + (index * 72)}px`
            }}
          >
            {widget.component}
          </div>
        ))}
    </>
  );
};

export default FloatingWidgetManager;

// Hook to restore hidden widgets
export const useRestoreHiddenWidgets = () => {
  const restoreAll = () => {
    localStorage.removeItem('hiddenFloatingWidgets');
    window.location.reload();
  };

  const restoreWidget = (widgetId: string) => {
    const saved = localStorage.getItem('hiddenFloatingWidgets');
    if (saved) {
      const hidden = new Set(JSON.parse(saved));
      hidden.delete(widgetId);
      localStorage.setItem('hiddenFloatingWidgets', JSON.stringify([...hidden]));
      window.location.reload();
    }
  };

  return { restoreAll, restoreWidget };
};