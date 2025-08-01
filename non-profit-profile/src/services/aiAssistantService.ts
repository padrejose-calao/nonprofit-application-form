/**
 * AI Assistant Service
 * Manages AI assistant entities with EUID tracking
 * Format: AI[5-digit]-[Provider]-[Model]-[Status]
 * Example: AI00001-Claude, AI00001-ChatGPT-3.5-R
 */

import { EntityType, EntityStatus } from './euidTypes';
import { euidService } from './euidService';
import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { logger } from '../utils/logger';

export interface AIModel {
  provider: string;        // Claude, ChatGPT, etc.
  modelVersion: string;    // opus-4, gpt-4, gpt-3.5, etc.
  status: 'active' | 'retired';
  capabilities: string[];
  limitations?: string[];
  deployedAt: string;
  retiredAt?: string;
}

export interface AIAssistant {
  euid: string;           // AI00001
  name: string;           // e.g., "System Assistant"
  description: string;
  primaryModel: AIModel;
  secondaryModels: AIModel[];
  purpose: string;
  createdAt: string;
  createdBy: string;
  lastActive?: string;
  interactions: number;
  metadata: Record<string, unknown>;
}

class AIAssistantService {
  private static instance: AIAssistantService;
  private assistants: Map<string, AIAssistant> = new Map();

  private constructor() {}

  static getInstance(): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService();
    }
    return AIAssistantService.instance;
  }

  /**
   * Initialize the default system AI assistant
   */
  async initializeSystemAssistant(): Promise<AIAssistant> {
    const existingAssistant = await this.getAssistant('AI00001');
    if (existingAssistant) {
      logger.debug('System AI assistant already initialized');
      return existingAssistant;
    }

    // Create the system AI assistant with fixed EUID
    const assistant: AIAssistant = {
      euid: 'AI00001',
      name: 'System Assistant',
      description: 'Primary AI assistant for the nonprofit management system',
      primaryModel: {
        provider: 'Claude',
        modelVersion: 'opus-4-20250514',
        status: 'active',
        capabilities: [
          'Natural language understanding',
          'Document analysis',
          'Form assistance',
          'Data validation',
          'Multi-language support',
          'Code generation',
          'Report generation'
        ],
        deployedAt: new Date().toISOString()
      },
      secondaryModels: [],
      purpose: 'Assist users with nonprofit profile management, documentation, and reporting',
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      interactions: 0,
      metadata: {
        systemOwner: 'C00001', // Calao Corp
        accessLevel: 'system',
        permissions: ['read', 'write', 'analyze', 'suggest']
      }
    };

    // Save to database
    await netlifyDatabase.create('ai_assistant', assistant, 'system');
    
    // Register EUID
    await this.registerAIAssistantEUID(assistant.euid, 'system');
    
    // Log initialization
    await universalAuditService.logAction({
      action: 'ai_assistant_initialized',
      entityId: assistant.euid,
      entityType: 'ai_assistant',
      userId: 'system',
      details: {
        name: assistant.name,
        primaryModel: assistant.primaryModel
      },
      timestamp: new Date().toISOString()
    });

    this.assistants.set(assistant.euid, assistant);
    return assistant;
  }

  /**
   * Register EUID for AI assistant
   */
  private async registerAIAssistantEUID(euid: string, userId: string): Promise<void> {
    const euidRecord = {
      full: euid,
      type: EntityType.AI_ASSISTANT,
      number: euid.slice(-5),
      relationships: [],
      status: EntityStatus.ACTIVE,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: userId,
        isSystemEntity: true,
        entitySubtype: 'ai_assistant'
      }
    };

    await netlifyDatabase.create('euid', euidRecord, userId);
  }

  /**
   * Create a new AI assistant
   */
  async createAssistant(
    name: string,
    description: string,
    primaryModel: AIModel,
    purpose: string,
    userId: string
  ): Promise<AIAssistant> {
    // Generate EUID for new assistant
    const euid = await euidService.generateEUID(
      EntityType.AI_ASSISTANT,
      userId
    );

    const assistant: AIAssistant = {
      euid,
      name,
      description,
      primaryModel,
      secondaryModels: [],
      purpose,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      interactions: 0,
      metadata: {}
    };

    await netlifyDatabase.create('ai_assistant', assistant, userId);
    this.assistants.set(euid, assistant);

    await universalAuditService.logAction({
      action: 'ai_assistant_created',
      entityId: euid,
      entityType: 'ai_assistant',
      userId,
      details: { name, primaryModel },
      timestamp: new Date().toISOString()
    });

    return assistant;
  }

  /**
   * Add a model to an AI assistant
   */
  async addModel(
    assistantEUID: string,
    model: AIModel,
    userId: string
  ): Promise<void> {
    const assistant = await this.getAssistant(assistantEUID);
    if (!assistant) {
      throw new Error(`AI Assistant ${assistantEUID} not found`);
    }

    assistant.secondaryModels.push(model);
    
    await netlifyDatabase.update(
      assistantEUID,
      { data: { secondaryModels: assistant.secondaryModels } },
      userId
    );

    await universalAuditService.logAction({
      action: 'ai_model_added',
      entityId: assistantEUID,
      entityType: 'ai_assistant',
      userId,
      details: { model },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Retire a model
   */
  async retireModel(
    assistantEUID: string,
    provider: string,
    modelVersion: string,
    userId: string
  ): Promise<void> {
    const assistant = await this.getAssistant(assistantEUID);
    if (!assistant) {
      throw new Error(`AI Assistant ${assistantEUID} not found`);
    }

    // Check if it's the primary model
    if (assistant.primaryModel.provider === provider && 
        assistant.primaryModel.modelVersion === modelVersion) {
      assistant.primaryModel.status = 'retired';
      assistant.primaryModel.retiredAt = new Date().toISOString();
    } else {
      // Check secondary models
      const model = assistant.secondaryModels.find(
        m => m.provider === provider && m.modelVersion === modelVersion
      );
      if (model) {
        model.status = 'retired';
        model.retiredAt = new Date().toISOString();
      }
    }

    await netlifyDatabase.update(
      assistantEUID,
      { 
        data: {
          primaryModel: assistant.primaryModel,
          secondaryModels: assistant.secondaryModels 
        }
      },
      userId
    );

    await universalAuditService.logAction({
      action: 'ai_model_retired',
      entityId: assistantEUID,
      entityType: 'ai_assistant',
      userId,
      details: { provider, modelVersion },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get AI assistant by EUID
   */
  async getAssistant(euid: string): Promise<AIAssistant | null> {
    // Check cache first
    if (this.assistants.has(euid)) {
      return this.assistants?.get(euid)!;
    }

    // Load from database
    const records = await netlifyDatabase.query({
      type: 'ai_assistant',
      filters: { 'data.euid': euid }
    });

    if (records.length > 0) {
      const assistant = records[0].data as AIAssistant;
      this.assistants.set(euid, assistant);
      return assistant;
    }

    return null;
  }

  /**
   * Get all AI assistants
   */
  async getAllAssistants(): Promise<AIAssistant[]> {
    const records = await netlifyDatabase.query({
      type: 'ai_assistant'
    });

    return records.map(r => r.data as AIAssistant);
  }

  /**
   * Format AI assistant display name with model info
   */
  formatAssistantDisplay(assistant: AIAssistant): string {
    const { euid, primaryModel } = assistant;
    const modelStatus = primaryModel.status === 'retired' ? '-R' : '';
    return `${euid}-${primaryModel.provider}-${primaryModel.modelVersion}${modelStatus}`;
  }

  /**
   * Track interaction with AI assistant
   */
  async trackInteraction(
    assistantEUID: string,
    interactionType: string,
    userId: string,
    details?: unknown
  ): Promise<void> {
    const assistant = await this.getAssistant(assistantEUID);
    if (!assistant) {
      throw new Error(`AI Assistant ${assistantEUID} not found`);
    }

    assistant.interactions++;
    assistant.lastActive = new Date().toISOString();

    await netlifyDatabase.update(
      assistantEUID,
      { 
        data: {
          interactions: assistant.interactions,
          lastActive: assistant.lastActive
        }
      },
      userId
    );

    await universalAuditService.logAction({
      action: 'ai_interaction',
      entityId: assistantEUID,
      entityType: 'ai_assistant',
      userId,
      details: { interactionType, ...(details as any) },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get AI assistant statistics
   */
  async getAssistantStats(assistantEUID: string): Promise<{
    totalInteractions: number;
    lastActive: string | null;
    activeModels: number;
    retiredModels: number;
  }> {
    const assistant = await this.getAssistant(assistantEUID);
    if (!assistant) {
      throw new Error(`AI Assistant ${assistantEUID} not found`);
    }

    const allModels = [assistant.primaryModel, ...assistant.secondaryModels];
    const activeModels = allModels.filter(m => m.status === 'active').length;
    const retiredModels = allModels.filter(m => m.status === 'retired').length;

    return {
      totalInteractions: assistant.interactions,
      lastActive: assistant.lastActive || null,
      activeModels,
      retiredModels
    };
  }
}

export const aiAssistantService = AIAssistantService.getInstance();