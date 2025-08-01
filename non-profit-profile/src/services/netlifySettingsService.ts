/**
 * NetlifySettingsService - Handles all app settings and user preferences via Netlify
 * Replaces localStorage for settings persistence
 */

import { googleDriveBackupService } from './googleDriveBackupService';
import { logger } from '../utils/logger';

// Import User type from api.ts instead of defining it here
import { User } from './api';

interface SettingValue {
  value: unknown;
  updatedAt: string;
  updatedBy: string;
}

class NetlifySettingsService {
  private static instance: NetlifySettingsService;
  private cache: Map<string, unknown> = new Map();
  private organizationId: string = 'default-org';
  private userId: string = 'default-user';

  private constructor() {}

  static getInstance(): NetlifySettingsService {
    if (!NetlifySettingsService.instance) {
      NetlifySettingsService.instance = new NetlifySettingsService();
    }
    return NetlifySettingsService.instance;
  }

  setContext(organizationId: string, userId: string) {
    this.organizationId = organizationId;
    this.userId = userId;
    this.cache.clear(); // Clear cache when context changes
  }

  async get(key: string): Promise<unknown> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const response = await fetch(
        `/.netlify/functions/app-settings-crud?organizationId=${this.organizationId}&userId=${this.userId}&key=${key}`
      );

      if (response.ok) {
        const data = await response.json();
        const value = data?.value !== undefined ? data.value : data;
        this.cache.set(key, value);
        return value;
      }
      return null;
    } catch (error) {
      logger.error('Failed to get setting:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, scope: 'user' | 'organization' = 'user'): Promise<boolean> {
    try {
      const response = await fetch(
        `/.netlify/functions/app-settings-crud?organizationId=${this.organizationId}&userId=${this.userId}&key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value, scope }),
        }
      );

      if (response.ok) {
        this.cache.set(key, value);
        
        // Queue for Google Drive backup
        googleDriveBackupService.queueBackup('settings', { [key]: value });
        
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to set setting:', error);
      return false;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/.netlify/functions/app-settings-crud?organizationId=${this.organizationId}&userId=${this.userId}&key=${key}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        this.cache.delete(key);
        
        // Queue removal for Google Drive backup
        const allSettings = await this.getAll();
        delete allSettings[key];
        googleDriveBackupService.queueBackup('settings', allSettings);
        
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to remove setting:', error);
      return false;
    }
  }

  async getAll(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(
        `/.netlify/functions/app-settings-crud?organizationId=${this.organizationId}&userId=${this.userId}`
      );

      if (response.ok) {
        const data = await response.json();
        // Update cache with all settings
        Object.entries(data as any).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
        return data;
      }
      return {};
    } catch (error) {
      logger.error('Failed to get all settings:', error);
      return {};
    }
  }

  // Convenience methods for common settings
  async getDarkMode(): Promise<boolean> {
    const value = await this.get('calao-dark-mode');
    return value === true || value === 'true';
  }

  async setDarkMode(enabled: boolean): Promise<boolean> {
    return this.set('calao-dark-mode', enabled);
  }

  async getAuthToken(): Promise<string | null> {
    const token = await this.get('authToken');
    return token as string | null;
  }

  async setAuthToken(token: string | null): Promise<boolean> {
    if (token === null) {
      return this.remove('authToken');
    }
    return this.set('authToken', token);
  }

  async getUserSession(): Promise<unknown> {
    return this.get('calao_user_session');
  }

  async setUserSession(session: User | null): Promise<boolean> {
    if (!session) {
      return this.remove('calao_user_session');
    }
    return this.set('calao_user_session', session);
  }

  async getAutoSaveData(key: string): Promise<unknown> {
    return this.get(`autosave_${key}`);
  }

  async setAutoSaveData(key: string, data: unknown): Promise<boolean> {
    const success = await this.set(`autosave_${key}`, data);
    if (success) {
      await this.set(`autosave_${key}_timestamp`, new Date().toISOString());
    }
    return success;
  }

  async removeAutoSaveData(key: string): Promise<boolean> {
    const success1 = await this.remove(`autosave_${key}`);
    const success2 = await this.remove(`autosave_${key}_timestamp`);
    return success1 && success2;
  }

  async getAutoSaveTimestamp(key: string): Promise<string | null> {
    const timestamp = await this.get(`autosave_${key}_timestamp`);
    return timestamp as string | null;
  }

  // Backward compatibility method
  getItem(key: string): string | null {
    logger.warn('Deprecated: Use async get() method instead of getItem()');
    const cached = this.cache.get(key);
    return cached ? JSON.stringify(cached) : null;
  }

  // Backward compatibility method
  setItem(key: string, value: string): void {
    logger.warn('Deprecated: Use async set() method instead of setItem()');
    try {
      const parsed = JSON.parse(value);
      this.set(key, parsed).catch(console.error);
    } catch {
      this.set(key, value).catch(console.error);
    }
  }

  // Backward compatibility method
  removeItem(key: string): void {
    logger.warn('Deprecated: Use async remove() method instead of removeItem()');
    this.remove(key).catch(console.error);
  }
}

export const netlifySettingsService = NetlifySettingsService.getInstance();