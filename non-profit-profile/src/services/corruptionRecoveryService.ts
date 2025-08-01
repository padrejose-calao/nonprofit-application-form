/**
 * Corruption Recovery Service
 * Handles corrupted records by assigning Jane/John Doe identities
 * JAD##### for companies (Jane Doe)
 * JOD##### for individuals (John Doe)
 */

import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { EntityType } from './euidTypes';
import { euidLifecycleService } from './euidLifecycleService';
import { logger } from '../utils/logger';

export interface CorruptedRecord {
  originalId?: string;
  assignedDoeId: string;
  entityType: 'company' | 'individual' | 'unknown';
  corruptionDetectedAt: string;
  corruptionType: string;
  recoveryAttempts: number;
  originalData?: Record<string, unknown>;
  recoveredData?: Record<string, unknown>;
  status: 'corrupted' | 'partially_recovered' | 'quarantined';
}

export interface DoeIdentity {
  doeId: string;
  type: 'JAD' | 'JOD';
  assignedTo: string;
  assignedAt: string;
  reason: string;
  metadata: Record<string, unknown>;
}

class CorruptionRecoveryService {
  private static instance: CorruptionRecoveryService;
  private jadCounter: number = 0;
  private jodCounter: number = 0;
  private doeIdentities: Map<string, DoeIdentity> = new Map();
  private corruptedRecords: Map<string, CorruptedRecord> = new Map();

  private constructor() {
    this.initialize();
  }

  static getInstance(): CorruptionRecoveryService {
    if (!CorruptionRecoveryService.instance) {
      CorruptionRecoveryService.instance = new CorruptionRecoveryService();
    }
    return CorruptionRecoveryService.instance;
  }

  private async initialize() {
    await this.loadDoeCounters();
    await this.loadDoeIdentities();
    await this.startCorruptionMonitor();
  }

  /**
   * Load existing Doe counters from database
   */
  private async loadDoeCounters() {
    try {
      const counters = await netlifyDatabase.read('doe_counters');
      if (counters) {
        const data = counters.data as { jad: number; jod: number };
        this.jadCounter = data.jad || 0;
        this.jodCounter = data.jod || 0;
      }
    } catch (error) {
      logger.debug('Initializing Doe counters');
      await this.saveDoeCounters();
    }
  }

  /**
   * Save Doe counters to database
   */
  private async saveDoeCounters() {
    await netlifyDatabase.create('doe_counters', {
      jad: this.jadCounter,
      jod: this.jodCounter,
      lastUpdated: new Date().toISOString()
    }, 'system');
  }

  /**
   * Load existing Doe identities
   */
  private async loadDoeIdentities() {
    try {
      const identities = await netlifyDatabase.query({
        type: 'doe_identity'
      });
      
      identities.forEach(record => {
        const identity = record.data as DoeIdentity;
        this.doeIdentities.set(identity.doeId, identity);
      });
      
      logger.debug(`Loaded ${this.doeIdentities.size} Doe identities`);
    } catch (error) {
      logger.error('Failed to load Doe identities:', error);
    }
  }

  /**
   * Start corruption monitoring
   */
  private async startCorruptionMonitor() {
    // Run every hour
    setInterval(async () => {
      await this.scanForCorruption();
    }, 60 * 60 * 1000);

    // Run initial scan
    await this.scanForCorruption();
  }

  /**
   * Generate next JAD (Jane Doe) ID for companies
   */
  private async generateJADId(): Promise<string> {
    this.jadCounter++;
    const jadId = `JAD${this.jadCounter.toString().padStart(5, '0')}`;
    await this.saveDoeCounters();
    return jadId;
  }

  /**
   * Generate next JOD (John Doe) ID for individuals
   */
  private async generateJODId(): Promise<string> {
    this.jodCounter++;
    const jodId = `JOD${this.jodCounter.toString().padStart(5, '0')}`;
    await this.saveDoeCounters();
    return jodId;
  }

  /**
   * Assign Doe identity to corrupted record
   */
  async assignDoeIdentity(
    originalId: string | undefined,
    entityType: 'company' | 'individual' | 'unknown',
    corruptionType: string,
    originalData?: Record<string, unknown>
  ): Promise<string> {
    let doeId: string;
    
    // Determine which Doe ID to use
    if (entityType === 'company' || (entityType === 'unknown' && this.isLikelyCompany(originalData || null))) {
      doeId = await this.generateJADId();
    } else {
      doeId = await this.generateJODId();
    }

    // Create Doe identity record
    const doeIdentity: DoeIdentity = {
      doeId,
      type: doeId.startsWith('JAD') ? 'JAD' : 'JOD',
      assignedTo: originalId || 'unknown',
      assignedAt: new Date().toISOString(),
      reason: corruptionType,
      metadata: {
        originalData: originalData || {},
        recoveryStatus: 'pending'
      }
    };

    // Save to database
    await netlifyDatabase.create('doe_identity', doeIdentity, 'system');
    this.doeIdentities.set(doeId, doeIdentity);

    // Create corrupted record entry
    const corruptedRecord: CorruptedRecord = {
      originalId,
      assignedDoeId: doeId,
      entityType,
      corruptionDetectedAt: new Date().toISOString(),
      corruptionType,
      recoveryAttempts: 0,
      originalData,
      status: 'corrupted'
    };

    await netlifyDatabase.create('corrupted_record', corruptedRecord, 'system');
    this.corruptedRecords.set(doeId, corruptedRecord);

    // Register with EUID lifecycle to prevent reuse
    await euidLifecycleService.registerDeletedEUID(
      originalId || doeId,
      entityType === 'company' ? EntityType.COMPANY : EntityType.INDIVIDUAL,
      'system',
      `Corrupted record - assigned Doe ID: ${doeId}`,
      originalData
    );

    // Log the assignment
    await universalAuditService.logAction({
      action: 'doe_identity_assigned',
      entityId: doeId,
      entityType: 'doe_identity',
      userId: 'system',
      details: {
        originalId,
        corruptionType,
        entityType
      },
      timestamp: new Date().toISOString()
    });

    return doeId;
  }

  /**
   * Attempt to recover corrupted record
   */
  async attemptRecovery(doeId: string): Promise<boolean> {
    const corruptedRecord = this.corruptedRecords.get(doeId);
    if (!corruptedRecord) return false;

    corruptedRecord.recoveryAttempts++;

    try {
      // Attempt various recovery strategies
      const recovered = await this.runRecoveryStrategies(corruptedRecord);
      
      if (recovered) {
        corruptedRecord.status = 'partially_recovered';
        corruptedRecord.recoveredData = recovered;
        
        await netlifyDatabase.update(
          doeId,
          { 
            data: {
              status: 'partially_recovered',
              recoveredData: recovered,
              recoveryAttempts: corruptedRecord.recoveryAttempts
            }
          },
          'system'
        );

        await universalAuditService.logAction({
          action: 'corruption_recovery_success',
          entityId: doeId,
          entityType: 'corrupted_record',
          userId: 'system',
          details: { 
            attempts: corruptedRecord.recoveryAttempts,
            recoveredFields: Object.keys(recovered)
          },
          timestamp: new Date().toISOString()
        });

        return true;
      }
    } catch (error) {
      logger.error('Recovery attempt failed:', error);
    }

    // If too many attempts, quarantine
    if (corruptedRecord.recoveryAttempts >= 5) {
      corruptedRecord.status = 'quarantined';
      await this.quarantineRecord(doeId);
    }

    return false;
  }

  /**
   * Run recovery strategies
   */
  private async runRecoveryStrategies(record: CorruptedRecord): Promise<Record<string, unknown> | null> {
    const strategies: Array<(record: CorruptedRecord) => Record<string, unknown> | null | Promise<Record<string, unknown> | null>> = [
      this.tryJSONParse.bind(this),
      this.tryPartialReconstruction.bind(this),
      this.tryBackupRecovery.bind(this),
      this.tryRelationshipRecovery.bind(this)
    ];

    for (const strategy of strategies) {
      try {
        const result = await Promise.resolve(strategy(record));
        if (result && Object.keys(result).length > 0) {
          return result;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Try to parse corrupted JSON
   */
  private tryJSONParse(record: CorruptedRecord): Record<string, unknown> | null {
    if (!record.originalData) return null;
    
    try {
      if (typeof record.originalData === 'string') {
        // Try to fix common JSON issues
        const dataStr = record.originalData as string;
        const fixed = dataStr
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        
        return JSON.parse(fixed);
      }
      return record.originalData;
    } catch {
      return null;
    }
  }

  /**
   * Try partial reconstruction from fragments
   */
  private async tryPartialReconstruction(record: CorruptedRecord): Promise<Record<string, unknown> | null> {
    const reconstructed: Record<string, unknown> = {};
    
    if (record.originalData) {
      // Extract any valid fields
      for (const [key, value] of Object.entries(record.originalData)) {
        if (value !== undefined && value !== null && !this.isCorrupted(value)) {
          reconstructed[key] = value;
        }
      }
    }

    return Object.keys(reconstructed).length > 0 ? reconstructed : null;
  }

  /**
   * Try recovery from backups
   */
  private async tryBackupRecovery(record: CorruptedRecord): Promise<Record<string, unknown> | null> {
    if (!record.originalId) return null;
    
    try {
      // Check for backups
      const backups = await netlifyDatabase.query({
        type: 'backup',
        filters: { 'data.entityId': record.originalId },
        sort: { field: 'data.createdAt', order: 'desc' },
        limit: 1
      });

      return backups.length > 0 ? (backups[0].data as any).content : null;
    } catch {
      return null;
    }
  }

  /**
   * Try recovery through relationships
   */
  private async tryRelationshipRecovery(record: CorruptedRecord): Promise<Record<string, unknown> | null> {
    if (!record.originalId) return null;
    
    try {
      // Find related entities that might have references
      const relationships = await netlifyDatabase.query({
        type: 'euid',
        filters: { 
          'data.relationships': { 
            $elemMatch: { targetEUID: record.originalId } 
          } 
        }
      });

      // Reconstruct basic info from relationships
      if (relationships.length > 0) {
        return {
          id: record.originalId,
          relatedEntities: relationships.map(r => (r.data as any).full),
          reconstructedFrom: 'relationships'
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Check if value appears corrupted
   */
  private isCorrupted(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    
    // Check for corruption patterns
    const corruptionPatterns = [
      /^\0+$/,                    // Null bytes
      /^[^\x20-\x7E]+$/,         // Non-printable characters
      /^undefined$/,              // Literal "undefined"
      /^NaN$/,                    // Literal "NaN"
      /^\[object Object\]$/       // Stringified object
    ];

    const valueStr = String(value);
    return corruptionPatterns.some(pattern => pattern.test(valueStr));
  }

  /**
   * Determine if data looks like a company
   */
  private isLikelyCompany(data: Record<string, unknown> | null): boolean {
    if (!data) return false;
    
    const companyIndicators = [
      'company', 'corporation', 'corp', 'inc', 'llc', 'ltd', 
      'business', 'organization', 'nonprofit', 'foundation'
    ];

    const dataStr = JSON.stringify(data).toLowerCase();
    return companyIndicators.some(indicator => dataStr.includes(indicator));
  }

  /**
   * Quarantine a corrupted record
   */
  private async quarantineRecord(doeId: string): Promise<void> {
    await netlifyDatabase.create('quarantine', {
      doeId,
      quarantinedAt: new Date().toISOString(),
      reason: 'Multiple recovery attempts failed',
      record: this.corruptedRecords.get(doeId)
    }, 'system');

    await universalAuditService.logAction({
      action: 'record_quarantined',
      entityId: doeId,
      entityType: 'corrupted_record',
      userId: 'system',
      details: { reason: 'Recovery attempts exhausted' },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Scan for corruption in the database
   */
  private async scanForCorruption(): Promise<void> {
    const allTypes = ['user', 'organization', 'document', 'euid'];
    
    for (const type of allTypes) {
      try {
        const records = await netlifyDatabase.query({ type });
        
        for (const record of records) {
          if (this.isRecordCorrupted(record)) {
            const entityType = this.determineEntityType(record);
            await this.assignDoeIdentity(
              record.id,
              entityType,
              'Corruption detected during scan',
              record.data as Record<string, unknown> | undefined
            );
          }
        }
      } catch (error) {
        logger.error(`Corruption scan failed for type ${type}:`, error);
      }
    }
  }

  /**
   * Check if a record is corrupted
   */
  private isRecordCorrupted(record: unknown): boolean {
    try {
      // Check for missing required fields
      if (!(record as any).id || !(record as any).type || !(record as any).data) return true;
      
      // Check for corrupted data
      if (this.isCorrupted((record as any).data)) return true;
      
      // Check for invalid JSON structure
      JSON.stringify((record as any).data);
      
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Determine entity type from record
   */
  private determineEntityType(record: unknown): 'company' | 'individual' | 'unknown' {
    if (!record || !(record as any).type) return 'unknown';
    
    const companyTypes = ['organization', 'company', 'nonprofit'];
    const individualTypes = ['user', 'individual', 'person'];
    
    const recordType = (record as any).type as string;
    if (companyTypes.includes(recordType)) return 'company';
    if (individualTypes.includes(recordType)) return 'individual';
    
    // Try to determine from data
    if ((record as any).data && typeof (record as any).data === 'object') {
      const data = (record as any).data as Record<string, unknown>;
      if (data.firstName || data.lastName || data.email) {
        return 'individual';
      }
      if (data.organizationName || data.ein) {
        return 'company';
      }
    }
    
    return 'unknown';
  }

  /**
   * Get statistics on Doe identities
   */
  async getDoeStatistics(): Promise<{
    totalJAD: number;
    totalJOD: number;
    recovered: number;
    quarantined: number;
    active: number;
  }> {
    let recovered = 0;
    let quarantined = 0;
    let active = 0;

    this.corruptedRecords.forEach(record => {
      switch (record.status) {
        case 'partially_recovered':
          recovered++;
          break;
        case 'quarantined':
          quarantined++;
          break;
        case 'corrupted':
          active++;
          break;
      }
    });

    return {
      totalJAD: this.jadCounter,
      totalJOD: this.jodCounter,
      recovered,
      quarantined,
      active
    };
  }

  /**
   * Get Doe identity by ID
   */
  getDoeIdentity(doeId: string): DoeIdentity | undefined {
    return this.doeIdentities.get(doeId);
  }

  /**
   * List all Doe identities
   */
  getAllDoeIdentities(): DoeIdentity[] {
    return Array.from(this.doeIdentities.values());
  }
}

export const corruptionRecoveryService = CorruptionRecoveryService.getInstance();