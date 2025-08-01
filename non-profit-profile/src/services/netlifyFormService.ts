/**
 * NetlifyFormService - Handles form data management via Netlify
 * Replaces localStorage for form data persistence
 */

import { netlifySettingsService } from './netlifySettingsService';
import { googleDriveBackupService } from './googleDriveBackupService';
import { logger } from '../utils/logger';

class NetlifyFormService {
  private static instance: NetlifyFormService;
  private readonly FORM_DATA_PREFIX = 'form-data-';

  private constructor() {
    // Initialize service
  }

  static getInstance(): NetlifyFormService {
    if (!NetlifyFormService.instance) {
      NetlifyFormService.instance = new NetlifyFormService();
    }
    return NetlifyFormService.instance;
  }



  // Get form data key
  private getFormDataKey(formType: string): string {
    return `${this.FORM_DATA_PREFIX}${formType}`;
  }

  // Get form data
  async getFormData(formType: string): Promise<unknown> {
    try {
      const key = this.getFormDataKey(formType);
      const data = await netlifySettingsService.get(key);
      return data || {};
    } catch (error) {
      logger.error('Failed to get form data:', error);
      return {};
    }
  }

  // Save form data
  async saveFormData(formType: string, data: unknown): Promise<boolean> {
    try {
      const key = this.getFormDataKey(formType);
      const timestampedData = {
        ...(data as any),
        lastSaved: new Date().toISOString()
      };
      
      const success = await netlifySettingsService.set(key, timestampedData, 'organization');
      
      if (success) {
        // Queue for Google Drive backup
        googleDriveBackupService.queueBackup(`form-${formType}`, timestampedData);
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to save form data:', error);
      return false;
    }
  }

  // Auto-save form data (with debouncing)
  async autoSaveFormData(formType: string, data: unknown): Promise<boolean> {
    try {
      const key = `autosave-${this.getFormDataKey(formType)}`;
      const autoSaveData = {
        ...(data as any),
        autoSavedAt: new Date().toISOString()
      };
      
      return await netlifySettingsService.set(key, autoSaveData, 'user');
    } catch (error) {
      logger.error('Failed to auto-save form data:', error);
      return false;
    }
  }

  // Get auto-saved form data
  async getAutoSavedFormData(formType: string): Promise<unknown> {
    try {
      const key = `autosave-${this.getFormDataKey(formType)}`;
      return await netlifySettingsService.get(key);
    } catch (error) {
      logger.error('Failed to get auto-saved form data:', error);
      return null;
    }
  }

  // Clear auto-saved form data
  async clearAutoSavedFormData(formType: string): Promise<boolean> {
    try {
      const key = `autosave-${this.getFormDataKey(formType)}`;
      return await netlifySettingsService.remove(key);
    } catch (error) {
      logger.error('Failed to clear auto-saved form data:', error);
      return false;
    }
  }

  // Get all form data
  async getAllFormData(): Promise<Record<string, unknown>> {
    try {
      const allSettings = await netlifySettingsService.getAll();
      const formData: Record<string, unknown> = {};
      
      // Filter form data from all settings
      Object.entries(allSettings).forEach(([key, value]) => {
        if (key.startsWith(this.FORM_DATA_PREFIX)) {
          const formType = key.replace(this.FORM_DATA_PREFIX, '');
          formData[formType] = value;
        }
      });
      
      return formData;
    } catch (error) {
      logger.error('Failed to get all form data:', error);
      return {};
    }
  }

  // Clear form data
  async clearFormData(formType: string): Promise<boolean> {
    try {
      const key = this.getFormDataKey(formType);
      const success = await netlifySettingsService.remove(key);
      
      if (success) {
        // Also clear auto-saved data
        await this.clearAutoSavedFormData(formType);
        
        // Update Google Drive backup
        const allFormData = await this.getAllFormData();
        googleDriveBackupService.queueBackup('forms', allFormData);
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to clear form data:', error);
      return false;
    }
  }

  // Save form checkpoint
  async saveFormCheckpoint(formType: string, checkpointName: string): Promise<boolean> {
    try {
      const formData = await this.getFormData(formType);
      const checkpointKey = `checkpoint-${formType}-${checkpointName}`;
      
      const checkpointData = {
        formData,
        checkpointName,
        createdAt: new Date().toISOString()
      };
      
      const success = await netlifySettingsService.set(checkpointKey, checkpointData, 'organization');
      
      if (success) {
        // Backup checkpoint to Google Drive
        googleDriveBackupService.queueBackup(`checkpoint-${formType}`, checkpointData);
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to save form checkpoint:', error);
      return false;
    }
  }

  // Restore form from checkpoint
  async restoreFormCheckpoint(formType: string, checkpointName: string): Promise<boolean> {
    try {
      const checkpointKey = `checkpoint-${formType}-${checkpointName}`;
      const checkpointData = await netlifySettingsService.get(checkpointKey);
      
      if ((checkpointData as any)?.formData) {
        return await this.saveFormData(formType, (checkpointData as any).formData);
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to restore form checkpoint:', error);
      return false;
    }
  }
}

// Export singleton instance
export const netlifyFormService = NetlifyFormService.getInstance();