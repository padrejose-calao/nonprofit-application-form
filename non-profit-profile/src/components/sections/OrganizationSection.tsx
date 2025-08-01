import { Building2 } from 'lucide-react';
import React from 'react';

interface OrganizationSectionProps {
  formData: unknown;
  setFormData: (data: unknown) => void;
  errors: unknown;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const handleChange = (field: string, value: unknown) => {
    setFormData({ ...(formData as any), [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Building2 className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Organization Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            value={(formData as any).organizationName || ''}
            onChange={(e) => handleChange('organizationName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).organizationName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).organizationName && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).organizationName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">EIN (Tax ID) *</label>
          <input
            type="text"
            value={(formData as any).ein || ''}
            onChange={(e) => handleChange('ein', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).ein ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="XX-XXXXXXX"
            required
          />
          {(errors as any).ein && <p className="text-red-500 text-sm mt-1">{(errors as any).ein}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year Founded *</label>
          <input
            type="number"
            value={(formData as any).yearFounded || ''}
            onChange={(e) => handleChange('yearFounded', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).yearFounded ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1800"
            max={new Date().getFullYear()}
            required
          />
          {(errors as any).yearFounded && <p className="text-red-500 text-sm mt-1">{(errors as any).yearFounded}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={(formData as any).website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="https://example.org"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mission Statement *
          </label>
          <textarea
            value={(formData as any).missionStatement || ''}
            onChange={(e) => handleChange('missionStatement', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).missionStatement ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            required
          />
          {(errors as any).missionStatement && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).missionStatement}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            value={(formData as any).address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).address ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).address && <p className="text-red-500 text-sm mt-1">{(errors as any).address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={(formData as any).city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).city ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).city && <p className="text-red-500 text-sm mt-1">{(errors as any).city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <input
            type="text"
            value={(formData as any).state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).state ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={2}
            required
          />
          {(errors as any).state && <p className="text-red-500 text-sm mt-1">{(errors as any).state}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
          <input
            type="text"
            value={(formData as any).zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).zipCode ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {(errors as any).zipCode && <p className="text-red-500 text-sm mt-1">{(errors as any).zipCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSection;
