import React, { useState, useEffect, useRef, useMemo } from 'react';
import { logger } from '../utils/logger';
import {
  Search, Plus, Building2, User, Users, Mail, Phone, Globe,
  AlertCircle, CheckCircle, RefreshCw as Sync, Eye, Edit2, Flag,
  Gift, X, BookOpen, TrendingUp, Copy, List, Grid
} from 'lucide-react';
import { toast } from 'react-toastify';
import DonorStorytellingHub from './DonorStorytellingHub';
import HistoricalGivingTimeline from './HistoricalGivingTimeline';
import LoadingSpinner, { SkeletonList } from './LoadingSpinner';
import { useConfirmation } from './ConfirmationDialog';
import { useAutoSave } from '../hooks/useAutoSave';
import AutoSaveStatus from './AutoSaveStatus';

// Enhanced Contact Interface with comprehensive fields
interface EnhancedContact {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  organization: string;
  title: string;
  department?: string;
  isOrganization?: boolean;
  
  // Contact Information
  email: string;
  emailVerified?: boolean;
  alternateEmails?: string[];
  phone: string;
  mobile: string;
  fax?: string;
  website: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Address Information
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressHistory?: Array<{
    address: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    startDate: string;
    endDate?: string;
  }>;
  
  // Enhanced Data
  tags: string[];
  groups: string[];
  projectRoles?: string[]; // For compatibility with existing Contact interface
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'archived' | 'prospect';
  source: string; // How we got this contact
  
  // Relationship Data
  relationships?: Array<{
    contactId: number;
    type: 'colleague' | 'supervisor' | 'subordinate' | 'client' | 'vendor' | 'partner';
    description?: string;
  }>;
  
  // Interaction History
  lastContact?: string;
  nextFollowUp?: string;
  interactionHistory?: Array<{
    date: string;
    type: 'email' | 'call' | 'meeting' | 'note';
    subject: string;
    notes?: string;
    outcome?: string;
  }>;
  
  // Data Quality
  dataCompleteness: number;
  duplicateScore?: number;
  possibleDuplicates?: number[];
  lastVerified?: string;
  dataSource?: 'manual' | 'gmail' | 'google_contacts' | 'import' | 'email_extraction';
  
  // Google Integration
  googleContactId?: string;
  googleSyncEnabled?: boolean;
  gmailThreads?: Array<{
    threadId: string;
    subject: string;
    date: string;
    snippet: string;
  }>;
  
  // Additional Fields
  notes: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }>;
  
  // Timestamps
  createdDate: string;
  lastModified: string;
  lastActivity?: string;
}

interface GoogleIntegrationSettings {
  enabled: boolean;
  clientId: string;
  syncFrequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  lastSync?: string;
  autoCreateContacts: boolean;
  emailSearchEnabled: boolean;
}

interface ContactManagerEnhancedProps {
  contacts: EnhancedContact[];
  onContactsChange: (contacts: EnhancedContact[]) => void;
  onClose: () => void;
  initialView?: string;
}

const ContactManagerEnhanced: React.FC<ContactManagerEnhancedProps> = ({
  contacts,
  onContactsChange,
  onClose,
  initialView = 'list'
}) => {
  // State Management
  const [view, setView] = useState<'list' | 'grid' | 'details' | 'duplicates' | 'analytics'>('list');
  const [contactType, setContactType] = useState<'all' | 'persons' | 'organizations'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [_selectedContact, setSelectedContact] = useState<EnhancedContact | null>(null);
  const [_editingContact, setEditingContact] = useState<EnhancedContact | null>(null);
  const [_showAddForm, setShowAddForm] = useState(false);
  const [showGivingHistory, setShowGivingHistory] = useState<EnhancedContact | null>(null);
  const [showDonorStorytelling, setShowDonorStorytelling] = useState(false);
  const [filters, _setFilters] = useState({
    groups: [] as string[],
    tags: [] as string[],
    priority: '' as string,
    status: '' as string,
    dataQuality: '' as string
  });

  // Enhanced state management for error handling and loading
  const [loading, setLoading] = useState({
    contacts: false,
    sync: false,
    import: false,
    export: false,
    search: false,
    save: false
  });

  const [errors, setErrors] = useState<{
    [key: string]: string | null;
  }>({});

  // Auto-save for contact edits
  const autoSave = useAutoSave(contacts, {
    key: 'contacts',
    delay: 2000,
    onSave: async (data) => {
      try {
        setLoading(prev => ({ ...prev, save: true }));
        onContactsChange(data as EnhancedContact[]);
        // Could also save to backend here
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      } catch (error) {
        throw new Error('Failed to save contacts');
      } finally {
        setLoading(prev => ({ ...prev, save: false }));
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Auto-save failed: ${errorMessage}`);
      setErrors(prev => ({ ...prev, autoSave: errorMessage }));
    }
  });

  // Confirmation dialog hook
  const { confirm, ConfirmationComponent } = useConfirmation();
  
  // Google Integration State
  const [googleSettings, setGoogleSettings] = useState<GoogleIntegrationSettings>({
    enabled: false,
    clientId: '',
    syncFrequency: 'daily',
    autoCreateContacts: true,
    emailSearchEnabled: true
  });
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  
  // Duplicate Detection State
  const [duplicateGroups, setDuplicateGroups] = useState<Array<EnhancedContact[]>>([]);
  const [_showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Email Search State
  const [emailSearchResults, setEmailSearchResults] = useState<Array<{
    email: string;
    name?: string;
    frequency: number;
    lastSeen: string;
    shouldImport: boolean;
  }>>([]);

  // Computed Values
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Contact type filter
      const typeMatch = contactType === 'all' || 
        (contactType === 'organizations' && contact.isOrganization) ||
        (contactType === 'persons' && !contact.isOrganization);
      
      // Text search
      const searchMatch = searchTerm === '' || 
        `${contact.firstName || ''} ${contact.lastName || ''} ${contact.email || ''} ${contact.organization || ''}`
          .toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter matches
      const groupMatch = filters.groups.length === 0 || 
        filters.groups.some(group => group && contact.groups?.includes(group));
      const tagMatch = filters.tags.length === 0 || 
        filters.tags.some(tag => tag && contact.tags?.includes(tag));
      const priorityMatch = filters.priority === '' || contact.priority === filters.priority;
      const statusMatch = filters.status === '' || contact.status === filters.status;
      
      return typeMatch && searchMatch && groupMatch && tagMatch && priorityMatch && statusMatch;
    });
  }, [contacts, searchTerm, filters, contactType]);

  // Data Quality Analytics
  const analytics = useMemo(() => {
    const total = contacts.length;
    const avgCompleteness = contacts.reduce((sum, c) => sum + c.dataCompleteness, 0) / total || 0;
    const duplicates = duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0);
    const needsVerification = contacts.filter(c => !c.lastVerified || 
      new Date(c.lastVerified) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length;
    
    return {
      total,
      avgCompleteness: Math.round(avgCompleteness),
      duplicates,
      needsVerification,
      bySource: contacts.reduce((acc, c) => {
        acc[c.dataSource || 'manual'] = (acc[c.dataSource || 'manual'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [contacts, duplicateGroups]);

  // Google Integration Functions
  const initializeGoogleAuth = async () => {
    try {
      // This would initialize Google OAuth2
      // For demo purposes, we'll simulate the authentication
      setIsGoogleAuthenticated(true);
      toast.success('Google integration authenticated!');
    } catch (error) {
      toast.error('Failed to authenticate with Google');
    }
  };

  const syncWithGoogleContacts = async () => {
    try {
      if (!isGoogleAuthenticated) {
        await initializeGoogleAuth();
        return;
      }

      setLoading(prev => ({ ...prev, sync: true }));
      setErrors(prev => ({ ...prev, sync: null }));
      
      // Show confirmation for sync operation
      const confirmed = await confirm({
        title: 'Sync with Google Contacts',
        message: 'This will import contacts from your Google account. Existing contacts with the same email will be updated.',
        confirmText: 'Sync Now',
        variant: 'info',
        details: [
          'New contacts will be added',
          'Existing contacts will be updated with Google data',
          'No contacts will be deleted',
          'This may take a few moments'
        ],
        onConfirm: () => Promise.resolve()
      });

      if (!confirmed) return;

      // Simulate Google Contacts sync with better error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate potential network failure
          if (Math.random() < 0.1) {
            reject(new Error('Network connection failed'));
          } else {
            resolve(void 0);
          }
        }, 2000);
      });
      
      // This would be replaced with actual Google Contacts API call
      const mockGoogleContacts = [
        {
          id: Date.now() + 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@gmail.com',
          phone: '+1-555-0123',
          organization: 'Google LLC',
          dataSource: 'google_contacts' as const,
          googleContactId: 'gc_' + Math.random().toString(36).substr(2, 9),
          dataCompleteness: 85,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: [],
          groups: [],
          priority: 'medium' as const,
          status: 'active' as const,
          source: 'Google Contacts Sync',
          address: '',
          address2: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          mobile: '',
          website: '',
          title: 'Software Engineer',
          prefix: '',
          notes: 'Imported from Google Contacts'
        }
      ];

      const updatedContacts = [...contacts, ...mockGoogleContacts];
      onContactsChange(updatedContacts);
      
      toast.success(`Synced ${mockGoogleContacts.length} contacts from Google`);
      setGoogleSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync with Google Contacts';
      setErrors(prev => ({ ...prev, sync: errorMessage }));
      toast.error(`Sync failed: ${errorMessage}`);
      logger.error('Google sync error:', error);
    } finally {
      setLoading(prev => ({ ...prev, sync: false }));
    }
  };

  const searchGmailForContacts = async () => {
    try {
      if (!isGoogleAuthenticated) {
        await initializeGoogleAuth();
        return;
      }

      setLoading(prev => ({ ...prev, search: true }));
      setErrors(prev => ({ ...prev, search: null }));

      // Show confirmation for Gmail search
      const confirmed = await confirm({
        title: 'Search Gmail for Contacts',
        message: 'This will scan your Gmail for frequently contacted email addresses that aren\'t in your contacts yet.',
        confirmText: 'Search Now',
        variant: 'info',
        details: [
          'Analyzes email frequency and patterns',
          'Suggests potential new contacts',
          'Does not store email content',
          'May take a few moments'
        ],
        onConfirm: () => Promise.resolve()
      });

      if (!confirmed) return;

      // Simulate Gmail email extraction with error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate potential API rate limit
          if (Math.random() < 0.15) {
            reject(new Error('Gmail API rate limit exceeded'));
          } else {
            resolve(void 0);
          }
        }, 3000);
      });
      
      const mockEmailResults = [
        {
          email: 'sarah.johnson@nonprofit.org',
          name: 'Sarah Johnson',
          frequency: 15,
          lastSeen: '2024-01-10',
          shouldImport: false
        },
        {
          email: 'mike.chen@foundation.com',
          name: 'Michael Chen',
          frequency: 8,
          lastSeen: '2024-01-08',
          shouldImport: false
        },
        {
          email: 'alex.rodriguez@charity.net',
          frequency: 12,
          lastSeen: '2024-01-12',
          shouldImport: false
        }
      ];

      setEmailSearchResults(mockEmailResults);
      toast.success(`Found ${mockEmailResults.length} potential contacts from Gmail`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search Gmail for contacts';
      setErrors(prev => ({ ...prev, search: errorMessage }));
      toast.error(`Gmail search failed: ${errorMessage}`);
      logger.error('Gmail search error:', error);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Duplicate Detection
  const detectDuplicates = () => {
    const groups: Array<EnhancedContact[]> = [];
    const processed = new Set<number>();

    contacts.forEach(contact => {
      if (processed.has(contact.id)) return;

      const duplicates = contacts.filter(other => {
        if (other.id === contact.id || processed.has(other.id)) return false;
        
        // Check for exact email match
        if (contact.email && other.email && contact.email.toLowerCase() === other.email.toLowerCase()) {
          return true;
        }
        
        // Check for similar names and organizations
        const nameMatch = contact.firstName.toLowerCase() === other.firstName.toLowerCase() &&
                          contact.lastName.toLowerCase() === other.lastName.toLowerCase();
        const orgMatch = contact.organization && other.organization &&
                        contact.organization.toLowerCase() === other.organization.toLowerCase();
        
        return nameMatch && orgMatch;
      });

      if (duplicates.length > 0) {
        const group = [contact, ...duplicates];
        groups.push(group);
        group.forEach(c => processed.add(c.id));
      }
    });

    setDuplicateGroups(groups);
    return groups;
  };

  // Contact Completion
  const calculateCompleteness = (contact: EnhancedContact): number => {
    const fields = [
      contact.firstName, contact.lastName, contact.email, contact.phone,
      contact.organization, contact.title, contact.address, contact.city,
      contact.state, contact.zipCode
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const _suggestContactImprovements = (contact: EnhancedContact) => {
    const suggestions = [];
    
    if (!contact.phone) suggestions.push('Add phone number');
    if (!contact.address) suggestions.push('Add address');
    if (!contact.title) suggestions.push('Add job title');
    if (!contact.website) suggestions.push('Add website');
    if (contact.tags.length === 0) suggestions.push('Add tags');
    if (!contact.lastContact) suggestions.push('Record last contact date');
    
    return suggestions;
  };

  // Bulk Operations
  const _mergeDuplicates = (duplicateGroup: EnhancedContact[]) => {
    const primary = duplicateGroup[0];
    const merged = duplicateGroup.reduce((acc, contact) => {
      // Merge non-empty fields
      Object.keys(contact).forEach(key => {
        if (contact[key as keyof EnhancedContact] && !acc[key as keyof EnhancedContact]) {
          (acc as any)[key] = contact[key as keyof EnhancedContact];
        }
      });
      
      // Merge arrays
      if (contact.tags) acc.tags = Array.from(new Set([...acc.tags, ...contact.tags]));
      if (contact.groups) acc.groups = Array.from(new Set([...acc.groups, ...contact.groups]));
      
      return acc;
    }, { ...primary });

    // Remove duplicates and add merged contact
    const idsToRemove = duplicateGroup.map(c => c.id);
    const updatedContacts = contacts.filter(c => !idsToRemove.includes(c.id));
    updatedContacts.push({ ...merged, lastModified: new Date().toISOString() });
    
    onContactsChange(updatedContacts);
    toast.success('Contacts merged successfully');
  };

  const importEmailContacts = () => {
    const toImport = emailSearchResults.filter(result => result.shouldImport);
    
    const newContacts = toImport.map((result, index) => ({
      id: Date.now() + index,
      firstName: result.name?.split(' ')[0] || '',
      lastName: result.name?.split(' ').slice(1).join(' ') || '',
      email: result.email,
      dataSource: 'email_extraction' as const,
      dataCompleteness: 30,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      lastActivity: result.lastSeen,
      source: 'Gmail Search',
      tags: ['imported-from-gmail'],
      groups: [],
      priority: 'medium' as const,
      status: 'prospect' as const,
      // Default empty values for required fields
      phone: '',
      mobile: '',
      website: '',
      organization: '',
      title: '',
      prefix: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: `Imported from Gmail. Last seen: ${result.lastSeen}, Email frequency: ${result.frequency}`
    }));

    onContactsChange([...contacts, ...newContacts]);
    setEmailSearchResults([]);
    toast.success(`Imported ${newContacts.length} contacts from Gmail`);
  };

  // Event Handlers
  useEffect(() => {
    detectDuplicates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  useEffect(() => {
    // Update completeness for all contacts
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      dataCompleteness: calculateCompleteness(contact)
    }));
    
    if (JSON.stringify(updatedContacts) !== JSON.stringify(contacts)) {
      onContactsChange(updatedContacts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  // Render Functions
  const renderContactCard = (contact: EnhancedContact) => (
    <div key={contact.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            contact.isOrganization ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {contact.isOrganization ? (
              <Building2 className="w-5 h-5 text-green-600" />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {contact.isOrganization ? (
                contact.organization || contact.displayName || 'Unnamed Organization'
              ) : (
                `${contact.firstName} ${contact.lastName}`
              )}
            </h3>
            {!contact.isOrganization && (
              <>
                <p className="text-sm text-gray-600">{contact.title}</p>
                <p className="text-sm text-gray-500">{contact.organization}</p>
              </>
            )}
            {contact.isOrganization && contact.website && (
              <p className="text-sm text-gray-500">{contact.website}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-1">
            {contact.priority === 'high' && <Flag className="w-4 h-4 text-red-500" />}
            {contact.priority === 'urgent' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {contact.googleContactId && <Sync className="w-4 h-4 text-green-500" />}
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${contact.dataCompleteness}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{contact.dataCompleteness}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
              <Mail className="w-4 h-4" />
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="text-green-600 hover:text-green-800">
              <Phone className="w-4 h-4" />
            </a>
          )}
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedContact(contact)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingContact(contact)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Edit contact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {(contact.tags?.some(tag => tag && typeof tag === 'string' && (
            tag.toLowerCase().includes('donor') || 
            tag.toLowerCase().includes('funder') || 
            tag.toLowerCase().includes('sponsor')
          )) ||
            contact.groups?.includes('donors')) && (
            <button
              onClick={() => setShowGivingHistory(contact)}
              className="p-1 text-purple-600 hover:text-purple-800"
              title="Giving history"
            >
              <Gift className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {contact.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{contact.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderGoogleIntegration = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Globe className="w-5 h-5 mr-2 text-blue-600" />
          Google Integration
        </h3>
        <div className="flex items-center space-x-2">
          {isGoogleAuthenticated ? (
            <span className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Connected
            </span>
          ) : (
            <span className="flex items-center text-gray-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Not Connected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={syncWithGoogleContacts}
          disabled={loading.sync}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={errors.sync ? `Last error: ${errors.sync}` : 'Sync contacts from Google'}
        >
          {loading.sync ? (
            <LoadingSpinner size="sm" color="white" className="mr-2" />
          ) : (
            <Sync className="w-4 h-4 mr-2" />
          )}
          {loading.sync ? 'Syncing...' : 'Sync Google Contacts'}
        </button>

        <button
          onClick={searchGmailForContacts}
          disabled={loading.search}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={errors.search ? `Last error: ${errors.search}` : 'Search Gmail for potential contacts'}
        >
          {loading.search ? (
            <LoadingSpinner size="sm" color="white" className="mr-2" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          {loading.search ? 'Searching...' : 'Search Gmail'}
        </button>
      </div>

      {googleSettings.lastSync && (
        <p className="text-sm text-gray-600">
          Last sync: {new Date(googleSettings.lastSync).toLocaleString()}
        </p>
      )}

      {emailSearchResults.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Gmail Search Results</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {emailSearchResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">{result.name || result.email}</div>
                  <div className="text-sm text-gray-600">
                    {result.frequency} emails • Last seen: {result.lastSeen}
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={result.shouldImport}
                    onChange={(e) => {
                      const updated = [...emailSearchResults];
                      updated[index].shouldImport = e.target.checked;
                      setEmailSearchResults(updated);
                    }}
                    className="mr-2"
                  />
                  Import
                </label>
              </div>
            ))}
          </div>
          
          {emailSearchResults.some(r => r.shouldImport) && (
            <button
              onClick={importEmailContacts}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Import Selected Contacts
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">Contact Manager Pro</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{analytics.total} contacts</span>
              <span>•</span>
              <span>{analytics.avgCompleteness}% avg completeness</span>
              <span>•</span>
              <AutoSaveStatus
                isSaving={autoSave.isSaving}
                lastSaved={autoSave.lastSaved}
                error={autoSave.error}
                hasUnsavedChanges={autoSave.hasUnsavedChanges}
                onSaveNow={autoSave.saveNow}
              />
              {analytics.duplicates > 0 && (
                <>
                  <span>•</span>
                  <span className="text-orange-600">{analytics.duplicates} duplicates</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDonorStorytelling(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              title="Impact & Storytelling"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Impact Hub
            </button>
            
            <button
              onClick={() => setView('analytics')}
              className={`p-2 rounded-lg ${view === 'analytics' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Analytics"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowDuplicateModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
              title="Manage duplicates"
            >
              <Copy className="w-5 h-5" />
              {analytics.duplicates > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {analytics.duplicates}
                </span>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b bg-gray-50">
              {/* Contact Type Tabs */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setContactType('all')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      contactType === 'all' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    All Contacts ({contacts.length})
                  </button>
                  <button
                    onClick={() => setContactType('persons')}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                      contactType === 'persons' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Persons ({contacts.filter(c => !c.isOrganization).length})
                  </button>
                  <button
                    onClick={() => setContactType('organizations')}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                      contactType === 'organizations' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Organizations ({contacts.filter(c => c.isOrganization).length})
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${contactType === 'persons' ? 'persons' : contactType === 'organizations' ? 'organizations' : 'contacts'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {contactType === 'organizations' ? 'Organization' : 'Contact'}
                </button>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Google Integration Panel */}
              {renderGoogleIntegration()}
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading.contacts ? (
                <div className="space-y-4">
                  <LoadingSpinner message="Loading contacts..." />
                  <SkeletonList items={5} />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No contacts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first contact'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Contact
                  </button>
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map(renderContactCard)}
                </div>
              ) : view === 'analytics' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
                      <div className="text-sm text-gray-600">Total Contacts</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{analytics.avgCompleteness}%</div>
                      <div className="text-sm text-gray-600">Avg Completeness</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">{analytics.duplicates}</div>
                      <div className="text-sm text-gray-600">Potential Duplicates</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{analytics.needsVerification}</div>
                      <div className="text-sm text-gray-600">Need Verification</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-4">Contacts by Source</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.bySource).map(([source, count]) => (
                        <div key={source} className="flex justify-between items-center">
                          <span className="capitalize">{source.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map(renderContactCard)}
                </div>
              )}
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No contacts found</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Your First Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Giving History Modal */}
      {showGivingHistory && (
        <HistoricalGivingTimeline
          contact={showGivingHistory as any}
          onClose={() => setShowGivingHistory(null)}
          onUpdate={(updatedContact) => {
            onContactsChange(contacts.map(c => 
              c.id === updatedContact.id ? updatedContact as any : c
            ) as any);
            setShowGivingHistory(null);
          }}
        />
      )}
      
      {/* Donor Storytelling Hub Modal */}
      {showDonorStorytelling && (
        <DonorStorytellingHub
          contacts={contacts as any}
          onContactsChange={onContactsChange as any}
          onClose={() => setShowDonorStorytelling(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default ContactManagerEnhanced;