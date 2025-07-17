import React from 'react';
import { OrganizationalAddressData, Address } from '../types';
import { US_STATES, ADDRESS_TYPES } from '../constants';

interface OrganizationalAddressSectionProps {
  data: OrganizationalAddressData;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const OrganizationalAddressSection: React.FC<OrganizationalAddressSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleAddAddress = () => {
    const newAddress: Address = {
      type: 'Alternate Address',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    };
    onChange('addresses', [...data.addresses, newAddress]);
  };

  const handleRemoveAddress = (index: number) => {
    if (data.addresses.length > 1) {
      const updated = data.addresses.filter((_, i) => i !== index);
      onChange('addresses', updated);
    }
  };

  const handleAddressChange = (index: number, field: keyof Address, value: any) => {
    const updated = [...data.addresses];
    updated[index] = { ...updated[index], [field]: value };
    onChange('addresses', updated);
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'Main Office':
        return 'bg-green-100 border-green-300';
      case 'Mailing Address':
        return 'bg-blue-100 border-blue-300';
      case 'Physical Location':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Organizational Addresses</h2>
        <button
          type="button"
          onClick={handleAddAddress}
          className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
        >
          + Add Address
        </button>
      </div>

      {/* ADA Compliance */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.adaCompliant || false}
            onChange={(e) => onChange('adaCompliant', e.target.checked)}
            className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            All locations are ADA compliant
          </span>
        </label>
      </div>

      {/* Address List */}
      <div className="space-y-6">
        {data.addresses.map((address, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 ${getAddressTypeColor(address.type)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type *
                </label>
                <select
                  value={address.type}
                  onChange={(e) => handleAddressChange(index, 'type', e.target.value as Address['type'])}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ADDRESS_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {data.addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(index)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove address"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) => handleAddressChange(index, 'address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors[`addresses.${index}.address`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Street address"
                />
                {errors[`addresses.${index}.address`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`addresses.${index}.address`]}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={address.address2 || ''}
                  onChange={(e) => handleAddressChange(index, 'address2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors[`addresses.${index}.city`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[`addresses.${index}.city`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`addresses.${index}.city`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={address.state}
                  onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors[`addresses.${index}.state`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors[`addresses.${index}.state`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`addresses.${index}.state`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors[`addresses.${index}.zipCode`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345 or 12345-6789"
                />
                {errors[`addresses.${index}.zipCode`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`addresses.${index}.zipCode`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Business Hours and Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={address.businessHours || ''}
                  onChange={(e) => handleAddressChange(index, 'businessHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Days
                </label>
                <input
                  type="text"
                  value={address.businessDays || ''}
                  onChange={(e) => handleAddressChange(index, 'businessDays', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Monday - Friday"
                />
              </div>
            </div>

            {/* Mailing Address Checkbox */}
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={address.isMailingAddress || false}
                  onChange={(e) => handleAddressChange(index, 'isMailingAddress', e.target.checked)}
                  className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  This is also a mailing address
                </span>
              </label>
            </div>

            {/* Primary Address Display (from Contact Card) */}
            {index === 0 && address.type === 'Main Office' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This address is linked to your organization's contact card.
                  Changes here will update the contact card.
                </p>
                <div className="mt-2 space-x-4">
                  <button
                    type="button"
                    className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                  >
                    Override - Add as Alternate
                  </button>
                  <button
                    type="button"
                    className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                  >
                    Override - Replace Contact Card
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Address Summary */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Address Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Main Office:</span>{' '}
            <span className="font-medium">
              {data.addresses.filter(a => a.type === 'Main Office').length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Mailing:</span>{' '}
            <span className="font-medium">
              {data.addresses.filter(a => a.isMailingAddress).length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Locations:</span>{' '}
            <span className="font-medium">{data.addresses.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalAddressSection;