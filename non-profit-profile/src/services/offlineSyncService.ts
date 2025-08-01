import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

interface SyncQueueItem {
  id: string;
  timestamp: Date;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: unknown;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

interface OfflineCache {
  [key: string]: {
    data: unknown;
    timestamp: Date;
    version: number;
  };
}

class OfflineSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private offlineCache: OfflineCache = {};
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private storageKey: string = 'offline_sync_queue';
  private cacheKey: string = 'offline_cache';
  private conflictResolutionStrategy: 'last-write-wins' | 'merge' | 'manual' = 'last-write-wins';

  constructor() {
    this.initializeOfflineDetection();
    this.loadQueueFromStorage();
    this.loadCacheFromStorage();
    this.startPeriodicSync();
  }

  private initializeOfflineDetection(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.debug('Connection restored - initiating sync');
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.debug('Connection lost - entering offline mode');
    });

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  private async checkConnectivity(): Promise<void> {
    try {
      // Try to ping a reliable endpoint
      const response = await fetch('/.netlify/functions/profile-crud?ping=true', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const wasOffline = !this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOffline && this.isOnline) {
        logger.debug('Connectivity restored');
        this.syncPendingChanges();
      }
    } catch (error) {
      this.isOnline = false;
    }
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const items = JSON.parse(stored);
        this.syncQueue = items.map((item: unknown) => ({
          ...(item as any),
          timestamp: new Date((item as any).timestamp)
        }));
      }
    } catch (error) {
      logger.error('Failed to load sync queue:', error);
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('Failed to save sync queue:', error);
    }
  }

  private async loadCacheFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const cache = JSON.parse(stored);
        Object.entries(cache).forEach(([key, value]: [string, any]) => {
          this.offlineCache[key] = {
            ...value,
            timestamp: new Date(value.timestamp)
          };
        });
      }
    } catch (error) {
      logger.error('Failed to load offline cache:', error);
    }
  }

  private async saveCacheToStorage(): Promise<void> {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(this.offlineCache));
    } catch (error) {
      logger.error('Failed to save offline cache:', error);
    }
  }

  private startPeriodicSync(): void {
    // Try to sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, 300000);

    // Initial sync if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  async queueOperation(
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: unknown
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      resource,
      data,
      retryCount: 0,
      status: 'pending'
    };

    this.syncQueue.push(item);
    await this.saveQueueToStorage();

    // Update cache for offline access
    if (type !== 'delete') {
      this.offlineCache[resource] = {
        data,
        timestamp: new Date(),
        version: (this.offlineCache[resource]?.version || 0) + 1
      };
      await this.saveCacheToStorage();
    } else {
      delete this.offlineCache[resource];
      await this.saveCacheToStorage();
    }

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingChanges();
    }

    return item.id;
  }

  async getCachedData(resource: string): Promise<unknown> {
    // First check offline cache
    if (this.offlineCache[resource]) {
      return this.offlineCache[resource].data;
    }

    // If online, try to fetch from server
    if (this.isOnline) {
      try {
        const data = await this.fetchFromServer(resource);
        
        // Update cache
        this.offlineCache[resource] = {
          data,
          timestamp: new Date(),
          version: 1
        };
        await this.saveCacheToStorage();
        
        return data;
      } catch (error) {
        logger.error('Failed to fetch from server:', error);
        return null;
      }
    }

    return null;
  }

  private async fetchFromServer(resource: string): Promise<unknown> {
    // This would be replaced with actual API calls
    return await netlifySettingsService.get(resource);
  }

  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    logger.debug(`Starting sync - ${this.syncQueue.filter(i => i.status === 'pending').length} pending items`);

    try {
      const pendingItems = this.syncQueue.filter(item => item.status === 'pending');
      
      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      // Clean up completed items
      this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');
      await this.saveQueueToStorage();

      // Check for updates from server
      await this.pullServerUpdates();

    } catch (error) {
      logger.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      item.status = 'syncing';
      
      switch (item.type) {
        case 'create':
          await this.syncCreate(item);
          break;
        case 'update':
          await this.syncUpdate(item);
          break;
        case 'delete':
          await this.syncDelete(item);
          break;
      }
      
      item.status = 'completed';
      logger.debug(`Synced ${item.type} operation for ${item.resource}`);
      
    } catch (error: unknown) {
      item.retryCount++;
      item.status = 'failed';
      item.error = (error as any).message;
      
      if (item.retryCount >= 3) {
        logger.error(`Failed to sync after 3 retries:`, item);
        // Could notify user about sync failure
      }
    }
  }

  private async syncCreate(item: SyncQueueItem): Promise<void> {
    // Implement actual create API call
    await netlifySettingsService.set(item.resource, item.data);
  }

  private async syncUpdate(item: SyncQueueItem): Promise<void> {
    // Check for conflicts
    const serverData = await this.fetchFromServer(item.resource);
    const conflict = await this.detectConflict(item, serverData);
    
    if (conflict) {
      const resolved = await this.resolveConflict(item.data, serverData);
      await netlifySettingsService.set(item.resource, resolved);
    } else {
      await netlifySettingsService.set(item.resource, item.data);
    }
  }

  private async syncDelete(item: SyncQueueItem): Promise<void> {
    await netlifySettingsService.remove(item.resource);
  }

  private async detectConflict(item: SyncQueueItem, serverData: unknown): Promise<boolean> {
    if (!serverData) return false;
    
    const cachedItem = this.offlineCache[item.resource];
    if (!cachedItem) return false;
    
    // Simple conflict detection based on timestamps
    const serverTimestamp = new Date((serverData as any).lastModified || 0);
    const localTimestamp = cachedItem.timestamp;
    
    return serverTimestamp > localTimestamp;
  }

  private async resolveConflict(localData: unknown, serverData: unknown): Promise<unknown> {
    switch (this.conflictResolutionStrategy) {
      case 'last-write-wins':
        return localData; // Local changes win
        
      case 'merge':
        // Simple merge - combine both objects
        return { ...(serverData as any), ...(localData as any) };
        
      case 'manual':
        // In production, this would show a UI for manual resolution
        logger.warn('Conflict detected - manual resolution required');
        return localData;
        
      default:
        return localData;
    }
  }

  private async pullServerUpdates(): Promise<void> {
    // Get list of resources to check
    const resources = Object.keys(this.offlineCache);
    
    for (const resource of resources) {
      try {
        const serverData = await this.fetchFromServer(resource);
        const cachedData = this.offlineCache[resource];
        
        if (serverData && cachedData) {
          const serverTimestamp = new Date((serverData as any).lastModified || 0);
          if (serverTimestamp > cachedData.timestamp) {
            // Server has newer data
            this.offlineCache[resource] = {
              data: serverData,
              timestamp: serverTimestamp,
              version: cachedData.version + 1
            };
          }
        }
      } catch (error) {
        logger.error(`Failed to pull updates for ${resource}:`, error);
      }
    }
    
    await this.saveCacheToStorage();
  }

  getQueueStatus(): {
    pending: number;
    syncing: number;
    failed: number;
    total: number;
  } {
    const pending = this.syncQueue.filter(i => i.status === 'pending').length;
    const syncing = this.syncQueue.filter(i => i.status === 'syncing').length;
    const failed = this.syncQueue.filter(i => i.status === 'failed').length;
    
    return {
      pending,
      syncing,
      failed,
      total: this.syncQueue.length
    };
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  async clearQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveQueueToStorage();
  }

  async clearCache(): Promise<void> {
    this.offlineCache = {};
    await this.saveCacheToStorage();
  }

  setConflictResolutionStrategy(strategy: 'last-write-wins' | 'merge' | 'manual'): void {
    this.conflictResolutionStrategy = strategy;
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
  }
}

export const offlineSyncService = new OfflineSyncService();