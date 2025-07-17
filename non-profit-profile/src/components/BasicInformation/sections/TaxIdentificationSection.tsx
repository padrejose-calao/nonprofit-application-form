import React, { useState } from 'react';
import { TaxIdentificationData } from '../types';
import { COUNTRIES, VALIDATION_PATTERNS, US_STATES } from '../constants';

interface TaxIdentificationSectionProps {
  data: TaxIdentificationData;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const TaxIdentificationSection: React.FC<TaxIdentificationSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [showAdditionalTaxInfo, setShowAdditionalTaxInfo] = useState(false);

  const handleTaxIdTypeChange = (type: TaxIdentificationData['taxIdType']) => {
    onChange('taxIdType', type);
    // Clear related fields when changing type
    if (type !== 'federal_ein') {
      onChange('ein', undefined);
    }
    if (type !== 'state_nonprofit') {
      onChange('stateEntityState', undefined);
      onChange('stateEntityNumber', undefined);
    }
    if (type !== 'foreign_entity') {
      onChange('foreignCountry', undefined);
      onChange('foreignRegistrationNumber', undefined);
    }
    if (type !== 'fiscal_sponsor') {
      onChange('fiscalSponsorName', undefined);
      onChange('fiscalSponsorEIN', undefined);
      onChange('fiscalSponsorContact', undefined);
      onChange('fiscalSponsorEmail', undefined);
    }
  };

  const formatEIN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`;
  };

  const handleEINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEIN(e.target.value);
    onChange('ein', formatted);
  };

  const renderFederalEINFields = () => {
    if (data.taxIdType !== 'federal_ein') return null;

    return (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Federal EIN *
          </label>
          <input
            type="text"
            value={data.ein || ''}
            onChange={handleEINChange}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.ein ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.ein && (
            <p className="mt-1 text-sm text-red-600">{errors.ein}</p>
          )}
        </div>
      </div>
    );
  };

  const renderStateNonProfitFields = () => {
    if (data.taxIdType !== 'state_nonprofit') return null;

    return (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State Entity State *
          </label>
          <select
            value={data.stateEntityState || ''}
            onChange={(e) => onChange('stateEntityState', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.stateEntityState ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.stateEntityState && (
            <p className="mt-1 text-sm text-red-600">{errors.stateEntityState}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State Entity Number *
          </label>
          <input
            type="text"
            value={data.stateEntityNumber || ''}
            onChange={(e) => onChange('stateEntityNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.stateEntityNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.stateEntityNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.stateEntityNumber}</p>
          )}
        </div>
      </div>
    );
  };

  const renderForeignEntityFields = () => {
    if (data.taxIdType !== 'foreign_entity') return null;

    return (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foreign Country *
          </label>
          <select
            value={data.foreignCountry || ''}
            onChange={(e) => onChange('foreignCountry', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.foreignCountry ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          {errors.foreignCountry && (
            <p className="mt-1 text-sm text-red-600">{errors.foreignCountry}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foreign Registration Number *
          </label>
          <input
            type="text"
            value={data.foreignRegistrationNumber || ''}
            onChange={(e) => onChange('foreignRegistrationNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.foreignRegistrationNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.foreignRegistrationNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.foreignRegistrationNumber}</p>
          )}
        </div>
      </div>
    );
  };

  const renderFiscalSponsorFields = () => {
    if (data.taxIdType !== 'fiscal_sponsor') return null;

    return (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fiscal Sponsor Name *
          </label>
          <input
            type="text"
            value={data.fiscalSponsorName || ''}
            onChange={(e) => onChange('fiscalSponsorName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.fiscalSponsorName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fiscalSponsorName && (
            <p className="mt-1 text-sm text-red-600">{errors.fiscalSponsorName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fiscal Sponsor EIN *
          </label>
          <input
            type="text"
            value={data.fiscalSponsorEIN || ''}
            onChange={(e) => onChange('fiscalSponsorEIN', formatEIN(e.target.value))}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.fiscalSponsorEIN ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fiscalSponsorEIN && (
            <p className="mt-1 text-sm text-red-600">{errors.fiscalSponsorEIN}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Sponsor Contact Person
            </label>
            <input
              type="text"
              value={data.fiscalSponsorContact || ''}
              onChange={(e) => onChange('fiscalSponsorContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Sponsor Email
            </label>
            <input
              type="email"
              value={data.fiscalSponsorEmail || ''}
              onChange={(e) => onChange('fiscalSponsorEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderNoTaxIdFields = () => {
    if (data.taxIdType !== 'no_tax_id') return null;

    return (
      <div className="mt-4 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            System will assign temporary ID: ORG-{new Date().getTime()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for No Tax ID *
          </label>
          <textarea
            value={data.noTaxIdReason || ''}
            onChange={(e) => onChange('noTaxIdReason', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.noTaxIdReason ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Please explain why your organization does not have a tax ID..."
          />
          {errors.noTaxIdReason && (
            <p className="mt-1 text-sm text-red-600">{errors.noTaxIdReason}</p>
          )}
        </div>
      </div>
    );
  };

  const renderDocumentUpload = () => {
    let documentLabel = '';
    let documentField = '';

    switch (data.taxIdType) {
      case 'federal_ein':
        documentLabel = 'IRS Determination Letter';
        documentField = 'irsDeterminationLetter';
        break;
      case 'state_nonprofit':
        documentLabel = 'State Non-Profit Registration';
        documentField = 'stateNonProfitRegistration';
        break;
      case 'foreign_entity':
        documentLabel = 'Foreign Entity Documentation';
        documentField = 'foreignEntityDocs';
        break;
      case 'fiscal_sponsor':
        documentLabel = 'Fiscal Sponsorship Agreement';
        documentField = 'fiscalSponsorshipAgreement';
        break;
      case 'no_tax_id':
        documentLabel = 'Supporting Documentation';
        documentField = 'supportingDocs';
        break;
    }

    if (!documentLabel) return null;

    return (
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {documentLabel}
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Choose File
          </button>
          <span className="text-sm text-gray-500">No file chosen</span>
        </div>
      </div>
    );
  };

  const renderAdditionalTaxInfoModal = () => {
    if (!showAdditionalTaxInfo) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Additional Tax Information</h3>
          
          <div className="space-y-6">
            {/* State Tax Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">State Tax Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Tax ID
                  </label>
                  <input
                    type="text"
                    value={data.additionalTaxInfo?.stateTaxId || ''}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      stateTaxId: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State of Registration
                  </label>
                  <select
                    value={data.additionalTaxInfo?.stateOfRegistration || ''}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      stateOfRegistration: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tax Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Exempt Status
                  </label>
                  <select
                    value={data.additionalTaxInfo?.taxExemptStatus || ''}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      taxExemptStatus: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Revoked">Revoked</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classification
                  </label>
                  <select
                    value={data.additionalTaxInfo?.classification || ''}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      classification: e.target.value as any
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Classification</option>
                    <option value="Public Charity">Public Charity</option>
                    <option value="Private Foundation">Private Foundation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Special Circumstances */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Special Circumstances</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.additionalTaxInfo?.disregardedEntity || false}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      disregardedEntity: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Disregarded Entity</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.additionalTaxInfo?.churchAutomatic || false}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      churchAutomatic: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Church (Automatic Exemption)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.additionalTaxInfo?.governmentEntity || false}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      governmentEntity: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Government Entity</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.additionalTaxInfo?.tribalGovernment || false}
                    onChange={(e) => onChange('additionalTaxInfo', {
                      ...data.additionalTaxInfo,
                      tribalGovernment: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Tribal Government</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAdditionalTaxInfo(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowAdditionalTaxInfo(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tax Identification</h2>
        <button
          type="button"
          onClick={() => setShowAdditionalTaxInfo(true)}
          className="text-sm text-green-600 hover:text-green-800 font-medium"
        >
          Additional Tax Information
        </button>
      </div>

      {/* Tax ID Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tax ID Type *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.taxIdType === 'federal_ein'}
              onChange={() => handleTaxIdTypeChange('federal_ein')}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">Federal EIN (default)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.taxIdType === 'state_nonprofit'}
              onChange={() => handleTaxIdTypeChange('state_nonprofit')}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">State Non-Profit Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.taxIdType === 'foreign_entity'}
              onChange={() => handleTaxIdTypeChange('foreign_entity')}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">Foreign Entity Registration</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.taxIdType === 'fiscal_sponsor'}
              onChange={() => handleTaxIdTypeChange('fiscal_sponsor')}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">Unincorporated with Fiscal Sponsor</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.taxIdType === 'no_tax_id'}
              onChange={() => handleTaxIdTypeChange('no_tax_id')}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">No Tax ID</span>
          </label>
        </div>
      </div>

      {/* Dynamic Fields Based on Selection */}
      {renderFederalEINFields()}
      {renderStateNonProfitFields()}
      {renderForeignEntityFields()}
      {renderFiscalSponsorFields()}
      {renderNoTaxIdFields()}

      {/* Document Upload */}
      {renderDocumentUpload()}

      {/* Additional Tax Info Modal */}
      {renderAdditionalTaxInfoModal()}
    </div>
  );
};

export default TaxIdentificationSection;