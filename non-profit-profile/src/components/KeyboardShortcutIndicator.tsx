import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { storageService } from '../services/storageService';

interface KeyboardShortcutIndicatorProps {
  show?: boolean;
}

const KeyboardShortcutIndicator: React.FC<KeyboardShortcutIndicatorProps> = ({ show = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkDismissed = async () => {
      // Check if user has dismissed this before
      const dismissed = await storageService.get('keyboardShortcutsIndicatorDismissed');
      if (dismissed) {
        setIsDismissed(true);
        return;
      }

      // Show indicator after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    };

    checkDismissed();
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    setIsDismissed(true);
    await storageService.set('keyboardShortcutsIndicatorDismissed', true);
  };

  if (!show || isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-xl border-l-4 border-yellow-400 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Keyboard className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">💡 Pro Tip: Keyboard Shortcuts</h4>
              <p className="text-xs text-blue-100 mb-2">
                Press <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">?</kbd> to see all available shortcuts
              </p>
              <div className="text-xs text-blue-100 space-y-1">
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Ctrl+S</kbd> Save</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Ctrl+K</kbd> Quick Actions</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors ml-2 flex-shrink-0"
            aria-label="Dismiss tip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutIndicator;