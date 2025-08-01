// Accessibility enhancement utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('role', 'status');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

export const createSkipLink = (targetId: string, label: string) => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
  return skipLink;
};

export const addFocusTrap = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

export const enhanceFormAccessibility = (form: HTMLFormElement) => {
  // Add aria-describedby for error messages
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const errorElement = form.querySelector(`[data-error-for="${input.id}"]`);
    if (errorElement) {
      input.setAttribute('aria-describedby', errorElement.id);
      input.setAttribute('aria-invalid', 'true');
    }
  });

  // Add required field indicators
  const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  requiredInputs.forEach((input) => {
    const label = form.querySelector(`label[for="${input.id}"]`);
    if (label && !label.textContent?.includes('*')) {
      label.innerHTML += ' <span class="text-red-500" aria-label="required">*</span>';
    }
  });
};

export const addKeyboardNavigation = (container: HTMLElement) => {
  container.addEventListener('keydown', (e) => {
    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const focusableElements = Array.from(
        container.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
      ) as HTMLElement[];
      
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) return;

      let nextIndex: number;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          break;
        default:
          return;
      }

      focusableElements[nextIndex]?.focus();
      e.preventDefault();
    }
  });
};

export const createTooltip = (element: HTMLElement, content: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
  let tooltip: HTMLElement | null = null;

  const showTooltip = () => {
    tooltip = document.createElement('div');
    tooltip.textContent = content;
    tooltip.className = `absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none`;
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    document.body.appendChild(tooltip);
    const tooltipRect = tooltip.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
        break;
      case 'bottom':
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
        tooltip.style.top = `${rect.bottom + 8}px`;
        break;
      case 'left':
        tooltip.style.left = `${rect.left - tooltipRect.width - 8}px`;
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
        break;
      case 'right':
        tooltip.style.left = `${rect.right + 8}px`;
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
        break;
    }

    // Add ARIA attributes
    element.setAttribute('aria-describedby', tooltip.id = `tooltip-${Date.now()}`);
    tooltip.setAttribute('role', 'tooltip');
  };

  const hideTooltip = () => {
    if (tooltip) {
      document.body.removeChild(tooltip);
      tooltip = null;
      element.removeAttribute('aria-describedby');
    }
  };

  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('focus', showTooltip);
  element.addEventListener('blur', hideTooltip);

  return () => {
    hideTooltip();
    element.removeEventListener('mouseenter', showTooltip);
    element.removeEventListener('mouseleave', hideTooltip);
    element.removeEventListener('focus', showTooltip);
    element.removeEventListener('blur', hideTooltip);
  };
};

export const addLiveRegion = (id: string, priority: 'polite' | 'assertive' = 'polite') => {
  const existing = document.getElementById(id);
  if (existing) return existing;

  const liveRegion = document.createElement('div');
  liveRegion.id = id;
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);

  return liveRegion;
};

export const updateLiveRegion = (id: string, message: string) => {
  const region = document.getElementById(id);
  if (region) {
    region.textContent = message;
  }
};

export const addProgressAnnouncement = (current: number, total: number, label: string = 'progress') => {
  const percentage = Math.round((current / total) * 100);
  announceToScreenReader(`${label}: ${percentage}% complete, ${current} of ${total}`);
};

export const enhanceTableAccessibility = (table: HTMLTableElement) => {
  // Add scope attributes to headers
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    if (!header.hasAttribute('scope')) {
      header.setAttribute('scope', header.closest('thead') ? 'col' : 'row');
    }
  });

  // Add table caption if missing
  if (!table.querySelector('caption')) {
    const caption = document.createElement('caption');
    caption.textContent = 'Data table';
    caption.className = 'sr-only';
    table.insertBefore(caption, table.firstChild);
  }

  // Add row headers if needed
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, index) => {
    const firstCell = row.querySelector('td');
    if (firstCell && !firstCell.hasAttribute('scope')) {
      firstCell.setAttribute('scope', 'row');
    }
  });
};

export const addErrorSummary = (errors: { field: string; message: string }[]) => {
  const existing = document.getElementById('error-summary');
  if (existing) {
    existing.remove();
  }

  if (errors.length === 0) return;

  const summary = document.createElement('div');
  summary.id = 'error-summary';
  summary.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-6';
  summary.setAttribute('role', 'alert');
  summary.setAttribute('aria-labelledby', 'error-summary-title');

  summary.innerHTML = `
    <h2 id="error-summary-title" class="text-lg font-semibold text-red-800 mb-2">
      Please correct the following errors:
    </h2>
    <ul class="list-disc list-inside space-y-1">
      ${errors.map(error => 
        `<li><a href="#${error.field}" class="text-red-700 hover:text-red-900 underline">${error.message}</a></li>`
      ).join('')}
    </ul>
  `;

  // Insert at the top of the main content
  const main = document.querySelector('main') || document.body;
  main.insertBefore(summary, main.firstChild);

  // Focus the summary
  summary.setAttribute('tabindex', '-1');
  summary.focus();

  return summary;
};

export const createAccessibilityReport = () => {
  const report = {
    missingAltText: document.querySelectorAll('img:not([alt])').length,
    missingFormLabels: document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length,
    missingHeadingHierarchy: checkHeadingHierarchy(),
    lowContrastElements: checkColorContrast(),
    missingSkipLinks: document.querySelectorAll('a[href^="#"]').length === 0,
    unlabledButtons: document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').length,
    score: 0
  };

  const maxScore = Object.keys(report).length - 1; // Exclude score itself
  const issues = Object.values(report).slice(0, -1).reduce((sum: number, count) => {
    if (typeof count === 'boolean') {
      return sum + (count ? 1 : 0);
    }
    if (typeof count === 'number') {
      return sum + (count > 0 ? 1 : 0);
    }
    return sum;
  }, 0);
  report.score = maxScore > 0 ? Math.round(((maxScore - issues) / maxScore) * 100) : 100;

  return report;
};

const checkHeadingHierarchy = () => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  
  for (const heading of headings) {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    if (currentLevel > previousLevel + 1) {
      return false; // Skipped heading level
    }
    previousLevel = currentLevel;
  }
  
  return true;
};

const checkColorContrast = () => {
  // Simplified contrast check - in a real implementation, you'd use a proper contrast library
  const textElements = document.querySelectorAll('p, span, div, a, button');
  let lowContrastCount = 0;
  
  textElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Simplified check - you'd want to use a proper contrast ratio calculation
    if (color === backgroundColor || (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)')) {
      lowContrastCount++;
    }
  });
  
  return lowContrastCount;
};

export default {
  announceToScreenReader,
  createSkipLink,
  addFocusTrap,
  enhanceFormAccessibility,
  addKeyboardNavigation,
  createTooltip,
  addLiveRegion,
  updateLiveRegion,
  addProgressAnnouncement,
  enhanceTableAccessibility,
  addErrorSummary,
  createAccessibilityReport
};