import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

interface HistoricalSuggestion {
  field: string;
  value: string;
  timestamp: string;
  frequency: number;
}

interface SuggestionsStore {
  suggestions: HistoricalSuggestion[];
  lastUpdated: string;
}

class HistoricalSuggestionsService {
  private static instance: HistoricalSuggestionsService;
  private suggestions: Map<string, HistoricalSuggestion[]> = new Map();
  private isLoading: boolean = false;

  private constructor() {
    this.loadSuggestions();
  }

  static getInstance(): HistoricalSuggestionsService {
    if (!HistoricalSuggestionsService.instance) {
      HistoricalSuggestionsService.instance = new HistoricalSuggestionsService();
    }
    return HistoricalSuggestionsService.instance;
  }

  private async loadSuggestions() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const stored = await netlifySettingsService.get('historical-suggestions');
      if (stored && (stored as any).suggestions) {
        const suggestions = (stored as any).suggestions as HistoricalSuggestion[];
        
        // Group suggestions by field
        this.suggestions.clear();
        suggestions.forEach(suggestion => {
          const fieldSuggestions = this.suggestions.get(suggestion.field) || [];
          fieldSuggestions.push(suggestion);
          this.suggestions.set(suggestion.field, fieldSuggestions);
        });
      }
    } catch (error) {
      logger.error('Failed to load historical suggestions:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async saveSuggestions() {
    try {
      // Flatten the map to array for storage
      const allSuggestions: HistoricalSuggestion[] = [];
      this.suggestions.forEach((fieldSuggestions) => {
        allSuggestions.push(...fieldSuggestions);
      });

      const store: SuggestionsStore = {
        suggestions: allSuggestions,
        lastUpdated: new Date().toISOString()
      };

      await netlifySettingsService.set('historical-suggestions', store, 'organization');
    } catch (error) {
      logger.error('Failed to save historical suggestions:', error);
    }
  }

  async addSuggestion(field: string, value: string) {
    if (!value || !value.trim()) return;

    const fieldSuggestions = this.suggestions.get(field) || [];
    
    // Check if this value already exists
    const existingIndex = fieldSuggestions.findIndex(s => 
      s.value.toLowerCase() === value.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Increment frequency if it exists
      fieldSuggestions[existingIndex].frequency += 1;
      fieldSuggestions[existingIndex].timestamp = new Date().toISOString();
    } else {
      // Add new suggestion
      fieldSuggestions.push({
        field,
        value,
        timestamp: new Date().toISOString(),
        frequency: 1
      });
    }

    // Sort by frequency (most used first) and limit to top 20
    fieldSuggestions.sort((a, b) => b.frequency - a.frequency);
    const topSuggestions = fieldSuggestions.slice(0, 20);

    this.suggestions.set(field, topSuggestions);
    await this.saveSuggestions();
    
    logger.info('Added historical suggestion:', { field, value });
  }

  getSuggestions(field: string, limit: number = 10): string[] {
    const fieldSuggestions = this.suggestions.get(field) || [];
    return fieldSuggestions
      .slice(0, limit)
      .map(s => s.value);
  }

  getAllSuggestions(): Map<string, string[]> {
    const result = new Map<string, string[]>();
    this.suggestions.forEach((suggestions, field) => {
      result.set(field, suggestions.map(s => s.value));
    });
    return result;
  }

  async clearSuggestions(field?: string) {
    if (field) {
      this.suggestions.delete(field);
    } else {
      this.suggestions.clear();
    }
    await this.saveSuggestions();
  }
}

export const historicalSuggestionsService = HistoricalSuggestionsService.getInstance();