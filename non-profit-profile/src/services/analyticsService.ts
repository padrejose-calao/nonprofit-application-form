import { netlifySettingsService } from './netlifySettingsService';
import { auditLogService } from './auditLogService';

// Type definitions for better type safety
interface FormData {
  sectionProgress?: Record<string, number>;
  formData?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuditLog {
  userId: string;
  userName: string;
  resource: string;
  timestamp: string;
  action: string;
  changes?: Array<{
    field: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface UserActivityData {
  userId: string;
  userName: string;
  totalEdits: number;
  sectionsEdited: Set<string>;
  lastActive: Date;
  sessions: unknown[];
}

interface Document {
  fileName: string;
  uploadDate?: string;
  uploadedBy?: string;
  size?: number;
  fileType?: string;
  [key: string]: unknown;
}

interface AnalyticsCacheData {
  data: AnalyticsData;
  timestamp: number;
}

export interface AnalyticsData {
  overview: {
    totalSections: number;
    completedSections: number;
    inProgressSections: number;
    overallProgress: number;
    lastUpdated: Date;
    totalFields: number;
    completedFields: number;
    emptyFields: number;
  };
  sectionMetrics: Array<{
    sectionId: string;
    sectionName: string;
    progress: number;
    totalFields: number;
    completedFields: number;
    timeSpent: number;
    lastModified: Date;
    modifiedBy: string;
  }>;
  userActivity: Array<{
    userId: string;
    userName: string;
    totalEdits: number;
    sectionsEdited: string[];
    lastActive: Date;
    averageSessionTime: number;
  }>;
  timeMetrics: {
    totalTimeSpent: number;
    averageTimePerSection: number;
    fastestSection: { name: string; time: number };
    slowestSection: { name: string; time: number };
    timeByDay: Array<{ date: string; minutes: number }>;
    peakHours: Array<{ hour: number; activity: number }>;
  };
  completionTrends: Array<{
    date: string;
    overallProgress: number;
    sectionsCompleted: number;
    fieldsCompleted: number;
  }>;
  fieldAnalytics: {
    mostEditedFields: Array<{ field: string; edits: number }>;
    frequentlyEmptyFields: Array<{ field: string; emptyRate: number }>;
    validationErrors: Array<{ field: string; errors: number }>;
  };
  documentStats: {
    totalDocuments: number;
    documentsByType: Record<string, number>;
    totalSize: number;
    recentUploads: Array<{
      fileName: string;
      uploadDate: Date;
      uploadedBy: string;
      size: number;
    }>;
  };
}

class AnalyticsService {
  private organizationId: string = '';
  private analyticsCache: Map<string, AnalyticsCacheData> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async initialize(organizationId: string): Promise<void> {
    this.organizationId = organizationId;
  }

  async getAnalytics(dateRange?: { start: Date; end: Date }): Promise<AnalyticsData> {
    const cacheKey = `analytics_${dateRange?.start?.toISOString()}_${dateRange?.end?.toISOString()}`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const analytics = await this.calculateAnalytics(dateRange);
    this.analyticsCache.set(cacheKey, { data: analytics, timestamp: Date.now() });
    
    return analytics;
  }

  private async calculateAnalytics(dateRange?: { start: Date; end: Date }): Promise<AnalyticsData> {
    // Get form data
    const formData = await netlifySettingsService.get('nonprofitApplicationData') as FormData | null;
    const sectionProgress = formData?.sectionProgress || {};
    const fields = formData?.formData || {};
    
    // Get audit logs
    const auditLogEntries = await auditLogService.getAuditLogs(
      dateRange ? { startDate: dateRange.start, endDate: dateRange.end } : undefined
    );
    const auditLogs = auditLogEntries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    })) as AuditLog[];

    // Calculate overview metrics
    const overview = this.calculateOverview(sectionProgress, fields);
    
    // Calculate section metrics
    const sectionMetrics = this.calculateSectionMetrics(sectionProgress, fields, auditLogs);
    
    // Calculate user activity
    const userActivity = this.calculateUserActivity(auditLogs);
    
    // Calculate time metrics
    const timeMetrics = this.calculateTimeMetrics(auditLogs);
    
    // Calculate completion trends
    const completionTrends = await this.calculateCompletionTrends();
    
    // Calculate field analytics
    const fieldAnalytics = this.calculateFieldAnalytics(fields, auditLogs);
    
    // Calculate document stats
    const documentStats = await this.calculateDocumentStats();

    return {
      overview,
      sectionMetrics,
      userActivity,
      timeMetrics,
      completionTrends,
      fieldAnalytics,
      documentStats
    };
  }

  private calculateOverview(sectionProgress: Record<string, number>, fields: Record<string, unknown>): AnalyticsData['overview'] {
    const sections = Object.keys(sectionProgress);
    const totalSections = sections.length;
    const completedSections = sections.filter(s => sectionProgress[s] === 100).length;
    const inProgressSections = sections.filter(s => sectionProgress[s] > 0 && sectionProgress[s] < 100).length;
    
    const overallProgress = totalSections > 0 
      ? Math.round(sections.reduce((sum, s) => sum + (sectionProgress[s] || 0), 0) / totalSections)
      : 0;

    const fieldStats = this.countFields(fields);

    return {
      totalSections,
      completedSections,
      inProgressSections,
      overallProgress,
      lastUpdated: new Date(),
      totalFields: fieldStats.total,
      completedFields: fieldStats.completed,
      emptyFields: fieldStats.empty
    };
  }

  private countFields(obj: Record<string, unknown>, prefix = ''): { total: number; completed: number; empty: number } {
    let total = 0;
    let completed = 0;
    let empty = 0;

    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const nested = this.countFields(value as Record<string, unknown>, `${prefix}${key}.`);
        total += nested.total;
        completed += nested.completed;
        empty += nested.empty;
      } else {
        total++;
        if (value === null || value === undefined || value === '') {
          empty++;
        } else {
          completed++;
        }
      }
    });

    return { total, completed, empty };
  }

  private calculateSectionMetrics(
    sectionProgress: Record<string, number>, 
    fields: Record<string, unknown>, 
    auditLogs: AuditLog[]
  ): AnalyticsData['sectionMetrics'] {
    const sectionNames: Record<string, string> = {
      basicInfo: 'Basic Information',
      narrative: 'Narrative',
      governance: 'Governance',
      management: 'Management',
      financials: 'Financials',
      programs: 'Programs',
      impact: 'Impact',
      compliance: 'Compliance',
      technology: 'Technology',
      communications: 'Communications',
      riskManagement: 'Risk Management'
    };

    return Object.keys(sectionProgress).map(sectionId => {
      const sectionLogs = auditLogs.filter(log => 
        log.resource === sectionId || log.resource.startsWith(`${sectionId}.`)
      );

      const lastLog = sectionLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      const sectionFields = (fields[sectionId] || {}) as Record<string, unknown>;
      const fieldStats = this.countFields(sectionFields);

      // Calculate time spent (simplified - in production, use actual session tracking)
      const timeSpent = sectionLogs.length * 2; // 2 minutes per edit average

      return {
        sectionId,
        sectionName: sectionNames[sectionId] || sectionId,
        progress: sectionProgress[sectionId] || 0,
        totalFields: fieldStats.total,
        completedFields: fieldStats.completed,
        timeSpent,
        lastModified: lastLog ? new Date(lastLog.timestamp) : new Date(0),
        modifiedBy: lastLog?.userName || 'Unknown'
      };
    });
  }

  private calculateUserActivity(auditLogs: AuditLog[]): AnalyticsData['userActivity'] {
    const userMap = new Map<string, UserActivityData>();

    auditLogs.forEach(log => {
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, {
          userId: log.userId,
          userName: log.userName,
          totalEdits: 0,
          sectionsEdited: new Set<string>(),
          lastActive: new Date(0),
          sessions: []
        });
      }

      const user = userMap.get(log.userId);
      if (user) {
        user.totalEdits++;
        user.sectionsEdited.add(log.resource.split('.')[0]);
        
        const logDate = new Date(log.timestamp);
        if (logDate > user.lastActive) {
          user.lastActive = logDate;
        }
      }
    });

    return Array.from(userMap.values()).map(user => ({
      userId: user.userId,
      userName: user.userName,
      totalEdits: user.totalEdits,
      sectionsEdited: Array.from(user.sectionsEdited),
      lastActive: user.lastActive,
      averageSessionTime: 30 // Simplified - 30 minutes average
    }));
  }

  private calculateTimeMetrics(auditLogs: AuditLog[]): AnalyticsData['timeMetrics'] {
    const sectionTimes = new Map<string, number>();
    const dayActivity = new Map<string, number>();
    const hourActivity = new Map<number, number>();

    auditLogs.forEach(log => {
      const section = log.resource.split('.')[0];
      sectionTimes.set(section, (sectionTimes.get(section) || 0) + 2); // 2 min per edit

      const date = new Date(log.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      dayActivity.set(dayKey, (dayActivity.get(dayKey) || 0) + 2);

      const hour = date.getHours();
      hourActivity.set(hour, (hourActivity.get(hour) || 0) + 1);
    });

    const sortedSections = Array.from(sectionTimes.entries()).sort((a, b) => a[1] - b[1]);
    const totalTime = Array.from(sectionTimes.values()).reduce((sum, time) => sum + time, 0);

    return {
      totalTimeSpent: totalTime,
      averageTimePerSection: sectionTimes.size > 0 ? totalTime / sectionTimes.size : 0,
      fastestSection: sortedSections[0] ? { name: sortedSections[0][0], time: sortedSections[0][1] } : { name: 'N/A', time: 0 },
      slowestSection: sortedSections[sortedSections.length - 1] ? { name: sortedSections[sortedSections.length - 1][0], time: sortedSections[sortedSections.length - 1][1] } : { name: 'N/A', time: 0 },
      timeByDay: Array.from(dayActivity.entries()).map(([date, minutes]) => ({ date, minutes })),
      peakHours: Array.from(hourActivity.entries()).map(([hour, activity]) => ({ hour, activity })).sort((a, b) => b.activity - a.activity).slice(0, 5)
    };
  }

  private async calculateCompletionTrends(): Promise<AnalyticsData['completionTrends']> {
    // Get historical snapshots (simplified - in production, store periodic snapshots)
    const trends: AnalyticsData['completionTrends'] = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate progress growth
      const daysFromStart = 30 - i;
      const progress = Math.min(100, daysFromStart * 3.3);
      const sectionsCompleted = Math.floor(progress / 100 * 11);
      const fieldsCompleted = Math.floor(progress / 100 * 150);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        overallProgress: Math.round(progress),
        sectionsCompleted,
        fieldsCompleted
      });
    }
    
    return trends;
  }

  private calculateFieldAnalytics(fields: Record<string, unknown>, auditLogs: AuditLog[]): AnalyticsData['fieldAnalytics'] {
    const fieldEdits = new Map<string, number>();
    const fieldEmpty = new Map<string, { empty: number; total: number }>();
    const fieldErrors = new Map<string, number>();

    // Count edits per field
    auditLogs.filter(log => log.action === 'update').forEach(log => {
      if (log.changes && log.changes.length > 0) {
        log.changes.forEach((change) => {
          const fieldKey = `${log.resource}.${change.field}`;
          fieldEdits.set(fieldKey, (fieldEdits.get(fieldKey) || 0) + 1);
        });
      }
    });

    // Analyze field emptiness
    this.analyzeFieldEmptiness(fields, '', fieldEmpty);

    // Mock validation errors (in production, track actual validation failures)
    const commonFields = ['ein', 'email', 'phone', 'website'];
    commonFields.forEach(field => {
      fieldErrors.set(field, Math.floor(Math.random() * 10));
    });

    return {
      mostEditedFields: Array.from(fieldEdits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([field, edits]) => ({ field, edits })),
      frequentlyEmptyFields: Array.from(fieldEmpty.entries())
        .map(([field, stats]) => ({ 
          field, 
          emptyRate: stats.total > 0 ? (stats.empty / stats.total) * 100 : 0 
        }))
        .filter(f => f.emptyRate > 50)
        .sort((a, b) => b.emptyRate - a.emptyRate)
        .slice(0, 10),
      validationErrors: Array.from(fieldErrors.entries())
        .filter(([_, errors]) => errors > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([field, errors]) => ({ field, errors }))
    };
  }

  private analyzeFieldEmptiness(
    obj: Record<string, unknown>, 
    prefix: string, 
    fieldEmpty: Map<string, { empty: number; total: number }>
  ): void {
    Object.entries(obj).forEach(([key, value]) => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        this.analyzeFieldEmptiness(value as Record<string, unknown>, fieldPath, fieldEmpty);
      } else {
        const stats = fieldEmpty.get(fieldPath) || { empty: 0, total: 0 };
        stats.total++;
        if (value === null || value === undefined || value === '') {
          stats.empty++;
        }
        fieldEmpty.set(fieldPath, stats);
      }
    });
  }

  private async calculateDocumentStats(): Promise<AnalyticsData['documentStats']> {
    const documents = await netlifySettingsService.get('documents') as Document[] || [];
    
    const documentsByType = documents.reduce((acc: Record<string, number>, doc: Document) => {
      const type = doc.fileType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const totalSize = documents.reduce((sum: number, doc: Document) => sum + (doc.size || 0), 0);

    const recentUploads = documents
      .filter((doc: Document) => doc.uploadDate)
      .sort((a: Document, b: Document) => 
        new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime()
      )
      .slice(0, 5)
      .map((doc: Document) => ({
        fileName: doc.fileName,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
        uploadedBy: doc.uploadedBy || 'Unknown',
        size: doc.size || 0
      }));

    return {
      totalDocuments: documents.length,
      documentsByType,
      totalSize,
      recentUploads
    };
  }

  async generateReport(
    type: 'summary' | 'detailed' | 'executive',
    dateRange?: { start: Date; end: Date }
  ): Promise<string> {
    const analytics = await this.getAnalytics(dateRange);
    
    switch (type) {
      case 'executive':
        return this.generateExecutiveReport(analytics);
      case 'detailed':
        return this.generateDetailedReport(analytics);
      default:
        return this.generateSummaryReport(analytics);
    }
  }

  private generateSummaryReport(analytics: AnalyticsData): string {
    return `
# Nonprofit Application Analytics Summary

Generated: ${new Date().toLocaleString()}

## Overview
- Overall Progress: ${analytics.overview.overallProgress}%
- Sections Completed: ${analytics.overview.completedSections}/${analytics.overview.totalSections}
- Fields Completed: ${analytics.overview.completedFields}/${analytics.overview.totalFields}

## Top Metrics
- Total Time Spent: ${Math.round(analytics.timeMetrics.totalTimeSpent / 60)} hours
- Most Active Users: ${analytics.userActivity.slice(0, 3).map(u => u.userName).join(', ')}
- Fastest Section: ${analytics.timeMetrics.fastestSection.name}
- Documents Uploaded: ${analytics.documentStats.totalDocuments}
    `;
  }

  private generateDetailedReport(analytics: AnalyticsData): string {
    // Generate comprehensive report with all metrics
    return JSON.stringify(analytics, null, 2);
  }

  private generateExecutiveReport(analytics: AnalyticsData): string {
    const completionRate = analytics.overview.overallProgress;
    const timeToComplete = completionRate > 0 
      ? Math.round((analytics.timeMetrics.totalTimeSpent / completionRate) * (100 - completionRate) / 60)
      : 0;

    return `
# Executive Summary - Nonprofit Application Status

Date: ${new Date().toLocaleDateString()}

## Key Performance Indicators
- **Application Completion**: ${completionRate}%
- **Estimated Time to Complete**: ${timeToComplete} hours
- **Active Contributors**: ${analytics.userActivity.length}
- **Document Readiness**: ${analytics.documentStats.totalDocuments} documents uploaded

## Risk Areas
${analytics.fieldAnalytics.frequentlyEmptyFields.slice(0, 3).map(f => 
  `- ${f.field}: ${Math.round(f.emptyRate)}% incomplete`
).join('\n')}

## Recommendations
1. Focus on completing ${analytics.overview.totalSections - analytics.overview.completedSections} remaining sections
2. Address ${analytics.overview.emptyFields} empty fields
3. Review validation errors in critical fields
    `;
  }

  async exportAnalytics(format: 'json' | 'csv' | 'pdf'): Promise<Blob> {
    const analytics = await this.getAnalytics();
    
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
      
      case 'csv':
        // Convert to CSV format
        const csv = this.convertToCSV(analytics);
        return new Blob([csv], { type: 'text/csv' });
      
      case 'pdf':
        // Generate PDF report (in production, use a PDF library)
        const html = this.generateHTMLReport(analytics);
        return new Blob([html], { type: 'text/html' });
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private convertToCSV(analytics: AnalyticsData): string {
    // Simplified CSV conversion
    const rows = [
      ['Metric', 'Value'],
      ['Overall Progress', analytics.overview.overallProgress + '%'],
      ['Completed Sections', analytics.overview.completedSections.toString()],
      ['Total Fields', analytics.overview.totalFields.toString()],
      ['Completed Fields', analytics.overview.completedFields.toString()],
      ['Total Documents', analytics.documentStats.totalDocuments.toString()],
      ['Active Users', analytics.userActivity.length.toString()]
    ];
    
    return rows.map(row => row.join(',')).join('\n');
  }

  private generateHTMLReport(analytics: AnalyticsData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1, h2 { color: #333; }
    .metric { margin: 10px 0; }
    .progress { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; }
    .progress-bar { background: #4CAF50; height: 100%; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Nonprofit Application Analytics Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <h2>Overview</h2>
  <div class="metric">Overall Progress: ${analytics.overview.overallProgress}%</div>
  <div class="progress">
    <div class="progress-bar" style="width: ${analytics.overview.overallProgress}%"></div>
  </div>
  
  <h2>Section Progress</h2>
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Progress</th>
        <th>Time Spent</th>
        <th>Last Modified</th>
      </tr>
    </thead>
    <tbody>
      ${analytics.sectionMetrics.map(section => `
        <tr>
          <td>${section.sectionName}</td>
          <td>${section.progress}%</td>
          <td>${section.timeSpent} min</td>
          <td>${new Date(section.lastModified).toLocaleDateString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>User Activity</h2>
  <table>
    <thead>
      <tr>
        <th>User</th>
        <th>Total Edits</th>
        <th>Sections Edited</th>
        <th>Last Active</th>
      </tr>
    </thead>
    <tbody>
      ${analytics.userActivity.map(user => `
        <tr>
          <td>${user.userName}</td>
          <td>${user.totalEdits}</td>
          <td>${user.sectionsEdited.length}</td>
          <td>${new Date(user.lastActive).toLocaleDateString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;
  }
}

export const analyticsService = new AnalyticsService();