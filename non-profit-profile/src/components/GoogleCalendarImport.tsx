import React, { useState, useEffect } from 'react';
import {
  Calendar, Upload, RefreshCw, CheckCircle, AlertCircle,
  Clock, MapPin, Users, FileText, Plus, X, Search,
  Filter, Download, ChevronRight, Eye, Edit2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
  };
  attachments?: Array<{
    fileUrl: string;
    title: string;
  }>;
}

interface EnrichedEvent {
  googleEvent: GoogleEvent;
  enrichment: {
    type: 'event' | 'meeting' | 'fundraiser' | 'program' | 'volunteer';
    attendeeCount: number;
    actualAttendees?: number;
    budget?: number;
    raised?: number;
    spent?: number;
    peopleServed?: number;
    volunteers?: number;
    outcomes?: string[];
    testimonials?: string[];
    photos?: string[];
    impact?: string;
    challenges?: string;
    followUp?: string;
    tags: string[];
  };
  imported: boolean;
  selected: boolean;
}

interface GoogleCalendarImportProps {
  onClose: () => void;
  onEventsImport: (events: unknown[]) => void;
  apiKey?: string;
}

const GoogleCalendarImport: React.FC<GoogleCalendarImportProps> = ({
  onClose,
  onEventsImport,
  apiKey
}) => {
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EnrichedEvent | null>(null);

  // Initialize Google Calendar API
  useEffect(() => {
    if ((window as any).gapi && apiKey) {
      (window as any).gapi.load('client:auth2', () => {
        (window as any).gapi.client.init({
          apiKey: apiKey,
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.readonly'
        }).then(() => {
          setIsAuthenticated(true);
          loadCalendars();
        });
      });
    }
  }, [apiKey]);

  // Mock function for demo - replace with actual Google Calendar API calls
  const loadCalendars = async () => {
    // In production, this would use gapi.client.calendar.calendarList.list()
    const mockCalendars = [
      { id: 'primary', summary: 'Primary Calendar' },
      { id: 'events@org.com', summary: 'Organization Events' },
      { id: 'board@org.com', summary: 'Board Meetings' }
    ];
    setCalendars(mockCalendars);
    setSelectedCalendar('primary');
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // In production, this would use gapi.client.calendar.events.list()
      // For demo, creating mock historical events
      const mockEvents: GoogleEvent[] = [
        {
          id: '1',
          summary: 'Annual Fundraising Gala 2023',
          description: 'Our signature fundraising event of the year',
          location: 'Grand Ballroom, City Hotel',
          start: { dateTime: '2023-11-15T18:00:00' },
          end: { dateTime: '2023-11-15T22:00:00' },
          attendees: Array(150).fill({}).map((_, i) => ({
            email: `guest${i}@example.com`,
            displayName: `Guest ${i}`,
            responseStatus: 'accepted'
          }))
        },
        {
          id: '2',
          summary: 'Youth Summer Camp',
          description: 'Two-week educational and recreational program',
          location: 'Community Center',
          start: { date: '2023-07-10' },
          end: { date: '2023-07-21' },
          attendees: Array(45).fill({}).map((_, i) => ({
            email: `participant${i}@example.com`,
            displayName: `Participant ${i}`,
            responseStatus: 'accepted'
          }))
        },
        {
          id: '3',
          summary: 'Board Strategic Planning Retreat',
          description: 'Annual board meeting for strategic planning',
          location: 'Mountain View Conference Center',
          start: { date: '2023-09-08' },
          end: { date: '2023-09-10' },
          attendees: Array(12).fill({}).map((_, i) => ({
            email: `board${i}@example.com`,
            displayName: `Board Member ${i}`,
            responseStatus: 'accepted'
          }))
        },
        {
          id: '4',
          summary: 'Community Health Fair',
          description: 'Free health screenings and education',
          location: 'City Park',
          start: { dateTime: '2023-06-03T09:00:00' },
          end: { dateTime: '2023-06-03T15:00:00' },
          attendees: Array(500).fill({}).map((_, i) => ({
            email: `visitor${i}@example.com`,
            displayName: `Visitor ${i}`,
            responseStatus: 'accepted'
          }))
        },
        {
          id: '5',
          summary: 'Volunteer Appreciation Dinner',
          description: 'Annual celebration for our volunteers',
          location: 'Organization Headquarters',
          start: { dateTime: '2023-12-10T18:00:00' },
          end: { dateTime: '2023-12-10T20:00:00' },
          attendees: Array(75).fill({}).map((_, i) => ({
            email: `volunteer${i}@example.com`,
            displayName: `Volunteer ${i}`,
            responseStatus: 'accepted'
          }))
        }
      ];

      // Convert to enriched events
      const enrichedEvents: EnrichedEvent[] = mockEvents.map(event => ({
        googleEvent: event,
        enrichment: {
          type: guessEventType(event.summary),
          attendeeCount: event.attendees?.length || 0,
          tags: generateTags(event.summary),
          actualAttendees: undefined,
          budget: undefined,
          raised: undefined,
          spent: undefined,
          peopleServed: undefined,
          volunteers: undefined,
          outcomes: [],
          testimonials: [],
          photos: [],
          impact: undefined,
          challenges: undefined,
          followUp: undefined
        },
        imported: false,
        selected: false
      }));

      setEvents(enrichedEvents);
      toast.success(`Found ${enrichedEvents.length} events to import`);
    } catch (error) {
      toast.error('Failed to fetch events from Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const guessEventType = (summary: string): EnrichedEvent['enrichment']['type'] => {
    const lower = (summary || '').toLowerCase();
    if (lower.includes('board') || lower.includes('meeting')) return 'meeting';
    if (lower.includes('gala') || lower.includes('fundrais')) return 'fundraiser';
    if (lower.includes('volunteer')) return 'volunteer';
    if (lower.includes('camp') || lower.includes('workshop') || lower.includes('training')) return 'program';
    return 'event';
  };

  const generateTags = (summary: string): string[] => {
    const tags = [];
    const lower = (summary || '').toLowerCase();
    if (lower.includes('annual')) tags.push('annual');
    if (lower.includes('fundrais')) tags.push('fundraising');
    if (lower.includes('community')) tags.push('community');
    if (lower.includes('youth')) tags.push('youth');
    if (lower.includes('health')) tags.push('health');
    if (lower.includes('education')) tags.push('education');
    return tags;
  };

  const updateEventEnrichment = (eventId: string, enrichment: Partial<EnrichedEvent['enrichment']>) => {
    setEvents(events.map(event => 
      event.googleEvent.id === eventId 
        ? { ...event, enrichment: { ...event.enrichment, ...enrichment } }
        : event
    ));
  };

  const selectAllEvents = () => {
    setEvents(events.map(event => ({ ...event, selected: true })));
  };

  const deselectAllEvents = () => {
    setEvents(events.map(event => ({ ...event, selected: false })));
  };

  const importSelectedEvents = () => {
    const selectedEvents = events.filter(e => e.selected);
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event to import');
      return;
    }

    // Convert to story events format
    const storyEvents = selectedEvents.map(event => ({
      id: Date.now().toString() + Math.random(),
      title: event.googleEvent.summary,
      type: event.enrichment.type,
      date: event.googleEvent.start.dateTime || event.googleEvent.start.date || '',
      endDate: event.googleEvent.end.dateTime || event.googleEvent.end.date,
      location: event.googleEvent.location,
      description: event.googleEvent.description || '',
      challenge: event.enrichment.challenges || '',
      approach: '',
      outcome: event.enrichment.impact || '',
      impact: {
        peopleServed: event.enrichment.peopleServed || 0,
        storiesCollected: event.enrichment.testimonials || [],
        metricsAchieved: event.enrichment.outcomes?.map(o => ({ metric: o, value: 'Achieved' })) || []
      },
      budget: event.enrichment.budget || 0,
      raised: event.enrichment.raised || 0,
      spent: event.enrichment.spent || 0,
      fundingSources: [],
      attendees: event.enrichment.actualAttendees || event.enrichment.attendeeCount,
      volunteers: event.enrichment.volunteers,
      donors: [],
      partners: [],
      photos: event.enrichment.photos,
      testimonials: event.enrichment.testimonials?.map(t => ({
        author: 'Participant',
        quote: t,
        role: 'Beneficiary'
      })),
      mediaLinks: [],
      reports: [],
      missionAlignment: [],
      strategicGoals: [],
      tags: event.enrichment.tags
    }));

    onEventsImport(storyEvents);
    toast.success(`Successfully imported ${selectedEvents.length} events`);
    onClose();
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      (event.googleEvent.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.googleEvent.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || event.enrichment.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold">Import Historical Events</h2>
                <p className="text-sm text-gray-600">
                  Import past events from Google Calendar and enrich with impact data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Selection */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Calendar
              </label>
              <select
                value={selectedCalendar}
                onChange={(e) => setSelectedCalendar(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {calendars.map(cal => (
                  <option key={cal.id} value={cal.id}>{cal.summary}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div className="pt-6">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Fetch Events
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {events.length > 0 && (
          <div className="p-4 border-b flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="meeting">Meetings</option>
              <option value="fundraiser">Fundraisers</option>
              <option value="program">Programs</option>
              <option value="volunteer">Volunteer</option>
            </select>
            
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllEvents}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={deselectAllEvents}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {events.length === 0 
                  ? "No events fetched yet. Click 'Fetch Events' to load your calendar history."
                  : "No events match your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div key={event.googleEvent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={event.selected}
                      onChange={(e) => {
                        setEvents(events.map(ev => 
                          ev.googleEvent.id === event.googleEvent.id 
                            ? { ...ev, selected: e.target.checked }
                            : ev
                        ));
                      }}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.googleEvent.summary}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(event.googleEvent.start.dateTime || event.googleEvent.start.date || '').toLocaleDateString()}
                            </span>
                            {event.googleEvent.location && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.googleEvent.location}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {event.enrichment.attendeeCount} invited
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.enrichment.type === 'fundraiser' ? 'bg-green-100 text-green-700' :
                            event.enrichment.type === 'program' ? 'bg-blue-100 text-blue-700' :
                            event.enrichment.type === 'meeting' ? 'bg-gray-100 text-gray-700' :
                            event.enrichment.type === 'volunteer' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {event.enrichment.type}
                          </span>
                          
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      {event.googleEvent.description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {event.googleEvent.description}
                        </p>
                      )}
                      
                      {/* Quick enrichment stats */}
                      <div className="flex gap-4 mt-3">
                        {event.enrichment.actualAttendees !== undefined && (
                          <span className="text-sm">
                            <strong>Attended:</strong> {event.enrichment.actualAttendees}
                          </span>
                        )}
                        {event.enrichment.raised !== undefined && (
                          <span className="text-sm">
                            <strong>Raised:</strong> ${event.enrichment.raised.toLocaleString()}
                          </span>
                        )}
                        {event.enrichment.peopleServed !== undefined && (
                          <span className="text-sm">
                            <strong>Served:</strong> {event.enrichment.peopleServed}
                          </span>
                        )}
                        {event.enrichment.outcomes && event.enrichment.outcomes.length > 0 && (
                          <span className="text-sm text-green-600">
                            {event.enrichment.outcomes.length} outcomes documented
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {events.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {events.filter(e => e.selected).length} of {events.length} events selected
            </div>
            <button
              onClick={importSelectedEvents}
              disabled={events.filter(e => e.selected).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Import Selected Events
            </button>
          </div>
        )}

        {/* Event Enrichment Modal */}
        {selectedEvent && (
          <EventEnrichmentModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSave={(enrichment) => {
              updateEventEnrichment(selectedEvent.googleEvent.id, enrichment);
              setSelectedEvent(null);
              toast.success('Event enrichment saved');
            }}
          />
        )}
      </div>
    </div>
  );
};

// Event Enrichment Modal
const EventEnrichmentModal: React.FC<{
  event: EnrichedEvent;
  onClose: () => void;
  onSave: (enrichment: Partial<EnrichedEvent['enrichment']>) => void;
}> = ({ event, onClose, onSave }) => {
  const [enrichment, setEnrichment] = useState(event.enrichment);
  const [newOutcome, setNewOutcome] = useState('');
  const [_newTestimonial, _setNewTestimonial] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Enrich Event Data</h3>
          <p className="text-sm text-gray-600 mt-1">{event.googleEvent.summary}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Attendance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invited
              </label>
              <input
                type="number"
                value={enrichment.attendeeCount}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actually Attended
              </label>
              <input
                type="number"
                value={enrichment.actualAttendees || ''}
                onChange={(e) => setEnrichment({ ...enrichment, actualAttendees: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter actual attendance"
              />
            </div>
          </div>

          {/* Financial (for fundraisers) */}
          {enrichment.type === 'fundraiser' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  value={enrichment.budget || ''}
                  onChange={(e) => setEnrichment({ ...enrichment, budget: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raised</label>
                <input
                  type="number"
                  value={enrichment.raised || ''}
                  onChange={(e) => setEnrichment({ ...enrichment, raised: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spent</label>
                <input
                  type="number"
                  value={enrichment.spent || ''}
                  onChange={(e) => setEnrichment({ ...enrichment, spent: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="$0"
                />
              </div>
            </div>
          )}

          {/* Impact */}
          {enrichment.type === 'program' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  People Served
                </label>
                <input
                  type="number"
                  value={enrichment.peopleServed || ''}
                  onChange={(e) => setEnrichment({ ...enrichment, peopleServed: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volunteers
                </label>
                <input
                  type="number"
                  value={enrichment.volunteers || ''}
                  onChange={(e) => setEnrichment({ ...enrichment, volunteers: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcomes Achieved
            </label>
            <div className="space-y-2 mb-2">
              {enrichment.outcomes?.map((outcome, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-100 rounded">{outcome}</span>
                  <button
                    onClick={() => setEnrichment({
                      ...enrichment,
                      outcomes: enrichment.outcomes?.filter((_, index) => index !== i)
                    })}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Add an outcome..."
              />
              <button
                onClick={() => {
                  if (newOutcome) {
                    setEnrichment({
                      ...enrichment,
                      outcomes: [...(enrichment.outcomes || []), newOutcome]
                    });
                    setNewOutcome('');
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Impact Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact Story
            </label>
            <textarea
              value={enrichment.impact || ''}
              onChange={(e) => setEnrichment({ ...enrichment, impact: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Describe the impact of this event..."
            />
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenges Faced
            </label>
            <textarea
              value={enrichment.challenges || ''}
              onChange={(e) => setEnrichment({ ...enrichment, challenges: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="What challenges did you overcome?"
            />
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(enrichment)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Enrichment
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarImport;