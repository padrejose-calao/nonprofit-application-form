import { User, Phone, Mail } from 'lucide-react';
import React from 'react';

interface ContactSectionProps {
  formData: unknown;
  setFormData: (data: unknown) => void;
  errors: unknown;
}

const ContactSection: React.FC<ContactSectionProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (field: string, value: unknown) => {
    setFormData({ ...(formData as any), [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact First Name *
          </label>
          <input
            type="text"
            value={(formData as any).contactFirstName || ''}
            onChange={(e) => handleChange('contactFirstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).contactFirstName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).contactFirstName && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).contactFirstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Last Name *
          </label>
          <input
            type="text"
            value={(formData as any).contactLastName || ''}
            onChange={(e) => handleChange('contactLastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).contactLastName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).contactLastName && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).contactLastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={(formData as any).contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).contactEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).contactEmail && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).contactEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone *
          </label>
          <input
            type="tel"
            value={(formData as any).contactPhone || ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).contactPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).contactPhone && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).contactPhone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position *</label>
          <input
            type="text"
            value={(formData as any).contactTitle || ''}
            onChange={(e) => handleChange('contactTitle', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).contactTitle ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).contactTitle && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).contactTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
