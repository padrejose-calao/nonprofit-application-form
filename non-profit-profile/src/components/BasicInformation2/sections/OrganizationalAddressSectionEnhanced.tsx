import React, { useState } from 'react';
import { SectionProps } from '../types';
import { MapPin, Plus, Edit2, Trash2, Clock, Building2, Globe } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';

interface HoursOfOperation {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface AddressWithHours {
  id: string;
  type: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isMailingAddress?: boolean;
  hoursOfOperation?: HoursOfOperation;
  noOfficeHours?: boolean;
  notOpenToPublic?: boolean;
  digitalOnly?: boolean;
  hybrid?: boolean;
  override?: boolean;
  inheritHours?: boolean;
  listings?: {
    yelp?: string;
    googleMaps?: string;
    appleMaps?: string;
    other?: Array<{ name: string; url: string; }>;
  };
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ADDRESS_TYPES = [
  { value: 'main', label: 'Main Office' },
  { value: 'mailing', label: 'Mailing Address' },
  { value: 'branch', label: 'Branch Office' },
  { value: 'field', label: 'Field Office' },
  { value: 'satellite', label: 'Satellite Office' },
  { value: 'administrative', label: 'Administrative Office' },
  { value: 'program', label: 'Program Site' },
  { value: 'service', label: 'Service Location' },
  { value: 'warehouse', label: 'Warehouse/Storage' },
  { value: 'virtual', label: 'Virtual Office' }
];

const OrganizationalAddressSectionEnhanced: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const typedData = (data || {}) as { addresses?: AddressWithHours[] };
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [_selectedOrgCard, setSelectedOrgCard] = useState<unknown>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState('main');

  const addresses = typedData.addresses || [];
  const mainAddress = addresses.find((addr: AddressWithHours) => addr.type === 'main');

  const handleAddressFromOrgCard = (orgCard: unknown) => {
    const typedOrgCard = orgCard as { addresses?: Array<{
      type?: string;
      address?: string;
      address2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    }> };
    if (typedOrgCard.addresses && typedOrgCard.addresses.length > 0) {
      const newAddresses = typedOrgCard.addresses.map((addr, index: number) => {
        return {
          id: `org-${Date.now()}-${index}`,
          type: addr.type || 'main',
          address: addr.address || '',
          address2: addr.address2 || '',
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          country: addr.country || 'United States',
          override: false,
          hoursOfOperation: getDefaultHours(),
          inheritHours: index > 0 // All except main inherit hours by default
        };
      });
      onChange('addresses', [...addresses, ...newAddresses]);
    }
  };

  const getDefaultHours = (): HoursOfOperation => {
    const hours: HoursOfOperation = {};
    DAYS_OF_WEEK.forEach(day => {
      hours[day] = { open: '09:00', close: '17:00', closed: day === 'Sunday' || day === 'Saturday' };
    });
    return hours;
  };

  const handleAddAddress = () => {
    setShowAddressTypeModal(true);
  };

  const confirmAddAddress = () => {
    const newAddress: AddressWithHours = {
      id: `custom-${Date.now()}`,
      type: selectedAddressType,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      override: true,
      hoursOfOperation: mainAddress ? { ...mainAddress.hoursOfOperation } : getDefaultHours(),
      inheritHours: selectedAddressType !== 'main'
    };
    onChange('addresses', [...addresses, newAddress]);
    setEditingAddressId(newAddress.id);
    setShowAddressTypeModal(false);
    setSelectedAddressType('main');
  };

  const handleUpdateAddress = (id: string, updates: Partial<AddressWithHours>) => {
    onChange('addresses', addresses.map((addr: AddressWithHours) => 
      addr.id === id ? { ...addr, ...updates } : addr
    ));
  };

  const handleDeleteAddress = (id: string) => {
    onChange('addresses', addresses.filter((addr: AddressWithHours) => addr.id !== id));
  };

  const handleHoursChange = (addressId: string, day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const address = addresses.find((addr: AddressWithHours) => addr.id === addressId);
    if (address) {
      const updatedHours = { ...address.hoursOfOperation };
      if (field === 'closed') {
        updatedHours[day] = { ...updatedHours[day], closed: value as boolean };
        if (value) {
          updatedHours[day].open = '';
          updatedHours[day].close = '';
        }
      } else {
        updatedHours[day] = { ...updatedHours[day], [field]: value as string };
      }
      handleUpdateAddress(addressId, { hoursOfOperation: updatedHours });
    }
  };

  const handleAddListing = (addressId: string, type: string, url: string) => {
    const address = addresses.find((addr: AddressWithHours) => addr.id === addressId);
    if (address) {
      const listings = address.listings || {};
      if (type === 'other') {
        listings.other = [...(listings.other || []), { name: 'New Listing', url }];
      } else if (type === 'yelp' || type === 'googleMaps' || type === 'appleMaps') {
        listings[type] = url;
      }
      handleUpdateAddress(addressId, { listings });
    }
  };

  return (
    <div className="space-y-4">
      {/* Organization Card Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Organization Addresses</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowOrgSelector(!showOrgSelector)}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm flex items-center gap-1"
          >
            <Building2 className="h-4 w-4" />
            From Organization Card
          </button>
          <button
            type="button"
            onClick={handleAddAddress}
            className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      </div>

      {/* Address Type Selection Modal */}
      {showAddressTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Select Address Type</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ADDRESS_TYPES.map(type => (
                <label
                  key={type.value}
                  className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="addressType"
                    value={type.value}
                    checked={selectedAddressType === type.value}
                    onChange={(e) => setSelectedAddressType(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddressTypeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddAddress}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organization Selector */}
      {showOrgSelector && (
        <div className="p-4 border rounded-md bg-gray-50">
          <ContactSelectorSimple
            type="organization"
            onSelect={(contact) => {
              setSelectedOrgCard(contact);
              handleAddressFromOrgCard(contact);
              setShowOrgSelector(false);
            }}
            onClose={() => setShowOrgSelector(false)}
          />
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.map((address: AddressWithHours) => (
          <div key={address.id} className="border rounded-lg p-4 bg-white">
            {/* Address Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {ADDRESS_TYPES.find(t => t.value === address.type)?.label || address.type}
                </span>
                {!address.override && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">From Org Card</span>
                )}
                {address.isMailingAddress && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Mailing</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!address.override && (
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={address.override || false}
                      onChange={(e) => handleUpdateAddress(address.id, { override: e.target.checked })}
                      className="mr-1"
                    />
                    Override
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setEditingAddressId(editingAddressId === address.id ? null : address.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Address Details */}
            {editingAddressId === address.id || address.override ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) => handleUpdateAddress(address.id, { address: e.target.value })}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  value={address.address2 || ''}
                  onChange={(e) => handleUpdateAddress(address.id, { address2: e.target.value })}
                  placeholder="Suite, Unit, etc. (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleUpdateAddress(address.id, { city: e.target.value })}
                    placeholder="City"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleUpdateAddress(address.id, { state: e.target.value })}
                    placeholder="State"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => handleUpdateAddress(address.id, { zipCode: e.target.value })}
                    placeholder="ZIP Code"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>{address.address}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.state} {address.zipCode}</p>
              </div>
            )}

            {/* Listings */}
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Online Listings
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-20">Yelp:</label>
                  <input
                    type="url"
                    value={address.listings?.yelp || ''}
                    onChange={(e) => handleAddListing(address.id, 'yelp', e.target.value)}
                    placeholder="Yelp URL"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-20">Google:</label>
                  <input
                    type="url"
                    value={address.listings?.googleMaps || ''}
                    onChange={(e) => handleAddListing(address.id, 'googleMaps', e.target.value)}
                    placeholder="Google Maps URL"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Hours of Operation */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours of Operation
              </h4>

              {/* Quick Options */}
              <div className="mb-3 space-y-1">
                {address.type !== 'main' && (
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={address.inheritHours || false}
                      onChange={(e) => {
                        handleUpdateAddress(address.id, { 
                          inheritHours: e.target.checked,
                          hoursOfOperation: e.target.checked && mainAddress ? { ...mainAddress.hoursOfOperation } : address.hoursOfOperation
                        });
                      }}
                      className="mr-2"
                    />
                    Same hours as main address
                  </label>
                )}
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name={`officeStatus-${address.id}`}
                    checked={!address.noOfficeHours && !address.notOpenToPublic && !address.digitalOnly && !address.hybrid}
                    onChange={() => handleUpdateAddress(address.id, { 
                      noOfficeHours: false,
                      notOpenToPublic: false,
                      digitalOnly: false,
                      hybrid: false
                    })}
                    className="mr-2"
                  />
                  Regular office hours
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name={`officeStatus-${address.id}`}
                    checked={address.noOfficeHours || false}
                    onChange={() => handleUpdateAddress(address.id, { 
                      noOfficeHours: true,
                      notOpenToPublic: false,
                      digitalOnly: false,
                      hybrid: false
                    })}
                    className="mr-2"
                  />
                  No office hours
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name={`officeStatus-${address.id}`}
                    checked={address.notOpenToPublic || false}
                    onChange={() => handleUpdateAddress(address.id, { 
                      noOfficeHours: false,
                      notOpenToPublic: true,
                      digitalOnly: false,
                      hybrid: false
                    })}
                    className="mr-2"
                  />
                  Office not open to public
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name={`officeStatus-${address.id}`}
                    checked={address.digitalOnly || false}
                    onChange={() => handleUpdateAddress(address.id, { 
                      noOfficeHours: false,
                      notOpenToPublic: false,
                      digitalOnly: true,
                      hybrid: false
                    })}
                    className="mr-2"
                  />
                  Digital presence only
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name={`officeStatus-${address.id}`}
                    checked={address.hybrid || false}
                    onChange={() => handleUpdateAddress(address.id, { 
                      noOfficeHours: false,
                      notOpenToPublic: false,
                      digitalOnly: false,
                      hybrid: true
                    })}
                    className="mr-2"
                  />
                  Hybrid (in-person / online)
                </label>
              </div>

              {/* Hours Table */}
              {!address.noOfficeHours && !address.digitalOnly && !address.inheritHours && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-2 py-1">Day</th>
                        <th className="text-left px-2 py-1">Hours</th>
                        <th className="text-center px-2 py-1">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map(day => {
                        const hours = address.hoursOfOperation?.[day] || { open: '09:00', close: '17:00', closed: false };
                        return (
                          <tr key={day} className="border-t">
                            <td className="px-2 py-1">{day}</td>
                            <td className="px-2 py-1">
                              {!hours.closed && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => handleHoursChange(address.id, day, 'open', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                                    step="900"
                                  />
                                  <span className="text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => handleHoursChange(address.id, day, 'close', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                                    step="900"
                                  />
                                </div>
                              )}
                              {hours.closed && <span className="text-gray-500">Closed</span>}
                            </td>
                            <td className="text-center px-2 py-1">
                              <input
                                type="checkbox"
                                checked={hours.closed}
                                onChange={(e) => handleHoursChange(address.id, day, 'closed', e.target.checked)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No addresses added yet</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationalAddressSectionEnhanced;