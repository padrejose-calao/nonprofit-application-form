import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, DollarSign, Gift, Heart, Users, Trophy, Target,
  Building2, FileText, TrendingUp, Clock, ChevronRight, Plus,
  BarChart3, Globe, Camera, Share2, Activity, Star, Flag,
  MapPin, UserPlus, CheckCircle, Award, Zap, BookOpen,
  MessageCircle, Eye, Edit2, Download, Filter, Search, Upload
} from 'lucide-react';
import { Contact } from '../types/NonprofitTypes';
import { toast } from 'react-toastify';
import GoogleCalendarImport from './GoogleCalendarImport';

// Event/Campaign with storytelling focus
interface StoryEvent {
  id: string;
  title: string;
  type: 'campaign' | 'event' | 'grant' | 'program';
  date: string;
  endDate?: string;
  location?: string;
  description: string;
  
  // Story Elements
  challenge: string; // What problem were we solving?
  approach: string; // How did we approach it?
  outcome: string; // What was the result?
  impact: {
    peopleServed: number;
    storiesCollected: string[];
    metricsAchieved: { metric: string; value: string }[];
  };
  
  // Financial
  budget: number;
  raised: number;
  spent: number;
  fundingSources: { source: string; amount: number; type: string }[];
  
  // Engagement
  attendees?: number;
  volunteers?: number;
  donors: string[]; // Contact IDs
  partners: string[];
  
  // Documentation
  photos?: string[];
  testimonials?: { author: string; quote: string; role: string }[];
  mediaLinks?: string[];
  reports?: string[];
  
  // Mission Alignment
  missionAlignment: string[];
  strategicGoals: string[];
  
  tags: string[];
}

interface DonorStorytellingHubProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  onClose: () => void;
}

const DonorStorytellingHub: React.FC<DonorStorytellingHubProps> = ({
  contacts,
  onContactsChange,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'timeline' | 'impact' | 'donors' | 'stories'>('timeline');
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCalendarImport, setShowCalendarImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('storyEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('storyEvents', JSON.stringify(events));
  }, [events]);

  // Calculate impact metrics
  const impactMetrics = useMemo(() => {
    const totalPeopleServed = events.reduce((sum, event) => 
      sum + (event.impact?.peopleServed || 0), 0
    );
    
    const totalRaised = events.reduce((sum, event) => 
      sum + event.raised, 0
    );
    
    const totalVolunteers = events.reduce((sum, event) => 
      sum + (event.volunteers || 0), 0
    );
    
    const uniqueDonors = new Set(
      events.flatMap(event => event.donors || [])
    ).size;
    
    const storiesCollected = events.reduce((sum, event) => 
      sum + (event.impact?.storiesCollected?.length || 0), 0
    );
    
    return {
      totalPeopleServed,
      totalRaised,
      totalVolunteers,
      uniqueDonors,
      storiesCollected,
      eventsCount: events.length
    };
  }, [events]);

  // Get donors with their story connections
  const donorsWithStories = useMemo(() => {
    return contacts
      .filter(contact => 
        contact.tags?.some(tag => 
          (tag || '').toLowerCase().includes('donor') || 
          (tag || '').toLowerCase().includes('funder')
        ) || (contact.groups || []).includes('donors')
      )
      .map(donor => {
        const donorEvents = events.filter(event => 
          (event.donors || []).includes(donor.id.toString())
        );
        
        const totalGiven = donorEvents.reduce((sum, event) => {
          const funding = event.fundingSources?.find(f => 
            f.source === donor.organization || 
            f.source === `${donor.firstName} ${donor.lastName}`
          );
          return sum + (funding?.amount || 0);
        }, 0);
        
        return {
          ...donor,
          eventsSupported: donorEvents.length,
          totalGiven,
          impactStories: donorEvents.flatMap(e => e.impact?.storiesCollected || [])
        };
      });
  }, [contacts, events]);

  const renderTimeline = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {impactMetrics.totalPeopleServed.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-blue-700">People Served</div>
          <div className="text-xs text-blue-600 mt-1">Across all programs & events</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">
              {impactMetrics.storiesCollected}
            </span>
          </div>
          <div className="text-sm text-green-700">Stories Collected</div>
          <div className="text-xs text-green-600 mt-1">Impact testimonials</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">
              ${impactMetrics.totalRaised.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-purple-700">Total Raised</div>
          <div className="text-xs text-purple-600 mt-1">For mission impact</div>
        </div>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Our Journey & Impact</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalendarImport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import from Calendar
          </button>
          <button
            onClick={() => setShowEventForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Document Event/Campaign
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No events documented yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start building your organization's story
            </p>
          </div>
        ) : (
          events
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < events.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                {/* Event Card */}
                <div className="flex gap-4">
                  {/* Date bubble */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex flex-col items-center justify-center">
                      <div className="text-xs font-bold">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-sm">
                        {new Date(event.date).getFullYear()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {event.type}
                          </span>
                          {event.location && (
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    {/* Impact Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {event.impact?.peopleServed || 0}
                        </div>
                        <div className="text-xs text-gray-600">People Served</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${(event.raised || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Raised</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {event.donors?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Donors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {event.volunteers || 0}
                        </div>
                        <div className="text-xs text-gray-600">Volunteers</div>
                      </div>
                    </div>
                    
                    {/* Outcome Preview */}
                    {event.outcome && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="text-sm font-semibold text-green-800 mb-1">Outcome</h5>
                        <p className="text-sm text-green-700 line-clamp-2">{event.outcome}</p>
                      </div>
                    )}
                    
                    {/* Testimonial Preview */}
                    {event.testimonials && event.testimonials.length > 0 && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm italic text-gray-700">
                          "{event.testimonials[0].quote}"
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          — {event.testimonials[0].author}, {event.testimonials[0].role}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );

  const renderImpactDashboard = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Impact Dashboard</h3>
      
      {/* Mission Alignment Matrix */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Mission Alignment
        </h4>
        <div className="space-y-3">
          {['Education', 'Health', 'Community', 'Environment'].map(mission => {
            const alignedEvents = events.filter(e => 
              e.missionAlignment?.includes(mission)
            );
            const percentage = events.length > 0 
              ? (alignedEvents.length / events.length * 100).toFixed(0)
              : 0;
            
            return (
              <div key={mission}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{mission}</span>
                  <span>{alignedEvents.length} programs ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcomes by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold mb-4">Key Metrics Achieved</h4>
          <div className="space-y-2">
            {events.flatMap(e => e.impact?.metricsAchieved || [])
              .slice(0, 5)
              .map((metric, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{metric.metric}</span>
                  <span className="font-semibold text-green-600">{metric.value}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold mb-4">Funding Efficiency</h4>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Cost per Person Served</div>
              <div className="text-2xl font-bold text-blue-600">
                ${impactMetrics.totalRaised && impactMetrics.totalPeopleServed 
                  ? Math.round(impactMetrics.totalRaised / impactMetrics.totalPeopleServed)
                  : 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Event ROI</div>
              <div className="text-2xl font-bold text-green-600">
                {events.length > 0 
                  ? Math.round(events.reduce((sum, e) => sum + ((e.raised - e.spent) / e.spent * 100), 0) / events.length)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDonorStories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Donor Impact Stories</h3>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donorsWithStories
          .filter(donor => 
            searchTerm === '' || 
            `${donor.firstName || ''} ${donor.lastName || ''} ${donor.organization || ''}`.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map(donor => (
            <div key={donor.id} className="bg-white rounded-lg border p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{donor.firstName} {donor.lastName}</h4>
                  {donor.organization && (
                    <p className="text-sm text-gray-600">{donor.organization}</p>
                  )}
                </div>
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Supported:</span>
                  <span className="font-semibold">{donor.eventsSupported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Impact:</span>
                  <span className="font-semibold text-green-600">
                    ${donor.totalGiven.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stories Connected:</span>
                  <span className="font-semibold">{donor.impactStories.length}</span>
                </div>
              </div>
              
              {donor.impactStories.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 italic">
                    "{donor.impactStories[0].slice(0, 100)}..."
                  </p>
                </div>
              )}
              
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                View Full Impact Story →
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Impact & Storytelling Hub</h2>
              <p className="text-sm text-gray-600">
                Document your journey, measure outcomes, inspire donors
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toast.info('Report generation would be implemented here')}
              className="px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'timeline'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Timeline & Events
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'impact'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Impact Dashboard
            </button>
            <button
              onClick={() => setActiveView('donors')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'donors'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Donor Stories
            </button>
            <button
              onClick={() => setActiveView('stories')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'stories'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Success Stories
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeView === 'timeline' && renderTimeline()}
          {activeView === 'impact' && renderImpactDashboard()}
          {activeView === 'donors' && renderDonorStories()}
          {activeView === 'stories' && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Success stories library coming soon</p>
              <p className="text-sm text-gray-500">Showcase beneficiary testimonials and outcomes</p>
            </div>
          )}
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <EventFormModal
            onClose={() => setShowEventForm(false)}
            onSave={(newEvent) => {
              setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
              setShowEventForm(false);
              toast.success('Event documented successfully');
            }}
            contacts={contacts}
          />
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            contacts={contacts}
          />
        )}

        {/* Google Calendar Import Modal */}
        {showCalendarImport && (
          <GoogleCalendarImport
            onClose={() => setShowCalendarImport(false)}
            onEventsImport={(importedEvents) => {
              setEvents([...events, ...importedEvents]);
              toast.success(`Imported ${importedEvents.length} events from Google Calendar`);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Event Form Component
const EventFormModal: React.FC<{
  onClose: () => void;
  onSave: (event: Omit<StoryEvent, 'id'>) => void;
  contacts: Contact[];
}> = ({ onClose, onSave, contacts }) => {
  const [formData, setFormData] = useState<Partial<StoryEvent>>({
    type: 'event',
    date: '',
    title: '',
    description: '',
    challenge: '',
    approach: '',
    outcome: '',
    budget: 0,
    raised: 0,
    spent: 0,
    impact: {
      peopleServed: 0,
      storiesCollected: [],
      metricsAchieved: []
    },
    fundingSources: [],
    donors: [],
    missionAlignment: [],
    tags: []
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Document Event/Campaign</h3>
          <p className="text-sm text-gray-600">Tell the story of your impact</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Form would go here - simplified for brevity */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Annual Gala 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="event">Event</option>
                  <option value="campaign">Campaign</option>
                  <option value="grant">Grant</option>
                  <option value="program">Program</option>
                </select>
              </div>
            </div>
            
            {/* Story Elements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Tell Your Story</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What challenge were you addressing?
                </label>
                <textarea
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="The problem or need this event/campaign addressed..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How did you approach it?
                </label>
                <textarea
                  value={formData.approach}
                  onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Your strategy and activities..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What was the outcome?
                </label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="The results and impact achieved..."
                />
              </div>
            </div>
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
            onClick={() => onSave(formData as any)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Story
          </button>
        </div>
      </div>
    </div>
  );
};

// Event Detail Component
const EventDetailModal: React.FC<{
  event: StoryEvent;
  onClose: () => void;
  contacts: Contact[];
}> = ({ event, onClose, contacts }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold">{event.title}</h3>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Story Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">The Story</h4>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h5 className="font-semibold text-red-800 mb-2">Challenge</h5>
                <p className="text-gray-700">{event.challenge}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">Approach</h5>
                <p className="text-gray-700">{event.approach}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">Outcome</h5>
                <p className="text-gray-700">{event.outcome}</p>
              </div>
            </div>
          </div>
          
          {/* Impact Metrics */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Impact Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {event.impact?.peopleServed || 0}
                </div>
                <div className="text-sm text-gray-600">People Served</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${event.raised.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Raised</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {event.volunteers || 0}
                </div>
                <div className="text-sm text-gray-600">Volunteers</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((event.raised - event.spent) / event.spent * 100)}%
                </div>
                <div className="text-sm text-gray-600">ROI</div>
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          {event.testimonials && event.testimonials.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Testimonials</h4>
              <div className="space-y-4">
                {event.testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic mb-2">"{testimonial.quote}"</p>
                    <p className="text-sm text-gray-600">
                      — {testimonial.author}, {testimonial.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorStorytellingHub;