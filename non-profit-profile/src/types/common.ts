// Common type definitions to replace 'any' usage across the codebase

// Event types
export type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type MouseEvent = React.MouseEvent<HTMLButtonElement | HTMLDivElement>;
export type KeyboardEvent = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;
export type FocusEvent = React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>;

// Generic object types
export type UnknownObject = Record<string, unknown>;
export type StringObject = Record<string, string>;
export type NumberObject = Record<string, number>;
export type BooleanObject = Record<string, boolean>;

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
  type?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type ValidatorFunction = (value: unknown, fieldName?: string) => ValidationResult;

// API and response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: UnknownObject;
}

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type CallbackFunction<T = void> = (arg?: T) => void;
export type ErrorCallback = (error: Error) => void;

// State update types
export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;
export type StateUpdater<T> = (prevState: T) => T;

// Document and file types
export interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string | ArrayBuffer;
}

export interface DocumentData {
  id: string;
  name: string;
  url?: string;
  file?: File;
  type?: string;
  uploadedAt?: string;
}

// User and auth types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt?: string;
}

// Error types
export interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  timestamp?: string;
  context?: UnknownObject;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is UnknownObject => 
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);
export const isFunction = (value: unknown): value is Function => typeof value === 'function';
export const isError = (value: unknown): value is Error => value instanceof Error;