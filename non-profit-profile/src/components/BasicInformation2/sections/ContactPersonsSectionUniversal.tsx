import React, { useState } from 'react';
import { Mail, Phone, User, Plus, Trash2 } from 'lucide-react';
import { SectionProps, ContactCard } from '../types';
import UniversalNameField from '../components/UniversalNameField';

interface ContactPerson {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  contactCardId?: string;
  contactCard?: ContactCard | null;
  override?: boolean;
}

const ContactPersonsSectionUniversal: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  // Type the data properly to avoid unknown type errors
  interface ContactData {
    contacts?: ContactPerson[];
    primaryContactName?: string;
    primaryContactTitle?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
  }
  
  const typedData = (data || {}) as ContactData;
  
  const [contacts, setContacts] = useState<ContactPerson[]>(
    typedData.contacts || [
      {
        id: 'primary',
        fullName: typedData.primaryContactName || '',
        title: typedData.primaryContactTitle || '',
        email: typedData.primaryContactEmail || '',
        phone: typedData.primaryContactPhone || '',
        isPrimary: true
      }
    ]
  );

  const handleUpdateContact = (contactId: string, updates: Partial<ContactPerson>) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, ...updates } : contact
    );
    setContacts(updatedContacts);

    // Update form data
    const primaryContact = updatedContacts.find(c => c.isPrimary);
    if (primaryContact) {
      onChange('primaryContactName', primaryContact.fullName);
      onChange('primaryContactTitle', primaryContact.title);
      onChange('primaryContactEmail', primaryContact.email);
      onChange('primaryContactPhone', primaryContact.phone);
    }

    const additionalContacts = updatedContacts.filter(c => !c.isPrimary);
    onChange('additionalContacts', additionalContacts);
  };

  const handleContactCardChange = (contactId: string, contactCard: ContactCard | null) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, contactCard, contactCardId: contactCard?.id } : contact
    );
    setContacts(updatedContacts);
  };

  const addNewContact = () => {
    const newContact: ContactPerson = {
      id: `contact-${Date.now()}`,
      fullName: '',
      title: '',
      email: '',
      phone: '',
      isPrimary: false
    };
    setContacts([...contacts, newContact]);
  };

  const removeContact = (contactId: string) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    setContacts(updatedContacts);
    
    // Update form data
    const additionalContacts = updatedContacts.filter(c => !c.isPrimary);
    onChange('additionalContacts', additionalContacts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Contact Persons</h2>
        <button
          type="button"
          onClick={addNewContact}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-4 border rounded-lg ${
              contact.isPrimary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {contact.isPrimary ? 'Primary Contact' : 'Additional Contact'}
                </span>
                {contact.isPrimary && <span className="text-red-500">*</span>}
              </div>
              
              {!contact.isPrimary && (
                <button
                  type="button"
                  onClick={() => removeContact(contact.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove contact"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name Field with Contact Manager Integration */}
              <UniversalNameField
                label="Full Name"
                value={contact.fullName}
                onChange={(value, contactCard) => {
                  handleUpdateContact(contact.id, { fullName: value });
                  if (contactCard) {
                    handleContactCardChange(contact.id, contactCard);
                  }
                }}
                type="person"
                required={contact.isPrimary}
                placeholder="Enter full name"
                error={errors?.[contact.isPrimary ? 'primaryContactName' : `contact${contact.id}Name`]}
                contactCard={contact.contactCard}
                onContactCardChange={(card) => handleContactCardChange(contact.id, card)}
                fieldName={`${contact.isPrimary ? 'primary' : 'additional'}ContactName`}
                relatedFields={{
                  title: {
                    value: contact.title,
                    onChange: (value) => handleUpdateContact(contact.id, { title: value })
                  },
                  email: {
                    value: contact.email,
                    onChange: (value) => handleUpdateContact(contact.id, { email: value })
                  },
                  phone: {
                    value: contact.phone,
                    onChange: (value) => handleUpdateContact(contact.id, { phone: value })
                  }
                }}
              />

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address {contact.isPrimary && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => handleUpdateContact(contact.id, { email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors?.[contact.isPrimary ? 'primaryContactEmail' : `contact${contact.id}Email`] 
                        ? 'border-red-300' : 'border-gray-300'
                    } ${!!contact.contactCard && !contact.override ? 'bg-gray-50' : ''}`}
                    disabled={!!contact.contactCard && !contact.override}
                    placeholder="email@organization.org"
                  />
                  {errors?.[contact.isPrimary ? 'primaryContactEmail' : `contact${contact.id}Email`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[contact.isPrimary ? 'primaryContactEmail' : `contact${contact.id}Email`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number {contact.isPrimary && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleUpdateContact(contact.id, { phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors?.[contact.isPrimary ? 'primaryContactPhone' : `contact${contact.id}Phone`] 
                        ? 'border-red-300' : 'border-gray-300'
                    } ${!!contact.contactCard && !contact.override ? 'bg-gray-50' : ''}`}
                    disabled={!!contact.contactCard && !contact.override}
                    placeholder="(555) 123-4567"
                  />
                  {errors?.[contact.isPrimary ? 'primaryContactPhone' : `contact${contact.id}Phone`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[contact.isPrimary ? 'primaryContactPhone' : `contact${contact.id}Phone`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title/Position {contact.isPrimary && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={contact.title}
                    onChange={(e) => handleUpdateContact(contact.id, { title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors?.[contact.isPrimary ? 'primaryContactTitle' : `contact${contact.id}Title`] 
                        ? 'border-red-300' : 'border-gray-300'
                    } ${!!contact.contactCard && !contact.override ? 'bg-gray-50' : ''}`}
                    disabled={!!contact.contactCard && !contact.override}
                    placeholder="e.g., Executive Director"
                  />
                  {errors?.[contact.isPrimary ? 'primaryContactTitle' : `contact${contact.id}Title`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[contact.isPrimary ? 'primaryContactTitle' : `contact${contact.id}Title`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contacts.filter(c => !c.isPrimary).length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No additional contacts added</p>
          <button
            type="button"
            onClick={addNewContact}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first additional contact
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactPersonsSectionUniversal;