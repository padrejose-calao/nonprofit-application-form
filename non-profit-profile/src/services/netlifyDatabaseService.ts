/**
 * Netlify Database Service
 * Primary database implementation using Netlify Blob Storage
 * All data is stored natively in Netlify with automatic Google Drive backup
 */

import { toast } from 'react-toastify';
import { logger } from '../utils/logger';

export interface DatabaseRecord {
  id: string;
  type: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
  metadata?: Record<string, unknown>;
}

export interface QueryOptions {
  type?: string;
  filters?: Record<string, unknown>;
  sort?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

class NetlifyDatabaseService {
  private static instance: NetlifyDatabaseService;
  private cache: Map<string, DatabaseRecord> = new Map();
  private initialized = false;

  private constructor() {}

  static getInstance(): NetlifyDatabaseService {
    if (!NetlifyDatabaseService.instance) {
      NetlifyDatabaseService.instance = new NetlifyDatabaseService();
    }
    return NetlifyDatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize connection to Netlify Blob Storage
      await this.testConnection();
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize Netlify Database:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/database-health');
      if (!response.ok) {
        throw new Error('Database health check failed');
      }
    } catch (error) {
      logger.error('Database connection test failed:', error);
      throw error;
    }
  }

  // Create a new record
  async create(type: string, data: unknown, userId?: string): Promise<DatabaseRecord> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: DatabaseRecord = {
      id,
      type,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
      version: 1
    };

    try {
      const response = await fetch('/.netlify/functions/database-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ action: 'create', record })
      });

      if (!response.ok) {
        throw new Error('Failed to create record');
      }

      const result = await response.json();
      this.cache.set(id, result);
      return result;
    } catch (error) {
      logger.error('Failed to create record:', error);
      throw error;
    }
  }

  // Read a single record
  async read(id: string): Promise<DatabaseRecord | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache?.get(id)!;
    }

    try {
      const response = await fetch(`/.netlify/functions/database-crud?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to read record');
      }

      const record = await response.json();
      this.cache.set(id, record);
      return record;
    } catch (error) {
      logger.error('Failed to read record:', error);
      throw error;
    }
  }

  // Update a record
  async update(id: string, updates: Partial<DatabaseRecord>, userId: string = 'system'): Promise<DatabaseRecord> {
    try {
      const response = await fetch('/.netlify/functions/database-crud', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          action: 'update',
          id,
          updates: {
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const result = await response.json();
      this.cache.set(id, result);
      return result;
    } catch (error) {
      logger.error('Failed to update record:', error);
      throw error;
    }
  }

  // Delete a record
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch('/.netlify/functions/database-crud', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ action: 'delete', id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      this.cache.delete(id);
      return true;
    } catch (error) {
      logger.error('Failed to delete record:', error);
      throw error;
    }
  }

  // Query records
  async query(options: QueryOptions = {}): Promise<DatabaseRecord[]> {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.filters) params.append('filters', JSON.stringify(options.filters));
      if (options.sort) params.append('sort', JSON.stringify(options.sort));
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const response = await fetch(`/.netlify/functions/database-crud?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to query records');
      }

      const records = await response.json();
      
      // Update cache
      records.forEach((record: DatabaseRecord) => {
        this.cache.set(record.id, record);
      });

      return records;
    } catch (error) {
      logger.error('Failed to query records:', error);
      throw error;
    }
  }

  // Batch operations
  async batchCreate(records: Omit<DatabaseRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DatabaseRecord[]> {
    try {
      const response = await fetch('/.netlify/functions/database-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ action: 'batchCreate', records })
      });

      if (!response.ok) {
        throw new Error('Failed to batch create records');
      }

      const results = await response.json();
      results.forEach((record: DatabaseRecord) => {
        this.cache.set(record.id, record);
      });

      return results;
    } catch (error) {
      logger.error('Failed to batch create records:', error);
      throw error;
    }
  }

  // Transaction support
  async transaction(operations: Array<{
    action: 'create' | 'update' | 'delete';
    data: unknown;
  }>): Promise<any[]> {
    try {
      const response = await fetch('/.netlify/functions/database-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ action: 'transaction', operations })
      });

      if (!response.ok) {
        throw new Error('Transaction failed');
      }

      return await response.json();
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  // Backup and restore
  async backup(): Promise<string> {
    try {
      const response = await fetch('/.netlify/functions/database-backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Backup failed');
      }

      const { backupId } = await response.json();
      toast.success('Database backup created successfully');
      return backupId;
    } catch (error) {
      logger.error('Backup failed:', error);
      toast.error('Failed to create database backup');
      throw error;
    }
  }

  async restore(backupId: string): Promise<boolean> {
    try {
      const response = await fetch('/.netlify/functions/database-backup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ action: 'restore', backupId })
      });

      if (!response.ok) {
        throw new Error('Restore failed');
      }

      this.cache.clear(); // Clear cache after restore
      toast.success('Database restored successfully');
      return true;
    } catch (error) {
      logger.error('Restore failed:', error);
      toast.error('Failed to restore database');
      throw error;
    }
  }

  // Get auth token from session storage
  private async getAuthToken(): Promise<string> {
    const token = sessionStorage.getItem('authToken');
    return token || '';
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const netlifyDatabase = NetlifyDatabaseService.getInstance();