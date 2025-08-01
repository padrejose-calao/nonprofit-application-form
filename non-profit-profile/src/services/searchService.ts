import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

export interface SearchFilter {
  id: string;
  name: string;
  query: string;
  filters: {
    sections?: string[];
    fieldTypes?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    completionStatus?: 'complete' | 'incomplete' | 'partial';
    modifiedBy?: string;
    tags?: string[];
    hasAttachments?: boolean;
  };
  savedAt: Date;
  savedBy: string;
}

export interface SearchResult {
  id: string;
  sectionId: string;
  sectionName: string;
  fieldId: string;
  fieldName: string;
  fieldValue: unknown;
  fieldType: string;
  matchScore: number;
  context: string;
  lastModified?: Date;
  modifiedBy?: string;
  attachments?: string[];
  tags?: string[];
}

export interface SearchOptions {
  query: string;
  sections?: string[];
  fieldTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  completionStatus?: 'complete' | 'incomplete' | 'partial';
  modifiedBy?: string;
  tags?: string[];
  hasAttachments?: boolean;
  fuzzySearch?: boolean;
  searchInAttachments?: boolean;
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'section';
}

class SearchService {
  private organizationId: string = '';
  private savedFilters: Map<string, SearchFilter> = new Map();
  private searchIndex: Map<string, any> = new Map();
  private initialized: boolean = false;

  async initialize(organizationId: string): Promise<void> {
    this.organizationId = organizationId;
    
    // Load saved filters
    await this.loadSavedFilters();
    
    // Build search index
    await this.buildSearchIndex();
    
    this.initialized = true;
  }

  private async loadSavedFilters(): Promise<void> {
    try {
      const filters = await netlifySettingsService.get(`search_filters_${this.organizationId}`);
      if (filters && Array.isArray(filters)) {
        filters.forEach(filter => {
          this.savedFilters.set(filter.id, {
            ...filter,
            savedAt: new Date(filter.savedAt)
          });
        });
      }
    } catch (error) {
      logger.error('Failed to load saved filters:', error);
    }
  }

  private async saveFilters(): Promise<void> {
    try {
      const filtersArray = Array.from(this.savedFilters.values());
      await netlifySettingsService.set(
        `search_filters_${this.organizationId}`,
        filtersArray,
        'organization'
      );
    } catch (error) {
      logger.error('Failed to save filters:', error);
    }
  }

  private async buildSearchIndex(): Promise<void> {
    try {
      // Get all form data
      const formData = await netlifySettingsService.get('nonprofitApplicationData');
      if (!formData) return;

      // Index all fields
      this.indexFormData((formData as any).formData || {});
      
      // Index documents
      const documents = await netlifySettingsService.get('documents');
      if (documents && Array.isArray(documents)) {
        this.indexDocuments(documents as any[]);
      }
    } catch (error) {
      logger.error('Failed to build search index:', error);
    }
  }

  private indexFormData(data: unknown, sectionId: string = '', path: string = ''): void {
    Object.entries(data as any).forEach(([key, value]) => {
      const fieldPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively index nested objects
        this.indexFormData(value, sectionId || key, fieldPath);
      } else {
        // Index field
        const indexKey = `field_${fieldPath}`;
        this.searchIndex.set(indexKey, {
          sectionId: sectionId || key,
          fieldId: key,
          fieldPath,
          value,
          type: this.getFieldType(value),
          text: this.extractText(value)
        });
      }
    });
  }

  private indexDocuments(documents: unknown[]): void {
    documents.forEach((doc, index) => {
      const docData = doc as any;
      const indexKey = `doc_${index}`;
      this.searchIndex.set(indexKey, {
        sectionId: 'documents',
        fieldId: docData.id || index,
        value: doc,
        type: 'document',
        text: `${docData.fileName} ${docData.description || ''} ${docData.tags?.join(' ') || ''}`
      });
    });
  }

  private getFieldType(value: unknown): string {
    if (value === null || value === undefined) return 'empty';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      if (value.match(/^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$/)) return 'email';
      if (value.match(/^\+?\d[\d\s-().]+$/)) return 'phone';
      return 'text';
    }
    if (Array.isArray(value)) return 'array';
    return 'object';
  }

  private extractText(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.map(v => this.extractText(v)).join(' ');
    if (typeof value === 'object') {
      return Object.values(value).map(v => this.extractText(v)).join(' ');
    }
    return '';
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.buildSearchIndex();
    }

    const results: SearchResult[] = [];
    const query = options.query.toLowerCase();
    const words = query.split(/\s+/).filter(w => w.length > 0);

    // Search through index
    this.searchIndex.forEach((item, key) => {
      // Apply filters
      if (options.sections && !options.sections.includes(item.sectionId)) return;
      if (options.fieldTypes && !options.fieldTypes.includes(item.type)) return;
      
      // Calculate match score
      let score = 0;
      const text = item.text || '';
      
      if (options.fuzzySearch) {
        score = this.fuzzyMatch(query, text);
      } else {
        // Exact word matching
        words.forEach(word => {
          if (text.includes(word)) {
            score += 1;
          }
        });
      }

      if (score > 0) {
        // Get context
        const context = this.getContext(text, words[0], 50);
        
        results.push({
          id: key,
          sectionId: item.sectionId,
          sectionName: this.getSectionName(item.sectionId),
          fieldId: item.fieldId,
          fieldName: this.getFieldName(item.fieldId),
          fieldValue: item.value,
          fieldType: item.type,
          matchScore: score,
          context
        });
      }
    });

    // Sort results
    results.sort((a, b) => {
      if (options.sortBy === 'section') {
        return a.sectionName.localeCompare(b.sectionName);
      } else if (options.sortBy === 'date' && a.lastModified && b.lastModified) {
        return b.lastModified.getTime() - a.lastModified.getTime();
      } else {
        // Sort by relevance (match score)
        return b.matchScore - a.matchScore;
      }
    });

    // Limit results
    if (options.maxResults) {
      return results.slice(0, options.maxResults);
    }

    return results;
  }

  private fuzzyMatch(pattern: string, text: string): number {
    pattern = pattern.toLowerCase();
    text = text.toLowerCase();
    
    let score = 0;
    let patternIdx = 0;
    let textIdx = 0;
    let consecutiveMatches = 0;
    
    while (textIdx < text.length && patternIdx < pattern.length) {
      if (pattern[patternIdx] === text[textIdx]) {
        score += 1 + consecutiveMatches;
        consecutiveMatches++;
        patternIdx++;
      } else {
        consecutiveMatches = 0;
      }
      textIdx++;
    }
    
    // Bonus for matching all characters
    if (patternIdx === pattern.length) {
      score += 10;
    }
    
    // Penalty for length difference
    score -= Math.abs(pattern.length - text.length) * 0.1;
    
    return Math.max(0, score);
  }

  private getContext(text: string, query: string, contextLength: number = 50): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, contextLength * 2) + '...';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    // Highlight the match
    const matchStart = index - start;
    const matchEnd = matchStart + query.length;
    context = context.substring(0, matchStart) + 
              `**${context.substring(matchStart, matchEnd)}**` + 
              context.substring(matchEnd);
    
    return context;
  }

  private getSectionName(sectionId: string): string {
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
      riskManagement: 'Risk Management',
      documents: 'Documents'
    };
    
    return sectionNames[sectionId] || sectionId;
  }

  private getFieldName(fieldId: string): string {
    // Convert camelCase to Title Case
    return fieldId
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  async saveFilter(name: string, options: SearchOptions, userId: string): Promise<string> {
    const filterId = `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const filter: SearchFilter = {
      id: filterId,
      name,
      query: options.query,
      filters: {
        sections: options.sections,
        fieldTypes: options.fieldTypes,
        dateRange: options.dateRange,
        completionStatus: options.completionStatus,
        modifiedBy: options.modifiedBy,
        tags: options.tags,
        hasAttachments: options.hasAttachments
      },
      savedAt: new Date(),
      savedBy: userId
    };
    
    this.savedFilters.set(filterId, filter);
    await this.saveFilters();
    
    return filterId;
  }

  async getSavedFilters(): Promise<SearchFilter[]> {
    return Array.from(this.savedFilters.values());
  }

  async deleteSavedFilter(filterId: string): Promise<boolean> {
    if (!this.savedFilters.has(filterId)) {
      return false;
    }
    
    this.savedFilters.delete(filterId);
    await this.saveFilters();
    
    return true;
  }

  async applySavedFilter(filterId: string): Promise<SearchOptions | null> {
    const filter = this.savedFilters.get(filterId);
    if (!filter) return null;
    
    return {
      query: filter.query,
      ...filter.filters
    };
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    // Get field names as suggestions
    this.searchIndex.forEach((item) => {
      const fieldName = this.getFieldName(item.fieldId);
      if (fieldName.toLowerCase().includes(lowerQuery)) {
        suggestions.add(fieldName);
      }
      
      // Get values as suggestions (limit to short strings)
      if (typeof item.value === 'string' && 
          item.value.length < 50 && 
          item.value.toLowerCase().includes(lowerQuery)) {
        suggestions.add(item.value);
      }
    });
    
    // Get section names
    const sections = ['Basic Information', 'Narrative', 'Governance', 'Management', 
                     'Financials', 'Programs', 'Impact', 'Compliance'];
    sections.forEach(section => {
      if (section.toLowerCase().includes(lowerQuery)) {
        suggestions.add(section);
      }
    });
    
    return Array.from(suggestions).slice(0, 10);
  }

  async refreshIndex(): Promise<void> {
    this.searchIndex.clear();
    await this.buildSearchIndex();
  }

  getQuickFilters(): Array<{ label: string; options: Partial<SearchOptions> }> {
    return [
      {
        label: 'Incomplete Fields',
        options: { completionStatus: 'incomplete' }
      },
      {
        label: 'Recently Modified',
        options: {
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        }
      },
      {
        label: 'Has Attachments',
        options: { hasAttachments: true }
      },
      {
        label: 'Financial Data',
        options: { sections: ['financials'] }
      },
      {
        label: 'Contact Information',
        options: { fieldTypes: ['email', 'phone'] }
      }
    ];
  }
}

export const searchService = new SearchService();