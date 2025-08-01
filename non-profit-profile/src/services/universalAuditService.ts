/**
 * Universal Audit Service
 * Compatibility layer for existing code - auditLogService now supports flexible action types directly
 * @deprecated Use auditLogService directly for new code
 */

import { auditLogService } from './auditLogService';
import { logger } from '../utils/logger';

export interface UniversalAuditEntry {
  action: string;
  entityId: string;
  entityType: string;
  userId: string;
  details?: unknown;
  timestamp: string;
}

class UniversalAuditService {
  private static instance: UniversalAuditService;

  private constructor() {}

  static getInstance(): UniversalAuditService {
    if (!UniversalAuditService.instance) {
      UniversalAuditService.instance = new UniversalAuditService();
    }
    return UniversalAuditService.instance;
  }

  /**
   * Map universal audit entry to standard audit log format
   */
  private mapToStandardFormat(entry: UniversalAuditEntry): {
    action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'login' | 'logout';
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    result: 'success' | 'failure';
  } {
    // Map custom actions to standard actions
    const actionMapping: Record<string, 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'login' | 'logout'> = {
      // Creation actions
      'euid_created': 'create',
      'ai_assistant_initialized': 'create',
      'ai_assistant_created': 'create',
      'doe_identity_assigned': 'create',
      'api_registered': 'create',
      'event_created': 'create',
      'euid_prefix_created': 'create',
      'system_initialized': 'create',
      
      // Update actions
      'euid_relationships_added': 'update',
      'euid_status_changed': 'update',
      'ai_model_added': 'update',
      'ai_model_retired': 'update',
      'corruption_recovery_success': 'update',
      'event_updated': 'update',
      'euid_prefix_retired': 'update',
      
      // Delete actions
      'euid_deleted': 'delete',
      'euid_purged': 'delete',
      'record_quarantined': 'delete',
      
      // View/Access actions
      'ai_interaction': 'view',
      
      // System actions default to update
      'euid_manual_override_undelete': 'update',
      'euid_manual_override_unreserve': 'update',
      'euid_manual_override_forceRetire': 'update'
    };

    return {
      action: actionMapping[entry.action] || 'update',
      resource: entry.entityType,
      resourceId: entry.entityId,
      metadata: {
        originalAction: entry.action,
        userId: entry.userId,
        timestamp: entry.timestamp,
        ...(entry.details || {})
      } as Record<string, unknown>,
      result: 'success' as const
    };
  }

  /**
   * Log an action with flexible format
   */
  async logAction(entry: UniversalAuditEntry): Promise<void> {
    try {
      // Since auditLogService now supports flexible action types, we can pass the action directly
      await auditLogService.logAction({
        action: entry.action,
        resource: entry.entityType,
        resourceId: entry.entityId,
        metadata: {
          userId: entry.userId,
          timestamp: entry.timestamp,
          ...(entry.details || {})
        } as Record<string, unknown>,
        result: 'success' as const
      });
    } catch (error) {
      logger.error('Failed to log audit entry:', error);
      // Fallback: log as update if mapping fails
      try {
        await auditLogService.logAction({
          action: 'update',
          resource: entry.entityType,
          resourceId: entry.entityId,
          metadata: {
            customAction: entry.action,
            ...entry
          },
          result: 'success'
        });
      } catch (fallbackError) {
        logger.error('Fallback audit logging also failed:', fallbackError);
      }
    }
  }

  /**
   * Convenience method for logging with current timestamp
   */
  async log(
    action: string,
    entityId: string,
    entityType: string,
    userId: string,
    details?: unknown
  ): Promise<void> {
    await this.logAction({
      action,
      entityId,
      entityType,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

export const universalAuditService = UniversalAuditService.getInstance();