import { config } from '../config';

export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    organizationId?: string;
  };
  extra?: Record<string, any>;
  tags?: Record<string, string>;
}

class ErrorTracker {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (config.errorTracking.sentryDsn) {
      // Initialize Sentry if DSN is provided
      // Note: You would need to install @sentry/react package
      // import * as Sentry from '@sentry/react';
      // Sentry.init({
      //   dsn: config.errorTracking.sentryDsn,
      //   environment: config.environment,
      //   tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
      // });
      this.initialized = true;
    }
  }

  /**
   * Log an error with context
   */
  logError(error: Error | string, level: ErrorLevel = ErrorLevel.ERROR, context?: ErrorContext) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Console logging based on environment and log level
    if (this.shouldLog(level)) {
      const logData = {
        level,
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        ...context
      };

      switch (level) {
        case ErrorLevel.DEBUG:
          console.debug('[DEBUG]', logData);
          break;
        case ErrorLevel.INFO:
          console.info('[INFO]', logData);
          break;
        case ErrorLevel.WARNING:
          console.warn('[WARNING]', logData);
          break;
        case ErrorLevel.ERROR:
        case ErrorLevel.FATAL:
          console.error(`[${level.toUpperCase()}]`, logData);
          break;
      }
    }

    // Send to external error tracking service if configured
    if (this.initialized && level !== ErrorLevel.DEBUG) {
      // Sentry.captureException(error, {
      //   level: level as any,
      //   contexts: context?.extra,
      //   tags: context?.tags,
      //   user: context?.user
      // });
    }

    // Store errors in localStorage for debugging (development only)
    if (config.environment === 'development') {
      this.storeErrorLocally(errorMessage, level, context);
    }
  }

  /**
   * Log a message (not an error)
   */
  logMessage(message: string, level: ErrorLevel = ErrorLevel.INFO, context?: ErrorContext) {
    if (this.shouldLog(level)) {
      const logData = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context
      };

      switch (level) {
        case ErrorLevel.DEBUG:
          console.debug('[DEBUG]', logData);
          break;
        case ErrorLevel.INFO:
          console.info('[INFO]', logData);
          break;
        case ErrorLevel.WARNING:
          console.warn('[WARNING]', logData);
          break;
      }
    }

    if (this.initialized && level === ErrorLevel.WARNING) {
      // Sentry.captureMessage(message, level as any);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: ErrorContext['user']) {
    if (this.initialized) {
      // Sentry.setUser(user);
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (this.initialized) {
      // Sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb for error tracking
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (this.initialized) {
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   level: 'info',
      //   data,
      //   timestamp: Date.now() / 1000
      // });
    }
  }

  /**
   * Check if should log based on current log level
   */
  private shouldLog(level: ErrorLevel): boolean {
    const levels = [ErrorLevel.DEBUG, ErrorLevel.INFO, ErrorLevel.WARNING, ErrorLevel.ERROR, ErrorLevel.FATAL];
    const configLevel = config.logging.level;
    const configLevelIndex = levels.findIndex(l => l === configLevel);
    const messageLevelIndex = levels.findIndex(l => l === level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Store error in localStorage for development debugging
   */
  private storeErrorLocally(message: string, level: ErrorLevel, context?: ErrorContext) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        message,
        level,
        context,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 errors
      const recentErrors = errors.slice(-50);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get stored errors from localStorage (development only)
   */
  getStoredErrors(): any[] {
    if (config.environment !== 'development') {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    localStorage.removeItem('app_errors');
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// React Error Boundary helper
export const logErrorBoundary = (error: Error, errorInfo: any) => {
  errorTracker.logError(error, ErrorLevel.ERROR, {
    extra: {
      componentStack: errorInfo.componentStack
    }
  });
};