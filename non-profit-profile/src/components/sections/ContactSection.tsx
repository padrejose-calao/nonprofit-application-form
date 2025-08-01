import { User, Phone, Mail } from 'lucide-react';
import React from 'react';

interface ContactSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
}

const ContactSection: React.FC<ContactSectionProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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
            value={formData.contactFirstName || ''}
            onChange={(e) => handleChange('contactFirstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contactFirstName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.contactFirstName && (
            <p className="text-red-500 text-sm mt-1">{errors.contactFirstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Last Name *
          </label>
          <input
            type="text"
            value={formData.contactLastName || ''}
            onChange={(e) => handleChange('contactLastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contactLastName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.contactLastName && (
            <p className="text-red-500 text-sm mt-1">{errors.contactLastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contactEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone *
          </label>
          <input
            type="tel"
            value={formData.contactPhone || ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contactPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.contactPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position *</label>
          <input
            type="text"
            value={formData.contactTitle || ''}
            onChange={(e) => handleChange('contactTitle', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.contactTitle ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.contactTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.contactTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
