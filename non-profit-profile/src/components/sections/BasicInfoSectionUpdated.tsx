import React, { useState, useEffect } from 'react';
import { 
  FileText, Building2, MapPin, Phone, Mail, Globe, Upload, Check, 
  Plus, Search, AlertCircle, Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import { FormData, Errors, US_STATES } from '../../types/NonprofitTypes';
import CopyPasteButton from '../CopyPasteButton';
import NTEECodeSelectorSimple from '../NTEECodeSelectorSimple';
import ModuleHeader from '../ModuleHeader';

interface BasicInfoSectionProps {
  formData: FormData;
  errors: Errors;
  locked: boolean;
  onInputChange: (field: string, value: unknown) => void;
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
  const [isLocked, setIsLocked] = useState(locked);
  const [isDraft, setIsDraft] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  // Auto-save effect
  useEffect(() => {
    if (isLocked) return;
    const timeout = setTimeout(() => {
      setAutoSaveStatus('Saving...');
      setTimeout(() => setAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData, isLocked]);

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

  const handleExport = () => {
    // Implementation for exporting basic info data
    console.log('Exporting basic info data...');
  };

  const handlePrint = () => {
    // Custom print implementation if needed
    console.log('Printing basic info...');
  };

  const isFieldDisabled = () => disabled || isLocked;

  return (
    <div className="relative">
      {/* Standardized Module Header */}
      <ModuleHeader
        title="Basic Information"
        subtitle="Organization identification and contact details"
        icon={Home}
        iconColor="text-blue-600"
        sectionId="basic-info"
        onLockToggle={setIsLocked}
        onDraftToggle={setIsDraft}
        onFinalToggle={setIsFinal}
        onExport={handleExport}
        onPrint={handlePrint}
        locked={isLocked}
        isDraft={isDraft}
        isFinal={isFinal}
      />

      <div className="p-6 space-y-6">
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
                value={String((formData as any).ein || '')}
                onChange={e => handleEINChange(e.target.value)}
                placeholder="XX-XXXXXXX"
                className={`w-full p-3 border rounded-lg ${
                  errors.ein ? 'border-red-500' : 'border-gray-300'
                } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFieldDisabled() || noEin}
                maxLength={10}
              />
              {errors.ein && (
                <p className="mt-1 text-sm text-red-600">{errors.ein}</p>
              )}
            </div>

            {/* No EIN Checkbox */}
            <div className="flex items-center mt-8">
              <input
                type="checkbox"
                id="noEin"
                checked={noEin}
                onChange={e => onNoEinChange?.(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isFieldDisabled()}
              />
              <label htmlFor="noEin" className="ml-2 text-sm text-gray-700">
                Organization does not have an EIN
              </label>
            </div>
          </div>
        </div>

        {/* Organization Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Organization Information
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Legal Name */}
            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-2">
                Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="legalName"
                  type="text"
                  value={String((formData as any).legalName || '')}
                  onChange={e => onInputChange('legalName', e.target.value)}
                  placeholder="Legal name as registered"
                  className={`w-full p-3 pr-12 border rounded-lg ${
                    errors.legalName ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).legalName || '')}
                  onPaste={(value) => onInputChange('legalName', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {errors.legalName && (
                <p className="mt-1 text-sm text-red-600">{errors.legalName}</p>
              )}
            </div>

            {/* DBA */}
            <div>
              <label htmlFor="dba" className="block text-sm font-medium text-gray-700 mb-2">
                DBA (Doing Business As)
              </label>
              <div className="relative">
                <input
                  id="dba"
                  type="text"
                  value={String((formData as any).dba || '')}
                  onChange={e => onInputChange('dba', e.target.value)}
                  placeholder="Operating name if different"
                  className={`w-full p-3 pr-12 border rounded-lg border-gray-300 ${
                    isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).dba || '')}
                  onPaste={(value) => onInputChange('dba', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
            </div>

            {/* Founded Year */}
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year <span className="text-red-500">*</span>
              </label>
              <input
                id="foundedYear"
                type="number"
                value={String((formData as any).foundedYear || '')}
                onChange={e => onInputChange('foundedYear', e.target.value)}
                placeholder="YYYY"
                min="1800"
                max={new Date().getFullYear()}
                className={`w-full p-3 border rounded-lg ${
                  errors.foundedYear ? 'border-red-500' : 'border-gray-300'
                } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFieldDisabled()}
              />
              {errors.foundedYear && (
                <p className="mt-1 text-sm text-red-600">{errors.foundedYear}</p>
              )}
            </div>

            {/* NTEE Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NTEE Code
              </label>
              <NTEECodeSelectorSimple
                value={(formData as any).nteeCode || ''}
                onChange={(value) => onInputChange('nteeCode', value.nteeCode || '')}
                disabled={isFieldDisabled()}
              />
            </div>
          </div>
        </div>

        {/* Physical Address Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Physical Address
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Street Address */}
            <div className="lg:col-span-2">
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="streetAddress"
                  type="text"
                  value={String((formData as any).streetAddress || '')}
                  onChange={e => onInputChange('streetAddress', e.target.value)}
                  placeholder="123 Main Street"
                  className={`w-full p-3 pr-12 border rounded-lg ${
                    errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).streetAddress || '')}
                  onPaste={(value) => onInputChange('streetAddress', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="city"
                  type="text"
                  value={String((formData as any).city || '')}
                  onChange={e => onInputChange('city', e.target.value)}
                  placeholder="City"
                  className={`w-full p-3 pr-12 border rounded-lg ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).city || '')}
                  onPaste={(value) => onInputChange('city', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                value={String((formData as any).state || '')}
                onChange={e => onInputChange('state', e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={isFieldDisabled()}
              >
                <option value="">Select state</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="zipCode"
                  type="text"
                  value={String((formData as any).zipCode || '')}
                  onChange={e => handleZipChange(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                  className={`flex-1 p-3 border rounded-lg ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <input
                  id="zipCode4"
                  type="text"
                  value={String((formData as any).zipCode4 || '')}
                  onChange={e => onInputChange('zipCode4', e.target.value.replace(/\D/g, ''))}
                  placeholder="+4"
                  maxLength={4}
                  className={`w-24 p-3 border rounded-lg border-gray-300 ${
                    isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isFieldDisabled()}
                />
              </div>
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Contact Information
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Phone */}
            <div>
              <label htmlFor="mainPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Main Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="mainPhone"
                  type="tel"
                  value={String((formData as any).mainPhone || '')}
                  onChange={e => handlePhoneChange('mainPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className={`w-full p-3 pr-12 border rounded-lg ${
                    errors.mainPhone ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).mainPhone || '')}
                  onPaste={(value) => handlePhoneChange('mainPhone', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {errors.mainPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.mainPhone}</p>
              )}
            </div>

            {/* Main Email */}
            <div>
              <label htmlFor="mainEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Main Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="mainEmail"
                  type="email"
                  value={String((formData as any).mainEmail || '')}
                  onChange={e => onInputChange('mainEmail', e.target.value)}
                  placeholder="info@organization.org"
                  className={`w-full p-3 pr-12 border rounded-lg ${
                    errors.mainEmail ? 'border-red-500' : 'border-gray-300'
                  } ${isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).mainEmail || '')}
                  onPaste={(value) => onInputChange('mainEmail', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
              {errors.mainEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.mainEmail}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <input
                  id="website"
                  type="url"
                  value={String((formData as any).website || '')}
                  onChange={e => onInputChange('website', e.target.value)}
                  placeholder="https://www.organization.org"
                  className={`w-full p-3 pr-12 border rounded-lg border-gray-300 ${
                    isFieldDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isFieldDisabled()}
                />
                <CopyPasteButton
                  value={String((formData as any).website || '')}
                  onPaste={(value) => onInputChange('website', value)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auto-save status */}
        {autoSaveStatus && !isLocked && (
          <div className="text-sm text-gray-500 text-right">
            {autoSaveStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;