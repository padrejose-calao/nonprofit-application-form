export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  section?: string;
  field?: string;
}

export interface UserInteraction {
  type: 'click' | 'input' | 'focus' | 'blur' | 'scroll' | 'key';
  element: string;
  timestamp: number;
  section?: string;
  field?: string;
  value?: unknown;
}

export interface FormAnalytics {
  sessionStart: number;
  sessionEnd?: number;
  totalTimeSpent: number;
  sectionsCompleted: string[];
  sectionsVisited: string[];
  fieldsFilled: string[];
  interactions: UserInteraction[];
  performance: PerformanceMetric[];
  errors: Array<{
    field: string;
    error: string;
    timestamp: number;
  }>;
  saveEvents: Array<{
    type: 'auto' | 'manual';
    timestamp: number;
    section?: string;
  }>;
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private analytics: FormAnalytics;
  private performanceObserver?: PerformanceObserver;

  private constructor() {
    this.analytics = {
      sessionStart: Date.now(),
      totalTimeSpent: 0,
      sectionsCompleted: [],
      sectionsVisited: [],
      fieldsFilled: [],
      interactions: [],
      performance: [],
      errors: [],
      saveEvents: [],
    };

    this.initializePerformanceTracking();
    this.startSessionTimer();
  }

  static getInstance(): AnalyticsTracker {
    if (!this.instance) {
      this.instance = new AnalyticsTracker();
    }
    return this.instance;
  }

  private initializePerformanceTracking() {
    // Track Core Web Vitals and other performance metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackPerformance({
            name: entry.name,
            value: entry.duration || (entry as any).value,
          });
        });
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (e) {
        console.warn('Performance observer not supported');
      }
    }

    // Track form-specific performance
    this.measureFormLoadTime();
  }

  private measureFormLoadTime() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        this.trackPerformance({
          name: 'form_load_time',
          value: navigation.loadEventEnd - navigation.loadEventStart,
        });
      });
    }
  }

  private startSessionTimer() {
    setInterval(() => {
      this.analytics.totalTimeSpent = Date.now() - this.analytics.sessionStart;
    }, 1000);
  }

  trackInteraction(interaction: Omit<UserInteraction, 'timestamp'>) {
    this.analytics.interactions.push({
      ...interaction,
      timestamp: Date.now(),
    });
  }

  trackSectionVisit(section: string) {
    if (!this.analytics.sectionsVisited?.includes(section)) {
      this.analytics.sectionsVisited = this.analytics.sectionsVisited || [];
      this.analytics.sectionsVisited.push(section);
    }
  }

  trackSectionCompletion(section: string) {
    if (!this.analytics.sectionsCompleted?.includes(section)) {
      this.analytics.sectionsCompleted = this.analytics.sectionsCompleted || [];
      this.analytics.sectionsCompleted.push(section);
    }
  }

  trackFieldFill(field: string) {
    if (!this.analytics.fieldsFilled?.includes(field)) {
      this.analytics.fieldsFilled = this.analytics.fieldsFilled || [];
      this.analytics.fieldsFilled.push(field);
    }
  }

  trackError(field: string, error: string) {
    this.analytics.errors.push({
      field,
      error,
      timestamp: Date.now(),
    });
  }

  trackSave(type: 'auto' | 'manual', section?: string) {
    this.analytics.saveEvents.push({
      type,
      timestamp: Date.now(),
      section,
    });
  }

  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>) {
    this.analytics.performance.push({
      ...metric,
      timestamp: Date.now(),
    });
  }

  // Track field completion time
  trackFieldCompletionTime(field: string, startTime: number) {
    const completionTime = Date.now() - startTime;
    this.trackPerformance({
      name: 'field_completion_time',
      value: completionTime,
      field,
    });
  }

  // Track section completion time
  trackSectionCompletionTime(section: string, startTime: number) {
    const completionTime = Date.now() - startTime;
    this.trackPerformance({
      name: 'section_completion_time',
      value: completionTime,
      section,
    });
  }

  // Analytics insights
  getCompletionRate(): number {
    const totalSections = 19; // Based on our form analysis
    return (this.analytics.sectionsCompleted.length / totalSections) * 100;
  }

  getAverageTimePerSection(): number {
    return this.analytics.totalTimeSpent / this.analytics.sectionsVisited.length;
  }

  getErrorRate(): number {
    return this.analytics.errors.length / this.analytics.fieldsFilled.length;
  }

  getMostProblematicFields(): Array<{ field: string; errorCount: number }> {
    const fieldErrors: { [field: string]: number } = {};

    this.analytics.errors.forEach((error) => {
      fieldErrors[error.field] = (fieldErrors[error.field] || 0) + 1;
    });

    return Object.entries(fieldErrors)
      .map(([field, errorCount]) => ({ field, errorCount }))
      .sort((a, b) => b.errorCount - a.errorCount);
  }

  getSectionEngagement(): Array<{ section: string; timeSpent: number; visits: number }> {
    const sectionMetrics: { [section: string]: { timeSpent: number; visits: number } } = {};

    this.analytics.interactions.forEach((interaction) => {
      if (interaction.section) {
        if (!sectionMetrics[interaction.section]) {
          sectionMetrics[interaction.section] = { timeSpent: 0, visits: 0 };
        }
        sectionMetrics[interaction.section].visits++;
      }
    });

    return Object.entries(sectionMetrics).map(([section, metrics]) => ({ section, ...metrics }));
  }

  // Export analytics data
  exportAnalytics(): FormAnalytics {
    return {
      ...this.analytics,
      sessionEnd: Date.now(),
    };
  }

  // Generate insights report
  generateInsightsReport() {
    return {
      summary: {
        sessionDuration: this.analytics.totalTimeSpent,
        completionRate: this.getCompletionRate(),
        sectionsCompleted: this.analytics.sectionsCompleted.length,
        sectionsVisited: this.analytics.sectionsVisited.length,
        fieldsCompleted: this.analytics.fieldsFilled.length,
        totalInteractions: this.analytics.interactions.length,
        errorCount: this.analytics.errors.length,
        saveEvents: this.analytics.saveEvents.length,
      },
      performance: {
        averageTimePerSection: this.getAverageTimePerSection(),
        errorRate: this.getErrorRate(),
        mostProblematicFields: this.getMostProblematicFields().slice(0, 5),
        sectionEngagement: this.getSectionEngagement(),
      },
      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const completionRate = this.getCompletionRate();
    const errorRate = this.getErrorRate();
    const avgTimePerSection = this.getAverageTimePerSection();

    if (completionRate < 50) {
      recommendations.push(
        'Consider breaking down long sections into smaller, more manageable parts'
      );
    }

    if (errorRate > 0.1) {
      recommendations.push('Review field validation messages and provide better guidance');
    }

    if (avgTimePerSection > 300000) {
      // 5 minutes
      recommendations.push(
        'Sections may be too complex - consider simplifying or adding progress indicators'
      );
    }

    const problematicFields = this.getMostProblematicFields();
    if (problematicFields.length > 0) {
      recommendations.push(
        `Focus on improving these high-error fields: ${problematicFields
          .slice(0, 3)
          .map((f) => f.field)
          .join(', ')}`
      );
    }

    return recommendations;
  }

  // Clear analytics data
  clearAnalytics() {
    this.analytics = {
      sessionStart: Date.now(),
      totalTimeSpent: 0,
      sectionsCompleted: [],
      sectionsVisited: [],
      fieldsFilled: [],
      interactions: [],
      performance: [],
      errors: [],
      saveEvents: [],
    };
  }
}

// React hooks for easy integration
export const useAnalytics = () => {
  const tracker = AnalyticsTracker.getInstance();

  return {
    trackInteraction: (interaction: Omit<UserInteraction, 'timestamp'>) =>
      tracker.trackInteraction(interaction),
    trackSectionVisit: (section: string) => tracker.trackSectionVisit(section),
    trackSectionCompletion: (section: string) => tracker.trackSectionCompletion(section),
    trackFieldFill: (field: string) => tracker.trackFieldFill(field),
    trackError: (field: string, error: string) => tracker.trackError(field, error),
    trackSave: (type: 'auto' | 'manual', section?: string) => tracker.trackSave(type, section),
    getInsights: () => tracker.generateInsightsReport(),
    exportData: () => tracker.exportAnalytics(),
  };
};

export default AnalyticsTracker;
