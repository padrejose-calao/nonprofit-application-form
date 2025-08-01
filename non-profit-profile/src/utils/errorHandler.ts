/**
 * Centralized error handling and validation system
 */

import { getErrorMessage } from '../types/ErrorTypes';
import { logger } from './logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ErrorHandler {
  static validateContactCard(contactCard: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!contactCard) {
      errors.push('Contact card is required');
      return { isValid: false, errors, warnings };
    }

    // Required fields
    const name = contactCard.name as string | undefined;
    if (!name?.trim()) {
      errors.push('Name is required');
    }
    const id = contactCard.id as string | undefined;
    if (!id?.trim()) {
      errors.push('ID is required');
    }
    const type = contactCard.type as string | undefined;
    if (!type || !['person', 'organization'].includes(type)) {
      errors.push('Valid type (person/organization) is required');
    }

    // Email validation
    const email = contactCard.email as string | undefined;
    if (email && !this.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    const phone = contactCard.phone as string | undefined;
    if (phone && !this.isValidPhone(phone)) {
      warnings.push('Phone number format may be invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-().]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  static cleanOrphanData(data: Record<string, unknown>): Record<string, unknown> {
    if (!data || typeof data !== 'object') return data;

    const cleaned = { ...data };
    
    // Remove null, undefined, and empty string values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
        delete cleaned[key];
      } else if (Array.isArray(cleaned[key])) {
        cleaned[key] = (cleaned[key] as any[]).filter((item: unknown) => item !== null && item !== undefined && item !== '');
      } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
        const cleanedObject = this.cleanOrphanData(cleaned[key] as Record<string, unknown>);
        cleaned[key] = cleanedObject;
        // Remove empty objects
        if (Object.keys(cleanedObject).length === 0) {
          delete cleaned[key];
        }
      }
    });

    return cleaned;
  }

  static async performSystemCheck(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check Netlify storage availability
    try {
      // We'll check this asynchronously if needed
      // For now, assume Netlify storage is available
    } catch {
      errors.push('Storage service is not available');
    }

    // Check required environment variables
    if (typeof window !== 'undefined') {
      if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        warnings.push('Google Contacts integration not configured');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Backward compatibility exports
export function handleSaveError(error: unknown, context?: Record<string, unknown>): string {
  logger.error('Save error:', error, context);
  return getErrorMessage(error) || 'Failed to save data';
}

export function handleImportError(error: unknown, context?: Record<string, unknown>): string {
  logger.error('Import error:', error, context);
  return getErrorMessage(error) || 'Failed to import data';
}

export function handleFileError(error: unknown, context?: Record<string, unknown>): string {
  logger.error('File error:', error, context);
  return getErrorMessage(error) || 'File operation failed';
}