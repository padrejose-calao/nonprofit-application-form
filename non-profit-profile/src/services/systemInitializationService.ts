/**
 * System Initialization Service
 * Sets up core system entities with predefined EUIDs
 */

import { netlifyDatabase } from './netlifyDatabaseService';
import { EntityType, EntityStatus, RelationshipType } from './euidTypes';
import { euidService } from './euidService';
import { rbacService, Role, Permission } from './rbacService';
import { universalAuditService } from './universalAuditService';
import { aiAssistantService } from './aiAssistantService';
import { logger } from '../utils/logger';

interface SystemEntity {
  euid: string;
  type: EntityType;
  name: string;
  role?: string;
  organization?: string;
  metadata: Record<string, unknown>;
}

interface SystemUser {
  euid: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: Role;
  organizationEUID: string;
  isSuperUser: boolean;
  permissions: string[];
}

class SystemInitializationService {
  private static instance: SystemInitializationService;
  private initialized = false;

  // Predefined system entities
  private readonly systemEntities: SystemEntity[] = [
    {
      euid: 'C00001',
      type: EntityType.COMPANY,
      name: 'Calao Corp',
      metadata: {
        type: 'for-profit',
        isSystemOwner: true,
        description: 'Owner of the system'
      }
    },
    {
      euid: 'C00002',
      type: EntityType.COMPANY, // CoquiProject is a company
      name: 'CoquiProject Pitch',
      metadata: {
        type: 'company',
        status: 'active'
      }
    },
    {
      euid: 'N00003', // Using N for nonprofit
      type: EntityType.NONPROFIT,
      name: 'Renacer en Vida Nueva, Inc.',
      metadata: {
        type: 'nonprofit',
        status: 'active'
      }
    },
    {
      euid: 'C00004',
      type: EntityType.COMPANY,
      name: 'Corpus Care, Inc',
      metadata: {
        type: 'company',
        status: 'active'
      }
    }
  ];

  // Predefined system users
  private readonly systemUsers: SystemUser[] = [
    {
      euid: 'I00001',
      email: 'henry.mendoza@calao.com',
      firstName: 'Henry',
      middleName: 'Andres',
      lastName: 'Mendoza Gonzalez',
      role: 'admin' as Role,
      organizationEUID: 'C00001',
      isSuperUser: true,
      permissions: ['*'] // All permissions
    },
    {
      euid: 'I00002',
      email: 'jose.rodriguez@coquiproject.com',
      firstName: 'Jose Esteban',
      lastName: 'Rodriguez Sanjurjo',
      role: 'admin' as Role,
      organizationEUID: 'C00002',
      isSuperUser: false,
      permissions: []
    },
    {
      euid: 'I00003',
      email: 'heather.washburn@coquiproject.com',
      firstName: 'Heather Faith',
      lastName: 'Washburn-Rodriguez',
      role: 'admin' as Role,
      organizationEUID: 'C00002',
      isSuperUser: false,
      permissions: []
    },
    {
      euid: 'I00004',
      email: 'hoower.cajica@renacervidanueva.org',
      firstName: 'Hoower',
      lastName: 'Cajica Remolina',
      role: 'admin' as Role,
      organizationEUID: 'N00003',
      isSuperUser: false,
      permissions: []
    }
  ];

  private constructor() {}

  static getInstance(): SystemInitializationService {
    if (!SystemInitializationService.instance) {
      SystemInitializationService.instance = new SystemInitializationService();
    }
    return SystemInitializationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('System already initialized');
      return;
    }

    logger.info('Initializing system entities...');

    try {
      // Initialize organizations
      await this.initializeOrganizations();
      
      // Initialize users
      await this.initializeUsers();
      
      // Set up relationships
      await this.initializeRelationships();
      
      // Initialize super user permissions
      await this.initializeSuperUserPermissions();
      
      // Initialize AI assistant
      await this.initializeAIAssistant();
      
      this.initialized = true;
      
      await universalAuditService.logAction({
        action: 'system_initialized',
        entityId: 'system',
        entityType: 'system',
        userId: 'system',
        details: {
          organizations: this.systemEntities.length,
          users: this.systemUsers.length
        },
        timestamp: new Date().toISOString()
      });
      
      logger.info('System initialization complete');
    } catch (error) {
      logger.error('System initialization failed:', error);
      throw error;
    }
  }

  private async initializeOrganizations(): Promise<void> {
    for (const entity of this.systemEntities) {
      // Check if already exists
      const existing = await netlifyDatabase.query({
        type: 'organization',
        filters: { 'data.euid': entity.euid }
      });

      if (existing.length > 0) {
        logger.info(`Organization ${entity.euid} already exists`);
        continue;
      }

      // Create organization record
      await netlifyDatabase.create('organization', {
        euid: entity.euid,
        type: entity.type,
        name: entity.name,
        status: EntityStatus.ACTIVE,
        metadata: entity.metadata,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }, 'system');

      // Register EUID (with fixed ID)
      await this.registerFixedEUID(entity.euid, entity.type, 'system');

      logger.info(`Created organization: ${entity.name} (${entity.euid})`);
    }
  }

  private async initializeUsers(): Promise<void> {
    for (const user of this.systemUsers) {
      // Check if already exists
      const existing = await netlifyDatabase.query({
        type: 'user',
        filters: { 'data.euid': user.euid }
      });

      if (existing.length > 0) {
        logger.info(`User ${user.euid} already exists`);
        continue;
      }

      // Create user record
      const userRecord = {
        euid: user.euid,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`,
        role: user.role,
        organizationEUID: user.organizationEUID,
        isSuperUser: user.isSuperUser,
        permissions: user.permissions,
        status: EntityStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      };

      await netlifyDatabase.create('user', userRecord, 'system');

      // Register EUID
      await this.registerFixedEUID(user.euid, EntityType.INDIVIDUAL, 'system');

      // Set up RBAC role
      // Convert '*' to all permissions for super users
      const permissions = user.permissions.includes('*') 
        ? undefined // undefined gives default role permissions
        : user.permissions as Permission[];
        
      await rbacService.assignRole(
        user.euid,
        user.role,
        permissions,
        undefined
      );

      logger.info(`Created user: ${userRecord.fullName} (${user.euid})`);
    }
  }

  private async initializeRelationships(): Promise<void> {
    // Henry Mendoza is CEO of Calao Corp
    await euidService.addRelationships('I00001', [{
      targetEUID: 'C00001',
      type: RelationshipType.CEO,
      startDate: new Date().toISOString()
    }], 'system');

    // Jose and Heather are owners of CoquiProject
    await euidService.addRelationships('I00002', [{
      targetEUID: 'C00002',
      type: RelationshipType.CEO,
      startDate: new Date().toISOString()
    }], 'system');

    await euidService.addRelationships('I00003', [{
      targetEUID: 'C00002',
      type: RelationshipType.CEO,
      startDate: new Date().toISOString()
    }], 'system');

    // Hoower is CEO of Renacer
    await euidService.addRelationships('I00004', [{
      targetEUID: 'N00003',
      type: RelationshipType.CEO,
      startDate: new Date().toISOString()
    }], 'system');

    logger.info('Relationships initialized');
  }

  private async initializeSuperUserPermissions(): Promise<void> {
    // Set up super user permissions for Henry Mendoza
    const superUserPermissions = {
      systemAccess: {
        level: 'super_admin',
        code: 'SA',
        irrevocable: true,
        permissions: ['*'], // All permissions
        canAssignAdmins: true,
        canRevokeAdmins: true,
        canAccessAllOrganizations: true,
        canModifySystemSettings: true
      }
    };

    await netlifyDatabase.create('super_user_permissions', {
      userEUID: 'I00001',
      ...superUserPermissions,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }, 'system');

    logger.info('Super user permissions initialized');
  }

  private async registerFixedEUID(
    euid: string, 
    type: EntityType, 
    userId: string
  ): Promise<void> {
    // Register the EUID in the EUID service
    const euidRecord = {
      full: euid,
      type,
      number: euid.slice(-5), // Last 5 digits
      relationships: [],
      status: EntityStatus.ACTIVE,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: userId,
        isSystemEntity: true
      }
    };

    await netlifyDatabase.create('euid', euidRecord, userId);
  }

  // Initialize AI Assistant
  private async initializeAIAssistant(): Promise<void> {
    logger.info('Initializing AI assistant...');
    await aiAssistantService.initializeSystemAssistant();
    logger.info('AI assistant initialized');
  }

  // Get system owner EUID
  getSystemOwnerEUID(): string {
    return 'C00001';
  }

  // Get super user EUID
  getSuperUserEUID(): string {
    return 'I00001';
  }

  // Check if user is super user
  async isSuperUser(userEUID: string): Promise<boolean> {
    const permissions = await netlifyDatabase.query({
      type: 'super_user_permissions',
      filters: { 'data.userEUID': userEUID }
    });

    return permissions.length > 0;
  }

  // Get user admin code
  async getUserAdminCode(userEUID: string): Promise<string> {
    const isSuperUser = await this.isSuperUser(userEUID);
    
    if (isSuperUser) {
      return 'SA'; // Super Admin
    }

    const user = await netlifyDatabase.query({
      type: 'user',
      filters: { 'data.euid': userEUID }
    });

    if (user.length > 0 && (user[0] as any).data.role === 'admin') {
      return 'A'; // Regular Admin
    }

    return ''; // Not an admin
  }
}

export const systemInitializationService = SystemInitializationService.getInstance();