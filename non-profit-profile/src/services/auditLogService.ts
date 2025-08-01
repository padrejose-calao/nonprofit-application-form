import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'login' | 'logout' | string;
  resource: string;
  resourceId?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    organizationId?: string;
    [key: string]: unknown;
  };
  result: 'success' | 'failure';
  errorMessage?: string;
}

interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  result?: 'success' | 'failure';
}

class AuditLogService {
  private organizationId: string = '';
  private userId: string = '';
  private userName: string = '';
  private sessionId: string = '';
  private logQueue: AuditLogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private maxQueueSize: number = 50;
  private flushIntervalMs: number = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushInterval();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize(organizationId: string, userId: string, userName: string): void {
    this.organizationId = organizationId;
    this.userId = userId;
    this.userName = userName;
    
    // Log login event
    this.logAction({
      action: 'login',
      resource: 'authentication',
      result: 'success'
    });
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushQueue();
    }, this.flushIntervalMs);
  }

  async logAction(params: {
    action: string;
    resource: string;
    resourceId?: string;
    changes?: AuditLogEntry['changes'];
    metadata?: Record<string, unknown>;
    result: 'success' | 'failure';
    errorMessage?: string;
  }): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: this.userId,
      userName: this.userName,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      changes: params.changes,
      metadata: {
        ...params.metadata,
        sessionId: this.sessionId,
        organizationId: this.organizationId,
        userAgent: navigator.userAgent,
        ipAddress: 'client' // In production, this would come from the server
      },
      result: params.result,
      errorMessage: params.errorMessage
    };

    this.logQueue.push(entry);

    // Flush if queue is getting large
    if (this.logQueue.length >= this.maxQueueSize) {
      await this.flushQueue();
    }
  }

  async logFieldChange(
    resource: string,
    resourceId: string,
    field: string,
    oldValue: unknown,
    newValue: unknown
  ): Promise<void> {
    await this.logAction({
      action: 'update',
      resource,
      resourceId,
      changes: [{
        field,
        oldValue,
        newValue
      }],
      result: 'success'
    });
  }

  async logBulkChanges(
    resource: string,
    resourceId: string,
    changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
  ): Promise<void> {
    await this.logAction({
      action: 'update',
      resource,
      resourceId,
      changes,
      result: 'success'
    });
  }

  private async flushQueue(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const entriesToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      // Get existing logs
      const existingLogs = await this.getStoredLogs();
      
      // Add new entries
      const updatedLogs = [...existingLogs, ...entriesToFlush];
      
      // Keep only logs from the last 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      const recentLogs = updatedLogs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );

      // Store updated logs
      await netlifySettingsService.set(
        `audit_logs_${this.organizationId}`,
        recentLogs,
        'organization'
      );

      logger.debug(`Flushed ${entriesToFlush.length} audit log entries`);
    } catch (error) {
      logger.error('Failed to flush audit logs:', error);
      // Re-add entries to queue for retry
      this.logQueue = [...entriesToFlush, ...this.logQueue];
    }
  }

  private async getStoredLogs(): Promise<AuditLogEntry[]> {
    try {
      const logs = await netlifySettingsService.get(`audit_logs_${this.organizationId}`);
      if (!logs || !Array.isArray(logs)) return [];
      
      return logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to load audit logs:', error);
      return [];
    }
  }

  async getAuditLogs(filter?: AuditLogFilter): Promise<AuditLogEntry[]> {
    // Flush any pending logs first
    await this.flushQueue();
    
    const logs = await this.getStoredLogs();
    
    if (!filter) return logs;

    return logs.filter(log => {
      if (filter.startDate && new Date(log.timestamp) < filter.startDate) return false;
      if (filter.endDate && new Date(log.timestamp) > filter.endDate) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.resource && log.resource !== filter.resource) return false;
      if (filter.result && log.result !== filter.result) return false;
      return true;
    });
  }

  async getUserActivity(userId: string, days: number = 30): Promise<AuditLogEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getAuditLogs({
      userId,
      startDate
    });
  }

  async getResourceHistory(resource: string, resourceId: string): Promise<AuditLogEntry[]> {
    const logs = await this.getAuditLogs({ resource });
    return logs.filter(log => log.resourceId === resourceId);
  }

  async getFailedActions(days: number = 7): Promise<AuditLogEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getAuditLogs({
      startDate,
      result: 'failure'
    });
  }

  async generateAuditReport(filter?: AuditLogFilter): Promise<{
    summary: {
      totalActions: number;
      successfulActions: number;
      failedActions: number;
      uniqueUsers: number;
      actionBreakdown: Record<string, number>;
      resourceBreakdown: Record<string, number>;
    };
    logs: AuditLogEntry[];
  }> {
    const logs = await this.getAuditLogs(filter);
    
    const summary = {
      totalActions: logs.length,
      successfulActions: logs.filter(l => l.result === 'success').length,
      failedActions: logs.filter(l => l.result === 'failure').length,
      uniqueUsers: new Set(logs.map(l => l.userId)).size,
      actionBreakdown: {} as Record<string, number>,
      resourceBreakdown: {} as Record<string, number>
    };

    // Count actions
    logs.forEach(log => {
      summary.actionBreakdown[log.action] = (summary.actionBreakdown[log.action] || 0) + 1;
      summary.resourceBreakdown[log.resource] = (summary.resourceBreakdown[log.resource] || 0) + 1;
    });

    return { summary, logs };
  }

  async exportAuditLogs(
    format: 'json' | 'csv',
    filter?: AuditLogFilter
  ): Promise<string> {
    const logs = await this.getAuditLogs(filter);
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }
    
    // CSV format
    const headers = [
      'ID', 'Timestamp', 'User ID', 'User Name', 'Action', 
      'Resource', 'Resource ID', 'Result', 'Error Message'
    ];
    
    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.userId,
      log.userName,
      log.action,
      log.resource,
      log.resourceId || '',
      log.result,
      log.errorMessage || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }

  async cleanup(): Promise<void> {
    // Flush any remaining logs
    await this.flushQueue();
    
    // Log logout event
    await this.logAction({
      action: 'logout',
      resource: 'authentication',
      result: 'success'
    });
    
    // Final flush
    await this.flushQueue();
    
    // Clear interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }

  // Compliance helpers
  async getComplianceReport(days: number = 90): Promise<{
    dataAccess: AuditLogEntry[];
    dataModifications: AuditLogEntry[];
    dataExports: AuditLogEntry[];
    failedSecurityEvents: AuditLogEntry[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await this.getAuditLogs({ startDate });
    
    return {
      dataAccess: logs.filter(l => l.action === 'view'),
      dataModifications: logs.filter(l => 
        ['create', 'update', 'delete'].includes(l.action)
      ),
      dataExports: logs.filter(l => l.action === 'export'),
      failedSecurityEvents: logs.filter(l => 
        l.result === 'failure' && 
        ['login', 'view', 'export'].includes(l.action)
      )
    };
  }
}

export const auditLogService = new AuditLogService();