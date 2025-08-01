import React, { useState, useEffect } from 'react';
import { SectionProps } from '../types';
import { Phone, Mail, Globe, Building2, MessageSquare, Check } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';

interface OrgCommData {
  autoPopulateComm?: boolean;
  organizationPhone?: string;
  primaryEmail?: string;
  website?: string;
  whatsappNumber?: string;
  whatsApp?: string;
  preferredEmail?: string;
  country?: string;
}

interface OrgCard {
  id?: string;
  name?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  website?: string;
  whatsApp?: string;
  taxId?: string;
}

const OrganizationalCommunicationSectionEnhanced: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const typedData = (data || {}) as OrgCommData;
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [selectedOrgCard, setSelectedOrgCard] = useState<OrgCard | null>(null);
  const [overrideFields, setOverrideFields] = useState<Record<string, boolean>>({});

  // Initialize auto-populate to true
  useEffect(() => {
    if (typedData.autoPopulateComm === undefined) {
      onChange('autoPopulateComm', true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-populate from organization card
  useEffect(() => {
    if (typedData.autoPopulateComm && selectedOrgCard) {
      if (!overrideFields.organizationPhone && selectedOrgCard.phone) {
        onChange('organizationPhone', selectedOrgCard.phone);
      }
      if (!overrideFields.primaryEmail && selectedOrgCard.email) {
        onChange('primaryEmail', selectedOrgCard.email);
      }
      if (!overrideFields.website && selectedOrgCard.website) {
        onChange('website', selectedOrgCard.website);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgCard, typedData.autoPopulateComm, overrideFields]);

  const handleOverrideToggle = (field: string) => {
    setOverrideFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Auto-populate Section - Always enabled */}
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Auto-populating from organization contact card
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowOrgSelector(true)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            <Building2 className="inline h-4 w-4 mr-1" />
            Select Organization
          </button>
        </div>
        
        {selectedOrgCard && (
          <div className="mt-2 p-2 bg-white rounded text-sm">
            <span className="font-medium">Organization:</span> {selectedOrgCard?.name || selectedOrgCard?.displayName}
            {selectedOrgCard?.taxId && <> <span className="ml-2 text-gray-600">• EIN: {selectedOrgCard.taxId}</span></>}
          </div>
        )}
        
        {!selectedOrgCard && (
          <p className="text-sm text-blue-700 mt-2">
            Select an organization to auto-populate communication fields
          </p>
        )}
      </div>

      {/* Organization Selector */}
      {showOrgSelector && (
        <div className="p-4 border rounded-md bg-gray-50">
          <ContactSelectorSimple
            type="organization"
            onSelect={(contact) => {
              setSelectedOrgCard(contact as OrgCard);
              setShowOrgSelector(false);
            }}
            onClose={() => setShowOrgSelector(false)}
          />
        </div>
      )}

      {/* Organization Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="inline h-4 w-4 mr-1" />
          Organization Phone *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={typedData.organizationPhone || ''}
            onChange={(e) => onChange('organizationPhone', formatPhoneNumber(e.target.value))}
            className={`flex-1 px-3 py-2 border rounded-md ${
              errors?.organizationPhone ? 'border-red-300' : 'border-gray-300'
            } ${!overrideFields.organizationPhone && selectedOrgCard?.phone ? 'bg-gray-50' : ''}`}
            placeholder="(123) 456-7890"
            disabled={!overrideFields.organizationPhone && !!selectedOrgCard?.phone}
          />
          {selectedOrgCard?.phone && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={overrideFields.organizationPhone || false}
                onChange={() => handleOverrideToggle('organizationPhone')}
                className="mr-1"
              />
              Override
            </label>
          )}
        </div>
        {errors?.organizationPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.organizationPhone}</p>
        )}
      </div>

      {/* WhatsApp Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MessageSquare className="inline h-4 w-4 mr-1" />
          WhatsApp Number
        </label>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={typedData.whatsappNumber || ''}
            onChange={(e) => onChange('whatsappNumber', formatPhoneNumber(e.target.value))}
            className={`flex-1 px-3 py-2 border border-gray-300 rounded-md ${
              !overrideFields.whatsappNumber && selectedOrgCard?.whatsApp ? 'bg-gray-50' : ''
            }`}
            placeholder="(123) 456-7890"
            disabled={!overrideFields.whatsappNumber && !!selectedOrgCard?.whatsApp}
          />
          {selectedOrgCard?.whatsApp && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={overrideFields.whatsappNumber || false}
                onChange={() => handleOverrideToggle('whatsappNumber')}
                className="mr-1"
              />
              Override
            </label>
          )}
        </div>
      </div>

      {/* Primary Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Mail className="inline h-4 w-4 mr-1" />
          Primary Email Address *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={typedData.primaryEmail || ''}
            onChange={(e) => onChange('primaryEmail', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md ${
              errors?.primaryEmail ? 'border-red-300' : 'border-gray-300'
            } ${!overrideFields.primaryEmail && selectedOrgCard?.email ? 'bg-gray-50' : ''}`}
            placeholder="info@organization.org"
            disabled={!overrideFields.primaryEmail && !!selectedOrgCard?.email}
          />
          {selectedOrgCard?.email && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={overrideFields.primaryEmail || false}
                onChange={() => handleOverrideToggle('primaryEmail')}
                className="mr-1"
              />
              Override
            </label>
          )}
        </div>
        {errors?.primaryEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.primaryEmail}</p>
        )}
      </div>

      {/* Preferred Email (if different) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Email (if different from primary)
        </label>
        <input
          type="email"
          value={typedData.preferredEmail || ''}
          onChange={(e) => onChange('preferredEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="preferred@organization.org"
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Globe className="inline h-4 w-4 mr-1" />
          Website
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={typedData.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md ${
              errors?.website ? 'border-red-300' : 'border-gray-300'
            } ${!overrideFields.website && selectedOrgCard?.website ? 'bg-gray-50' : ''}`}
            placeholder="https://www.organization.org"
            disabled={!overrideFields.website && !!selectedOrgCard?.website}
          />
          {selectedOrgCard?.website && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={overrideFields.website || false}
                onChange={() => handleOverrideToggle('website')}
                className="mr-1"
              />
              Override
            </label>
          )}
        </div>
        {errors?.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select
          value={typedData.country || 'United States'}
          onChange={(e) => onChange('country', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="Mexico">Mexico</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Australia">Australia</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default OrganizationalCommunicationSectionEnhanced;