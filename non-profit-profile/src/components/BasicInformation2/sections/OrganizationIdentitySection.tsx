import React, { useState } from 'react';
import { OrganizationIdentityData } from '../types';
import { US_STATES, LANGUAGES, ACCESSIBILITY_SERVICES } from '../constants';

interface OrganizationIdentitySectionProps {
  data: OrganizationIdentityData;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

const OrganizationIdentitySection: React.FC<OrganizationIdentitySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [_showContactSelector, setShowContactSelector] = useState(false);

  const handleLanguageToggle = (language: string) => {
    const updatedLanguages = data.operatingLanguages.includes(language)
      ? data.operatingLanguages.filter(l => l !== language)
      : [...data.operatingLanguages, language];
    onChange('operatingLanguages', updatedLanguages);
  };

  const handleAccessibilityToggle = (service: string) => {
    const updatedServices = data.accessibilityServices.includes(service)
      ? data.accessibilityServices.filter(s => s !== service)
      : [...data.accessibilityServices, service];
    onChange('accessibilityServices', updatedServices);
  };

  const handleAddFictitiousName = () => {
    const newName = {
      name: '',
      state: '',
      certificateNumber: '',
      filingDate: '',
      expirationDate: '',
      status: 'Active' as const,
    };
    onChange('registeredFictitiousNames', [...data.registeredFictitiousNames, newName]);
  };

  const handleRemoveFictitiousName = (index: number) => {
    const updated = data.registeredFictitiousNames.filter((_, i) => i !== index);
    onChange('registeredFictitiousNames', updated);
  };

  const handleFictitiousNameChange = (index: number, field: string, value: unknown) => {
    const updated = [...data.registeredFictitiousNames];
    updated[index] = { ...updated[index], [field]: value };
    onChange('registeredFictitiousNames', updated);
  };

  const handleAddAKA = () => {
    onChange('alsoKnownAs', [...data.alsoKnownAs, { name: '', usageContext: '' }]);
  };

  const handleRemoveAKA = (index: number) => {
    const updated = data.alsoKnownAs.filter((_, i) => i !== index);
    onChange('alsoKnownAs', updated);
  };

  const handleAKAChange = (index: number, field: string, value: string) => {
    const updated = [...data.alsoKnownAs];
    updated[index] = { ...updated[index], [field]: value };
    onChange('alsoKnownAs', updated);
  };

  const handleStateOfOperationToggle = (state: string) => {
    const updated = data.statesOfOperation.includes(state)
      ? data.statesOfOperation.filter(s => s !== state)
      : [...data.statesOfOperation, state];
    onChange('statesOfOperation', updated);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Organization Identity</h2>

      {/* Organization Legal Name with Contact Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Legal Name *
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={data.orgLegalName}
            onChange={(e) => onChange('orgLegalName', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.orgLegalName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter organization legal name"
          />
          <button
            type="button"
            onClick={() => setShowContactSelector(true)}
            className="p-2 text-gray-600 hover:text-blue-600"
            title="Search existing contacts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 text-gray-600 hover:text-blue-600"
            title="Add new contact"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 text-gray-600 hover:text-blue-600"
            title="Edit existing contact"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        {errors.orgLegalName && (
          <p className="mt-1 text-sm text-red-600">{errors.orgLegalName}</p>
        )}
      </div>

      {/* Language & Accessibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Operating Languages *
          </label>
          <div className="space-y-2">
            {LANGUAGES.map((language) => (
              <label key={language} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.operatingLanguages.includes(language)}
                  onChange={() => handleLanguageToggle(language)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Language *
          </label>
          <select
            value={data.preferredLanguage}
            onChange={(e) => onChange('preferredLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {data.operatingLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accessibility Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Accessibility Services
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ACCESSIBILITY_SERVICES.map((service) => (
            <label key={service} className="flex items-center">
              <input
                type="checkbox"
                checked={data.accessibilityServices.includes(service)}
                onChange={() => handleAccessibilityToggle(service)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{service}</span>
            </label>
          ))}
        </div>
      </div>

      {/* State Information & Formation Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State of Incorporation *
          </label>
          <select
            value={data.stateOfIncorporation}
            onChange={(e) => onChange('stateOfIncorporation', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.stateOfIncorporation ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.stateOfIncorporation && (
            <p className="mt-1 text-sm text-red-600">{errors.stateOfIncorporation}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incorporation Date
          </label>
          <input
            type="date"
            value={data.incorporationDate || ''}
            onChange={(e) => onChange('incorporationDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Articles of Incorporation
          </label>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Choose File
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Bylaws
          </label>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Choose File
          </button>
        </div>
      </div>

      {/* States of Operation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          States of Operation
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
          {US_STATES.map((state) => (
            <label key={state.value} className="flex items-center">
              <input
                type="checkbox"
                checked={data.statesOfOperation.includes(state.value)}
                onChange={() => handleStateOfOperationToggle(state.value)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{state.value}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.foreignEntityRegistered}
              onChange={(e) => onChange('foreignEntityRegistered', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Foreign entity registered in selected states
            </span>
          </label>
          <p className="mt-1 text-xs text-gray-500 ml-6">
            A foreign entity is any corporation, LLC, or organization incorporated outside of this state but conducting business within it
          </p>
        </div>
      </div>

      {/* Registered Fictitious Names */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Registered Fictitious Names / DBAs
          </label>
          <button
            type="button"
            onClick={handleAddFictitiousName}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Registered Name
          </button>
        </div>
        
        {data.registeredFictitiousNames.map((name, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => handleRemoveFictitiousName(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name.name}
                  onChange={(e) => handleFictitiousNameChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={name.state}
                  onChange={(e) => handleFictitiousNameChange(index, 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Number
                </label>
                <input
                  type="text"
                  value={name.certificateNumber}
                  onChange={(e) => handleFictitiousNameChange(index, 'certificateNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={name.status}
                  onChange={(e) => handleFictitiousNameChange(index, 'status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Also Known As */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Also Known As (AKAs)
          </label>
          <button
            type="button"
            onClick={handleAddAKA}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add AKA
          </button>
        </div>
        
        {data.alsoKnownAs.map((aka, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={aka.name}
              onChange={(e) => handleAKAChange(index, 'name', e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={aka.usageContext || ''}
              onChange={(e) => handleAKAChange(index, 'usageContext', e.target.value)}
              placeholder="Usage context (optional)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveAKA(index)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Organizational Relationships */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.hasParentOrg}
              onChange={(e) => onChange('hasParentOrg', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Has Parent Organization</span>
          </label>
        </div>

        {data.hasParentOrg && (
          <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Organization Name *
              </label>
              <input
                type="text"
                value={data.parentOrgDetails?.parentName || ''}
                onChange={(e) => onChange('parentOrgDetails', {
                  ...data.parentOrgDetails,
                  parentName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Tax ID *
              </label>
              <input
                type="text"
                value={data.parentOrgDetails?.parentTaxId || ''}
                onChange={(e) => onChange('parentOrgDetails', {
                  ...data.parentOrgDetails,
                  parentTaxId: e.target.value
                })}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type *
              </label>
              <select
                value={data.parentOrgDetails?.relationshipType || ''}
                onChange={(e) => onChange('parentOrgDetails', {
                  ...data.parentOrgDetails,
                  relationshipType: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Wholly-owned subsidiary">Wholly-owned subsidiary</option>
                <option value="Chapter">Chapter</option>
                <option value="Affiliate">Affiliate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Description *
              </label>
              <textarea
                value={data.parentOrgDetails?.relationshipDescription || ''}
                onChange={(e) => onChange('parentOrgDetails', {
                  ...data.parentOrgDetails,
                  relationshipDescription: e.target.value
                })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.hasSubsidiaries}
              onChange={(e) => onChange('hasSubsidiaries', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Has Subsidiaries</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.hasFiscalSponsor}
              onChange={(e) => onChange('hasFiscalSponsor', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Has Fiscal Sponsor</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default OrganizationIdentitySection;