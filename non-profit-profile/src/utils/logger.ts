import { config } from '../config';
import { errorTracker, ErrorLevel } from './errorTracking';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private context: LogContext = {};

  constructor(defaultContext?: LogContext) {
    this.context = defaultContext || {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Set context for all future logs
   */
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, metadata?: Record<string, any>) {
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };

    this.log(LogLevel.ERROR, message, errorMetadata);

    // Also send to error tracker
    if (error instanceof Error) {
      errorTracker.logError(error, ErrorLevel.ERROR, {
        extra: { ...this.context, ...errorMetadata }
      });
    }
  }

  /**
   * Log API calls
   */
  logApiCall(method: string, url: string, data?: any, response?: any, error?: Error) {
    const metadata = {
      method,
      url,
      request: data,
      response: response?.status ? {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      } : response,
      error: error?.message
    };

    if (error) {
      this.error(`API call failed: ${method} ${url}`, error, metadata);
    } else {
      this.info(`API call: ${method} ${url}`, metadata);
    }
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, details?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      action,
      ...details
    });

    // Add breadcrumb for error tracking
    errorTracker.addBreadcrumb(action, 'user', details);
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...metadata
    });
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(metadata && { metadata })
    };

    // Console output
    const consoleMethod = this.getConsoleMethod(level);
    if (config.environment === 'development') {
      consoleMethod(`[${level.toUpperCase()}]`, message, logEntry);
    } else {
      consoleMethod(`[${level.toUpperCase()}]`, message);
    }

    // In production, you might want to send logs to a service
    if (config.environment === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  /**
   * Check if should log based on config
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevel = this.mapConfigLevel(config.logging.level);
    const levelIndex = levels.indexOf(level);
    const configLevelIndex = levels.indexOf(configLevel);

    return levelIndex >= configLevelIndex;
  }

  /**
   * Map config level to LogLevel
   */
  private mapConfigLevel(configLevel: string): LogLevel {
    switch (configLevel) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  /**
   * Get appropriate console method
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG: return console.debug;
      case LogLevel.INFO: return console.info;
      case LogLevel.WARN: return console.warn;
      case LogLevel.ERROR: return console.error;
      default: return console.log;
    }
  }

  /**
   * Send logs to external service (placeholder)
   */
  private sendToLoggingService(logEntry: any) {
    // Implement sending to your logging service
    // Example: CloudWatch, LogRocket, etc.
  }
}

// Export default logger instance
export const logger = new Logger();

// Export logger for specific modules
export const createLogger = (module: string): Logger => {
  return logger.child({ module });
};