import { netlifySettingsService } from './netlifySettingsService';
import { auditLogService } from './auditLogService';
import { logger } from '../utils/logger';

export type Role = 'admin' | 'manager' | 'editor' | 'viewer';
export type Permission = 
  | 'view_all'
  | 'edit_all'
  | 'delete_all'
  | 'manage_users'
  | 'manage_roles'
  | 'view_section'
  | 'edit_section'
  | 'lock_section'
  | 'view_financials'
  | 'edit_financials'
  | 'view_governance'
  | 'edit_governance'
  | 'export_data'
  | 'import_data'
  | 'view_audit_logs'
  | 'manage_settings';

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  sections?: {
    [sectionId: string]: {
      canView: boolean;
      canEdit: boolean;
      canLock: boolean;
      canDelete?: boolean;
    };
  };
  fields?: {
    [fieldId: string]: {
      canView: boolean;
      canEdit: boolean;
    };
  };
}

export interface UserRole {
  userId: string;
  organizationId: string;
  role: Role;
  customPermissions?: Permission[];
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  sections?: {
    [sectionId: string]: {
      canView: boolean;
      canEdit: boolean;
      canLock: boolean;
      canDelete?: boolean;
    };
  };
  fields?: {
    [fieldId: string]: {
      canView: boolean;
      canEdit: boolean;
    };
  };
}

class RBACService {
  private defaultRolePermissions: Record<Role, Permission[]> = {
    admin: [
      'view_all',
      'edit_all',
      'delete_all',
      'manage_users',
      'manage_roles',
      'view_section',
      'edit_section',
      'lock_section',
      'view_financials',
      'edit_financials',
      'view_governance',
      'edit_governance',
      'export_data',
      'import_data',
      'view_audit_logs',
      'manage_settings'
    ],
    manager: [
      'view_all',
      'edit_all',
      'view_section',
      'edit_section',
      'lock_section',
      'view_financials',
      'edit_financials',
      'view_governance',
      'edit_governance',
      'export_data',
      'import_data',
      'view_audit_logs'
    ],
    editor: [
      'view_all',
      'edit_all',
      'view_section',
      'edit_section',
      'view_financials',
      'view_governance',
      'export_data'
    ],
    viewer: [
      'view_all',
      'view_section',
      'view_financials',
      'view_governance',
      'export_data'
    ]
  };

  private sectionPermissions: Record<string, { roles: Role[]; permissions: Permission[] }> = {
    'financials': {
      roles: ['admin', 'manager'],
      permissions: ['view_financials', 'edit_financials']
    },
    'governance': {
      roles: ['admin', 'manager'],
      permissions: ['view_governance', 'edit_governance']
    },
    'compliance': {
      roles: ['admin', 'manager', 'editor'],
      permissions: ['view_section', 'edit_section']
    }
  };

  private userRoles: Map<string, UserRole> = new Map();
  private organizationId: string = '';
  private currentUserId: string = '';
  private initialized: boolean = false;

  async initialize(organizationId: string, userId: string): Promise<void> {
    this.organizationId = organizationId;
    this.currentUserId = userId;
    
    // Load user roles from storage
    await this.loadUserRoles();
    
    this.initialized = true;
  }

  private async loadUserRoles(): Promise<void> {
    try {
      const storedRoles = await netlifySettingsService.get(`rbac_roles_${this.organizationId}`);
      if (storedRoles && Array.isArray(storedRoles)) {
        storedRoles.forEach(role => {
          this.userRoles.set(role.userId, {
            ...role,
            assignedAt: new Date(role.assignedAt),
            expiresAt: role.expiresAt ? new Date(role.expiresAt) : undefined
          });
        });
      }
    } catch (error) {
      logger.error('Failed to load user roles:', error);
    }
  }

  private async saveUserRoles(): Promise<void> {
    try {
      const rolesArray = Array.from(this.userRoles.values());
      await netlifySettingsService.set(
        `rbac_roles_${this.organizationId}`,
        rolesArray,
        'organization'
      );
    } catch (error) {
      logger.error('Failed to save user roles:', error);
    }
  }

  async assignRole(
    userId: string,
    role: Role,
    customPermissions?: Permission[],
    expiresAt?: Date
  ): Promise<boolean> {
    if (!this.hasPermission('manage_roles')) {
      logger.error('Current user lacks permission to manage roles');
      return false;
    }

    const userRole: UserRole = {
      userId,
      organizationId: this.organizationId,
      role,
      customPermissions,
      assignedBy: this.currentUserId,
      assignedAt: new Date(),
      expiresAt
    };

    this.userRoles.set(userId, userRole);
    await this.saveUserRoles();

    // Log the role assignment
    await auditLogService.logAction({
      action: 'update',
      resource: 'user_role',
      resourceId: userId,
      metadata: {
        role,
        customPermissions,
        expiresAt: expiresAt?.toISOString()
      },
      result: 'success'
    });

    return true;
  }

  async revokeRole(userId: string): Promise<boolean> {
    if (!this.hasPermission('manage_roles')) {
      logger.error('Current user lacks permission to manage roles');
      return false;
    }

    const existingRole = this.userRoles.get(userId);
    if (!existingRole) {
      return false;
    }

    this.userRoles.delete(userId);
    await this.saveUserRoles();

    // Log the role revocation
    await auditLogService.logAction({
      action: 'delete',
      resource: 'user_role',
      resourceId: userId,
      metadata: {
        previousRole: existingRole.role
      },
      result: 'success'
    });

    return true;
  }

  getUserRole(userId?: string): UserRole | undefined {
    const targetUserId = userId || this.currentUserId;
    const role = this.userRoles.get(targetUserId);
    
    // Check if role has expired
    if (role && role.expiresAt && new Date() > role.expiresAt) {
      this.userRoles.delete(targetUserId);
      return undefined;
    }
    
    return role;
  }

  getRolePermissions(role: Role): Permission[] {
    return this.defaultRolePermissions[role] || [];
  }

  hasPermission(permission: Permission, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    const rolePermissions = this.getRolePermissions(userRole.role);
    const customPermissions = userRole.customPermissions || [];
    const allPermissions = [...rolePermissions, ...customPermissions];

    return allPermissions.includes(permission);
  }

  canViewSection(sectionId: string, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Admins can view everything
    if (userRole.role === 'admin') {
      return true;
    }

    // Check section-specific permissions
    const sectionPerms = this.sectionPermissions[sectionId];
    if (sectionPerms) {
      return sectionPerms.roles.includes(userRole.role) || 
             this.hasPermission('view_section', userId);
    }

    // Default to checking general view permission
    return this.hasPermission('view_section', userId) || 
           this.hasPermission('view_all', userId);
  }

  canEditSection(sectionId: string, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Admins can edit everything
    if (userRole.role === 'admin') {
      return true;
    }

    // Viewers can't edit
    if (userRole.role === 'viewer') {
      return false;
    }

    // Check section-specific permissions
    const sectionPerms = this.sectionPermissions[sectionId];
    if (sectionPerms) {
      const canEdit = sectionPerms.permissions.some(p => p.includes('edit'));
      return sectionPerms.roles.includes(userRole.role) && canEdit;
    }

    // Default to checking general edit permission
    return this.hasPermission('edit_section', userId) || 
           this.hasPermission('edit_all', userId);
  }

  canLockSection(sectionId: string, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Only admins and managers can lock sections
    return ['admin', 'manager'].includes(userRole.role) && 
           this.hasPermission('lock_section', userId);
  }

  canViewField(fieldId: string, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Check custom field permissions
    if (userRole.role === 'admin' || this.hasPermission('view_all', userId)) {
      return true;
    }

    // Check field-specific permissions if defined
    const fieldPerms = userRole.fields?.[fieldId];
    if (fieldPerms) {
      return fieldPerms.canView;
    }

    // Default to section or general view permissions
    return this.hasPermission('view_section', userId);
  }

  canEditField(fieldId: string, userId?: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return false;
    }

    // Viewers can't edit fields
    if (userRole.role === 'viewer') {
      return false;
    }

    // Check custom field permissions
    if (userRole.role === 'admin' || this.hasPermission('edit_all', userId)) {
      return true;
    }

    // Check field-specific permissions if defined
    const fieldPerms = userRole.fields?.[fieldId];
    if (fieldPerms) {
      return fieldPerms.canEdit;
    }

    // Default to section or general edit permissions
    return this.hasPermission('edit_section', userId);
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    if (!this.hasPermission('manage_roles')) {
      return [];
    }

    return Array.from(this.userRoles.values());
  }

  async updateCustomPermissions(
    userId: string,
    customPermissions: Permission[]
  ): Promise<boolean> {
    if (!this.hasPermission('manage_roles')) {
      return false;
    }

    const userRole = this.userRoles.get(userId);
    if (!userRole) {
      return false;
    }

    userRole.customPermissions = customPermissions;
    await this.saveUserRoles();

    // Log the permission update
    await auditLogService.logAction({
      action: 'update',
      resource: 'user_permissions',
      resourceId: userId,
      metadata: {
        customPermissions
      },
      result: 'success'
    });

    return true;
  }

  async setSectionPermissions(
    sectionId: string,
    roles: Role[],
    permissions: Permission[]
  ): Promise<boolean> {
    if (!this.hasPermission('manage_roles')) {
      return false;
    }

    this.sectionPermissions[sectionId] = { roles, permissions };
    
    // Save section permissions
    await netlifySettingsService.set(
      `rbac_section_permissions_${this.organizationId}`,
      this.sectionPermissions,
      'organization'
    );

    return true;
  }

  getRoleHierarchy(): Role[] {
    return ['admin', 'manager', 'editor', 'viewer'];
  }

  isRoleHigherOrEqual(role1: Role, role2: Role): boolean {
    const hierarchy = this.getRoleHierarchy();
    const index1 = hierarchy.indexOf(role1);
    const index2 = hierarchy.indexOf(role2);
    return index1 <= index2;
  }

  // Utility method to check if current user can manage another user
  canManageUser(targetUserId: string): boolean {
    if (!this.hasPermission('manage_users')) {
      return false;
    }

    const currentRole = this.getUserRole();
    const targetRole = this.getUserRole(targetUserId);

    if (!currentRole || !targetRole) {
      return false;
    }

    // Can only manage users with lower or equal roles
    return this.isRoleHigherOrEqual(currentRole.role, targetRole.role);
  }
}

export const rbacService = new RBACService();