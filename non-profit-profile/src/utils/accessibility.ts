import { storageService } from '../services/storageService';
import { logger } from './logger';

export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  textSpacing: 'normal' | 'increased';
  readingGuide: boolean;
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private options: AccessibilityOptions;
  private observers: Array<(options: AccessibilityOptions) => void> = [];

  private constructor() {
    this.options = this.getDefaultOptions();
    this.initializeAsync();
  }

  private async initializeAsync() {
    this.options = await this.loadSavedOptions();
    this.applyAccessibilitySettings();
    this.setupKeyboardNavigation();
    this.detectSystemPreferences();
  }

  static getInstance(): AccessibilityManager {
    if (!this.instance) {
      this.instance = new AccessibilityManager();
    }
    return this.instance;
  }

  private async loadSavedOptions(): Promise<AccessibilityOptions> {
    const saved = await storageService.get('accessibility-settings');
    if (saved) {
      try {
        return { ...this.getDefaultOptions(), ...saved };
      } catch (e) {
        logger.warn('Failed to load accessibility settings');
      }
    }
    return this.getDefaultOptions();
  }

  private getDefaultOptions(): AccessibilityOptions {
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindMode: 'none',
      fontSize: 'medium',
      textSpacing: 'normal',
      readingGuide: false,
    };
  }

  private detectSystemPreferences() {
    if (typeof window !== 'undefined') {
      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        this.updateOption('reducedMotion', true);
      }

      // Detect high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
      if (prefersHighContrast.matches) {
        this.updateOption('highContrast', true);
      }

      // Listen for changes
      prefersReducedMotion.addEventListener('change', (e) => {
        this.updateOption('reducedMotion', e.matches);
      });

      prefersHighContrast.addEventListener('change', (e) => {
        this.updateOption('highContrast', e.matches);
      });
    }
  }

  private setupKeyboardNavigation() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => {
        if (!this.options.keyboardNavigation) return;

        // Tab navigation enhancement
        if (e.key === 'Tab') {
          this.highlightFocusableElements();
        }

        // Skip to main content
        if (e.key === 'Enter' && e.ctrlKey) {
          const mainContent = document.querySelector('main, [role="main"], #main-content');
          if (mainContent) {
            (mainContent as HTMLElement).focus();
          }
        }

        // Section navigation shortcuts
        if (e.altKey) {
          const sectionNumber = parseInt(e.key);
          if (sectionNumber >= 1 && sectionNumber <= 9) {
            this.navigateToSection(sectionNumber);
          }
        }
      });

      // Escape key to close modals/dropdowns
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const activeElement = document.activeElement;
          if (activeElement && activeElement.closest('[role="dialog"], .modal, .dropdown')) {
            (activeElement as HTMLElement).blur();
          }
        }
      });
    }
  }

  private highlightFocusableElements() {
    if (!this.options.focusIndicators) return;

    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 3px solid #4285f4 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 1px #ffffff !important;
      }
    `;

    document.head.appendChild(style);
    setTimeout(() => style.remove(), 5000);
  }

  private navigateToSection(sectionNumber: number) {
    const sections = document.querySelectorAll('[data-section]');
    if (sections[sectionNumber - 1]) {
      (sections[sectionNumber - 1] as HTMLElement).scrollIntoView({
        behavior: this.options.reducedMotion ? 'auto' : 'smooth',
      });
      (sections[sectionNumber - 1] as HTMLElement).focus();
    }
  }

  async updateOption<K extends keyof AccessibilityOptions>(key: K, value: AccessibilityOptions[K]) {
    this.options[key] = value;
    await this.saveOptions();
    this.applyAccessibilitySettings();
    this.notifyObservers();
  }

  async updateOptions(options: Partial<AccessibilityOptions>) {
    Object.assign(this.options, options);
    await this.saveOptions();
    this.applyAccessibilitySettings();
    this.notifyObservers();
  }

  getOptions(): AccessibilityOptions {
    return { ...this.options };
  }

  private async saveOptions() {
    await storageService.set('accessibility-settings', this.options);
  }

  private applyAccessibilitySettings() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // High contrast
    root.classList.toggle('high-contrast', this.options.highContrast);

    // Large text
    root.classList.toggle('large-text', this.options.largeText);

    // Reduced motion
    root.classList.toggle('reduced-motion', this.options.reducedMotion);

    // Font size
    root.setAttribute('data-font-size', this.options.fontSize);

    // Text spacing
    root.classList.toggle('increased-spacing', this.options.textSpacing === 'increased');

    // Color blind mode
    root.setAttribute('data-colorblind-mode', this.options.colorBlindMode);

    // Reading guide
    root.classList.toggle('reading-guide', this.options.readingGuide);

    // Apply CSS custom properties
    this.applyCSSVariables();
  }

  private applyCSSVariables() {
    const root = document.documentElement;

    // Font sizes
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '22px',
    };

    root.style.setProperty('--base-font-size', fontSizes[this.options.fontSize]);

    // Spacing multipliers
    const spacingMultiplier = this.options.textSpacing === 'increased' ? 1.5 : 1;
    root.style.setProperty('--text-spacing-multiplier', spacingMultiplier.toString());

    // High contrast colors
    if (this.options.highContrast) {
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--border-color', '#000000');
      root.style.setProperty('--link-color', '#0000ff');
      root.style.setProperty('--button-color', '#000000');
      root.style.setProperty('--button-bg', '#ffffff');
    }

    // Color blind filters
    const colorBlindFilters = {
      protanopia: 'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
      none: 'none',
    };

    if (this.options.colorBlindMode !== 'none') {
      this.injectColorBlindFilters();
      root.style.setProperty('filter', colorBlindFilters[this.options.colorBlindMode]);
    } else {
      root.style.removeProperty('filter');
    }
  }

  private injectColorBlindFilters() {
    if (document.getElementById('colorblind-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'colorblind-filters';
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';

    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567 0.433 0     0 0
                                              0.558 0.442 0     0 0
                                              0     0.242 0.758 0 0
                                              0     0     0     1 0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625 0.375 0     0 0
                                              0.7   0.3   0     0 0
                                              0     0.3   0.7   0 0
                                              0     0     0     1 0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95  0.05  0     0 0
                                              0     0.433 0.567 0 0
                                              0     0.475 0.525 0 0
                                              0     0     0     1 0"/>
        </filter>
      </defs>
    `;

    document.body.appendChild(svg);
  }

  // Screen reader announcements
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.options.screenReader && !this.isScreenReaderDetected()) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  private isScreenReaderDetected(): boolean {
    // Simple heuristic to detect screen readers
    return (
      typeof window !== 'undefined' &&
      (window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        !!window.speechSynthesis)
    );
  }

  // Generate accessibility report
  generateAccessibilityReport(): {
    score: number;
    issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string; element?: string }>;
    recommendations: string[];
  } {
    const issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      element?: string;
    }> = [];

    if (typeof document === 'undefined') {
      return { score: 0, issues: [], recommendations: [] };
    }

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach((img, index) => {
      issues.push({
        severity: 'error',
        message: 'Image missing alt text',
        element: `img[${index}]`,
      });
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach((input, index) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push({
          severity: 'error',
          message: 'Form input missing label',
          element: `input[${index}]`,
        });
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          severity: 'warning',
          message: 'Heading hierarchy skip detected',
          element: `${heading.tagName.toLowerCase()}[${index}]`,
        });
      }
      lastLevel = level;
    });

    // Check color contrast (simplified)
    if (!this.options.highContrast) {
      issues.push({
        severity: 'info',
        message: 'Consider enabling high contrast mode for better readability',
      });
    }

    const score = Math.max(0, 100 - issues.length * 10);
    const recommendations = this.generateAccessibilityRecommendations(issues);

    return { score, issues, recommendations };
  }

  private generateAccessibilityRecommendations(
    issues: Array<{ severity: string; message: string }>
  ): string[] {
    const recommendations: string[] = [];

    if (issues.some((issue) => issue.message.includes('alt text'))) {
      recommendations.push('Add descriptive alt text to all images');
    }

    if (issues.some((issue) => issue.message.includes('label'))) {
      recommendations.push('Ensure all form inputs have proper labels');
    }

    if (issues.some((issue) => issue.message.includes('heading'))) {
      recommendations.push('Maintain proper heading hierarchy (h1 → h2 → h3, etc.)');
    }

    recommendations.push('Test your form with keyboard navigation only');
    recommendations.push('Test with a screen reader');
    recommendations.push('Verify color contrast meets WCAG guidelines');

    return recommendations;
  }

  // Observer pattern for settings changes
  subscribe(callback: (options: AccessibilityOptions) => void) {
    this.observers.push(callback);
  }

  unsubscribe(callback: (options: AccessibilityOptions) => void) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback(this.options));
  }

  // Reset to defaults
  async resetToDefaults() {
    this.options = this.getDefaultOptions();
    await this.saveOptions();
    this.applyAccessibilitySettings();
    this.notifyObservers();
  }
}

// React hook for accessibility
export const useAccessibility = () => {
  const manager = AccessibilityManager.getInstance();

  return {
    options: manager.getOptions(),
    updateOption: async <K extends keyof AccessibilityOptions>(key: K, value: AccessibilityOptions[K]) =>
      await manager.updateOption(key, value),
    updateOptions: async (options: Partial<AccessibilityOptions>) => await manager.updateOptions(options),
    announce: (message: string, priority?: 'polite' | 'assertive') =>
      manager.announceToScreenReader(message, priority),
    generateReport: () => manager.generateAccessibilityReport(),
    resetToDefaults: async () => await manager.resetToDefaults(),
  };
};

export default AccessibilityManager;
