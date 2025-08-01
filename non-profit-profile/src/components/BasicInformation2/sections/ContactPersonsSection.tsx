import React, { useState } from 'react';
import { ContactPersonsData, ContactPerson } from '../types';

interface ContactPersonsSectionProps {
  data: ContactPersonsData;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

const ContactPersonsSection: React.FC<ContactPersonsSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [_selectedRole, setSelectedRole] = useState<'primary' | 'additional'>('primary');

  const predefinedRoles = [
    'Executive Director/CEO',
    'Board Chair',
    'Finance Director/CFO',
    'Program Director',
    'Development Director',
    'Operations Manager',
    'HR Director',
    'Communications Director',
    'IT Director',
    'Other'
  ];

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleAddAdditionalContact = () => {
    const newContact: ContactPerson = {
      id: `contact-${Date.now()}`,
      fullName: '',
      title: '',
      email: '',
      phone: '',
    };
    onChange('additionalContacts', [...data.additionalContacts, newContact]);
  };

  const handleRemoveAdditionalContact = (index: number) => {
    const updated = data.additionalContacts.filter((_, i) => i !== index);
    onChange('additionalContacts', updated);
  };

  const handlePrimaryContactChange = (field: keyof ContactPerson, value: unknown) => {
    onChange('primaryContact', {
      ...data.primaryContact,
      [field]: field === 'phone' || field === 'whatsappNumber' ? formatPhoneNumber(value as string) : value,
    });
  };

  const handleAdditionalContactChange = (index: number, field: keyof ContactPerson, value: unknown) => {
    const updated = [...data.additionalContacts];
    updated[index] = {
      ...updated[index],
      [field]: field === 'phone' || field === 'whatsappNumber' ? formatPhoneNumber(value as string) : value,
    };
    onChange('additionalContacts', updated);
  };

  const renderContactFields = (
    contact: ContactPerson,
    onChange: (field: keyof ContactPerson, value: unknown) => void,
    errors: Record<string, string> = {},
    isPrimary: boolean = false
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name {isPrimary && '*'}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={contact.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          <button
            type="button"
            onClick={() => {
              setSelectedRole(isPrimary ? 'primary' : 'additional');
              setShowContactSelector(true);
            }}
            className="p-2 text-gray-600 hover:text-orange-600"
            title="Search contacts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title/Position {isPrimary && '*'}
        </label>
        <select
          value={contact.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Title</option>
          {predefinedRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address {isPrimary && '*'}
        </label>
        <input
          type="email"
          value={contact.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="john.doe@organization.org"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number {isPrimary && '*'}
        </label>
        <input
          type="tel"
          value={contact.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123-456-7890"
          maxLength={12}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number
        </label>
        <input
          type="tel"
          value={contact.whatsappNumber || ''}
          onChange={(e) => onChange('whatsappNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="123-456-7890"
          maxLength={12}
        />
      </div>

      <div>
        <label className="flex items-center mt-6">
          <input
            type="checkbox"
            checked={contact.w9Status || false}
            onChange={(e) => onChange('w9Status', e.target.checked)}
            className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">W-9 on file</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Key Personnel</h2>

      {/* Primary Contact */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Primary Contact (Required)</h3>
        {renderContactFields(
          data.primaryContact,
          handlePrimaryContactChange,
          errors,
          true
        )}
        
        {/* Authorization Scope */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Authorization Scope
          </label>
          <div className="space-y-2">
            {[
              'Sign contracts',
              'Apply for grants',
              'Financial transactions',
              'Hire/terminate staff',
              'Represent organization publicly',
            ].map((scope) => (
              <label key={scope} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{scope}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Designation Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation Letter/Board Resolution
          </label>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Choose File
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Upload document designating this person as primary contact
          </p>
        </div>
      </div>

      {/* Additional Contacts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Additional Contacts</h3>
          <button
            type="button"
            onClick={handleAddAdditionalContact}
            className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
          >
            + Add Contact
          </button>
        </div>

        {data.additionalContacts.map((contact, index) => (
          <div key={contact.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Additional Contact #{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveAdditionalContact(index)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            {renderContactFields(
              contact,
              (field, value) => handleAdditionalContactChange(index, field, value)
            )}
          </div>
        ))}
      </div>

      {/* Leadership Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Leadership Summary</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Primary Contact:</span>
            <span className="font-medium">
              {data.primaryContact.fullName || 'Not specified'} 
              {data.primaryContact.title && ` - ${data.primaryContact.title}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Additional Contacts:</span>
            <span className="font-medium">{data.additionalContacts.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">W-9 Forms on File:</span>
            <span className="font-medium">
              {[data.primaryContact, ...data.additionalContacts].filter(c => c.w9Status).length}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Card Selector Modal (placeholder) */}
      {showContactSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Contact</h3>
              <button
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">Contact selector will be integrated with Contact Manager</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPersonsSection;