import React, { useState } from 'react';
import { 
  MapPin, Plus, Trash2, Building, Phone, Mail, Globe,
  Clock, Users, DollarSign, Calendar, FileText, Target
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Location {
  id: string | number;
  name: string;
  type: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  operatingHours: string;
  status: 'active' | 'inactive' | 'seasonal';
  staffCount: number;
  services: string;
  capacity: number;
  yearEstablished: string;
  notes: string;
}

interface OtherLocationsSectionProps {
  locations: Location[];
  errors: any;
  locked: boolean;
  onLocationsChange: (locations: Location[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

const OtherLocationsSection: React.FC<OtherLocationsSectionProps> = ({
  locations,
  errors,
  locked,
  onLocationsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'locations' | 'operations' | 'coordination'>('locations');
  const [expandedLocation, setExpandedLocation] = useState<string | number | null>(null);

  const locationTypes = [
    'Headquarters',
    'Branch Office',
    'Service Center',
    'Warehouse/Storage',
    'Program Site',
    'Satellite Office',
    'Temporary Location',
    'Partner Location',
    'Mobile Unit',
    'Other'
  ];

  const addLocation = () => {
    const newLocation: Location = {
      id: Date.now(),
      name: '',
      type: 'Branch Office',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      operatingHours: '',
      status: 'active',
      staffCount: 0,
      services: '',
      capacity: 0,
      yearEstablished: '',
      notes: ''
    };
    onLocationsChange([...locations, newLocation]);
  };

  const updateLocation = (id: string | number, updates: Partial<Location>) => {
    onLocationsChange(locations.map(location => 
      location.id === id ? { ...location, ...updates } : location
    ));
  };

  const removeLocation = (id: string | number) => {
    onLocationsChange(locations.filter(location => location.id !== id));
    toast.info('Location removed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'seasonal':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStaff = () => {
    return locations.reduce((total, location) => total + (location.staffCount || 0), 0);
  };

  const getActiveLocations = () => {
    return locations.filter(location => location.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Locations Overview */}
      <div className="bg-indigo-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Other Locations & Facilities
        </h3>

        {/* Location Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">{locations.length}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{getActiveLocations()}</div>
            <div className="text-sm text-gray-600">Active Locations</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{getTotalStaff()}</div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(locations.map(l => l.state)).size}
            </div>
            <div className="text-sm text-gray-600">States/Regions</div>
          </div>
        </div>

        {/* Quick Location Summary */}
        {locations.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-3">Location Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.slice(0, 6).map(location => (
                <div key={location.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{location.name || 'Unnamed Location'}</div>
                    <div className="text-xs text-gray-600">{location.city}, {location.state}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(location.status)}`}>
                    {location.status}
                  </span>
                </div>
              ))}
              {locations.length > 6 && (
                <div className="text-sm text-gray-500 p-2">
                  And {locations.length - 6} more locations...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'locations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Locations List
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'operations'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Operations Management
            </button>
            <button
              onClick={() => setActiveTab('coordination')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'coordination'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Multi-Site Coordination
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Organization Locations</h4>
                <button
                  type="button"
                  onClick={addLocation}
                  disabled={locked}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>

              {locations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No additional locations recorded yet.</p>
                  <p className="text-sm text-gray-500">Click "Add Location" to add branch offices, service centers, or other facilities.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.id} className="border rounded-lg">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Location Name</label>
                                <input
                                  type="text"
                                  value={location.name}
                                  onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Location name"
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Type</label>
                                <select
                                  value={location.type}
                                  onChange={(e) => updateLocation(location.id, { type: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  disabled={locked}
                                >
                                  {locationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Status</label>
                                <select
                                  value={location.status}
                                  onChange={(e) => updateLocation(location.id, { status: e.target.value as any })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  disabled={locked}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="seasonal">Seasonal</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => setExpandedLocation(
                                expandedLocation === location.id ? null : location.id
                              )}
                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              {expandedLocation === location.id ? 'Collapse' : 'Expand'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLocation(location.id)}
                              disabled={locked}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {expandedLocation === location.id && (
                          <div className="space-y-4 pt-4 border-t">
                            {/* Address Information */}
                            <div>
                              <h5 className="font-medium mb-2">Address Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Street Address</label>
                                  <input
                                    type="text"
                                    value={location.address}
                                    onChange={(e) => updateLocation(location.id, { address: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Street address"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Address Line 2</label>
                                  <input
                                    type="text"
                                    value={location.address2}
                                    onChange={(e) => updateLocation(location.id, { address2: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Suite, apt, etc."
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">City</label>
                                  <input
                                    type="text"
                                    value={location.city}
                                    onChange={(e) => updateLocation(location.id, { city: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="City"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">State/Province</label>
                                  <input
                                    type="text"
                                    value={location.state}
                                    onChange={(e) => updateLocation(location.id, { state: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="State"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">ZIP/Postal Code</label>
                                  <input
                                    type="text"
                                    value={location.zipCode}
                                    onChange={(e) => updateLocation(location.id, { zipCode: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="ZIP code"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Country</label>
                                  <input
                                    type="text"
                                    value={location.country}
                                    onChange={(e) => updateLocation(location.id, { country: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Country"
                                    disabled={locked}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                              <h5 className="font-medium mb-2">Contact Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                                  <input
                                    type="tel"
                                    value={location.phone}
                                    onChange={(e) => updateLocation(location.id, { phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Phone number"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                                  <input
                                    type="email"
                                    value={location.email}
                                    onChange={(e) => updateLocation(location.id, { email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Email address"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Website</label>
                                  <input
                                    type="url"
                                    value={location.website}
                                    onChange={(e) => updateLocation(location.id, { website: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Website URL"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Contact Person</label>
                                  <input
                                    type="text"
                                    value={location.contactPerson}
                                    onChange={(e) => updateLocation(location.id, { contactPerson: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Site manager name"
                                    disabled={locked}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Operational Details */}
                            <div>
                              <h5 className="font-medium mb-2">Operational Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Operating Hours</label>
                                  <input
                                    type="text"
                                    value={location.operatingHours}
                                    onChange={(e) => updateLocation(location.id, { operatingHours: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., Mon-Fri 9am-5pm"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Staff Count</label>
                                  <input
                                    type="number"
                                    value={location.staffCount}
                                    onChange={(e) => updateLocation(location.id, { staffCount: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Capacity</label>
                                  <input
                                    type="number"
                                    value={location.capacity}
                                    onChange={(e) => updateLocation(location.id, { capacity: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Maximum capacity"
                                    disabled={locked}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-700 mb-1">Year Established</label>
                                  <input
                                    type="number"
                                    value={location.yearEstablished}
                                    onChange={(e) => updateLocation(location.id, { yearEstablished: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                    placeholder="YYYY"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    disabled={locked}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Services and Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Services Offered</label>
                                <textarea
                                  value={location.services}
                                  onChange={(e) => updateLocation(location.id, { services: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  rows={3}
                                  placeholder="List services provided at this location..."
                                  disabled={locked}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                                <textarea
                                  value={location.notes}
                                  onChange={(e) => updateLocation(location.id, { notes: e.target.value })}
                                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                  rows={3}
                                  placeholder="Additional notes about this location..."
                                  disabled={locked}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Operations Tab */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              {/* Multi-Site Operations */}
              <div>
                <label className="block font-semibold mb-2">
                  Multi-Site Operations Strategy
                </label>
                <textarea
                  value={formData?.multiSiteStrategy || ''}
                  onChange={(e) => onInputChange?.('multiSiteStrategy', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe how you manage operations across multiple locations..."
                  disabled={locked}
                />
              </div>

              {/* Resource Sharing */}
              <div>
                <label className="block font-semibold mb-2">
                  Resource Sharing Between Locations
                </label>
                <textarea
                  value={formData?.resourceSharing || ''}
                  onChange={(e) => onInputChange?.('resourceSharing', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="How do locations share resources, staff, equipment, etc.?"
                  disabled={locked}
                />
              </div>

              {/* Operational Challenges */}
              <div>
                <label className="block font-semibold mb-2">
                  Operational Challenges & Solutions
                </label>
                <textarea
                  value={formData?.operationalChallenges || ''}
                  onChange={(e) => onInputChange?.('operationalChallenges', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What challenges do you face managing multiple locations?"
                  disabled={locked}
                />
              </div>

              {/* Quality Assurance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Quality Assurance Across Locations
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Standardization Procedures
                    </label>
                    <textarea
                      value={formData?.standardizationProcedures || ''}
                      onChange={(e) => onInputChange?.('standardizationProcedures', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="How do you ensure consistent service quality?"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Performance Monitoring
                    </label>
                    <textarea
                      value={formData?.performanceMonitoring || ''}
                      onChange={(e) => onInputChange?.('performanceMonitoring', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="How do you monitor performance across locations?"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coordination Tab */}
          {activeTab === 'coordination' && (
            <div className="space-y-6">
              {/* Communication Systems */}
              <div>
                <label className="block font-semibold mb-2">
                  Inter-Location Communication Systems
                </label>
                <textarea
                  value={formData?.communicationSystems || ''}
                  onChange={(e) => onInputChange?.('communicationSystems', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Describe communication tools and processes between locations..."
                  disabled={locked}
                />
              </div>

              {/* Central Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Central Management Structure
                  </label>
                  <select
                    value={formData?.centralManagement || ''}
                    onChange={(e) => onInputChange?.('centralManagement', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    disabled={locked}
                  >
                    <option value="">Select structure</option>
                    <option value="centralized">Centralized</option>
                    <option value="decentralized">Decentralized</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="autonomous">Autonomous Sites</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Coordination Meeting Frequency
                  </label>
                  <select
                    value={formData?.coordinationMeetingFreq || ''}
                    onChange={(e) => onInputChange?.('coordinationMeetingFreq', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    disabled={locked}
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
              </div>

              {/* Shared Systems */}
              <div>
                <label className="block font-semibold mb-2">
                  Shared Systems & Technology
                </label>
                <div className="space-y-3">
                  {[
                    { field: 'sharedDatabase', label: 'Shared Database/CRM System' },
                    { field: 'sharedFinancials', label: 'Centralized Financial System' },
                    { field: 'sharedCalendar', label: 'Shared Calendar/Scheduling' },
                    { field: 'sharedDocuments', label: 'Document Management System' },
                    { field: 'sharedTraining', label: 'Unified Training Platform' },
                    { field: 'sharedReporting', label: 'Consolidated Reporting System' }
                  ].map(system => (
                    <label key={system.field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData?.[system.field] || false}
                        onChange={(e) => onInputChange?.(system.field, e.target.checked)}
                        className="rounded"
                        disabled={locked}
                      />
                      <span className="text-sm">{system.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Documentation */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Location Documentation
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multi-Site Operations Manual
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('operationsManual', file);
                          toast.success('Operations manual uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Directory/Map
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('locationDirectory', file);
                          toast.success('Location directory uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherLocationsSection;