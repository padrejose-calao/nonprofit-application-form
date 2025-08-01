/**
 * EUID Lifecycle Management Service
 * Manages the complete lifecycle of EUIDs with automatic conflict resolution,
 * ID preservation, and retention rules
 */

import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { EntityType } from './euidTypes';
import { logger } from '../utils/logger';

export interface RetentionRule {
  entityType: EntityType;
  retentionPeriod: number; // in days
  action: 'archive' | 'purge' | 'permanent';
  conditions?: Record<string, unknown>;
}

export interface DeletedEUID {
  euid: string;
  entityType: EntityType;
  deletedAt: string;
  deletedBy: string;
  reason: string;
  originalData: unknown;
  retentionUntil: string;
  isPermanent: boolean;
}

export interface EUIDPrefix {
  prefix: string;
  entityType: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  isSystemPrefix: boolean;
  autoRetireConditions?: {
    inactivityDays?: number;
    maxEntities?: number;
    expiryDate?: string;
  };
}

export interface EUIDConflict {
  id: string;
  attemptedEUID: string;
  existingEUID: string;
  conflictType: 'duplicate' | 'reserved' | 'deleted';
  resolvedEUID?: string;
  timestamp: string;
  resolvedBy: 'system' | 'manual';
}

class EUIDLifecycleService {
  private static instance: EUIDLifecycleService;
  private deletedEUIDs: Set<string> = new Set();
  private reservedEUIDs: Set<string> = new Set();
  private customPrefixes: Map<string, EUIDPrefix> = new Map();
  private retentionRules: Map<EntityType, RetentionRule> = new Map();
  private conflictLog: EUIDConflict[] = [];

  // Default retention rules (in days)
  private defaultRetentionRules: RetentionRule[] = [
    { entityType: EntityType.DOCUMENT, retentionPeriod: 2555, action: 'archive' }, // 7 years
    { entityType: EntityType.COMPANY, retentionPeriod: 3650, action: 'archive' }, // 10 years
    { entityType: EntityType.INDIVIDUAL, retentionPeriod: 3650, action: 'archive' }, // 10 years
    { entityType: EntityType.NONPROFIT, retentionPeriod: 3650, action: 'archive' }, // 10 years
    { entityType: EntityType.GOVERNMENT, retentionPeriod: -1, action: 'permanent' }, // Never delete
    { entityType: EntityType.AI_ASSISTANT, retentionPeriod: -1, action: 'permanent' }, // Never delete
  ];

  private constructor() {
    this.initialize();
  }

  static getInstance(): EUIDLifecycleService {
    if (!EUIDLifecycleService.instance) {
      EUIDLifecycleService.instance = new EUIDLifecycleService();
    }
    return EUIDLifecycleService.instance;
  }

  private async initialize() {
    await this.loadDeletedEUIDs();
    await this.loadCustomPrefixes();
    await this.loadRetentionRules();
    await this.startLifecycleMonitor();
  }

  /**
   * Load all deleted EUIDs to prevent reuse
   */
  private async loadDeletedEUIDs() {
    try {
      const deleted = await netlifyDatabase.query({
        type: 'deleted_euid'
      });
      
      deleted.forEach(record => {
        this.deletedEUIDs.add((record.data as DeletedEUID).euid);
      });
      
      logger.debug(`Loaded ${this.deletedEUIDs.size} deleted EUIDs`);
    } catch (error) {
      logger.error('Failed to load deleted EUIDs:', error);
    }
  }

  /**
   * Load custom prefixes
   */
  private async loadCustomPrefixes() {
    try {
      const prefixes = await netlifyDatabase.query({
        type: 'euid_prefix'
      });
      
      prefixes.forEach(record => {
        const prefix = record.data as EUIDPrefix;
        this.customPrefixes.set(prefix.prefix, prefix);
      });
    } catch (error) {
      logger.error('Failed to load custom prefixes:', error);
    }
  }

  /**
   * Load retention rules
   */
  private async loadRetentionRules() {
    // Load default rules
    this.defaultRetentionRules.forEach(rule => {
      this.retentionRules.set(rule.entityType, rule);
    });

    // Load custom rules
    try {
      const customRules = await netlifyDatabase.query({
        type: 'retention_rule'
      });
      
      customRules.forEach(record => {
        const rule = record.data as RetentionRule;
        this.retentionRules.set(rule.entityType, rule);
      });
    } catch (error) {
      logger.error('Failed to load custom retention rules:', error);
    }
  }

  /**
   * Start lifecycle monitoring process
   */
  private async startLifecycleMonitor() {
    // Run every 24 hours
    setInterval(async () => {
      await this.processRetentionRules();
      await this.checkPrefixAutoRetirement();
      await this.cleanupConflictLog();
    }, 24 * 60 * 60 * 1000);

    // Run initial check
    await this.processRetentionRules();
  }

  /**
   * Check if EUID is available (not deleted or reserved)
   */
  async isEUIDAvailable(euid: string): Promise<boolean> {
    return !this.deletedEUIDs.has(euid) && !this.reservedEUIDs.has(euid);
  }

  /**
   * Register a deleted EUID to prevent reuse
   */
  async registerDeletedEUID(
    euid: string,
    entityType: EntityType,
    userId: string,
    reason: string,
    originalData: unknown
  ): Promise<void> {
    // Get retention rule
    const retentionRule = this.retentionRules.get(entityType) || {
      retentionPeriod: 3650,
      action: 'archive'
    };

    const retentionUntil = retentionRule.retentionPeriod === -1
      ? 'permanent'
      : new Date(Date.now() + retentionRule.retentionPeriod * 24 * 60 * 60 * 1000).toISOString();

    const deletedRecord: DeletedEUID = {
      euid,
      entityType,
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
      reason,
      originalData,
      retentionUntil,
      isPermanent: retentionRule.retentionPeriod === -1
    };

    // Save to database
    await netlifyDatabase.create('deleted_euid', deletedRecord, userId);
    
    // Add to memory set
    this.deletedEUIDs.add(euid);

    // Log deletion
    await universalAuditService.logAction({
      action: 'euid_deleted',
      entityId: euid,
      entityType: 'euid',
      userId,
      details: {
        reason,
        retentionUntil,
        isPermanent: deletedRecord.isPermanent
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Reserve EUIDs for future use
   */
  async reserveEUIDs(euids: string[], userId: string, reason: string): Promise<void> {
    for (const euid of euids) {
      if (await this.isEUIDAvailable(euid)) {
        this.reservedEUIDs.add(euid);
        
        await netlifyDatabase.create('reserved_euid', {
          euid,
          reservedAt: new Date().toISOString(),
          reservedBy: userId,
          reason
        }, userId);
      }
    }
  }

  /**
   * Auto-generate new prefix when needed
   */
  async generateNewPrefix(
    entityTypeName: string,
    description: string,
    userId: string = 'system'
  ): Promise<string> {
    // Generate a unique prefix (2-3 characters)
    const basePrefix = entityTypeName.substring(0, 2).toUpperCase();
    let prefix = basePrefix;
    let counter = 1;

    // Ensure uniqueness
    while (this.customPrefixes.has(prefix) || Object.values(EntityType).includes(prefix as any)) {
      prefix = basePrefix + counter.toString();
      counter++;
    }

    const newPrefix: EUIDPrefix = {
      prefix,
      entityType: entityTypeName,
      description,
      createdAt: new Date().toISOString(),
      isActive: true,
      isSystemPrefix: false
    };

    // Save to database
    await netlifyDatabase.create('euid_prefix', newPrefix, userId);
    
    // Add to memory
    this.customPrefixes.set(prefix, newPrefix);

    // Log creation
    await universalAuditService.logAction({
      action: 'euid_prefix_created',
      entityId: prefix,
      entityType: 'euid_prefix',
      userId,
      details: { entityTypeName, description },
      timestamp: new Date().toISOString()
    });

    return prefix;
  }

  /**
   * Resolve EUID conflicts automatically
   */
  async resolveConflict(
    attemptedEUID: string,
    conflictType: 'duplicate' | 'reserved' | 'deleted'
  ): Promise<string> {
    // Extract prefix and number
    const match = attemptedEUID.match(/^([A-Z]+)(\d+)(.*)$/);
    if (!match) {
      throw new Error('Invalid EUID format');
    }

    const [, prefix, number, suffix] = match;
    let newNumber = parseInt(number);
    let resolvedEUID: string;

    // Keep incrementing until we find an available EUID
    do {
      newNumber++;
      resolvedEUID = `${prefix}${newNumber.toString().padStart(5, '0')}${suffix}`;
    } while (!await this.isEUIDAvailable(resolvedEUID));

    // Log conflict resolution
    const conflict: EUIDConflict = {
      id: Date.now().toString(),
      attemptedEUID,
      existingEUID: attemptedEUID,
      conflictType,
      resolvedEUID,
      timestamp: new Date().toISOString(),
      resolvedBy: 'system'
    };

    this.conflictLog.push(conflict);
    await netlifyDatabase.create('euid_conflict', conflict, 'system');

    return resolvedEUID;
  }

  /**
   * Process retention rules
   */
  private async processRetentionRules() {
    const now = new Date();
    
    const deletedRecords = await netlifyDatabase.query({
      type: 'deleted_euid',
      filters: {
        'data.isPermanent': false,
        'data.retentionUntil': { $lte: now.toISOString() }
      }
    });

    for (const record of deletedRecords) {
      const deleted = record.data as DeletedEUID;
      const rule = this.retentionRules.get(deleted.entityType);
      
      if (rule?.action === 'purge') {
        // Permanently delete the record
        await netlifyDatabase.delete(record.id);
        
        await universalAuditService.logAction({
          action: 'euid_purged',
          entityId: deleted.euid,
          entityType: 'deleted_euid',
          userId: 'system',
          details: { retentionPeriod: rule.retentionPeriod },
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Check and auto-retire prefixes based on conditions
   */
  private async checkPrefixAutoRetirement() {
    for (const [prefix, prefixData] of Array.from(this.customPrefixes)) {
      if (!prefixData.isActive || !prefixData.autoRetireConditions) continue;

      const conditions = prefixData.autoRetireConditions;
      let shouldRetire = false;

      // Check expiry date
      if (conditions.expiryDate && new Date(conditions.expiryDate) <= new Date()) {
        shouldRetire = true;
      }

      // Check inactivity
      if (conditions.inactivityDays) {
        const lastUsed = await this.getLastUsedDate(prefix);
        if (lastUsed) {
          const daysSinceLastUse = Math.floor(
            (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastUse >= conditions.inactivityDays) {
            shouldRetire = true;
          }
        }
      }

      // Check max entities
      if (conditions.maxEntities) {
        const count = await this.getEntityCount(prefix);
        if (count >= conditions.maxEntities) {
          shouldRetire = true;
        }
      }

      if (shouldRetire) {
        await this.retirePrefix(prefix, 'auto-retirement');
      }
    }
  }

  /**
   * Retire a prefix
   */
  async retirePrefix(prefix: string, reason: string): Promise<void> {
    const prefixData = this.customPrefixes.get(prefix);
    if (!prefixData) return;

    prefixData.isActive = false;
    
    await netlifyDatabase.update(
      prefix,
      { data: { isActive: false } },
      'system'
    );

    await universalAuditService.logAction({
      action: 'euid_prefix_retired',
      entityId: prefix,
      entityType: 'euid_prefix',
      userId: 'system',
      details: { reason },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get last used date for a prefix
   */
  private async getLastUsedDate(prefix: string): Promise<string | null> {
    const records = await netlifyDatabase.query({
      type: 'euid',
      filters: { 'data.full': { $regex: `^${prefix}` } },
      sort: { field: 'data.metadata.createdAt', order: 'desc' },
      limit: 1
    });

    return records.length > 0 ? (records[0].data as any).metadata.createdAt : null;
  }

  /**
   * Get entity count for a prefix
   */
  private async getEntityCount(prefix: string): Promise<number> {
    const records = await netlifyDatabase.query({
      type: 'euid',
      filters: { 'data.full': { $regex: `^${prefix}` } }
    });

    return records.length;
  }

  /**
   * Clean up old conflict logs (keep 90 days)
   */
  private async cleanupConflictLog() {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    this.conflictLog = this.conflictLog.filter(
      conflict => new Date(conflict.timestamp) > cutoffDate
    );
  }

  /**
   * Get conflict statistics
   */
  async getConflictStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    resolutionRate: number;
  }> {
    const byType: Record<string, number> = {};
    let resolved = 0;

    this.conflictLog.forEach(conflict => {
      byType[conflict.conflictType] = (byType[conflict.conflictType] || 0) + 1;
      if (conflict.resolvedEUID) resolved++;
    });

    return {
      total: this.conflictLog.length,
      byType,
      resolutionRate: this.conflictLog.length > 0 ? resolved / this.conflictLog.length : 0
    };
  }

  /**
   * Manual override (Super User only)
   */
  async manualOverride(
    operation: 'undelete' | 'unreserve' | 'forceRetire',
    euid: string,
    userId: string,
    reason: string
  ): Promise<void> {
    // This should be called only after permission check in the UI
    
    switch (operation) {
      case 'undelete':
        this.deletedEUIDs.delete(euid);
        // Find the actual record to delete
        const deletedRecords = await netlifyDatabase.query({
          type: 'deleted_euid',
          filters: { 'data.euid': euid }
        });
        if (deletedRecords.length > 0) {
          await netlifyDatabase.delete(deletedRecords[0].id);
        }
        break;
        
      case 'unreserve':
        this.reservedEUIDs.delete(euid);
        // Find the actual record to delete
        const reservedRecords = await netlifyDatabase.query({
          type: 'reserved_euid',
          filters: { 'data.euid': euid }
        });
        if (reservedRecords.length > 0) {
          await netlifyDatabase.delete(reservedRecords[0].id);
        }
        break;
        
      case 'forceRetire':
        // Force retirement logic
        break;
    }

    await universalAuditService.logAction({
      action: `euid_manual_override_${operation}`,
      entityId: euid,
      entityType: 'euid',
      userId,
      details: { reason },
      timestamp: new Date().toISOString()
    });
  }
}

export const euidLifecycleService = EUIDLifecycleService.getInstance();