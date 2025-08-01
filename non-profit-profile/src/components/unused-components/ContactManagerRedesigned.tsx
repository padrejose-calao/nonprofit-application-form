import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Building2,
  User,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Settings,
  Upload,
  Download,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Filter,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Person {
  id: string;
  type: 'person';
  prefix?: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  email: string;
  phone?: string;
  mobile?: string;
  organization?: string; // Link to organization
  title?: string;
  roles: Array<{
    type: 'board_member' | 'staff' | 'donor' | 'fundraiser' | 'volunteer' | 'contractor' | 'advisory' | 'committee' | 'other';
    details?: string;
    startDate?: string;
    endDate?: string;
    compensation?: 'volunteer' | 'stipendiary' | 'compensated' | 'contractor';
  }>;
  demographics?: {
    gender?: string;
    ethnicity?: string;
    age?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  documents?: {
    headshot?: string;
    biography?: string;
    resume?: string;
    certifications?: string[];
    photoVideoRelease?: boolean;
  };
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Organization {
  id: string;
  type: 'organization';
  name: string;
  legalName?: string;
  ein?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPersons: string[]; // Links to persons
  roles: Array<{
    type: 'partner' | 'funder' | 'vendor' | 'affiliate' | 'parent' | 'subsidiary' | 'fiscal_sponsor' | 'insurer' | 'auditor' | 'other';
    details?: string;
  }>;
  documents?: {
    logo?: string;
    agreements?: string[];
  };
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

type Contact = Person | Organization;

interface ContactManagerProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  onClose?: () => void;
  currentUser?: string;
  permissions?: {
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewGoogleSettings: boolean;
  };
}

const ContactManagerRedesigned: React.FC<ContactManagerProps> = ({
  contacts,
  onContactsChange,
  onClose,
  currentUser = 'User',
  permissions = {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canViewGoogleSettings: true
  }
}) => {
  const [activeTab, setActiveTab] = useState<'persons' | 'organizations'>('persons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Filter contacts by type
  const persons = contacts.filter(c => c.type === 'person') as Person[];
  const organizations = contacts.filter(c => c.type === 'organization') as Organization[];

  // Filter by search and role
  const filteredList = React.useMemo(() => {
    if (activeTab === 'persons') {
      return persons.filter((contact: Person) => {
        const matchesSearch = searchQuery === '' || 
          JSON.stringify(contact).toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = filterRole === 'all' || 
          contact.roles.some(r => r.type === filterRole);
        
        return matchesSearch && matchesRole;
      });
    } else {
      return organizations.filter((contact: Organization) => {
        const matchesSearch = searchQuery === '' || 
          JSON.stringify(contact).toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = filterRole === 'all' || 
          contact.roles.some(r => r.type === filterRole);
        
        return matchesSearch && matchesRole;
      });
    }
  }, [activeTab, persons, organizations, searchQuery, filterRole]);

  // Create new contact
  const createNewContact = (type: 'person' | 'organization'): Contact => {
    const baseContact = {
      id: `${type}_${Date.now()}`,
      type,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (type === 'person') {
      return {
        ...baseContact,
        firstName: '',
        lastName: '',
        email: '',
        roles: []
      } as Person;
    } else {
      return {
        ...baseContact,
        name: '',
        contactPersons: [],
        roles: []
      } as Organization;
    }
  };

  // Handle add new
  const handleAddNew = () => {
    if (!permissions.canAdd) {
      toast.error('You do not have permission to add contacts');
      return;
    }
    
    const newContact = createNewContact(activeTab === 'persons' ? 'person' : 'organization');
    setSelectedContact(newContact);
    setIsAddingNew(true);
    setIsEditing(true);
  };

  // Handle save
  const handleSave = () => {
    if (!selectedContact) return;

    // Validation
    if (selectedContact.type === 'person') {
      const person = selectedContact as Person;
      if (!person.firstName || !person.lastName || !person.email) {
        toast.error('First name, last name, and email are required');
        return;
      }
    } else {
      const org = selectedContact as Organization;
      if (!org.name) {
        toast.error('Organization name is required');
        return;
      }
    }

    // Update contacts
    let updatedContacts: Contact[];
    if (isAddingNew) {
      updatedContacts = [...contacts, selectedContact];
    } else {
      updatedContacts = contacts.map(c => 
        c.id === selectedContact.id ? selectedContact : c
      );
    }

    onContactsChange(updatedContacts);
    setIsEditing(false);
    setIsAddingNew(false);
    toast.success(`${selectedContact.type === 'person' ? 'Person' : 'Organization'} saved successfully`);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (!permissions.canDelete) {
      toast.error('You do not have permission to delete contacts');
      return;
    }

    const updatedContacts = contacts.filter(c => c.id !== id);
    onContactsChange(updatedContacts);
    setSelectedContact(null);
    setShowDeleteConfirm(null);
    toast.success('Contact deleted successfully');
  };

  // Handle export
  const handleExport = () => {
    const data = activeTab === 'persons' ? persons : organizations;
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  // Convert to CSV
  const convertToCSV = (data: Contact[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => 
      !['documents', 'address', 'socialMedia', 'demographics'].includes(key)
    );
    
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header as keyof Contact];
        if (Array.isArray(value)) {
          return value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('; ');
        }
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Contact Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            {permissions.canViewGoogleSettings && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && permissions.canViewGoogleSettings && (
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Google Integration Settings</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Connect Google Account
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('persons')}
            className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'persons' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-5 w-5" />
            Persons ({persons.length})
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'organizations' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="h-5 w-5" />
            Organizations ({organizations.length})
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - List */}
        <div className="w-1/3 border-r flex flex-col bg-gray-50">
          {/* Search and Actions */}
          <div className="p-4 space-y-3 bg-white border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {permissions.canAdd && (
                <button
                  onClick={handleAddNew}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add {activeTab === 'persons' ? 'Person' : 'Organization'}
                </button>
              )}
              <button
                onClick={handleExport}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Export"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Roles</option>
              {activeTab === 'persons' ? (
                <>
                  <option value="board_member">Board Members</option>
                  <option value="staff">Staff</option>
                  <option value="donor">Donors</option>
                  <option value="fundraiser">Fundraisers</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="contractor">Contractors</option>
                </>
              ) : (
                <>
                  <option value="partner">Partners</option>
                  <option value="funder">Funders</option>
                  <option value="vendor">Vendors</option>
                  <option value="affiliate">Affiliates</option>
                  <option value="insurer">Insurers</option>
                </>
              )}
            </select>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  {activeTab === 'persons' ? (
                    <User className="h-12 w-12 mx-auto text-gray-300" />
                  ) : (
                    <Building2 className="h-12 w-12 mx-auto text-gray-300" />
                  )}
                </div>
                <p>No {activeTab} found</p>
                <p className="text-sm mt-2">
                  {searchQuery ? 'Try adjusting your search' : `Add your first ${activeTab === 'persons' ? 'person' : 'organization'}`}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredList.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {contact.type === 'person' 
                            ? `${(contact as Person).firstName} ${(contact as Person).lastName}`
                            : (contact as Organization).name
                          }
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {contact.type === 'person'
                            ? (contact as Person).organization || 'No organization'
                            : (contact as Organization).website || 'No website'
                          }
                        </p>
                        {contact.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.roles.slice(0, 2).map((role, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded"
                              >
                                {role.type.replace('_', ' ')}
                              </span>
                            ))}
                            {contact.roles.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{contact.roles.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedContact?.id === contact.id && (
                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedContact.type === 'person'
                        ? `${(selectedContact as Person).firstName} ${(selectedContact as Person).lastName}`
                        : (selectedContact as Organization).name
                      }
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedContact.type === 'person' ? 'Person' : 'Organization'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && permissions.canEdit && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {isEditing && (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            if (isAddingNew) {
                              setSelectedContact(null);
                              setIsAddingNew(false);
                            }
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {!isAddingNew && permissions.canDelete && (
                      <button
                        onClick={() => setShowDeleteConfirm(selectedContact.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === selectedContact.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800">
                          Are you sure you want to delete this {selectedContact.type}? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleDelete(selectedContact.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedContact.type === 'person' ? (
                  <PersonDetails
                    person={selectedContact as Person}
                    isEditing={isEditing}
                    onChange={(updated) => setSelectedContact(updated)}
                    showSensitive={showSensitiveData}
                    onToggleSensitive={() => setShowSensitiveData(!showSensitiveData)}
                    organizations={organizations}
                  />
                ) : (
                  <OrganizationDetails
                    organization={selectedContact as Organization}
                    isEditing={isEditing}
                    onChange={(updated) => setSelectedContact(updated)}
                    persons={persons}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>Select a contact to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Person Details Component
const PersonDetails: React.FC<{
  person: Person;
  isEditing: boolean;
  onChange: (person: Person) => void;
  showSensitive: boolean;
  onToggleSensitive: () => void;
  organizations: Organization[];
}> = ({ person, isEditing, onChange, showSensitive, onToggleSensitive, organizations }) => {
  const handleChange = (field: keyof Person, value: unknown) => {
    onChange({ ...person, [field]: value, updatedAt: new Date() });
  };

  const _handleAddressChange = (field: string, value: string) => {
    onChange({
      ...person,
      address: { ...person.address, [field]: value } as any,
      updatedAt: new Date()
    });
  };

  const handleRoleAdd = () => {
    const newRole = {
      type: 'other' as const,
      details: '',
      startDate: new Date().toISOString().split('T')[0]
    };
    handleChange('roles', [...person.roles, newRole]);
  };

  const handleRoleRemove = (index: number) => {
    handleChange('roles', person.roles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={person.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={person.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={person.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={person.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <select
              value={person.organization || ''}
              onChange={(e) => handleChange('organization', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="">No organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={person.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Roles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Roles</h3>
          {isEditing && (
            <button
              onClick={handleRoleAdd}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Role
            </button>
          )}
        </div>
        {person.roles.length === 0 ? (
          <p className="text-gray-500 text-sm">No roles assigned</p>
        ) : (
          <div className="space-y-3">
            {person.roles.map((role, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Type
                    </label>
                    <select
                      value={role.type}
                      onChange={(e) => {
                        const updatedRoles = [...person.roles];
                        updatedRoles[index] = { ...role, type: e.target.value as any };
                        handleChange('roles', updatedRoles);
                      }}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                    >
                      <option value="board_member">Board Member</option>
                      <option value="staff">Staff</option>
                      <option value="donor">Donor</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="contractor">Contractor</option>
                      <option value="advisory">Advisory Board</option>
                      <option value="committee">Committee Member</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {role.type === 'staff' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compensation Type
                      </label>
                      <select
                        value={role.compensation || 'volunteer'}
                        onChange={(e) => {
                          const updatedRoles = [...person.roles];
                          updatedRoles[index] = { ...role, compensation: e.target.value as any };
                          handleChange('roles', updatedRoles);
                        }}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                      >
                        <option value="volunteer">Volunteer</option>
                        <option value="stipendiary">Stipendiary</option>
                        <option value="compensated">Compensated</option>
                        <option value="contractor">Contractor</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={role.startDate || ''}
                      onChange={(e) => {
                        const updatedRoles = [...person.roles];
                        updatedRoles[index] = { ...role, startDate: e.target.value };
                        handleChange('roles', updatedRoles);
                      }}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={role.endDate || ''}
                      onChange={(e) => {
                        const updatedRoles = [...person.roles];
                        updatedRoles[index] = { ...role, endDate: e.target.value };
                        handleChange('roles', updatedRoles);
                      }}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                    />
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRoleRemove(index)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Role
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demographics (Sensitive Data) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Demographics</h3>
          <button
            onClick={onToggleSensitive}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {showSensitive ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Sensitive Data
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Sensitive Data
              </>
            )}
          </button>
        </div>
        {showSensitive ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <input
                type="text"
                value={person.demographics?.gender || ''}
                onChange={(e) => handleChange('demographics', {
                  ...person.demographics,
                  gender: e.target.value
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ethnicity
              </label>
              <input
                type="text"
                value={person.demographics?.ethnicity || ''}
                onChange={(e) => handleChange('demographics', {
                  ...person.demographics,
                  ethnicity: e.target.value
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <input
                type="text"
                value={person.demographics?.age || ''}
                onChange={(e) => handleChange('demographics', {
                  ...person.demographics,
                  age: e.target.value
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Sensitive data is hidden</p>
        )}
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Documents & Media</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Photo/Video Release</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={person.documents?.photoVideoRelease || false}
                onChange={(e) => handleChange('documents', {
                  ...person.documents,
                  photoVideoRelease: e.target.checked
                })}
                disabled={!isEditing}
                className="rounded"
              />
              <span className="text-sm">Consent given</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-sm text-left">
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Headshot
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-sm text-left">
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Resume
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-sm text-left">
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Biography
            </button>
            <button className="p-3 border rounded-lg hover:bg-gray-50 text-sm text-left">
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Certifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Organization Details Component
const OrganizationDetails: React.FC<{
  organization: Organization;
  isEditing: boolean;
  onChange: (org: Organization) => void;
  persons: Person[];
}> = ({ organization, isEditing, onChange, persons }) => {
  const handleChange = (field: keyof Organization, value: unknown) => {
    onChange({ ...organization, [field]: value, updatedAt: new Date() });
  };

  const handleAddressChange = (field: string, value: string) => {
    onChange({
      ...organization,
      address: { ...organization.address, [field]: value } as any,
      updatedAt: new Date()
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              value={organization.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name
            </label>
            <input
              type="text"
              value={organization.legalName || ''}
              onChange={(e) => handleChange('legalName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              EIN
            </label>
            <input
              type="text"
              value={organization.ein || ''}
              onChange={(e) => handleChange('ein', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={organization.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={organization.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={organization.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Organization Roles</h3>
        <div className="grid grid-cols-2 gap-3">
          {organization.roles.map((role, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <select
                value={role.type}
                onChange={(e) => {
                  const updatedRoles = [...organization.roles];
                  updatedRoles[index] = { ...role, type: e.target.value as any };
                  handleChange('roles', updatedRoles);
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
              >
                <option value="partner">Partner</option>
                <option value="funder">Funder</option>
                <option value="vendor">Vendor</option>
                <option value="affiliate">Affiliate</option>
                <option value="parent">Parent Organization</option>
                <option value="subsidiary">Subsidiary</option>
                <option value="fiscal_sponsor">Fiscal Sponsor</option>
                <option value="insurer">Insurer</option>
                <option value="auditor">Auditor</option>
                <option value="other">Other</option>
              </select>
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => handleChange('roles', [...organization.roles, { type: 'other' }])}
              className="p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-sm text-gray-600"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add Role
            </button>
          )}
        </div>
      </div>

      {/* Contact Persons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Persons</h3>
        <div className="space-y-2">
          {organization.contactPersons.map((personId, index) => {
            const person = persons.find(p => p.id === personId);
            return person ? (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">
                  {person.firstName} {person.lastName} - {person.title || 'No title'}
                </span>
                {isEditing && (
                  <button
                    onClick={() => {
                      handleChange('contactPersons', organization.contactPersons.filter((_, i) => i !== index));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null;
          })}
          {isEditing && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleChange('contactPersons', [...organization.contactPersons, e.target.value]);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Add contact person...</option>
              {persons
                .filter(p => !organization.contactPersons.includes(p.id))
                .map(person => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={organization.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={organization.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={organization.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={organization.address?.zipCode || ''}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={organization.address?.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManagerRedesigned;