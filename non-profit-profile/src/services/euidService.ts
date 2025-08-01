/**
 * EUID (Entity Unique Identifier) Service
 * Manages unique identifiers for all entities in the system
 * Format: [Type][5-digit-number][-Relationships][-Status]
 */

import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { euidLifecycleService } from './euidLifecycleService';
import { 
  EntityType, 
  EntityStatus, 
  AccessLevel, 
  RelationshipType, 
  GovernmentState,
  EUID,
  EUIDValidation 
} from './euidTypes';

// Re-export types for backward compatibility
export { 
  EntityType, 
  EntityStatus, 
  AccessLevel, 
  RelationshipType, 
  GovernmentState
};
// Don't re-export interfaces to avoid webpack issues
// EUID and EUIDValidation should be imported directly from euidTypes

class EUIDService {
  private static instance: EUIDService;
  private sequenceCounters: Map<string, number> = new Map();
  private reservedPrefixes = ['Y', 'Z']; // Reserved for future use

  private constructor() {}

  static getInstance(): EUIDService {
    if (!EUIDService.instance) {
      EUIDService.instance = new EUIDService();
    }
    return EUIDService.instance;
  }

  /**
   * Generate a new EUID for an entity
   */
  async generateEUID(
    type: EntityType,
    userId: string,
    accessLevel?: AccessLevel,
    externalRef?: string,
    governmentState?: GovernmentState
  ): Promise<string> {
    // Handle special formatting for government entities
    if (type === EntityType.GOVERNMENT && governmentState) {
      return this.generateGovernmentEUID(governmentState, userId, externalRef);
    }

    // Handle multi-character entity types (PS, EO, QG, AI, JAD, JOD)
    if (type === EntityType.PUBLIC_SERVANT || 
        type === EntityType.ELECTED_OFFICIAL || 
        type === EntityType.QUASI_GOVERNMENT ||
        type === EntityType.AI_ASSISTANT ||
        type === EntityType.JANE_DOE ||
        type === EntityType.JOHN_DOE) {
      const sequence = await this.getNextSequence(type);
      const baseEUID = `${type}${sequence.toString().padStart(5, '0')}`;
      
      // Create EUID record
      const euidRecord: EUID = {
        full: baseEUID,
        type,
        number: sequence.toString().padStart(5, '0'),
        relationships: [],
        status: EntityStatus.ACTIVE,
        accessLevel,
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: userId,
          externalRef
        }
      };

      await netlifyDatabase.create('euid', euidRecord, userId);
      await this.logEUIDCreation(baseEUID, type, userId, { accessLevel, externalRef });
      
      return baseEUID;
    }

    // Standard single-character entity types
    const sequence = await this.getNextSequence(type);
    const prefix = accessLevel ? `${accessLevel}${type}` : type;
    let baseEUID = `${prefix}${sequence.toString().padStart(5, '0')}`;
    
    // Check if EUID is available (not deleted or reserved)
    if (!await euidLifecycleService.isEUIDAvailable(baseEUID)) {
      // Resolve conflict automatically
      baseEUID = await euidLifecycleService.resolveConflict(baseEUID, 'duplicate');
    }
    
    // Create EUID record
    const euidRecord: EUID = {
      full: baseEUID,
      type,
      number: sequence.toString().padStart(5, '0'),
      relationships: [],
      status: EntityStatus.ACTIVE,
      accessLevel,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: userId,
        externalRef
      }
    };

    await netlifyDatabase.create('euid', euidRecord, userId);
    await this.logEUIDCreation(baseEUID, type, userId, { accessLevel, externalRef });

    return baseEUID;
  }

  /**
   * Generate EUID for government entities with state codes
   */
  private async generateGovernmentEUID(
    state: GovernmentState,
    userId: string,
    externalRef?: string
  ): Promise<string> {
    const typeWithState = `G${state}`;
    const sequence = await this.getNextSequence(typeWithState as any);
    const euid = `${typeWithState}${sequence.toString().padStart(5, '0')}`;

    const euidRecord: unknown = {
      full: euid,
      type: EntityType.GOVERNMENT,
      number: sequence.toString().padStart(5, '0'),
      relationships: [],
      status: EntityStatus.ACTIVE, // Government entities never go inactive unless abolished
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: userId,
        externalRef
      },
      governmentState: state,
      isGovernmentEntity: true
    };

    await netlifyDatabase.create('euid', euidRecord, userId);
    await this.logEUIDCreation(euid, EntityType.GOVERNMENT, userId, { 
      governmentState: state, 
      externalRef 
    });

    return euid;
  }

  /**
   * Log EUID creation
   */
  private async logEUIDCreation(
    euid: string,
    type: EntityType,
    userId: string,
    details: unknown
  ): Promise<void> {
    await universalAuditService.logAction({
      action: 'euid_created',
      entityId: euid,
      entityType: 'euid',
      userId,
      details: { type, ...(details as any) },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate EUID with relationships
   */
  async generateRelatedEUID(
    type: EntityType,
    userId: string,
    relationships: Array<{
      targetEUID: string;
      type: RelationshipType;
      startDate?: string;
      endDate?: string;
    }>,
    accessLevel?: AccessLevel
  ): Promise<string> {
    const baseEUID = await this.generateEUID(type, userId, accessLevel);
    
    // Add relationships
    await this.addRelationships(baseEUID, relationships, userId);
    
    // Return full EUID with primary relationship
    if (relationships.length > 0) {
      const primary = relationships[0];
      return `${baseEUID}-${primary.targetEUID}`;
    }
    
    return baseEUID;
  }

  /**
   * Add relationships to existing EUID
   */
  async addRelationships(
    euid: string,
    relationships: Array<{
      targetEUID: string;
      type: RelationshipType;
      startDate?: string;
      endDate?: string;
    }>,
    userId: string
  ): Promise<void> {
    const record = await this.getEUIDRecord(euid);
    if (!record) {
      throw new Error(`EUID ${euid} not found`);
    }

    // Add new relationships
    record.relationships.push(...relationships);
    
    // Update record
    await netlifyDatabase.update(record.full, {
      data: {
        relationships: record.relationships,
        metadata: {
          ...record.metadata,
          modifiedAt: new Date().toISOString(),
          modifiedBy: userId
        }
      }
    }, userId);

    // Log relationship addition
    await universalAuditService.logAction({
      action: 'euid_relationships_added',
      entityId: euid,
      entityType: 'euid',
      userId,
      details: { relationships },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update entity status
   */
  async updateStatus(
    euid: string,
    status: EntityStatus,
    userId: string,
    cascadeToRelated = true
  ): Promise<void> {
    const record = await this.getEUIDRecord(euid);
    if (!record) {
      throw new Error(`EUID ${euid} not found`);
    }

    const oldStatus = record.status;
    record.status = status;
    
    // Update full EUID with status suffix
    if (status !== EntityStatus.ACTIVE) {
      record.full = `${record.full.replace(/[HR]$/, '')}${status}`;
    }

    await netlifyDatabase.update(record.full, {
      data: {
        status: record.status,
        full: record.full,
        metadata: {
          ...record.metadata,
          modifiedAt: new Date().toISOString(),
          modifiedBy: userId
        }
      }
    }, userId);

    // Log status change
    await universalAuditService.logAction({
      action: 'euid_status_changed',
      entityId: euid,
      entityType: 'euid',
      userId,
      details: { oldStatus, newStatus: status },
      timestamp: new Date().toISOString()
    });

    // Cascade status changes if needed
    if (cascadeToRelated) {
      await this.cascadeStatusChange(euid, status, userId);
    }
  }

  /**
   * Cascade status changes based on rules
   */
  private async cascadeStatusChange(
    euid: string,
    status: EntityStatus,
    userId: string
  ): Promise<void> {
    const record = await this.getEUIDRecord(euid);
    if (!record) return;

    // If organization becomes inactive, change all related 'H' to 'R'
    if (record.type === EntityType.COMPANY && status === EntityStatus.RETIRED) {
      const relatedRecords = await this.findRelatedEUIDs(euid);
      
      for (const related of relatedRecords) {
        if (related.status === EntityStatus.HISTORICAL) {
          await this.updateStatus(related.full, EntityStatus.RETIRED, userId, false);
        }
      }
    }

    // If individual leaves org, retire their EUID
    if (record.type === EntityType.INDIVIDUAL && status === EntityStatus.RETIRED) {
      // Update any documents or records owned by this individual
      const ownedRecords = await this.findOwnedEUIDs(euid);
      
      for (const owned of ownedRecords) {
        if (owned.status === EntityStatus.ACTIVE) {
          await this.updateStatus(owned.full, EntityStatus.HISTORICAL, userId, false);
        }
      }
    }
  }

  /**
   * Validate EUID format
   */
  validateEUID(euid: string): EUIDValidation {
    const errors: string[] = [];
    const parsed: Partial<EUID> = {};

    // Remove status suffix for parsing
    const cleanEUID = euid.replace(/[HR]$/, '');
    const statusMatch = euid.match(/([HR])$/);
    if (statusMatch) {
      parsed.status = statusMatch[1] as EntityStatus;
    }

    // Check basic format
    const basicMatch = cleanEUID.match(/^([PXV])?([A-Z])(\d{5})(?:-([A-Z]\d{5}))*$/);
    if (!basicMatch) {
      errors.push('Invalid EUID format');
      return { isValid: false, errors };
    }

    // Parse components
    const [, accessLevel, type, number] = basicMatch;
    
    if (accessLevel) {
      parsed.accessLevel = accessLevel as AccessLevel;
    }
    
    parsed.type = type as EntityType;
    parsed.number = number;

    // Validate type
    if (!Object.values(EntityType).includes(type as EntityType)) {
      errors.push(`Invalid entity type: ${type}`);
    }

    // Check for reserved prefixes
    if (this.reservedPrefixes.includes(type)) {
      errors.push(`Reserved prefix: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      parsed
    };
  }

  /**
   * Parse EUID to extract components
   */
  async parseEUID(euid: string): Promise<EUID | null> {
    const validation = this.validateEUID(euid);
    if (!validation.isValid) {
      return null;
    }

    // Get full record from database
    return this.getEUIDRecord(euid);
  }

  /**
   * Get EUID record from database
   */
  private async getEUIDRecord(euid: string): Promise<EUID | null> {
    const records = await netlifyDatabase.query({
      type: 'euid',
      filters: { 'data.full': euid.replace(/[HR]$/, '') }
    });

    return records.length > 0 ? records[0].data as EUID : null;
  }

  /**
   * Find related EUIDs
   */
  private async findRelatedEUIDs(euid: string): Promise<EUID[]> {
    const records = await netlifyDatabase.query({
      type: 'euid',
      filters: { 'data.relationships': { $elemMatch: { targetEUID: euid } } }
    });

    return records.map(r => r.data as EUID);
  }

  /**
   * Find EUIDs owned by an entity
   */
  private async findOwnedEUIDs(ownerEUID: string): Promise<EUID[]> {
    const records = await netlifyDatabase.query({
      type: 'euid',
      filters: { 'data.metadata.createdBy': ownerEUID }
    });

    return records.map(r => r.data as EUID);
  }

  /**
   * Get next sequence number for entity type
   */
  private async getNextSequence(type: EntityType): Promise<number> {
    const key = `euid_sequence_${type}`;
    
    // Try to get from cache first
    if (this.sequenceCounters.has(key)) {
      const current = this.sequenceCounters?.get(key)!;
      const next = current + 1;
      this.sequenceCounters.set(key, next);
      
      // Update in database
      await netlifyDatabase.update(key, { data: { value: next } }, 'system');
      
      return next;
    }

    // Get from database
    const record = await netlifyDatabase.read(key);
    let sequence = 1;
    
    if (record) {
      const data = record.data as { value: number };
      sequence = (data.value || 0) + 1;
      await netlifyDatabase.update(key, { data: { value: sequence } }, 'system');
    } else {
      await netlifyDatabase.create('sequence', { 
        id: key, 
        type: 'euid_sequence',
        entityType: type,
        value: sequence 
      }, 'system');
    }

    this.sequenceCounters.set(key, sequence);
    return sequence;
  }

  /**
   * Generate version EUID for documents
   */
  async generateVersionEUID(
    baseEUID: string,
    userId: string
  ): Promise<string> {
    const record = await this.getEUIDRecord(baseEUID);
    if (!record) {
      throw new Error(`Base EUID ${baseEUID} not found`);
    }

    const version = (record.version || 1) + 1;
    const versionedEUID = `${baseEUID}-v${version}`;

    // Update base record with new version
    await netlifyDatabase.update(record.full, {
      data: {
        version,
        metadata: {
          ...record.metadata,
          modifiedAt: new Date().toISOString(),
          modifiedBy: userId
        }
      }
    }, userId);

    return versionedEUID;
  }

  /**
   * Batch generate EUIDs for bulk imports
   */
  async batchGenerateEUIDs(
    type: EntityType,
    count: number,
    userId: string,
    batchId?: string
  ): Promise<string[]> {
    const euids: string[] = [];
    const batch = batchId || await this.generateEUID(EntityType.BATCH, userId);

    for (let i = 0; i < count; i++) {
      const euid = await this.generateEUID(type, userId);
      
      // Link to batch
      await this.addRelationships(euid, [{
        targetEUID: batch,
        type: RelationshipType.CHILD,
        startDate: new Date().toISOString()
      }], userId);

      euids.push(euid);
    }

    return euids;
  }

  /**
   * Get display format for EUID
   */
  formatEUIDDisplay(euid: string): string {
    const validation = this.validateEUID(euid);
    if (!validation.isValid || !validation.parsed) {
      return euid;
    }

    const { type, number, accessLevel, status } = validation.parsed;
    let display = '';

    // Add access level icon
    if (accessLevel === AccessLevel.PUBLIC) display += '🌐 ';
    if (accessLevel === AccessLevel.RESTRICTED) display += '🔒 ';
    if (accessLevel === AccessLevel.VIP) display += '⭐ ';

    // Add type name
    const typeNames: Record<EntityType, string> = {
      [EntityType.COMPANY]: 'Company',
      [EntityType.INDIVIDUAL]: 'Individual',
      [EntityType.DOCUMENT]: 'Document',
      [EntityType.GOVERNMENT]: 'Government',
      [EntityType.REPORT]: 'Report',
      [EntityType.NONPROFIT]: 'Nonprofit',
      [EntityType.PROJECT]: 'Project',
      [EntityType.TASK]: 'Task',
      [EntityType.EVENT]: 'Event',
      [EntityType.LOCATION]: 'Location',
      [EntityType.ASSET]: 'Asset',
      [EntityType.BATCH]: 'Batch',
      [EntityType.QUALITY]: 'Quality',
      [EntityType.MESSAGE]: 'Message',
      [EntityType.EXTERNAL]: 'External',
      [EntityType.PUBLIC_SERVANT]: 'Public Servant',
      [EntityType.ELECTED_OFFICIAL]: 'Elected Official',
      [EntityType.QUASI_GOVERNMENT]: 'Quasi-Government',
      [EntityType.AI_ASSISTANT]: 'AI Assistant',
      [EntityType.API]: 'API Integration',
      [EntityType.JANE_DOE]: 'Jane Doe (Company)',
      [EntityType.JOHN_DOE]: 'John Doe (Individual)'
    };

    display += `${type ? ((typeNames as any)[type] || type) : 'Unknown'} #${number}`;

    // Add status indicator
    if (status === EntityStatus.HISTORICAL) display += ' (Historical)';
    if (status === EntityStatus.RETIRED) display += ' (Retired)';

    return display;
  }
}

export const euidService = EUIDService.getInstance();