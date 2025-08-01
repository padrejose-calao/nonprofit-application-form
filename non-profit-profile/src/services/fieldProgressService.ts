/**
 * Field Progress Service
 * Manages field-level completion tracking and required field settings
 */

import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

export interface FieldCompletionState {
  [fieldId: string]: boolean;
}

export interface RequiredFieldSettings {
  [sectionId: string]: {
    [fieldId: string]: boolean;
  };
}

class FieldProgressService {
  private fieldCompletions: FieldCompletionState = {};
  private requiredFields: RequiredFieldSettings = {};
  private storageKey = 'fieldCompletions';
  private requiredFieldsKey = 'requiredFields';

  constructor() {
    this.loadFieldCompletions();
    this.loadRequiredFields();
  }

  /**
   * Load field completions from storage
   */
  private async loadFieldCompletions() {
    try {
      const saved = await netlifySettingsService.get(this.storageKey);
      if (saved) {
        this.fieldCompletions = saved as FieldCompletionState;
      }
    } catch (error) {
      logger.error('Failed to load field completions:', error);
    }
  }

  /**
   * Load required field settings from storage
   */
  private async loadRequiredFields() {
    try {
      const saved = await netlifySettingsService.get(this.requiredFieldsKey);
      if (saved) {
        this.requiredFields = saved as RequiredFieldSettings;
      }
    } catch (error) {
      logger.error('Failed to load required fields:', error);
    }
  }

  /**
   * Mark a field as complete/incomplete
   */
  async setFieldCompletion(fieldId: string, completed: boolean) {
    this.fieldCompletions[fieldId] = completed;
    
    try {
      await netlifySettingsService.set(
        this.storageKey,
        this.fieldCompletions,
        'organization'
      );
    } catch (error) {
      logger.error('Failed to save field completion:', error);
    }
  }

  /**
   * Get field completion status
   */
  isFieldCompleted(fieldId: string): boolean {
    return this.fieldCompletions[fieldId] || false;
  }

  /**
   * Get all field completions
   */
  getAllCompletions(): FieldCompletionState {
    return { ...this.fieldCompletions };
  }

  /**
   * Calculate section progress based on field completions
   */
  calculateSectionProgress(sectionId: string, fieldIds: string[]): number {
    if (!fieldIds || fieldIds.length === 0) return 0;
    
    const completedCount = fieldIds.filter(fieldId => 
      this.isFieldCompleted(`${sectionId}.${fieldId}`)
    ).length;
    
    return Math.round((completedCount / fieldIds.length) * 100);
  }

  /**
   * Set required field (superuser only)
   */
  async setRequiredField(sectionId: string, fieldId: string, required: boolean) {
    if (!this.requiredFields[sectionId]) {
      this.requiredFields[sectionId] = {};
    }
    
    this.requiredFields[sectionId][fieldId] = required;
    
    try {
      await netlifySettingsService.set(
        this.requiredFieldsKey,
        this.requiredFields,
        'organization'
      );
    } catch (error) {
      logger.error('Failed to save required field setting:', error);
    }
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(sectionId: string, fieldId: string): boolean {
    return this.requiredFields[sectionId]?.[fieldId] || false;
  }

  /**
   * Get all required fields for a section
   */
  getRequiredFields(sectionId: string): string[] {
    const sectionRequirements = this.requiredFields[sectionId];
    if (!sectionRequirements) return [];
    
    return Object.entries(sectionRequirements)
      .filter(([_, required]) => required)
      .map(([fieldId]) => fieldId);
  }

  /**
   * Validate if all required fields are completed
   */
  validateRequiredFields(sectionId: string): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFieldIds = this.getRequiredFields(sectionId);
    const missingFields = requiredFieldIds.filter(fieldId => 
      !this.isFieldCompleted(`${sectionId}.${fieldId}`)
    );
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Reset all field completions
   */
  async resetAllCompletions() {
    this.fieldCompletions = {};
    try {
      await netlifySettingsService.set(this.storageKey, {}, 'organization');
    } catch (error) {
      logger.error('Failed to reset field completions:', error);
    }
  }

  /**
   * Export field completion data
   */
  exportCompletionData() {
    return {
      completions: this.fieldCompletions,
      requiredFields: this.requiredFields,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Import field completion data
   */
  async importCompletionData(data: {
    completions: FieldCompletionState;
    requiredFields?: RequiredFieldSettings;
  }) {
    if (data.completions) {
      this.fieldCompletions = data.completions;
      await netlifySettingsService.set(
        this.storageKey,
        this.fieldCompletions,
        'organization'
      );
    }
    
    if (data.requiredFields) {
      this.requiredFields = data.requiredFields;
      await netlifySettingsService.set(
        this.requiredFieldsKey,
        this.requiredFields,
        'organization'
      );
    }
  }
}

// Export singleton instance
export const fieldProgressService = new FieldProgressService();