/**
 * Centralized logging service for the application
 * Replaces direct console.log/error/warn usage
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG;
    } else {
      this.logLevel = LogLevel.WARN;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    let message = `[${timestamp}] [${level}] ${entry.message}`;
    
    if (entry.context) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    return message;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error
    };

    this.addToBuffer(entry);

    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(formattedMessage);
        }
        break;
      case LogLevel.INFO:
        if (this.isDevelopment) {
          console.log(formattedMessage);
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error);
        break;
    }

    // In production, send errors to monitoring service
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
    // For now, we'll just store critical errors in localStorage as backup
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        message: entry.message,
        timestamp: entry.timestamp,
        context: entry.context,
        stack: entry.error?.stack
      });
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Fail silently if localStorage is full
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, context, errorObj);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearLogs(): void {
    this.logBuffer = [];
  }

  // Group logging for batch operations
  group(label: string): void {
    if (this.isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const logDebug = (message: string, context?: Record<string, unknown>) => 
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, unknown>) => 
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, unknown>) => 
  logger.warn(message, context);

export const logError = (message: string, error?: Error | unknown, context?: Record<string, unknown>) => 
  logger.error(message, error, context);

export default logger;