import React, { useState } from 'react';
import { X, Minimize2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

interface FloatingWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultMinimized?: boolean;
  canClose?: boolean;
  position?: 'left' | 'right' | 'center';
}

interface FloatingUIContainerProps {
  widgets: FloatingWidget[];
}

const FloatingUIContainer: React.FC<FloatingUIContainerProps> = ({ widgets }) => {
  const [minimizedWidgets, setMinimizedWidgets] = useState<Set<string>>(
    new Set(widgets.filter(w => w.defaultMinimized).map(w => w.id))
  );
  const [closedWidgets, setClosedWidgets] = useState<Set<string>>(new Set());
  const [collapsedContainer, setCollapsedContainer] = useState(false);

  const toggleMinimize = (widgetId: string) => {
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

  const closeWidget = (widgetId: string) => {
    setClosedWidgets(prev => new Set(prev).add(widgetId));
  };

  const activeWidgets = widgets.filter(w => !closedWidgets.has(w.id));
  
  // Group widgets by position
  const leftWidgets = activeWidgets.filter(w => w.position === 'left');
  const centerWidgets = activeWidgets.filter(w => w.position === 'center');
  const rightWidgets = activeWidgets.filter(w => !w.position || w.position === 'right');

  if (activeWidgets.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="relative h-full">
        {/* Container toggle button */}
        <button
          onClick={() => setCollapsedContainer(!collapsedContainer)}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 pointer-events-auto hover:bg-gray-800 transition-colors shadow-md"
        >
          {collapsedContainer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {collapsedContainer ? 'Show' : 'Hide'} Widgets
        </button>

        {/* Widgets container */}
        <div className={`flex justify-between items-end px-4 pb-4 gap-4 transition-all duration-300 ${
          collapsedContainer ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
        }`}>
          {/* Left section */}
          <div className="flex gap-3 items-end">
            {leftWidgets.map(widget => (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isMinimized={minimizedWidgets.has(widget.id)}
                onToggleMinimize={() => toggleMinimize(widget.id)}
                onClose={() => closeWidget(widget.id)}
              />
            ))}
          </div>

          {/* Center section */}
          <div className="flex gap-3 items-end">
            {centerWidgets.map(widget => (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isMinimized={minimizedWidgets.has(widget.id)}
                onToggleMinimize={() => toggleMinimize(widget.id)}
                onClose={() => closeWidget(widget.id)}
              />
            ))}
          </div>

          {/* Right section */}
          <div className="flex gap-3 items-end">
            {rightWidgets.map(widget => (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isMinimized={minimizedWidgets.has(widget.id)}
                onToggleMinimize={() => toggleMinimize(widget.id)}
                onClose={() => closeWidget(widget.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface WidgetWrapperProps {
  widget: FloatingWidget;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widget,
  isMinimized,
  onToggleMinimize,
  onClose
}) => {
  return (
    <div className="pointer-events-auto">
      {isMinimized ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{widget.title}</span>
          <button
            onClick={onToggleMinimize}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all">
          <div className="flex items-center justify-between p-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleMinimize}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {widget.canClose && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="p-3">
            {widget.component}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingUIContainer;