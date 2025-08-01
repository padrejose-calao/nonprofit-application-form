export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'editing' | 'form' | 'accessibility';
  enabled: boolean;
}

export class KeyboardShortcutManager {
  private static instance: KeyboardShortcutManager;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;
  private helpModalVisible = false;

  private constructor() {
    this.registerDefaultShortcuts();
    this.setupEventListeners();
  }

  static getInstance(): KeyboardShortcutManager {
    if (!this.instance) {
      this.instance = new KeyboardShortcutManager();
    }
    return this.instance;
  }

  private registerDefaultShortcuts() {
    // Navigation shortcuts
    this.register({
      key: 'Tab',
      description: 'Navigate to next field',
      action: () => this.focusNextField(),
      category: 'navigation',
      enabled: true,
    });

    this.register({
      key: 'Tab',
      shiftKey: true,
      description: 'Navigate to previous field',
      action: () => this.focusPreviousField(),
      category: 'navigation',
      enabled: true,
    });

    // Form shortcuts
    this.register({
      key: 's',
      ctrlKey: true,
      description: 'Save form (Ctrl+S)',
      action: () => this.saveForm(),
      category: 'form',
      enabled: true,
    });

    this.register({
      key: 'z',
      ctrlKey: true,
      description: 'Undo last change (Ctrl+Z)',
      action: () => this.undoLastChange(),
      category: 'editing',
      enabled: true,
    });

    this.register({
      key: 'y',
      ctrlKey: true,
      description: 'Redo last change (Ctrl+Y)',
      action: () => this.redoLastChange(),
      category: 'editing',
      enabled: true,
    });

    // Section navigation
    for (let i = 1; i <= 9; i++) {
      this.register({
        key: i.toString(),
        altKey: true,
        description: `Jump to section ${i} (Alt+${i})`,
        action: () => this.jumpToSection(i),
        category: 'navigation',
        enabled: true,
      });
    }

    // Quick actions
    this.register({
      key: 'n',
      ctrlKey: true,
      description: 'New entry/Clear form (Ctrl+N)',
      action: () => this.clearForm(),
      category: 'form',
      enabled: true,
    });

    this.register({
      key: 'p',
      ctrlKey: true,
      description: 'Print/Export form (Ctrl+P)',
      action: () => this.printForm(),
      category: 'form',
      enabled: true,
    });

    this.register({
      key: 'f',
      ctrlKey: true,
      description: 'Search/Find in form (Ctrl+F)',
      action: () => this.openSearch(),
      category: 'navigation',
      enabled: true,
    });

    // Copy/Paste shortcuts
    this.register({
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      description: 'Copy field content (Ctrl+Shift+C)',
      action: () => this.copyFieldContent(),
      category: 'editing',
      enabled: true,
    });

    this.register({
      key: 'v',
      ctrlKey: true,
      shiftKey: true,
      description: 'Paste field content (Ctrl+Shift+V)',
      action: () => this.pasteFieldContent(),
      category: 'editing',
      enabled: true,
    });

    // Accessibility shortcuts
    this.register({
      key: 'h',
      altKey: true,
      description: 'Toggle high contrast (Alt+H)',
      action: () => this.toggleHighContrast(),
      category: 'accessibility',
      enabled: true,
    });

    this.register({
      key: 'l',
      altKey: true,
      description: 'Toggle large text (Alt+L)',
      action: () => this.toggleLargeText(),
      category: 'accessibility',
      enabled: true,
    });

    // Help
    this.register({
      key: '?',
      description: 'Show keyboard shortcuts help (?)',
      action: () => this.showHelp(),
      category: 'navigation',
      enabled: true,
    });

    this.register({
      key: 'Escape',
      description: 'Close modal/dropdown (Escape)',
      action: () => this.closeModal(),
      category: 'navigation',
      enabled: true,
    });

    // Quick field types
    this.register({
      key: 'Enter',
      ctrlKey: true,
      description: 'Submit current section (Ctrl+Enter)',
      action: () => this.submitCurrentSection(),
      category: 'form',
      enabled: true,
    });

    // Advanced navigation
    this.register({
      key: 'Home',
      ctrlKey: true,
      description: 'Go to form beginning (Ctrl+Home)',
      action: () => this.goToFormBeginning(),
      category: 'navigation',
      enabled: true,
    });

    this.register({
      key: 'End',
      ctrlKey: true,
      description: 'Go to form end (Ctrl+End)',
      action: () => this.goToFormEnd(),
      category: 'navigation',
      enabled: true,
    });
  }

  private setupEventListeners() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      // Don't trigger shortcuts when typing in input fields (except for special cases)
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.hasAttribute('contenteditable'));

      const shortcutKey = this.getShortcutKey(event);
      const shortcut = this.shortcuts.get(shortcutKey);

      if (shortcut && shortcut.enabled) {
        // Allow certain shortcuts even in input fields
        const allowedInInputs = ['s', 'z', 'y', 'f', '?', 'Escape'];
        const keyWithModifiers =
          event.key +
          (event.ctrlKey ? '+ctrl' : '') +
          (event.shiftKey ? '+shift' : '') +
          (event.altKey ? '+alt' : '');

        if (
          !isInputField ||
          allowedInInputs.includes(event.key) ||
          keyWithModifiers.includes('alt') ||
          keyWithModifiers.includes('ctrl')
        ) {
          event.preventDefault();
          shortcut.action();
        }
      }
    });

    // Handle global shortcuts that should work from anywhere
    document.addEventListener('keydown', (event) => {
      // Quick save with Ctrl+S should always work
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.saveForm();
      }

      // Help should always be accessible
      if (event.key === 'F1' || (event.shiftKey && event.key === '?')) {
        event.preventDefault();
        this.showHelp();
      }
    });
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    if (event.metaKey) modifiers.push('meta');

    return [event.key, ...modifiers.sort()].join('+');
  }

  register(shortcut: Omit<KeyboardShortcut, 'key'> & { key: string }) {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('ctrl');
    if (shortcut.shiftKey) modifiers.push('shift');
    if (shortcut.altKey) modifiers.push('alt');
    if (shortcut.metaKey) modifiers.push('meta');

    const key = [shortcut.key, ...modifiers.sort()].join('+');

    this.shortcuts.set(key, {
      ...shortcut,
      key,
    });
  }

  unregister(key: string) {
    this.shortcuts.delete(key);
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  isEnabledShortcut(key: string): boolean {
    const shortcut = this.shortcuts.get(key);
    return shortcut ? shortcut.enabled : false;
  }

  toggleShortcut(key: string) {
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      shortcut.enabled = !shortcut.enabled;
    }
  }

  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.category === category);
  }

  // Action implementations
  private focusNextField() {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  }

  private focusPreviousField() {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[prevIndex]?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const selectors = [
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]',
    ];

    return Array.from(document.querySelectorAll(selectors.join(', '))) as HTMLElement[];
  }

  private saveForm() {
    // Trigger save event
    const saveEvent = new CustomEvent('keyboard-save', { detail: { source: 'keyboard' } });
    document.dispatchEvent(saveEvent);
  }

  private undoLastChange() {
    const undoEvent = new CustomEvent('keyboard-undo');
    document.dispatchEvent(undoEvent);
  }

  private redoLastChange() {
    const redoEvent = new CustomEvent('keyboard-redo');
    document.dispatchEvent(redoEvent);
  }

  private jumpToSection(sectionNumber: number) {
    const section = document.querySelector(
      `[data-section="${sectionNumber}"], [data-section-index="${sectionNumber}"]`
    );
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      const firstInput = section.querySelector('input, textarea, select, button');
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }

  private clearForm() {
    const clearEvent = new CustomEvent('keyboard-clear-form');
    document.dispatchEvent(clearEvent);
  }

  private printForm() {
    const printEvent = new CustomEvent('keyboard-print');
    document.dispatchEvent(printEvent);
  }

  private openSearch() {
    const searchEvent = new CustomEvent('keyboard-search');
    document.dispatchEvent(searchEvent);
  }

  private copyFieldContent() {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      navigator.clipboard.writeText(activeElement.value);
    }
  }

  private pasteFieldContent() {
    navigator.clipboard.readText().then((text) => {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      ) {
        activeElement.value = text;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  private toggleHighContrast() {
    const toggleEvent = new CustomEvent('keyboard-toggle-high-contrast');
    document.dispatchEvent(toggleEvent);
  }

  private toggleLargeText() {
    const toggleEvent = new CustomEvent('keyboard-toggle-large-text');
    document.dispatchEvent(toggleEvent);
  }

  private showHelp() {
    if (this.helpModalVisible) {
      this.hideHelp();
      return;
    }

    this.helpModalVisible = true;
    const modal = this.createHelpModal();
    document.body.appendChild(modal);

    // Focus the modal for accessibility
    modal.focus();
  }

  private hideHelp() {
    this.helpModalVisible = false;
    const modal = document.getElementById('keyboard-shortcuts-help');
    if (modal) {
      modal.remove();
    }
  }

  private createHelpModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'keyboard-shortcuts-help';
    modal.className = 'keyboard-shortcuts-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'shortcuts-title');
    modal.setAttribute('tabindex', '-1');

    const categories = {
      navigation: 'Navigation',
      form: 'Form Actions',
      editing: 'Editing',
      accessibility: 'Accessibility',
    };

    let helpContent = `
      <div class="keyboard-shortcuts-content">
        <div class="keyboard-shortcuts-header">
          <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          <button class="close-button" onclick="this.closest('.keyboard-shortcuts-modal').remove()">×</button>
        </div>
        <div class="keyboard-shortcuts-body">
    `;

    Object.entries(categories).forEach(([category, title]) => {
      const shortcuts = this.getShortcutsByCategory(category as KeyboardShortcut['category']);
      if (shortcuts.length > 0) {
        helpContent += `<div class="shortcut-category">
          <h3>${title}</h3>
          <ul>`;

        shortcuts.forEach((shortcut) => {
          if (shortcut.enabled) {
            helpContent += `<li>
              <span class="shortcut-key">${this.formatShortcutDisplay(shortcut)}</span>
              <span class="shortcut-description">${shortcut.description}</span>
            </li>`;
          }
        });

        helpContent += '</ul></div>';
      }
    });

    helpContent += `
        </div>
        <div class="keyboard-shortcuts-footer">
          <p>Press <kbd>Escape</kbd> or <kbd>?</kbd> to close this help</p>
        </div>
      </div>
    `;

    modal.innerHTML = helpContent;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .keyboard-shortcuts-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .keyboard-shortcuts-content {
        background: white;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      
      .keyboard-shortcuts-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .keyboard-shortcuts-header h2 {
        margin: 0;
        color: #333;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .keyboard-shortcuts-body {
        padding: 20px;
      }
      
      .shortcut-category {
        margin-bottom: 24px;
      }
      
      .shortcut-category h3 {
        margin: 0 0 12px 0;
        color: #555;
        font-size: 16px;
      }
      
      .shortcut-category ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .shortcut-category li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .shortcut-key {
        font-family: monospace;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        min-width: 120px;
      }
      
      .shortcut-description {
        flex: 1;
        margin-left: 16px;
        color: #666;
      }
      
      .keyboard-shortcuts-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      
      .keyboard-shortcuts-footer kbd {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }
    `;

    if (!document.getElementById('keyboard-shortcuts-styles')) {
      styles.id = 'keyboard-shortcuts-styles';
      document.head.appendChild(styles);
    }

    // Handle escape key
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === '?') {
        this.hideHelp();
      }
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideHelp();
      }
    });

    return modal;
  }

  private formatShortcutDisplay(shortcut: KeyboardShortcut): string {
    const parts = [];
    const keyParts = shortcut.key.split('+');
    const mainKey = keyParts[0];
    const modifiers = keyParts.slice(1);

    modifiers.forEach((modifier) => {
      switch (modifier) {
        case 'ctrl':
          parts.push('Ctrl');
          break;
        case 'shift':
          parts.push('Shift');
          break;
        case 'alt':
          parts.push('Alt');
          break;
        case 'meta':
          parts.push('Cmd');
          break;
      }
    });

    parts.push(mainKey.charAt(0).toUpperCase() + mainKey.slice(1));
    return parts.join(' + ');
  }

  private closeModal() {
    // Close any open modals or dropdowns
    const modals = document.querySelectorAll('[role="dialog"], .modal, .dropdown-open');
    modals.forEach((modal) => {
      if (modal.id === 'keyboard-shortcuts-help') {
        this.hideHelp();
      } else {
        (modal as HTMLElement).style.display = 'none';
      }
    });
  }

  private submitCurrentSection() {
    const submitEvent = new CustomEvent('keyboard-submit-section');
    document.dispatchEvent(submitEvent);
  }

  private goToFormBeginning() {
    const firstSection = document.querySelector('[data-section="1"], [data-section-index="1"]');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
      const firstInput = firstSection.querySelector('input, textarea, select');
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }

  private goToFormEnd() {
    const lastSection = document.querySelector('[data-section]:last-of-type');
    if (lastSection) {
      lastSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// React hook for keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const manager = KeyboardShortcutManager.getInstance();

  return {
    register: (shortcut: Omit<KeyboardShortcut, 'key'> & { key: string }) =>
      manager.register(shortcut),
    unregister: (key: string) => manager.unregister(key),
    enable: () => manager.enable(),
    disable: () => manager.disable(),
    toggleShortcut: (key: string) => manager.toggleShortcut(key),
    getAllShortcuts: () => manager.getAllShortcuts(),
    getShortcutsByCategory: (category: KeyboardShortcut['category']) =>
      manager.getShortcutsByCategory(category),
    isEnabled: (key: string) => manager.isEnabledShortcut(key),
  };
};

export default KeyboardShortcutManager;
