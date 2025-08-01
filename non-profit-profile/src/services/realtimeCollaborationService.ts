import { EventEmitter } from 'events';
import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

interface CollaborationEvent {
  id: string;
  type: 'field_update' | 'section_update' | 'user_joined' | 'user_left' | 'cursor_position';
  userId: string;
  userName: string;
  timestamp: Date;
  data: unknown;
  sectionId?: string;
  fieldId?: string;
}

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  color: string;
  lastActivity: Date;
  currentSection?: string;
  cursorPosition?: { x: number; y: number };
}

interface FieldLock {
  fieldId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

class RealtimeCollaborationService extends EventEmitter {
  private activeUsers: Map<string, ActiveUser> = new Map();
  private fieldLocks: Map<string, FieldLock> = new Map();
  private pendingChanges: CollaborationEvent[] = [];
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private organizationId: string = '';
  private userId: string = '';
  private userName: string = '';
  private userColor: string = '';

  constructor() {
    super();
    this.generateUserColor();
  }

  private generateUserColor(): void {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#5D5C61',
      '#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3', '#54A0FF'
    ];
    this.userColor = colors[Math.floor(Math.random() * colors.length)];
  }

  async initialize(organizationId: string, userId: string, userName: string): Promise<void> {
    this.organizationId = organizationId;
    this.userId = userId;
    this.userName = userName;

    // Connect to WebSocket for real-time updates
    this.connectWebSocket();

    // Start syncing active users
    this.startUserSync();

    // Load existing active users
    await this.loadActiveUsers();

    // Announce user joined
    this.broadcastEvent({
      id: `${Date.now()}-${userId}`,
      type: 'user_joined',
      userId,
      userName,
      timestamp: new Date(),
      data: { color: this.userColor }
    });
  }

  private connectWebSocket(): void {
    try {
      // In production, this would connect to a real WebSocket server
      // For now, we'll use a mock connection with polling
      this.simulateWebSocketConnection();
    } catch (error) {
      logger.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private simulateWebSocketConnection(): void {
    // Poll for updates every 2 seconds
    setInterval(async () => {
      const updates = await this.fetchRemoteUpdates();
      updates.forEach(update => {
        this.handleRemoteUpdate(update);
      });
    }, 2000);
  }

  private async fetchRemoteUpdates(): Promise<CollaborationEvent[]> {
    try {
      const stored = await netlifySettingsService.get(`collaboration_events_${this.organizationId}`);
      if (!stored || !Array.isArray(stored)) return [];

      // Get events from the last 5 seconds that weren't created by this user
      const recentEvents = stored.filter((event: CollaborationEvent) => {
        const eventTime = new Date(event.timestamp).getTime();
        const now = Date.now();
        return eventTime > now - 5000 && event.userId !== this.userId;
      });

      return recentEvents;
    } catch (error) {
      logger.error('Failed to fetch remote updates:', error);
      return [];
    }
  }

  private handleRemoteUpdate(event: CollaborationEvent): void {
    switch (event.type) {
      case 'field_update':
        this.emit('fieldUpdated', event);
        break;
      case 'section_update':
        this.emit('sectionUpdated', event);
        break;
      case 'user_joined':
        this.handleUserJoined(event);
        break;
      case 'user_left':
        this.handleUserLeft(event);
        break;
      case 'cursor_position':
        this.handleCursorUpdate(event);
        break;
    }
  }

  private handleUserJoined(event: CollaborationEvent): void {
    const eventData = event.data as any;
    const user: ActiveUser = {
      id: event.userId,
      name: event.userName,
      email: eventData.email || '',
      color: eventData.color,
      lastActivity: new Date(event.timestamp),
      currentSection: eventData.currentSection
    };
    this.activeUsers.set(event.userId, user);
    this.emit('userJoined', user);
  }

  private handleUserLeft(event: CollaborationEvent): void {
    this.activeUsers.delete(event.userId);
    this.emit('userLeft', event.userId);
    
    // Release any locks held by this user
    this.fieldLocks.forEach((lock, fieldId) => {
      if (lock.userId === event.userId) {
        this.fieldLocks.delete(fieldId);
        this.emit('fieldUnlocked', fieldId);
      }
    });
  }

  private handleCursorUpdate(event: CollaborationEvent): void {
    const user = this.activeUsers.get(event.userId);
    const eventData = event.data as any;
    if (user) {
      user.cursorPosition = eventData.position;
      user.currentSection = eventData.section;
      this.emit('cursorMoved', { userId: event.userId, ...eventData });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      this.connectWebSocket();
    }, 5000);
  }

  private startUserSync(): void {
    // Update active users every 30 seconds
    this.syncInterval = setInterval(async () => {
      await this.syncActiveUsers();
    }, 30000);

    // Immediate sync
    this.syncActiveUsers();
  }

  private async loadActiveUsers(): Promise<void> {
    try {
      const stored = await netlifySettingsService.get(`active_users_${this.organizationId}`);
      if (stored && typeof stored === 'object') {
        Object.entries(stored).forEach(([userId, userData]) => {
          const user = userData as ActiveUser;
          // Only add users active in the last 5 minutes
          if (new Date(user.lastActivity).getTime() > Date.now() - 300000) {
            this.activeUsers.set(userId, user);
          }
        });
      }
    } catch (error) {
      logger.error('Failed to load active users:', error);
    }
  }

  private async syncActiveUsers(): Promise<void> {
    try {
      // Update our own activity
      const self: ActiveUser = {
        id: this.userId,
        name: this.userName,
        email: '',
        color: this.userColor,
        lastActivity: new Date(),
        currentSection: this.getCurrentSection()
      };
      this.activeUsers.set(this.userId, self);

      // Convert Map to object for storage
      const usersObj: Record<string, ActiveUser> = {};
      this.activeUsers.forEach((user, id) => {
        // Remove inactive users (no activity for 5 minutes)
        if (new Date(user.lastActivity).getTime() > Date.now() - 300000) {
          usersObj[id] = user;
        }
      });

      await netlifySettingsService.set(`active_users_${this.organizationId}`, usersObj);
    } catch (error) {
      logger.error('Failed to sync active users:', error);
    }
  }

  private getCurrentSection(): string {
    // This would be set by the UI components
    return 'unknown';
  }

  async broadcastEvent(event: CollaborationEvent): Promise<void> {
    try {
      // Store event for other users to pick up
      const events = (await netlifySettingsService.get(`collaboration_events_${this.organizationId}`) || []) as CollaborationEvent[];
      
      // Keep only recent events (last 30 seconds)
      const recentEvents = events.filter((e: CollaborationEvent) => {
        return new Date(e.timestamp).getTime() > Date.now() - 30000;
      });
      
      recentEvents.push(event);
      
      await netlifySettingsService.set(`collaboration_events_${this.organizationId}`, recentEvents);
    } catch (error) {
      logger.error('Failed to broadcast event:', error);
      this.pendingChanges.push(event);
    }
  }

  async updateField(sectionId: string, fieldId: string, value: unknown): Promise<void> {
    const event: CollaborationEvent = {
      id: `${Date.now()}-${this.userId}`,
      type: 'field_update',
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date(),
      sectionId,
      fieldId,
      data: { value }
    };

    await this.broadcastEvent(event);
  }

  async lockField(fieldId: string): Promise<boolean> {
    // Check if field is already locked
    const existingLock = this.fieldLocks.get(fieldId);
    if (existingLock && existingLock.userId !== this.userId) {
      return false;
    }

    const lock: FieldLock = {
      fieldId,
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date()
    };

    this.fieldLocks.set(fieldId, lock);
    
    // Broadcast lock event
    await this.broadcastEvent({
      id: `${Date.now()}-${this.userId}`,
      type: 'field_update',
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date(),
      fieldId,
      data: { locked: true, lockedBy: this.userName }
    });

    return true;
  }

  async unlockField(fieldId: string): Promise<void> {
    const lock = this.fieldLocks.get(fieldId);
    if (lock && lock.userId === this.userId) {
      this.fieldLocks.delete(fieldId);
      
      // Broadcast unlock event
      await this.broadcastEvent({
        id: `${Date.now()}-${this.userId}`,
        type: 'field_update',
        userId: this.userId,
        userName: this.userName,
        timestamp: new Date(),
        fieldId,
        data: { locked: false }
      });
    }
  }

  isFieldLocked(fieldId: string): { locked: boolean; lockedBy?: string } {
    const lock = this.fieldLocks.get(fieldId);
    if (lock && lock.userId !== this.userId) {
      return { locked: true, lockedBy: lock.userName };
    }
    return { locked: false };
  }

  getActiveUsers(): ActiveUser[] {
    return Array.from(this.activeUsers.values()).filter(
      user => user.id !== this.userId
    );
  }

  updateCursorPosition(x: number, y: number, section: string): void {
    this.broadcastEvent({
      id: `${Date.now()}-${this.userId}`,
      type: 'cursor_position',
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date(),
      data: { position: { x, y }, section }
    });
  }

  async cleanup(): Promise<void> {
    // Announce user leaving
    await this.broadcastEvent({
      id: `${Date.now()}-${this.userId}`,
      type: 'user_left',
      userId: this.userId,
      userName: this.userName,
      timestamp: new Date(),
      data: {}
    });

    // Clear intervals
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Close websocket
    if (this.websocket) {
      this.websocket.close();
    }

    // Clear local data
    this.activeUsers.clear();
    this.fieldLocks.clear();
    this.pendingChanges = [];
  }
}

export const collaborationService = new RealtimeCollaborationService();