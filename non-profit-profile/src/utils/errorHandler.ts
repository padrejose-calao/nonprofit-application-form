import { toast } from 'react-toastify';

export interface ErrorInfo {
  message: string;
  field?: string;
  section?: string;
  severity: 'error' | 'warning' | 'info';
  timestamp?: number;
  stack?: string;
}

export class ErrorHandler {
  private static errors: ErrorInfo[] = [];
  private static maxErrors = 100;

  static logError(error: ErrorInfo) {
    this.errors.unshift({
      ...error,
      timestamp: Date.now(),
    });

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    switch (error.severity) {
      case 'error':
        toast.error(error.message);
        break;
      case 'warning':
        toast.warn(error.message);
        break;
      case 'info':
        toast.info(error.message);
        break;
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }
  }

  static getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  static clearErrors() {
    this.errors = [];
  }

  static handleValidationError(field: string, message: string, section?: string) {
    this.logError({
      message: `Validation error in ${field}: ${message}`,
      field,
      section,
      severity: 'error',
    });
  }

  static handleFileUploadError(fileName: string, error: string) {
    this.logError({
      message: `File upload failed for ${fileName}: ${error}`,
      severity: 'error',
    });
  }

  static handleAutoSaveError(section: string, error: string) {
    this.logError({
      message: `Auto-save failed for ${section}: ${error}`,
      section,
      severity: 'warning',
    });
  }
}

export const handleSaveError = (error: any, context?: any) => {
  ErrorHandler.logError({
    message: `Save error: ${error.message || error}`,
    severity: 'error',
  });
  console.error('Save error:', error, context);
};

export const handleImportError = (error: any, context?: any) => {
  ErrorHandler.logError({
    message: `Import error: ${error.message || error}`,
    severity: 'error',
  });
  console.error('Import error:', error, context);
};

export const handleFileError = (error: any, context?: any) => {
  ErrorHandler.logError({
    message: `File error: ${error.message || error}`,
    severity: 'error',
  });
  console.error('File error:', error, context);
};

export default ErrorHandler;
