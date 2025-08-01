/**
 * Auto-save Event Service
 * Manages global auto-save state through events
 */

type AutoSaveState = {
  lastSaved?: Date;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError?: string;
  autoSaveInterval?: number;
};

type AutoSaveListener = (state: AutoSaveState) => void;

class AutoSaveEventService {
  private state: AutoSaveState = {
    isSaving: false,
    hasUnsavedChanges: false,
    autoSaveInterval: 30
  };
  
  private listeners: Set<AutoSaveListener> = new Set();

  subscribe(listener: AutoSaveListener): () => void {
    this.listeners.add(listener);
    // Immediately call listener with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateState(updates: Partial<AutoSaveState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  startSaving() {
    this.updateState({ isSaving: true, saveError: undefined });
  }

  saveCompleted() {
    this.updateState({ 
      isSaving: false, 
      hasUnsavedChanges: false, 
      lastSaved: new Date(),
      saveError: undefined 
    });
  }

  saveFailed(error: string) {
    this.updateState({ 
      isSaving: false, 
      saveError: error 
    });
  }

  markUnsaved() {
    this.updateState({ hasUnsavedChanges: true });
  }

  getState(): AutoSaveState {
    return { ...this.state };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.state);
    });
  }
}

export const autoSaveEventService = new AutoSaveEventService();