import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, User, Building2, Edit2, Trash2, 
  Check, X, Users, Globe, Phone, Mail, MapPin,
  Calendar, Clock, Star, Tag, Filter, Download,
  Upload, RefreshCw, Eye, Settings, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';

export interface ContactInfo {
  id: string;
  type: 'person' | 'organization';
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  address?: string;
  roles?: string[];
  tags?: string[];
  avatar?: string;
  verified?: boolean;
  lastContact?: Date;
  notes?: string;
  relationships?: Array<{
    id: string;
    type: string;
    name: string;
  }>;
}

interface ContactSelectorProps {
  label: string;
  value: ContactInfo | ContactInfo[] | null;
  onChange: (value: ContactInfo | ContactInfo[] | null) => void;
  multiple?: boolean;
  type?: 'person' | 'organization' | 'both';
  required?: boolean;
  className?: string;
  placeholder?: string;
  showAddButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  roleFilter?: string[];
  tagFilter?: string[];
  organizationFilter?: string[];
  onAddContact?: (contact: ContactInfo) => void;
  onEditContact?: (contact: ContactInfo) => void;
  onDeleteContact?: (contactId: string) => void;
  permissions?: {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
  };
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxSelections?: number;
  showContactDetails?: boolean;
  autoComplete?: boolean;
  recentContacts?: boolean;
  favoriteContacts?: boolean;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({
  label,
  value,
  onChange,
  multiple = false,
  type = 'both',
  required = false,
  className = '',
  placeholder = 'Select contact...',
  showAddButton = true,
  showEditButton = true,
  showDeleteButton = true,
  roleFilter = [],
  tagFilter = [],
  organizationFilter = [],
  onAddContact,
  onEditContact,
  onDeleteContact,
  permissions = {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canView: true
  },
  searchPlaceholder = 'Search contacts...',
  emptyMessage = 'No contacts found',
  maxSelections,
  showContactDetails = true,
  autoComplete = true,
  recentContacts = true,
  favoriteContacts = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactInfo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    roles: [] as string[],
    tags: [] as string[],
    organizations: [] as string[],
    type: 'all' as 'all' | 'person' | 'organization'
  });
  const [recentContactsList, setRecentContactsList] = useState<ContactInfo[]>([]);
  const [favoriteContactsList, setFavoriteContactsList] = useState<ContactInfo[]>([]);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Load contacts
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts based on search and filters
  useEffect(() => {
    let filtered = contacts;

    // Apply type filter
    if (type !== 'both') {
      filtered = filtered.filter(contact => contact.type === type);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter && roleFilter.length > 0) {
      filtered = filtered.filter(contact =>
        contact.roles?.some(role => role && roleFilter.includes(role))
      );
    }

    // Apply tag filter
    if (tagFilter && tagFilter.length > 0) {
      filtered = filtered.filter(contact =>
        contact.tags?.some(tag => tag && tagFilter.includes(tag))
      );
    }

    // Apply organization filter
    if (organizationFilter && organizationFilter.length > 0) {
      filtered = filtered.filter(contact =>
        contact.organization && organizationFilter.includes(contact.organization || '')
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, type, roleFilter, tagFilter, organizationFilter]);

  // Load contacts from backend or localStorage
  const loadContacts = async () => {
    setLoading(true);
    try {
      // Mock data - in reality, this would fetch from API
      const mockContacts: ContactInfo[] = [
        {
          id: '1',
          type: 'person',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          organization: 'Example Org',
          title: 'Executive Director',
          roles: ['board_member', 'primary_contact'],
          tags: ['donor', 'volunteer'],
          verified: true,
          lastContact: new Date('2024-01-15')
        },
        {
          id: '2',
          type: 'organization',
          name: 'Example Foundation',
          email: 'contact@foundation.org',
          phone: '+1987654321',
          address: '123 Main St, City, State',
          roles: ['funder', 'partner'],
          tags: ['foundation', 'major_donor'],
          verified: true,
          lastContact: new Date('2024-01-20')
        }
      ];
      
      setContacts(mockContacts);
      
      // Load recent and favorite contacts
      if (recentContacts) {
        setRecentContactsList(mockContacts.slice(0, 3));
      }
      if (favoriteContacts) {
        setFavoriteContactsList(mockContacts.slice(0, 2));
      }
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact: ContactInfo) => {
    if (multiple) {
      const currentValue = (value as ContactInfo[]) || [];
      const isSelected = currentValue.some(c => c.id === contact.id);
      
      if (isSelected) {
        onChange(currentValue.filter(c => c.id !== contact.id));
      } else {
        if (maxSelections && currentValue.length >= maxSelections) {
          toast.warning(`Maximum ${maxSelections} contacts allowed`);
          return;
        }
        onChange([...currentValue, contact]);
      }
    } else {
      onChange(contact);
      setIsOpen(false);
    }
  };

  // Handle contact removal
  const handleContactRemove = (contactId: string) => {
    if (multiple) {
      const currentValue = (value as ContactInfo[]) || [];
      onChange(currentValue.filter(c => c.id !== contactId));
    } else {
      onChange(null);
    }
  };

  // Handle add new contact
  const handleAddContact = () => {
    if (onAddContact) {
      onAddContact({
        id: Date.now().toString(),
        type: 'person',
        name: searchTerm || 'New Contact',
        email: ''
      });
    }
    setShowAddForm(false);
    setIsOpen(false);
  };

  // Handle edit contact
  const handleEditContact = (contact: ContactInfo) => {
    if (onEditContact) {
      onEditContact(contact);
    }
    setIsOpen(false);
  };

  // Handle delete contact
  const handleDeleteContact = async (contact: ContactInfo) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete ${contact.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        if (onDeleteContact) {
          onDeleteContact(contact.id);
        }
        handleContactRemove(contact.id);
        toast.success('Contact deleted successfully');
      }
    });
  };

  // Render contact item
  const renderContactItem = (contact: ContactInfo, isSelected: boolean = false) => (
    <div
      key={contact.id}
      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={() => handleContactSelect(contact)}
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          contact.type === 'person' ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          {contact.avatar ? (
            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
          ) : (
            contact.type === 'person' ? (
              <User className="w-5 h-5 text-blue-600" />
            ) : (
              <Building2 className="w-5 h-5 text-green-600" />
            )
          )}
        </div>
        
        {/* Contact Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {contact.name}
            </h3>
            {contact.verified && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          {showContactDetails && (
            <div className="mt-1 space-y-1">
              {contact.title && contact.organization && (
                <p className="text-xs text-gray-600">
                  {contact.title} at {contact.organization}
                </p>
              )}
              {contact.email && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {contact.phone}
                </p>
              )}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {contact.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                      +{contact.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-1">
        {showEditButton && permissions.canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditContact(contact);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Edit contact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        
        {showDeleteButton && permissions.canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteContact(contact);
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        
        {isSelected && (
          <CheckCircle className="w-5 h-5 text-blue-500" />
        )}
      </div>
    </div>
  );

  // Render selected contacts
  const renderSelectedContacts = () => {
    if (!value) return null;
    
    const selectedContacts = multiple ? (value as ContactInfo[]) : [value as ContactInfo];
    
    return (
      <div className="space-y-2">
        {selectedContacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                contact.type === 'person' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {contact.type === 'person' ? (
                  <User className="w-3 h-3 text-blue-600" />
                ) : (
                  <Building2 className="w-3 h-3 text-green-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">{contact.name}</span>
              {contact.title && (
                <span className="text-xs text-gray-500">({contact.title})</span>
              )}
            </div>
            
            <button
              onClick={() => handleContactRemove(contact.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Remove contact"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`contact-selector ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {maxSelections && multiple && (
          <span className="text-xs text-gray-500">
            {((value as ContactInfo[]) || []).length} / {maxSelections}
          </span>
        )}
      </div>

      {/* Selected Contacts */}
      {value && renderSelectedContacts()}

      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Add Button */}
          {showAddButton && permissions.canAdd && (
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add new contact"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            title="Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* Recent Contacts */}
                {recentContacts && recentContactsList.length > 0 && (
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Recent</h3>
                    <div className="space-y-1">
                      {recentContactsList.map(contact => renderContactItem(contact))}
                    </div>
                  </div>
                )}

                {/* Favorite Contacts */}
                {favoriteContacts && favoriteContactsList.length > 0 && (
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Favorites</h3>
                    <div className="space-y-1">
                      {favoriteContactsList.map(contact => renderContactItem(contact))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {filteredContacts.length > 0 ? (
                  <div className="p-3">
                    {searchTerm && (
                      <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
                        Search Results ({filteredContacts.length})
                      </h3>
                    )}
                    <div className="space-y-1">
                      {filteredContacts.map(contact => {
                        const isSelected = multiple 
                          ? ((value as ContactInfo[]) || []).some(c => c.id === contact.id)
                          : (value as ContactInfo)?.id === contact.id;
                        return renderContactItem(contact, isSelected);
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{emptyMessage}</p>
                    {searchTerm && showAddButton && permissions.canAdd && (
                      <button
                        onClick={handleAddContact}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add "{searchTerm}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default ContactSelector;