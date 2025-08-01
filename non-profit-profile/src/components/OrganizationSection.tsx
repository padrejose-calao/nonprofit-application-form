import { Building2 } from 'lucide-react';
import React from 'react';

interface OrganizationSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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
            value={formData.organizationName || ''}
            onChange={(e) => handleChange('organizationName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.organizationName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.organizationName && (
            <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">EIN (Tax ID) *</label>
          <input
            type="text"
            value={formData.ein || ''}
            onChange={(e) => handleChange('ein', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.ein ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="XX-XXXXXXX"
            required
          />
          {errors.ein && <p className="text-red-500 text-sm mt-1">{errors.ein}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year Founded *</label>
          <input
            type="number"
            value={formData.yearFounded || ''}
            onChange={(e) => handleChange('yearFounded', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.yearFounded ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1800"
            max={new Date().getFullYear()}
            required
          />
          {errors.yearFounded && <p className="text-red-500 text-sm mt-1">{errors.yearFounded}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={formData.website || ''}
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
            value={formData.missionStatement || ''}
            onChange={(e) => handleChange('missionStatement', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.missionStatement ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            required
          />
          {errors.missionStatement && (
            <p className="text-red-500 text-sm mt-1">{errors.missionStatement}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <input
            type="text"
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={2}
            required
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
          <input
            type="text"
            value={formData.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.zipCode ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSection;
