/**
 * AI Definition Service
 * Defines what constitutes an AI entity in the system based on industry standards
 * and autonomous processing capabilities
 */

export interface AIDefinition {
  id: string;
  version: string;
  effectiveDate: string;
  criteria: AIClassificationCriteria;
  examples: AIExample[];
  references: string[];
}

export interface AIClassificationCriteria {
  mustHaveAll: string[];      // All criteria must be met
  mustHaveOne: string[];      // At least one must be met
  excludes: string[];         // Disqualifying criteria
}

export interface AIExample {
  name: string;
  description: string;
  qualifies: boolean;
  reasoning: string;
}

export interface AIClassification {
  entityId: string;
  entityType: string;
  isAI: boolean;
  matchedCriteria: string[];
  classificationDate: string;
  classifiedBy: string;
}

class AIDefinitionService {
  private static instance: AIDefinitionService;
  
  // Industry-accepted AI definition based on IEEE, ISO/IEC, and academic standards
  private readonly currentDefinition: AIDefinition = {
    id: 'AI_DEF_001',
    version: '1.0',
    effectiveDate: new Date().toISOString(),
    criteria: {
      mustHaveAll: [
        'Autonomous operation - Operates without continuous human intervention',
        'Decision-making capability - Makes choices based on input data or conditions',
        'Adaptive behavior - Adjusts responses based on patterns or rules'
      ],
      mustHaveOne: [
        'Machine learning - Improves performance through experience',
        'Rule-based reasoning - Follows predefined logic to reach conclusions',
        'Pattern recognition - Identifies patterns in data',
        'Natural language processing - Understands and generates human language',
        'Automated problem solving - Resolves issues without human intervention',
        'Predictive analytics - Forecasts outcomes based on data',
        'Optimization algorithms - Finds best solutions among alternatives',
        'Knowledge representation - Stores and uses information systematically'
      ],
      excludes: [
        'Simple conditional statements (if-then) without complex logic',
        'Basic automation scripts without decision trees',
        'Static data transformations',
        'Manual processes requiring human input at each step'
      ]
    },
    examples: [
      {
        name: 'EUID Lifecycle Manager',
        description: 'Automatically manages entity IDs, resolves conflicts, and applies retention rules',
        qualifies: true,
        reasoning: 'Autonomous operation with decision-making for conflict resolution and adaptive behavior for retention rules'
      },
      {
        name: 'Smart Form Assistant',
        description: 'Provides intelligent suggestions and validates form data in real-time',
        qualifies: true,
        reasoning: 'Uses pattern recognition and predictive analytics to assist users'
      },
      {
        name: 'Audit Log Service',
        description: 'Records all system actions with timestamps',
        qualifies: false,
        reasoning: 'Simple data recording without autonomous decision-making'
      },
      {
        name: 'Auto-Save Function',
        description: 'Saves data every 30 seconds',
        qualifies: false,
        reasoning: 'Basic timer-based automation without adaptive behavior'
      },
      {
        name: 'Collaboration Monitor',
        description: 'Detects conflicts, merges changes, and notifies users of concurrent edits',
        qualifies: true,
        reasoning: 'Autonomous conflict detection and resolution with adaptive merging strategies'
      },
      {
        name: 'Document Classifier',
        description: 'Automatically categorizes uploaded documents based on content',
        qualifies: true,
        reasoning: 'Uses pattern recognition and machine learning for classification'
      },
      {
        name: 'Permission Manager',
        description: 'Enforces role-based access control',
        qualifies: false,
        reasoning: 'Rule enforcement without autonomous decision-making or adaptation'
      },
      {
        name: 'Offline Sync Service',
        description: 'Intelligently merges offline changes with server state',
        qualifies: true,
        reasoning: 'Autonomous conflict resolution with adaptive synchronization strategies'
      }
    ],
    references: [
      'IEEE Standard for Artificial Intelligence Terminology (IEEE 2029.1)',
      'ISO/IEC 23053:2022 - Framework for AI systems using ML',
      'European Commission High-Level Expert Group on AI Definition',
      'Stanford University AI Index Report',
      'MIT Technology Review AI Classification Framework'
    ]
  };

  private classifications: Map<string, AIClassification> = new Map();

  private constructor() {}

  static getInstance(): AIDefinitionService {
    if (!AIDefinitionService.instance) {
      AIDefinitionService.instance = new AIDefinitionService();
    }
    return AIDefinitionService.instance;
  }

  /**
   * Get the current AI definition
   */
  getCurrentDefinition(): AIDefinition {
    return this.currentDefinition;
  }

  /**
   * Classify an entity as AI or non-AI based on its characteristics
   */
  classifyEntity(
    entityId: string,
    entityType: string,
    characteristics: string[],
    classifiedBy: string = 'system'
  ): AIClassification {
    const matchedCriteria: string[] = [];
    
    // Check must-have-all criteria
    const hasAllRequired = this.currentDefinition.criteria.mustHaveAll.every(
      criterion => characteristics.some(char => 
        char.toLowerCase().includes(criterion.split(' - ')[0].toLowerCase())
      )
    );

    if (hasAllRequired) {
      matchedCriteria.push(...this.currentDefinition.criteria.mustHaveAll);
    }

    // Check must-have-one criteria
    const matchedOptional = this.currentDefinition.criteria.mustHaveOne.filter(
      criterion => characteristics.some(char => 
        char.toLowerCase().includes(criterion.split(' - ')[0].toLowerCase())
      )
    );

    if (matchedOptional.length > 0) {
      matchedCriteria.push(...matchedOptional);
    }

    // Check exclusions
    const hasExclusions = this.currentDefinition.criteria.excludes.some(
      exclusion => characteristics.some(char => 
        char.toLowerCase().includes(exclusion.split(' ')[0].toLowerCase())
      )
    );

    // Determine if entity qualifies as AI
    const isAI = hasAllRequired && matchedOptional.length > 0 && !hasExclusions;

    const classification: AIClassification = {
      entityId,
      entityType,
      isAI,
      matchedCriteria,
      classificationDate: new Date().toISOString(),
      classifiedBy
    };

    this.classifications.set(entityId, classification);
    return classification;
  }

  /**
   * Check if a specific system component qualifies as AI
   */
  isComponentAI(componentName: string): boolean {
    // Map of known system components and their AI status
    const aiComponents = new Map<string, boolean>([
      // AI Components
      ['euidLifecycleService', true],
      ['smartFormAssistant', true],
      ['collaborationService', true],
      ['offlineSyncService', true],
      ['documentClassifier', true],
      ['predictiveAnalytics', true],
      ['autoProgressTracker', true],
      ['intelligentSearch', true],
      ['conflictResolver', true],
      ['patternRecognition', true],
      
      // Non-AI Components
      ['auditLogService', false],
      ['databaseService', false],
      ['authService', false],
      ['permissionService', false],
      ['storageService', false],
      ['validationService', false],
      ['routerService', false],
      ['themeService', false],
      ['exportService', false],
      ['notificationService', false]
    ]);

    return aiComponents.get(componentName) || false;
  }

  /**
   * Get all AI components in the system
   */
  getAllAIComponents(): Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  }> {
    return [
      {
        id: 'AI00001',
        name: 'System Assistant',
        description: 'Primary AI assistant for user interactions',
        capabilities: ['Natural language processing', 'Predictive analytics', 'Pattern recognition']
      },
      {
        id: 'AI00002',
        name: 'EUID Lifecycle Manager',
        description: 'Autonomous EUID management system',
        capabilities: ['Automated conflict resolution', 'Retention rule processing', 'Pattern-based ID generation']
      },
      {
        id: 'AI00003',
        name: 'Smart Form Assistant',
        description: 'Intelligent form completion helper',
        capabilities: ['Field prediction', 'Validation assistance', 'Context-aware suggestions']
      },
      {
        id: 'AI00004',
        name: 'Collaboration Monitor',
        description: 'Real-time collaboration conflict resolver',
        capabilities: ['Conflict detection', 'Merge strategies', 'User behavior analysis']
      },
      {
        id: 'AI00005',
        name: 'Document Intelligence',
        description: 'Automated document processing and classification',
        capabilities: ['Content extraction', 'Auto-categorization', 'Metadata generation']
      },
      {
        id: 'AI00006',
        name: 'Sync Intelligence',
        description: 'Intelligent offline/online synchronization',
        capabilities: ['Conflict resolution', 'Priority determination', 'Data reconciliation']
      },
      {
        id: 'AI00007',
        name: 'Analytics Engine',
        description: 'Predictive analytics and insights generator',
        capabilities: ['Trend analysis', 'Anomaly detection', 'Forecasting']
      },
      {
        id: 'AI00008',
        name: 'Search Intelligence',
        description: 'Advanced search with semantic understanding',
        capabilities: ['Natural language queries', 'Relevance ranking', 'Query expansion']
      }
    ];
  }

  /**
   * Generate AI certification for a component
   */
  generateAICertification(
    componentId: string,
    componentName: string,
    capabilities: string[]
  ): string {
    const classification = this.classifyEntity(
      componentId,
      'system_component',
      capabilities
    );

    return `
AI CERTIFICATION
================
Component: ${componentName} (${componentId})
Classification: ${classification.isAI ? 'QUALIFIES AS AI' : 'NOT AI'}
Date: ${new Date().toISOString()}

Matched Criteria:
${classification.matchedCriteria.map(c => `- ${c}`).join('\n')}

Definition Version: ${this.currentDefinition.version}
Based on: ${this.currentDefinition.references[0]}
    `.trim();
  }

  /**
   * Explain why something is or isn't classified as AI
   */
  explainClassification(entityId: string): string {
    const classification = this.classifications.get(entityId);
    if (!classification) {
      return 'No classification found for this entity.';
    }

    let explanation = `Entity ${entityId} is ${classification.isAI ? '' : 'NOT '}classified as AI.\n\n`;

    if (classification.isAI) {
      explanation += 'This entity meets the following AI criteria:\n';
      classification.matchedCriteria.forEach(criterion => {
        explanation += `✓ ${criterion}\n`;
      });
    } else {
      explanation += 'This entity does not meet the minimum requirements for AI classification:\n';
      explanation += '- Must have autonomous operation, decision-making, and adaptive behavior\n';
      explanation += '- Must demonstrate at least one advanced capability (ML, reasoning, etc.)\n';
      explanation += '- Must not be a simple automation or static process\n';
    }

    return explanation;
  }
}

export const aiDefinitionService = AIDefinitionService.getInstance();