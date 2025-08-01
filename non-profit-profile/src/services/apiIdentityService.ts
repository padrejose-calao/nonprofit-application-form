/**
 * API Identity and Data Provenance Service
 * Tracks API identities and data sources throughout the system
 */

import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { aiDefinitionService } from './aiDefinitionService';
import { logger } from '../utils/logger';

export enum APIType {
  INTERNAL = 'INTERNAL',          // Our own APIs
  EXTERNAL = 'EXTERNAL',          // Third-party APIs
  PARTNER = 'PARTNER',            // Partner organization APIs
  GOVERNMENT = 'GOVERNMENT',      // Government APIs
  AI_SERVICE = 'AI_SERVICE',      // AI/ML service APIs
  WEBHOOK = 'WEBHOOK',            // Incoming webhooks
  INTEGRATION = 'INTEGRATION'     // Integration platforms
}

export enum DataSourceType {
  USER_INPUT = 'USER_INPUT',
  API_FETCH = 'API_FETCH',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DATABASE_SYNC = 'DATABASE_SYNC',
  WEBHOOK_RECEIVE = 'WEBHOOK_RECEIVE',
  AI_GENERATION = 'AI_GENERATION',
  SYSTEM_CALCULATION = 'SYSTEM_CALCULATION',
  EXTERNAL_IMPORT = 'EXTERNAL_IMPORT',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  AUTOMATED_PROCESS = 'AUTOMATED_PROCESS'
}

export interface APIIdentity {
  euid: string;                   // API##### format
  name: string;
  type: APIType;
  endpoint: string;
  version: string;
  provider: string;
  authentication: {
    type: 'none' | 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'custom';
    credentials?: string;         // Encrypted reference
  };
  rateLimit?: {
    requests: number;
    window: number;               // in seconds
  };
  isActive: boolean;
  isAI: boolean;                  // Determined by AI definition service
  capabilities: string[];
  createdAt: string;
  createdBy: string;
  lastUsed?: string;
  metadata: Record<string, unknown>;
}

export interface DataProvenance {
  id: string;
  dataEUID: string;               // EUID of the data entity
  sourceType: DataSourceType;
  sourceEUID?: string;            // EUID of the source (API, User, etc.)
  sourceName: string;
  timestamp: string;
  confidence: number;             // 0-1 confidence score
  transformations: DataTransformation[];
  validations: DataValidation[];
  lineage: DataLineage[];
  metadata: {
    originalFormat?: string;
    originalSize?: number;
    processingTime?: number;
    errorCount?: number;
    warningCount?: number;
  };
}

export interface DataTransformation {
  type: string;
  description: string;
  timestamp: string;
  performedBy: string;           // EUID of entity that performed transformation
  isAI: boolean;
  details: Record<string, unknown>;
}

export interface DataValidation {
  type: string;
  passed: boolean;
  message?: string;
  timestamp: string;
  validatorEUID: string;
  confidence: number;
}

export interface DataLineage {
  step: number;
  entityEUID: string;
  entityType: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface APICallRecord {
  id: string;
  apiEUID: string;
  timestamp: string;
  method: string;
  endpoint: string;
  requestData?: unknown;
  responseData?: unknown;
  statusCode: number;
  duration: number;               // in milliseconds
  errorMessage?: string;
  dataProvenanceId?: string;
  metadata: {
    userEUID?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

class APIIdentityService {
  private static instance: APIIdentityService;
  private apis: Map<string, APIIdentity> = new Map();
  private provenanceRecords: Map<string, DataProvenance> = new Map();
  private apiCallRecords: Map<string, APICallRecord> = new Map();
  private apiSequence: number = 0;

  private constructor() {
    this.initialize();
  }

  static getInstance(): APIIdentityService {
    if (!APIIdentityService.instance) {
      APIIdentityService.instance = new APIIdentityService();
    }
    return APIIdentityService.instance;
  }

  private async initialize() {
    await this.loadAPISequence();
    await this.loadAPIs();
    await this.initializeSystemAPIs();
  }

  private async loadAPISequence() {
    try {
      const sequence = await netlifyDatabase.read('api_sequence');
      if (sequence) {
        const data = sequence.data as { value: number };
        this.apiSequence = data.value || 0;
      }
    } catch (error) {
      logger.debug('Initializing API sequence');
    }
  }

  private async loadAPIs() {
    try {
      const apis = await netlifyDatabase.query({
        type: 'api_identity'
      });
      
      apis.forEach(record => {
        const api = record.data as APIIdentity;
        this.apis.set(api.euid, api);
      });
      
      logger.debug(`Loaded ${this.apis.size} API identities`);
    } catch (error) {
      logger.error('Failed to load API identities:', error);
    }
  }

  /**
   * Initialize system APIs
   */
  private async initializeSystemAPIs() {
    const systemAPIs: Array<Omit<APIIdentity, 'euid' | 'createdAt' | 'createdBy'>> = [
      {
        name: 'Netlify Functions API',
        type: APIType.INTERNAL,
        endpoint: '/.netlify/functions',
        version: '1.0',
        provider: 'Netlify',
        authentication: { type: 'jwt' },
        isActive: true,
        isAI: false,
        capabilities: ['CRUD operations', 'Database access', 'File storage'],
        metadata: {}
      },
      {
        name: 'Google Drive API',
        type: APIType.EXTERNAL,
        endpoint: 'https://www.googleapis.com/drive/v3',
        version: 'v3',
        provider: 'Google',
        authentication: { type: 'oauth2' },
        rateLimit: { requests: 1000, window: 100 },
        isActive: true,
        isAI: false,
        capabilities: ['File storage', 'Backup', 'Sharing'],
        metadata: {}
      },
      {
        name: 'OpenAI API',
        type: APIType.AI_SERVICE,
        endpoint: 'https://api.openai.com/v1',
        version: 'v1',
        provider: 'OpenAI',
        authentication: { type: 'api_key' },
        rateLimit: { requests: 3000, window: 60 },
        isActive: true,
        isAI: true,
        capabilities: ['Text generation', 'Embeddings', 'Analysis'],
        metadata: {}
      },
      {
        name: 'IRS Nonprofit API',
        type: APIType.GOVERNMENT,
        endpoint: 'https://apps.irs.gov/app/eos',
        version: '1.0',
        provider: 'IRS',
        authentication: { type: 'none' },
        isActive: true,
        isAI: false,
        capabilities: ['Tax-exempt verification', 'EIN lookup'],
        metadata: {}
      }
    ];

    for (const apiData of systemAPIs) {
      const existingAPI = Array.from(this.apis.values()).find(
        api => api.name === apiData.name && api.version === apiData.version
      );
      
      if (!existingAPI) {
        await this.registerAPI(apiData, 'system');
      }
    }
  }

  /**
   * Generate API EUID
   */
  private async generateAPIEUID(): Promise<string> {
    this.apiSequence++;
    const euid = `API${this.apiSequence.toString().padStart(5, '0')}`;
    
    await netlifyDatabase.create('api_sequence', {
      value: this.apiSequence,
      lastUpdated: new Date().toISOString()
    }, 'system');
    
    return euid;
  }

  /**
   * Register a new API
   */
  async registerAPI(
    apiData: Omit<APIIdentity, 'euid' | 'createdAt' | 'createdBy'>,
    userId: string
  ): Promise<APIIdentity> {
    const euid = await this.generateAPIEUID();
    
    // Check if this API qualifies as AI
    const isAI = apiData.isAI || aiDefinitionService.classifyEntity(
      euid,
      'api',
      apiData.capabilities,
      userId
    ).isAI;

    const api: APIIdentity = {
      ...apiData,
      euid,
      isAI,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      metadata: apiData.metadata || {}
    };

    await netlifyDatabase.create('api_identity', api, userId);
    this.apis.set(euid, api);

    await universalAuditService.logAction({
      action: 'api_registered',
      entityId: euid,
      entityType: 'api',
      userId,
      details: {
        name: api.name,
        type: api.type,
        isAI
      },
      timestamp: new Date().toISOString()
    });

    return api;
  }

  /**
   * Track API call
   */
  async trackAPICall(
    apiEUID: string,
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    metadata: APICallRecord['metadata'],
    requestData?: unknown,
    responseData?: unknown,
    errorMessage?: string
  ): Promise<APICallRecord> {
    const callRecord: APICallRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiEUID,
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      requestData,
      responseData,
      statusCode,
      duration,
      errorMessage,
      metadata
    };

    await netlifyDatabase.create('api_call', callRecord, metadata.userEUID || 'system');
    this.apiCallRecords.set(callRecord.id, callRecord);

    // Update last used timestamp for API
    const api = this.apis.get(apiEUID);
    if (api) {
      api.lastUsed = callRecord.timestamp;
      await netlifyDatabase.update(apiEUID, { data: { lastUsed: api.lastUsed } }, 'system');
    }

    return callRecord;
  }

  /**
   * Track data provenance
   */
  async trackDataProvenance(
    dataEUID: string,
    sourceType: DataSourceType,
    sourceName: string,
    sourceEUID?: string,
    confidence: number = 1.0
  ): Promise<DataProvenance> {
    const provenance: DataProvenance = {
      id: `prov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataEUID,
      sourceType,
      sourceEUID,
      sourceName,
      timestamp: new Date().toISOString(),
      confidence,
      transformations: [],
      validations: [],
      lineage: [{
        step: 1,
        entityEUID: sourceEUID || 'unknown',
        entityType: this.getEntityTypeFromSource(sourceType),
        action: 'created',
        timestamp: new Date().toISOString()
      }],
      metadata: {}
    };

    await netlifyDatabase.create('data_provenance', provenance, 'system');
    this.provenanceRecords.set(provenance.id, provenance);

    return provenance;
  }

  /**
   * Add transformation to provenance
   */
  async addTransformation(
    provenanceId: string,
    transformation: Omit<DataTransformation, 'timestamp'>
  ): Promise<void> {
    const provenance = this.provenanceRecords.get(provenanceId);
    if (!provenance) return;

    const fullTransformation: DataTransformation = {
      ...transformation,
      timestamp: new Date().toISOString()
    };

    provenance.transformations.push(fullTransformation);
    
    // Add to lineage
    provenance.lineage.push({
      step: provenance.lineage.length + 1,
      entityEUID: transformation.performedBy,
      entityType: transformation.isAI ? 'ai' : 'system',
      action: `transform:${transformation.type}`,
      timestamp: fullTransformation.timestamp,
      metadata: transformation.details
    });

    await netlifyDatabase.update(
      provenanceId,
      {
        data: {
          transformations: provenance.transformations,
          lineage: provenance.lineage
        }
      },
      'system'
    );
  }

  /**
   * Add validation to provenance
   */
  async addValidation(
    provenanceId: string,
    validation: Omit<DataValidation, 'timestamp'>
  ): Promise<void> {
    const provenance = this.provenanceRecords.get(provenanceId);
    if (!provenance) return;

    const fullValidation: DataValidation = {
      ...validation,
      timestamp: new Date().toISOString()
    };

    provenance.validations.push(fullValidation);
    
    // Update confidence based on validation
    if (!validation.passed) {
      provenance.confidence *= 0.9; // Reduce confidence for failed validations
    }

    await netlifyDatabase.update(
      provenanceId,
      {
        data: {
          validations: provenance.validations,
          confidence: provenance.confidence
        }
      },
      'system'
    );
  }

  /**
   * Get entity type from source type
   */
  private getEntityTypeFromSource(sourceType: DataSourceType): string {
    const mapping: Record<DataSourceType, string> = {
      [DataSourceType.USER_INPUT]: 'user',
      [DataSourceType.API_FETCH]: 'api',
      [DataSourceType.FILE_UPLOAD]: 'document',
      [DataSourceType.DATABASE_SYNC]: 'database',
      [DataSourceType.WEBHOOK_RECEIVE]: 'webhook',
      [DataSourceType.AI_GENERATION]: 'ai',
      [DataSourceType.SYSTEM_CALCULATION]: 'system',
      [DataSourceType.EXTERNAL_IMPORT]: 'external',
      [DataSourceType.MANUAL_ENTRY]: 'user',
      [DataSourceType.AUTOMATED_PROCESS]: 'system'
    };
    
    return mapping[sourceType] || 'unknown';
  }

  /**
   * Get provenance for data
   */
  async getDataProvenance(dataEUID: string): Promise<DataProvenance | null> {
    const records = await netlifyDatabase.query({
      type: 'data_provenance',
      filters: { 'data.dataEUID': dataEUID },
      sort: { field: 'data.timestamp', order: 'desc' },
      limit: 1
    });

    return records.length > 0 ? records[0].data as DataProvenance : null;
  }

  /**
   * Get complete data lineage
   */
  async getDataLineage(dataEUID: string): Promise<{
    origin: DataProvenance | null;
    transformations: DataTransformation[];
    validations: DataValidation[];
    timeline: Array<{
      timestamp: string;
      event: string;
      entity: string;
      details: unknown;
    }>;
  }> {
    const provenance = await this.getDataProvenance(dataEUID);
    if (!provenance) {
      return {
        origin: null,
        transformations: [],
        validations: [],
        timeline: []
      };
    }

    // Build timeline from all events
    const timeline: Array<{
      timestamp: string;
      event: string;
      entity: string;
      details: unknown;
    }> = [];

    // Add origin
    timeline.push({
      timestamp: provenance.timestamp,
      event: 'data_created',
      entity: provenance.sourceName,
      details: {
        sourceType: provenance.sourceType,
        confidence: provenance.confidence
      }
    });

    // Add transformations
    provenance.transformations.forEach(t => {
      timeline.push({
        timestamp: t.timestamp,
        event: `transformation:${t.type}`,
        entity: t.performedBy,
        details: t.details
      });
    });

    // Add validations
    provenance.validations.forEach(v => {
      timeline.push({
        timestamp: v.timestamp,
        event: `validation:${v.type}`,
        entity: v.validatorEUID,
        details: {
          passed: v.passed,
          message: v.message,
          confidence: v.confidence
        }
      });
    });

    // Sort by timestamp
    timeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      origin: provenance,
      transformations: provenance.transformations,
      validations: provenance.validations,
      timeline
    };
  }

  /**
   * Get API statistics
   */
  async getAPIStatistics(apiEUID?: string): Promise<{
    totalCalls: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
    lastHourCalls: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    const calls = apiEUID
      ? Array.from(this.apiCallRecords.values()).filter(c => c.apiEUID === apiEUID)
      : Array.from(this.apiCallRecords.values());

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastHourCalls = calls.filter(c => new Date(c.timestamp) > oneHourAgo);

    const successfulCalls = calls.filter(c => c.statusCode >= 200 && c.statusCode < 300);
    const totalDuration = calls.reduce((sum, c) => sum + c.duration, 0);

    // Count endpoint usage
    const endpointCounts: Record<string, number> = {};
    calls.forEach(c => {
      endpointCounts[c.endpoint] = (endpointCounts[c.endpoint] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCalls: calls.length,
      successRate: calls.length > 0 ? (successfulCalls.length / calls.length) * 100 : 0,
      averageResponseTime: calls.length > 0 ? totalDuration / calls.length : 0,
      errorRate: calls.length > 0 
        ? (calls.filter(c => c.statusCode >= 400).length / calls.length) * 100 
        : 0,
      lastHourCalls: lastHourCalls.length,
      topEndpoints
    };
  }

  /**
   * Check if API is AI-powered
   */
  isAPIAI(apiEUID: string): boolean {
    const api = this.apis.get(apiEUID);
    return api?.isAI || false;
  }

  /**
   * Get all AI APIs
   */
  getAIAPIs(): APIIdentity[] {
    return Array.from(this.apis.values()).filter(api => api.isAI);
  }

  /**
   * Format API display name
   */
  formatAPIDisplay(api: APIIdentity): string {
    const status = api.isActive ? '' : ' (Inactive)';
    const aiIndicator = api.isAI ? ' 🤖' : '';
    return `${api.euid} - ${api.name} v${api.version}${aiIndicator}${status}`;
  }
}

export const apiIdentityService = APIIdentityService.getInstance();