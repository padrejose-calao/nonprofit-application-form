import React, { useState, useEffect } from 'react';
import { 
  FileText, Building2, MapPin, Phone, Mail, Globe, Upload, Check, 
  Plus, Search, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { FormData, Errors, US_STATES } from '../types/NonprofitTypes';
import CopyPasteButton from './CopyPasteButton';

interface BasicInfoSectionProps {
  formData: FormData;
  errors: Errors;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
  onShowContactSelector?: (field: string, type: string) => void;
  disabled?: boolean;
  noEin?: boolean;
  onNoEinChange?: (value: boolean) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload,
  onShowContactSelector,
  disabled = false,
  noEin = false,
  onNoEinChange
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-save effect
  useEffect(() => {
    if (locked) return;
    const timeout = setTimeout(() => {
      setAutoSaveStatus('Saving...');
      setTimeout(() => setAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData, locked]);

  const handleEINChange = (value: string) => {
    // Format EIN as XX-XXXXXXX
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      onInputChange('ein', cleaned);
    } else {
      onInputChange('ein', `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`);
    }
  };

  const handlePhoneChange = (field: string, value: string) => {
    // Format phone as (XXX) XXX-XXXX
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      onInputChange(field, cleaned);
    } else if (cleaned.length <= 6) {
      onInputChange(field, `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`);
    } else {
      onInputChange(field, `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`);
    }
  };

  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) {
      onInputChange('zipCode', cleaned);
    } else {
      onInputChange('zipCode', cleaned.slice(0, 5));
      onInputChange('zipCode4', cleaned.slice(5, 9));
    }
  };

  const isFieldDisabled = () => disabled || locked;

  return (
    <div className="space-y-6">
      {/* Tax Identification Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Tax Identification
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EIN Field */}
          <div>
            <label htmlFor="ein" className="block text-sm font-medium text-gray-700 mb-2">
              EIN <span className="text-red-500">*</span>
            </label>
            <input
              id="ein"
              type="text"
              value={formData.ein || ''}
              onChange={e => handleEINChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="12-3456789"
              disabled={isFieldDisabled() || noEin}
              maxLength={10}
            />
            <small className="text-gray-500 text-xs block mt-1">Employer Identification Number</small>
            {errors.ein && <p className="text-red-600 text-sm mt-1">{errors.ein}</p>}
          </div>

          {/* No EIN Checkbox */}
          {onNoEinChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">EIN Options</label>
              <div className="flex items-start">
                <input
                  id="noEin"
                  type="checkbox"
                  checked={noEin}
                  onChange={e => onNoEinChange(e.target.checked)}
                  disabled={isFieldDisabled()}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="noEin" className="text-sm text-gray-700">
                  No EIN (Organization will be assigned sequential number)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* SSN Section for 1099 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">1099 Individuals / Special Circumstances</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-2">
                Social Security Number (SSN)
              </label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  id="use1099"
                  type="checkbox"
                  checked={formData.use1099 || false}
                  onChange={e => onInputChange('use1099', e.target.checked)}
                  disabled={isFieldDisabled() || !!formData.ein}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="use1099" className="text-sm text-gray-700">
                  1099 individual/sole proprietor
                </label>
              </div>
              <div className="relative">
                <input
                  id="ssn"
                  type={showPassword ? "text" : "password"}
                  value={formData.ssn || ''}
                  onChange={e => onInputChange('ssn', e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    (!formData.use1099 && !noEin) ? 'bg-gray-100 text-gray-400' : ''
                  }`}
                  placeholder="XXX-XX-XXXX"
                  disabled={isFieldDisabled() || !!formData.ein || !formData.use1099}
                  maxLength={11}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  disabled={isFieldDisabled()}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <small className="text-gray-500 text-xs block mt-1">
                SSN is only enabled for 1099 individuals or when no EIN is provided
              </small>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Individual Type</label>
              <div className="flex items-center">
                <input
                  id="use1099"
                  type="checkbox"
                  checked={formData.use1099 || false}
                  onChange={e => onInputChange('use1099', e.target.checked)}
                  disabled={isFieldDisabled()}
                  className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="use1099" className="text-sm font-medium text-gray-700">
                  1099 Individual
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Identity Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Organization Identity
        </h3>
        
        {/* Organization Name */}
        <div className="mb-6">
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name <span className="text-red-500">*</span>
          </label>
          
          <div className="flex gap-3 mb-3">
            {onShowContactSelector && (
              <button
                type="button"
                onClick={() => onShowContactSelector('orgName', 'organization')}
                disabled={isFieldDisabled()}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title="Search existing organizations"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex-1">
              <input
                type="text"
                id="orgName"
                value={formData.orgName || ''}
                onChange={(e) => onInputChange('orgName', e.target.value)}
                placeholder="Your nonprofit's name"
                disabled={isFieldDisabled()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                required
              />
            </div>
            
            <CopyPasteButton
              value={formData.orgName || ''}
              onCopy={() => toast.success('Organization name copied!')}
              onPaste={(text: string) => onInputChange('orgName', text)}
              disabled={isFieldDisabled()}
            />
          </div>
          
          {/* Document Upload */}
          {onFileUpload && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileUpload('orgNameDocs', file);
                    toast.success(`Document uploaded: ${file.name}`);
                  }
                }}
                disabled={isFieldDisabled()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <small className="text-gray-500 text-xs block mt-1">
                Upload documents that substantiate the organization name
              </small>
            </div>
          )}
          {errors.orgName && <p className="text-red-600 text-sm mt-1">{errors.orgName}</p>}
        </div>

        {/* DBA Names */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DBA Names (Doing Business As)
          </label>
          <div className="space-y-2">
            {(formData.dba || []).map((dba: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={dba}
                  onChange={(e) => {
                    const newDbas = [...(formData.dba || [])];
                    newDbas[index] = e.target.value;
                    onInputChange('dba', newDbas);
                  }}
                  disabled={isFieldDisabled()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alternative name"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newDbas = (formData.dba || []).filter((_: string, i: number) => i !== index);
                    onInputChange('dba', newDbas);
                  }}
                  disabled={isFieldDisabled()}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onInputChange('dba', [...(formData.dba || []), ''])}
              disabled={isFieldDisabled()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add DBA
            </button>
          </div>
        </div>

        {/* Parent Organization */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <input
              id="hasParentOrg"
              type="checkbox"
              checked={formData.hasParentOrg || false}
              onChange={e => onInputChange('hasParentOrg', e.target.checked)}
              disabled={isFieldDisabled()}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasParentOrg" className="text-sm font-medium text-gray-700">
              Has parent organization
            </label>
          </div>
          
          {formData.hasParentOrg && (
            <input
              type="text"
              id="parentOrganization"
              value={formData.parentOrganization || ''}
              onChange={(e) => onInputChange('parentOrganization', e.target.value)}
              placeholder="Name of parent organization"
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          <div className="flex items-center gap-3 mt-3">
            <input
              id="hasSubsidiaries"
              type="checkbox"
              checked={formData.hasSubsidiaries || false}
              onChange={e => onInputChange('hasSubsidiaries', e.target.checked)}
              disabled={isFieldDisabled()}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasSubsidiaries" className="text-sm text-gray-700">
              Has subsidiaries
            </label>
          </div>
        </div>

        {/* Fiscal Sponsor */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <input
              id="hasFiscalSponsor"
              type="checkbox"
              checked={formData.hasFiscalSponsor || false}
              onChange={e => onInputChange('hasFiscalSponsor', e.target.checked)}
              disabled={isFieldDisabled()}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasFiscalSponsor" className="text-sm font-medium text-gray-700">
              Has fiscal sponsor
            </label>
          </div>
          
          {formData.hasFiscalSponsor && (
            <input
              type="text"
              id="fiscalSponsor"
              value={formData.fiscalSponsor || ''}
              onChange={(e) => onInputChange('fiscalSponsor', e.target.value)}
              placeholder="Name of fiscal sponsor"
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Contact Information
        </h3>

        {/* Address */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={formData.address || ''}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="123 Main Street"
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              id="address2"
              value={formData.address2 || ''}
              onChange={(e) => onInputChange('address2', e.target.value)}
              placeholder="Suite, Floor, etc."
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={formData.city || ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="City"
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={formData.state || ''}
              onChange={(e) => onInputChange('state', e.target.value)}
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="12345"
                disabled={isFieldDisabled()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={5}
                required
              />
              {formData.zipCode4 && (
                <input
                  type="text"
                  value={formData.zipCode4 || ''}
                  onChange={(e) => onInputChange('zipCode4', e.target.value)}
                  placeholder="6789"
                  disabled={isFieldDisabled()}
                  className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength={4}
                />
              )}
            </div>
            {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Phone, Email, Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handlePhoneChange('phone', e.target.value)}
                placeholder="(123) 456-7890"
                disabled={isFieldDisabled()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="info@organization.org"
                disabled={isFieldDisabled()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <input
                type="url"
                id="website"
                value={formData.website || ''}
                onChange={(e) => onInputChange('website', e.target.value)}
                placeholder="https://www.organization.org"
                disabled={isFieldDisabled()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
          </div>

          <div>
            <label htmlFor="organizationWhatsApp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="organizationWhatsApp"
              value={formData.organizationWhatsApp || ''}
              onChange={(e) => handlePhoneChange('organizationWhatsApp', e.target.value)}
              placeholder="(123) 456-7890"
              disabled={isFieldDisabled()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contact Person */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Primary Contact Person</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => onInputChange('contactPerson', e.target.value)}
                placeholder="John Doe"
                disabled={isFieldDisabled()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(e) => handlePhoneChange('contactPhone', e.target.value)}
                placeholder="(123) 456-7890"
                disabled={isFieldDisabled()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save status */}
      {autoSaveStatus && (
        <div className="text-sm text-gray-600 italic text-right">
          {autoSaveStatus}
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;