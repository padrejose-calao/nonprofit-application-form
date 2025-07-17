import React from 'react';
import { OrganizationalCommunicationData } from '../types';
import { COUNTRIES, VALIDATION_PATTERNS } from '../constants';

interface OrganizationalCommunicationSectionProps {
  data: OrganizationalCommunicationData;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const OrganizationalCommunicationSection: React.FC<OrganizationalCommunicationSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    onChange(field, formatted);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Organizational Communication</h2>

      {/* Auto-populate Option */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.autoPopulateComm}
            onChange={(e) => onChange('autoPopulateComm', e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-blue-800">
            Auto-populate from organization contact card
          </span>
        </label>
        {data.autoPopulateComm && (
          <p className="mt-2 text-xs text-blue-700 ml-6">
            Communication fields will be automatically filled from your organization's contact card.
            You can still override individual fields as needed.
          </p>
        )}
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Phone *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={data.organizationPhone}
              onChange={(e) => handlePhoneChange('organizationPhone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                errors.organizationPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123-456-7890"
              maxLength={12}
            />
            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          {errors.organizationPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.organizationPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={data.whatsappNumber || ''}
              onChange={(e) => handlePhoneChange('whatsappNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="123-456-7890"
              maxLength={12}
            />
            <svg className="absolute right-3 top-3 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional: For WhatsApp Business communication
          </p>
        </div>
      </div>

      {/* Email Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Organization Email *
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.primaryEmail}
              onChange={(e) => onChange('primaryEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                errors.primaryEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="info@organization.org"
            />
            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {errors.primaryEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.primaryEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Contact Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.preferredEmail || ''}
              onChange={(e) => onChange('preferredEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="contact@organization.org"
            />
            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            If different from primary email
          </p>
        </div>
      </div>

      {/* Website and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <div className="relative">
            <input
              type="url"
              value={data.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="https://www.organization.org"
            />
            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Listings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Directory Listings (Auto-syncs with Social Media)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            'Google Business Profile',
            'Apple Maps',
            'Yelp',
            'Facebook',
            'LinkedIn',
            'Nextdoor',
            'Better Business Bureau',
            'GuideStar',
            'Charity Navigator'
          ].map((platform) => (
            <label key={platform} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{platform}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Communication Preferences</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Accept email communications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Accept SMS communications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Available for public directory listings</span>
          </label>
        </div>
      </div>

      {/* Contact Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Contact Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-blue-600">Main Phone:</span>{' '}
            <span className="font-medium text-blue-900">{data.organizationPhone || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-blue-600">Primary Email:</span>{' '}
            <span className="font-medium text-blue-900">{data.primaryEmail || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-blue-600">Website:</span>{' '}
            <span className="font-medium text-blue-900">{data.website || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-blue-600">Country:</span>{' '}
            <span className="font-medium text-blue-900">
              {COUNTRIES.find(c => c.value === data.country)?.label || data.country}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalCommunicationSection;