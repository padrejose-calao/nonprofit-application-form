/**
 * Event Management Service
 * Manages events with EUID tracking and categorization
 */

import { EntityType, AccessLevel, RelationshipType } from './euidTypes';
import { euidService } from './euidService';
import { netlifyDatabase } from './netlifyDatabaseService';
import { universalAuditService } from './universalAuditService';
import { logger } from '../utils/logger';

export enum EventCategory {
  // Fundraising Events
  GALA = 'GALA',
  AUCTION = 'AUCTION',
  WALKATHON = 'WALKATHON',
  GOLF_TOURNAMENT = 'GOLF_TOURNAMENT',
  BENEFIT_CONCERT = 'BENEFIT_CONCERT',
  
  // Community Events
  VOLUNTEER_DAY = 'VOLUNTEER_DAY',
  COMMUNITY_OUTREACH = 'COMMUNITY_OUTREACH',
  FOOD_DRIVE = 'FOOD_DRIVE',
  CLOTHING_DRIVE = 'CLOTHING_DRIVE',
  
  // Educational Events
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  WEBINAR = 'WEBINAR',
  
  // Board/Governance Events
  BOARD_MEETING = 'BOARD_MEETING',
  ANNUAL_MEETING = 'ANNUAL_MEETING',
  STRATEGIC_PLANNING = 'STRATEGIC_PLANNING',
  COMMITTEE_MEETING = 'COMMITTEE_MEETING',
  
  // Program Events
  PROGRAM_LAUNCH = 'PROGRAM_LAUNCH',
  SERVICE_DELIVERY = 'SERVICE_DELIVERY',
  CLIENT_EVENT = 'CLIENT_EVENT',
  GRADUATION = 'GRADUATION',
  
  // Networking Events
  MIXER = 'MIXER',
  PARTNERSHIP_MEETING = 'PARTNERSHIP_MEETING',
  DONOR_RECEPTION = 'DONOR_RECEPTION',
  
  // Other
  CELEBRATION = 'CELEBRATION',
  HOLIDAY_EVENT = 'HOLIDAY_EVENT',
  ANNIVERSARY = 'ANNIVERSARY',
  OTHER = 'OTHER'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export enum EventRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY'
}

export interface EventVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity: number;
  amenities: string[];
  virtualLink?: string;
  isVirtual: boolean;
  isHybrid: boolean;
}

export interface EventBudget {
  estimated: number;
  actual: number;
  revenue: number;
  expenses: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
}

export interface EventAttendee {
  euid: string;
  name: string;
  email: string;
  role: 'organizer' | 'speaker' | 'sponsor' | 'volunteer' | 'participant' | 'vip';
  registrationDate: string;
  attended: boolean;
  checkInTime?: string;
}

export interface Event {
  euid: string;
  name: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate: string;
  recurrence: EventRecurrence;
  venue: EventVenue;
  organizerEUID: string;
  hostOrganizationEUID: string;
  budget: EventBudget;
  attendees: EventAttendee[];
  maxAttendees: number;
  registrationDeadline?: string;
  tags: string[];
  relatedDocumentEUIDs: string[];
  createdAt: string;
  createdBy: string;
  modifiedAt?: string;
  modifiedBy?: string;
  metadata: {
    requiresRegistration: boolean;
    isPublic: boolean;
    allowWalkIns: boolean;
    hasWaitlist: boolean;
    streamingEnabled: boolean;
    recordingAvailable: boolean;
  };
}

export interface EventSeries {
  seriesEUID: string;
  name: string;
  description: string;
  eventEUIDs: string[];
  recurrenceRule: string;
  startDate: string;
  endDate?: string;
}

class EventManagementService {
  private static instance: EventManagementService;
  private events: Map<string, Event> = new Map();
  private eventSeries: Map<string, EventSeries> = new Map();

  private constructor() {
    this.loadEvents();
  }

  static getInstance(): EventManagementService {
    if (!EventManagementService.instance) {
      EventManagementService.instance = new EventManagementService();
    }
    return EventManagementService.instance;
  }

  private async loadEvents() {
    try {
      const events = await netlifyDatabase.query({
        type: 'event'
      });
      
      events.forEach(record => {
        const event = record.data as Event;
        this.events.set(event.euid, event);
      });
      
      logger.debug(`Loaded ${this.events.size} events`);
    } catch (error) {
      logger.error('Failed to load events:', error);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    eventData: Omit<Event, 'euid' | 'createdAt' | 'createdBy'>,
    userId: string,
    accessLevel?: AccessLevel
  ): Promise<Event> {
    // Generate EUID for event
    const euid = await euidService.generateEUID(
      EntityType.EVENT,
      userId,
      accessLevel
    );

    const event: Event = {
      ...eventData,
      euid,
      createdAt: new Date().toISOString(),
      createdBy: userId
    };

    // Create relationships
    const relationships = [];
    
    // Link to host organization
    if (event.hostOrganizationEUID) {
      relationships.push({
        targetEUID: event.hostOrganizationEUID,
        type: RelationshipType.PARENT,
        startDate: event.startDate
      });
    }

    // Link to organizer
    if (event.organizerEUID) {
      relationships.push({
        targetEUID: event.organizerEUID,
        type: RelationshipType.MANAGER,
        startDate: event.createdAt
      });
    }

    if (relationships.length > 0) {
      await euidService.addRelationships(euid, relationships, userId);
    }

    // Save to database
    await netlifyDatabase.create('event', event, userId);
    this.events.set(euid, event);

    // Log creation
    await universalAuditService.logAction({
      action: 'event_created',
      entityId: euid,
      entityType: 'event',
      userId,
      details: {
        name: event.name,
        category: event.category,
        startDate: event.startDate
      },
      timestamp: new Date().toISOString()
    });

    return event;
  }

  /**
   * Create a recurring event series
   */
  async createEventSeries(
    baseEvent: Omit<Event, 'euid' | 'createdAt' | 'createdBy'>,
    recurrenceRule: string,
    seriesEndDate: string,
    userId: string
  ): Promise<EventSeries> {
    const seriesEUID = await euidService.generateEUID(
      EntityType.EVENT,
      userId
    );

    const eventEUIDs: string[] = [];
    const dates = this.generateRecurringDates(
      baseEvent.startDate,
      seriesEndDate,
      baseEvent.recurrence
    );

    // Create individual events
    for (const date of dates) {
      const event = await this.createEvent(
        {
          ...baseEvent,
          startDate: date.start,
          endDate: date.end
        },
        userId
      );
      eventEUIDs.push(event.euid);
    }

    const series: EventSeries = {
      seriesEUID,
      name: `${baseEvent.name} Series`,
      description: baseEvent.description,
      eventEUIDs,
      recurrenceRule,
      startDate: baseEvent.startDate,
      endDate: seriesEndDate
    };

    await netlifyDatabase.create('event_series', series, userId);
    this.eventSeries.set(seriesEUID, series);

    return series;
  }

  /**
   * Update event
   */
  async updateEvent(
    euid: string,
    updates: Partial<Event>,
    userId: string
  ): Promise<Event | null> {
    const event = this.events.get(euid);
    if (!event) return null;

    const updatedEvent = {
      ...event,
      ...updates,
      modifiedAt: new Date().toISOString(),
      modifiedBy: userId
    };

    await netlifyDatabase.update(euid, updatedEvent, userId);
    this.events.set(euid, updatedEvent);

    await universalAuditService.logAction({
      action: 'event_updated',
      entityId: euid,
      entityType: 'event',
      userId,
      details: { updates: Object.keys(updates) },
      timestamp: new Date().toISOString()
    });

    return updatedEvent;
  }

  /**
   * Register attendee
   */
  async registerAttendee(
    eventEUID: string,
    attendee: Omit<EventAttendee, 'registrationDate' | 'attended'>,
    userId: string
  ): Promise<boolean> {
    const event = this.events.get(eventEUID);
    if (!event) return false;

    // Check capacity
    if (event.attendees.length >= event.maxAttendees) {
      if (!event.metadata.hasWaitlist) {
        return false;
      }
    }

    const newAttendee: EventAttendee = {
      ...attendee,
      registrationDate: new Date().toISOString(),
      attended: false
    };

    event.attendees.push(newAttendee);
    await this.updateEvent(eventEUID, { attendees: event.attendees }, userId);

    // Create relationship between attendee and event
    await euidService.addRelationships(
      attendee.euid,
      [{
        targetEUID: eventEUID,
        type: RelationshipType.BENEFICIARY,
        startDate: newAttendee.registrationDate
      }],
      userId
    );

    return true;
  }

  /**
   * Check in attendee
   */
  async checkInAttendee(
    eventEUID: string,
    attendeeEUID: string,
    userId: string
  ): Promise<boolean> {
    const event = this.events.get(eventEUID);
    if (!event) return false;

    const attendee = event.attendees.find(a => a.euid === attendeeEUID);
    if (!attendee) return false;

    attendee.attended = true;
    attendee.checkInTime = new Date().toISOString();

    await this.updateEvent(eventEUID, { attendees: event.attendees }, userId);
    return true;
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: EventCategory): Event[] {
    return Array.from(this.events.values()).filter(
      event => event.category === category
    );
  }

  /**
   * Get upcoming events
   */
  getUpcomingEvents(organizationEUID?: string): Event[] {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => {
        const eventDate = new Date(event.startDate);
        const matchesOrg = !organizationEUID || event.hostOrganizationEUID === organizationEUID;
        return eventDate > now && matchesOrg && event.status !== EventStatus.CANCELLED;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  /**
   * Get past events
   */
  getPastEvents(organizationEUID?: string): Event[] {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => {
        const eventDate = new Date(event.endDate || event.startDate);
        const matchesOrg = !organizationEUID || event.hostOrganizationEUID === organizationEUID;
        return eventDate < now && matchesOrg;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  /**
   * Generate recurring dates
   */
  private generateRecurringDates(
    startDate: string,
    endDate: string,
    recurrence: EventRecurrence
  ): Array<{ start: string; end: string }> {
    const dates: Array<{ start: string; end: string }> = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      dates.push({
        start: current.toISOString(),
        end: new Date(current.getTime() + 2 * 60 * 60 * 1000).toISOString() // 2 hours default
      });

      switch (recurrence) {
        case EventRecurrence.DAILY:
          current.setDate(current.getDate() + 1);
          break;
        case EventRecurrence.WEEKLY:
          current.setDate(current.getDate() + 7);
          break;
        case EventRecurrence.BIWEEKLY:
          current.setDate(current.getDate() + 14);
          break;
        case EventRecurrence.MONTHLY:
          current.setMonth(current.getMonth() + 1);
          break;
        case EventRecurrence.QUARTERLY:
          current.setMonth(current.getMonth() + 3);
          break;
        case EventRecurrence.ANNUALLY:
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          return dates;
      }
    }

    return dates;
  }

  /**
   * Get event statistics
   */
  async getEventStatistics(organizationEUID?: string): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalAttendees: number;
    averageAttendance: number;
    categoryBreakdown: Record<EventCategory, number>;
  }> {
    const events = organizationEUID
      ? Array.from(this.events.values()).filter(e => e.hostOrganizationEUID === organizationEUID)
      : Array.from(this.events.values());

    const categoryBreakdown: Record<EventCategory, number> = {} as any;
    let totalAttendees = 0;
    let completedEvents = 0;

    events.forEach(event => {
      categoryBreakdown[event.category] = (categoryBreakdown[event.category] || 0) + 1;
      
      if (event.status === EventStatus.COMPLETED) {
        completedEvents++;
        totalAttendees += event.attendees.filter(a => a.attended).length;
      }
    });

    return {
      totalEvents: events.length,
      upcomingEvents: this.getUpcomingEvents(organizationEUID).length,
      completedEvents,
      totalAttendees,
      averageAttendance: completedEvents > 0 ? totalAttendees / completedEvents : 0,
      categoryBreakdown
    };
  }

  /**
   * Export event data
   */
  async exportEventData(eventEUID: string): Promise<unknown> {
    const event = this.events.get(eventEUID);
    if (!event) return null;

    return {
      event,
      attendeeList: event.attendees,
      statistics: {
        registered: event.attendees.length,
        attended: event.attendees.filter(a => a.attended).length,
        noShow: event.attendees.filter(a => !a.attended).length,
        attendanceRate: event.attendees.length > 0
          ? (event.attendees.filter(a => a.attended).length / event.attendees.length) * 100
          : 0
      }
    };
  }
}

export const eventManagementService = EventManagementService.getInstance();