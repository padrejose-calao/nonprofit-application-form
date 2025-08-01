/**
 * Central error type definitions for the application
 */

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: ValidationError[];
}

export interface NetworkError extends AppError {
  url?: string;
  method?: string;
  timeout?: boolean;
}

export interface FileError extends AppError {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (isApiError(error)) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function getErrorDetails(error: unknown): Record<string, unknown> {
  if (isAppError(error) && error.details) {
    return error.details;
  }
  if (isApiError(error) && error.errors) {
    return { validationErrors: error.errors };
  }
  return {};
}