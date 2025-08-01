import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
  enabled?: boolean;
}

interface UseKeyboardNavigationProps {
  shortcuts?: KeyboardShortcut[];
  enableArrowNavigation?: boolean;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onEscape?: () => void;
  onEnter?: () => void;
}

export const useKeyboardNavigation = ({
  shortcuts = [],
  enableArrowNavigation = false,
  onNavigate,
  onEscape,
  onEnter
}: UseKeyboardNavigationProps) => {
  const activeElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check for custom shortcuts
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.enabled === false) return false;
      
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !shortcut.ctrl || event.ctrlKey === shortcut.ctrl;
      const altMatch = !shortcut.alt || event.altKey === shortcut.alt;
      const shiftMatch = !shortcut.shift || event.shiftKey === shortcut.shift;
      const metaMatch = !shortcut.meta || event.metaKey === shortcut.meta;
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.handler();
      return;
    }

    // Handle navigation keys
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
        
      case 'Enter':
        if (onEnter && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
          event.preventDefault();
          onEnter();
        }
        break;
        
      case 'ArrowUp':
        if (enableArrowNavigation && onNavigate) {
          event.preventDefault();
          onNavigate('up');
        }
        break;
        
      case 'ArrowDown':
        if (enableArrowNavigation && onNavigate) {
          event.preventDefault();
          onNavigate('down');
        }
        break;
        
      case 'ArrowLeft':
        if (enableArrowNavigation && onNavigate) {
          event.preventDefault();
          onNavigate('left');
        }
        break;
        
      case 'ArrowRight':
        if (enableArrowNavigation && onNavigate) {
          event.preventDefault();
          onNavigate('right');
        }
        break;
        
      case 'Tab':
        // Enhanced tab navigation
        if (event.shiftKey) {
          // Going backwards
          const focusableElements = getFocusableElements();
          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          if (currentIndex === 0) {
            event.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
          }
        } else {
          // Going forwards
          const focusableElements = getFocusableElements();
          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          if (currentIndex === focusableElements.length - 1) {
            event.preventDefault();
            focusableElements[0]?.focus();
          }
        }
        break;
    }
  }, [shortcuts, enableArrowNavigation, onNavigate, onEscape, onEnter]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Track active element
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      activeElement.current = event.target as HTMLElement;
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  return {
    activeElement: activeElement.current,
    registerShortcut: (shortcut: KeyboardShortcut) => {
      shortcuts.push(shortcut);
    }
  };
};

// Helper function to get all focusable elements
const getFocusableElements = (): HTMLElement[] => {
  const selectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(document.querySelectorAll(selectors)) as HTMLElement[];
};

// Common keyboard shortcuts
export const commonShortcuts = {
  save: { key: 's', ctrl: true, description: 'Save' },
  search: { key: 'f', ctrl: true, description: 'Search' },
  new: { key: 'n', ctrl: true, description: 'New' },
  close: { key: 'w', ctrl: true, description: 'Close' },
  help: { key: '?', shift: true, description: 'Show help' },
  undo: { key: 'z', ctrl: true, description: 'Undo' },
  redo: { key: 'z', ctrl: true, shift: true, description: 'Redo' }
};

// Focus trap hook for modals/dialogs
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements().filter(el => container.contains(el));
    
    if (focusableElements.length === 0) return;

    // Focus first element
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      
      if (event.shiftKey) {
        // Going backwards
        if (currentIndex === 0) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
        }
      } else {
        // Going forwards
        if (currentIndex === focusableElements.length - 1) {
          event.preventDefault();
          focusableElements[0]?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
};

export default useKeyboardNavigation;