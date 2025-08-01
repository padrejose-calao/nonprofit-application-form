import React, { useState } from 'react';
import { SectionProps } from '../types';
import { User, Plus, Edit2, Trash2, Building2, FileText, Phone, Mail, ChevronDown, MessageCircle, Check } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';

interface PersonContact {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  w9Status?: boolean;
  organization?: string;
  override?: boolean;
  contactCardId?: string;
  role: string;
  customRole?: string;
}

const CONTACT_ROLES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'ceo', label: 'CEO/Executive Director' },
  { value: 'cfo', label: 'CFO' },
  { value: 'financial_lead', label: 'Financial Lead' },
  { value: 'program_manager', label: 'Program Manager' },
  { value: 'board_chair', label: 'Board Chair' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'development', label: 'Development Director' },
  { value: 'operations', label: 'Operations Manager' },
  { value: 'hr', label: 'HR Director' },
  { value: 'it', label: 'IT Manager' },
  { value: 'marketing', label: 'Marketing/Communications' },
  { value: 'other', label: 'Other Contact' }
];

const ContactPersonsSectionEnhanced: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const [showPersonSelector, setShowPersonSelector] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);

  // Initialize primary contact if not exists
  const contactData = data as { primaryContact?: PersonContact; additionalContacts?: PersonContact[] };
  const primaryContact = contactData.primaryContact || {
    id: '1',
    fullName: '',
    title: '',
    email: '',
    phone: '',
    role: 'primary'
  };
  
  // Ensure additionalContacts is always an array
  if (!contactData.additionalContacts) {
    contactData.additionalContacts = [];
  }

  const contacts = [
    { ...primaryContact, isPrimary: true },
    ...contactData.additionalContacts
  ];

  const handleSelectPerson = (contactId: string, personCard: unknown) => {
    const contact = contacts.find(c => c.id === contactId);
    const currentRole = contact?.role || 'other';
    
    const card = personCard as any;
    const newContactData: PersonContact = {
      id: contactId.startsWith('placeholder-') ? `contact-${Date.now()}` : contactId,
      fullName: card?.displayName || card?.name || `${card?.firstName || ''} ${card?.lastName || ''}`.trim() || 'Unknown',
      title: card?.title || '',
      email: card?.email || '',
      phone: card?.phone || card?.mobile || '',
      whatsappNumber: card?.whatsApp || '',
      w9Status: card?.w9OnFile || false,
      organization: card?.organization || '',
      override: false,
      contactCardId: card?.id,
      role: currentRole
    };

    if (contactId === primaryContact.id) {
      onChange('primaryContact', newContactData);
    } else if (contactId.startsWith('placeholder-')) {
      // Adding a new contact from placeholder
      onChange('additionalContacts', [...(contactData.additionalContacts || []), newContactData]);
    } else {
      // Updating existing contact
      const updatedContacts = (contactData.additionalContacts || []).map((c: PersonContact) =>
        c.id === contactId ? newContactData : c
      );
      onChange('additionalContacts', updatedContacts);
    }
    setShowPersonSelector(null);
  };

  const handleUpdateContact = (contactId: string, updates: Partial<PersonContact>) => {
    if (contactId === primaryContact.id) {
      onChange('primaryContact', { ...primaryContact, ...updates });
    } else {
      const updatedContacts = (contactData.additionalContacts || []).map((c: PersonContact) =>
        c.id === contactId ? { ...c, ...updates } : c
      );
      onChange('additionalContacts', updatedContacts);
    }
  };

  const handleRoleChange = (contactId: string, role: string) => {
    handleUpdateContact(contactId, { role });
    if (role !== 'other') {
      handleUpdateContact(contactId, { customRole: undefined });
    }
    setShowRoleDropdown(null);
  };

  const handleAddContact = () => {
    // Create a placeholder contact that will be replaced when a person is selected
    const placeholderId = `placeholder-${Date.now()}`;
    setShowPersonSelector(placeholderId);
  };

  const handleDeleteContact = (contactId: string) => {
    onChange('additionalContacts', 
      (contactData.additionalContacts || []).filter((c: PersonContact) => c.id !== contactId)
    );
  };

  const getRoleDisplay = (contact: PersonContact & { isPrimary?: boolean }) => {
    if (contact.isPrimary) return 'Primary Contact (Required)';
    const role = CONTACT_ROLES.find(r => r.value === contact.role);
    if (contact.role === 'other' && contact.customRole) {
      return contact.customRole;
    }
    return role?.label || 'Other Contact';
  };

  const renderContact = (contact: PersonContact & { isPrimary?: boolean }) => {
    const isEditing = editingContactId === contact.id || contact.override || (contact.isPrimary && !contact.contactCardId);
    const hasOverride = contact.contactCardId && contact.override;

    return (
      <div key={contact.id} className="border rounded-lg p-4 bg-white">
        {/* Contact Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              {contact.isPrimary ? (
                <span className="font-medium text-gray-700">Primary Contact (Required)</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(showRoleDropdown === contact.id ? null : contact.id)}
                  className="font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  {getRoleDisplay(contact)}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}
              {contact.contactCardId && !contact.override && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">From Contact Card</span>
              )}
            </div>
            
            {/* Role Dropdown */}
            {showRoleDropdown === contact.id && !contact.isPrimary && (
              <div className="absolute mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {CONTACT_ROLES.filter(r => r.value !== 'primary').map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleChange(contact.id, role.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      contact.role === role.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Custom Role Input */}
            {contact.role === 'other' && !contact.isPrimary && (
              <input
                type="text"
                value={contact.customRole || ''}
                onChange={(e) => handleUpdateContact(contact.id, { customRole: e.target.value })}
                placeholder="Enter custom role"
                className="mt-2 px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-xs"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {contact.contactCardId && (
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={contact.override || false}
                  onChange={(e) => handleUpdateContact(contact.id, { override: e.target.checked })}
                  className="mr-1"
                />
                Override
              </label>
            )}
            <button
              type="button"
              onClick={() => setShowPersonSelector(contact.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Select from contact manager"
            >
              <User className="h-4 w-4" />
            </button>
            {contact.isPrimary && contact.contactCardId && (
              <button
                type="button"
                onClick={() => setEditingContactId(editingContactId === contact.id ? null : contact.id)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit contact"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {!contact.isPrimary && (
              <>
                <button
                  type="button"
                  onClick={() => setEditingContactId(editingContactId === contact.id ? null : contact.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contact Details */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={contact.fullName || ''}
                onChange={(e) => handleUpdateContact(contact.id, { fullName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors?.[contact.isPrimary ? 'primaryContactName' : `contact${contact.id}Name`] 
                    ? 'border-red-300' : 'border-gray-300'
                } ${!hasOverride && contact.contactCardId ? 'bg-gray-50' : ''}`}
                disabled={!hasOverride && !!contact.contactCardId}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title/Position *</label>
              <input
                type="text"
                value={contact.title || ''}
                onChange={(e) => handleUpdateContact(contact.id, { title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  !hasOverride && contact.contactCardId ? 'bg-gray-50' : ''
                }`}
                disabled={!hasOverride && !!contact.contactCardId}
                placeholder="e.g., Executive Director"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Mail className="inline h-3 w-3 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={contact.email || ''}
                  onChange={(e) => handleUpdateContact(contact.id, { email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors?.[contact.isPrimary ? 'primaryContactEmail' : `contact${contact.id}Email`] 
                      ? 'border-red-300' : 'border-gray-300'
                  } ${!hasOverride && contact.contactCardId ? 'bg-gray-50' : ''}`}
                  disabled={!hasOverride && !!contact.contactCardId}
                  placeholder="email@organization.org"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Phone className="inline h-3 w-3 mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={contact.phone || ''}
                  onChange={(e) => handleUpdateContact(contact.id, { phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !hasOverride && contact.contactCardId ? 'bg-gray-50' : ''
                  }`}
                  disabled={!hasOverride && !!contact.contactCardId}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={contact.whatsappNumber || ''}
                  onChange={(e) => handleUpdateContact(contact.id, { whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={contact.w9Status || false}
                    onChange={(e) => handleUpdateContact(contact.id, { w9Status: e.target.checked })}
                    className="mr-2"
                  />
                  <FileText className="h-4 w-4 mr-1 text-gray-400" />
                  W-9 on file
                </label>
              </div>
            </div>

            {/* Organization Link */}
            {contact.organization && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Organization:</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-blue-600">{contact.organization}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            {contact.fullName ? (
              <>
                <p className="font-medium text-gray-900">{contact.fullName}</p>
                <p className="text-xs text-gray-500 mb-2">{contact.title}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-xs">{contact.phone}</span>
                  </div>
                  {contact.whatsappNumber && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3 text-gray-400" />
                      <span className="text-xs">{contact.whatsappNumber}</span>
                    </div>
                  )}
                </div>
                {contact.w9Status && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    W-9 on file
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No contact selected</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click the <User className="inline h-3 w-3" /> button above to select a contact
                </p>
              </div>
            )}
          </div>
        )}

        {/* Person Selector */}
        {showPersonSelector === contact.id && (
          <div className="mt-3 p-4 border rounded-md bg-gray-50">
            <ContactSelectorSimple
              type="person"
              onSelect={(person) => handleSelectPerson(contact.id, person)}
              onClose={() => setShowPersonSelector(null)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          All contacts are tied to the contact manager. Select from existing contacts or add new ones.
          These contacts will auto-populate in other sections of the application.
        </p>
      </div>

      {/* Primary Contact */}
      {renderContact({ ...primaryContact, isPrimary: true })}

      {/* Additional Contacts */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700">Additional Contacts</h4>
          <button
            type="button"
            onClick={handleAddContact}
            className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {contactData.additionalContacts?.map((contact: PersonContact) => renderContact(contact))}
        
        {(!contactData.additionalContacts || contactData.additionalContacts.length === 0) && (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
            <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No additional contacts added</p>
            <p className="text-xs mt-1">Add CEO, CFO, or other key personnel</p>
          </div>
        )}
      </div>

      {/* Contact Selector for Add New */}
      {showPersonSelector && showPersonSelector.startsWith('placeholder-') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Select Contact Person</h3>
            <ContactSelectorSimple
              type="person"
              onSelect={(person) => handleSelectPerson(showPersonSelector, person)}
              onClose={() => setShowPersonSelector(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPersonsSectionEnhanced;