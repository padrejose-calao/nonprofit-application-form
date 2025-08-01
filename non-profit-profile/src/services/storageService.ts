/**
 * Universal Storage Service
 * 
 * This service provides a centralized way to handle storage operations across the application.
 * It now uses Netlify settings service with Google Drive backup instead of localStorage.
 */

import { netlifySettingsService } from './netlifySettingsService';
import { googleDriveBackupService } from './googleDriveBackupService';
import { logger } from '../utils/logger';

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
  scope?: 'user' | 'organization';
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class StorageService {
  private prefix = 'nonprofit_';
  
  /**
   * Get an item from storage
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const item = await netlifySettingsService.get(fullKey);
      
      if (!item) return null;
      
      // If item is already unwrapped (from netlifySettingsService)
      const itemObj = item as any;
      if (itemObj.data !== undefined && itemObj.timestamp !== undefined) {
        const parsed = item as StorageItem<T>;
        
        // Check if item has expired
        if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
          await this.remove(key);
          return null;
        }
        
        return parsed.data;
      }
      
      // Return raw data if not wrapped
      return item as T;
    } catch (error) {
      logger.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  }
  
  /**
   * Set an item in storage
   */
  async set<T = any>(key: string, value: T, options?: StorageOptions): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: options?.ttl
      };
      
      const success = await netlifySettingsService.set(fullKey, item, options?.scope || 'user');
      
      // Queue for Google Drive backup
      if (success) {
        googleDriveBackupService.queueBackup('storage', { [fullKey]: item });
      }
      
      return success;
    } catch (error) {
      logger.error(`Error setting item ${key} in storage:`, error);
      return false;
    }
  }
  
  /**
   * Remove an item from storage
   */
  async remove(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const success = await netlifySettingsService.remove(fullKey);
      
      // Update Google Drive backup
      if (success) {
        const allStorage = await this.getAllItems();
        googleDriveBackupService.queueBackup('storage', allStorage);
      }
      
      return success;
    } catch (error) {
      logger.error(`Error removing item ${key} from storage:`, error);
      return false;
    }
  }
  
  /**
   * Clear all items with the nonprofit prefix
   */
  async clear(): Promise<boolean> {
    try {
      const keys = await this.getAllKeys();
      const results = await Promise.all(
        keys.map(key => netlifySettingsService.remove(key))
      );
      
      // Clear Google Drive backup
      googleDriveBackupService.queueBackup('storage', {});
      
      return results.every(r => r === true);
    } catch (error) {
      logger.error('Error clearing storage:', error);
      return false;
    }
  }
  
  /**
   * Get all keys with the nonprofit prefix
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allSettings = await netlifySettingsService.getAll();
      return Object.keys(allSettings).filter(key => key.startsWith(this.prefix));
    } catch (error) {
      logger.error('Error getting all keys:', error);
      return [];
    }
  }
  
  /**
   * Get all items
   */
  private async getAllItems(): Promise<Record<string, unknown>> {
    try {
      const allSettings = await netlifySettingsService.getAll();
      const items: Record<string, unknown> = {};
      
      Object.entries(allSettings).forEach(([key, value]) => {
        if (key.startsWith(this.prefix)) {
          items[key] = value;
        }
      });
      
      return items;
    } catch (error) {
      logger.error('Error getting all items:', error);
      return {};
    }
  }
  
  /**
   * Check if a key exists in storage
   */
  async has(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const value = await netlifySettingsService.get(fullKey);
    return value !== null;
  }
  
  /**
   * Get the size of stored data in bytes
   */
  async getSize(): Promise<number> {
    try {
      const items = await this.getAllItems();
      const jsonString = JSON.stringify(items);
      return new Blob([jsonString]).size;
    } catch (error) {
      logger.error('Error calculating storage size:', error);
      return 0;
    }
  }
  
  /**
   * Get storage quota info
   */
  async getQuota(): Promise<{ usage: number; quota: number }> {
    // Since we're using Netlify storage, we don't have browser quota limits
    const usage = await this.getSize();
    return {
      usage,
      quota: 100 * 1024 * 1024 // 100MB soft limit for Netlify blob storage
    };
  }
  
  /**
   * Migrate old localStorage keys to new format
   */
  async migrate(oldKey: string, newKey: string): Promise<boolean> {
    try {
      // First check if data exists in Netlify storage
      const existingValue = await netlifySettingsService.get(oldKey);
      if (existingValue) {
        await this.set(newKey, existingValue);
        await netlifySettingsService.remove(oldKey);
        return true;
      }
      
      // Fallback: check localStorage for legacy data
      const oldValue = typeof window !== 'undefined' ? localStorage.getItem(oldKey) : null;
      if (oldValue) {
        // Try to parse as JSON, otherwise store as string
        let data: unknown;
        try {
          data = JSON.parse(oldValue);
        } catch {
          data = oldValue;
        }
        
        await this.set(newKey, data);
        localStorage.removeItem(oldKey);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error migrating ${oldKey} to ${newKey}:`, error);
      return false;
    }
  }
  
  /**
   * Batch operations for better performance
   */
  async batchSet(items: Record<string, unknown>, options?: StorageOptions): Promise<boolean> {
    try {
      const results = await Promise.all(
        Object.entries(items).map(([key, value]) => 
          this.set(key, value, options)
        )
      );
      return results.every(r => r === true);
    } catch (error) {
      logger.error('Error in batch set:', error);
      return false;
    }
  }
  
  /**
   * Batch get operations
   */
  async batchGet<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.get<T>(key);
      })
    );
    
    return result;
  }
  
  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__storage_test__';
      const success = await netlifySettingsService.set(testKey, 'test');
      if (success) {
        await netlifySettingsService.remove(testKey);
      }
      return success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export migration helpers for common keys
export const storageMigrations = {
  // Auth related
  migrateAuth: async () => {
    await storageService.migrate('authToken', 'auth_token');
    await storageService.migrate('user', 'auth_user');
  },
  
  // Documents
  migrateDocuments: async () => {
    await storageService.migrate('nonprofit-documents', 'documents');
    await storageService.migrate('enhanced-nonprofit-documents', 'enhanced_documents');
    await storageService.migrate('nonprofit_documents', 'documents_backup');
  },
  
  // Contacts
  migrateContacts: async () => {
    // Handle dynamic contact keys from localStorage
    if (typeof window !== 'undefined' && localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nonprofit-contacts-')) {
          const orgId = key.replace('nonprofit-contacts-', '');
          await storageService.migrate(key, `contacts_${orgId}`);
        }
      }
    }
  },
  
  // Forms
  migrateForms: async () => {
    // Handle dynamic form keys from localStorage
    if (typeof window !== 'undefined' && localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('_form_') || key.startsWith('autosave_'))) {
          const newKey = key.replace('autosave_', 'form_autosave_');
          await storageService.migrate(key, newKey);
        }
      }
    }
  },
  
  // Settings
  migrateSettings: async () => {
    await storageService.migrate('accessibility-settings', 'settings_accessibility');
    await storageService.migrate('admin-backup-schedule', 'settings_backup_schedule');
    await storageService.migrate('admin-settings', 'settings_admin');
  },
  
  // Errors
  migrateErrors: async () => {
    await storageService.migrate('app_errors', 'errors_log');
  },
  
  // Story events
  migrateStoryEvents: async () => {
    await storageService.migrate('storyEvents', 'story_events');
  },
  
  // Run all migrations
  runAll: async () => {
    await storageMigrations.migrateAuth();
    await storageMigrations.migrateDocuments();
    await storageMigrations.migrateContacts();
    await storageMigrations.migrateForms();
    await storageMigrations.migrateSettings();
    await storageMigrations.migrateErrors();
    await storageMigrations.migrateStoryEvents();
  }
};

// Auto-run migrations on first load
if (typeof window !== 'undefined') {
  storageService.isAvailable().then(available => {
    if (available) {
      // Check if migrations have been run
      storageService.has('migrations_completed').then(hasRun => {
        if (!hasRun) {
          storageMigrations.runAll().then(() => {
            storageService.set('migrations_completed', true);
          });
        }
      });
    }
  });
}