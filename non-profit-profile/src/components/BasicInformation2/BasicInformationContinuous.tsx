import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BasicInformationFormData } from './types';
import TaxIdentificationSection from './sections/TaxIdentificationSectionEnhanced';
import OrganizationIdentitySection from './sections/OrganizationIdentitySectionEnhanced';
import OrganizationalAddressSection from './sections/OrganizationalAddressSectionEnhanced';
import TaxExemptStatusSection from './sections/TaxExemptStatusSectionEnhanced';
import OrganizationalCommunicationSection from './sections/OrganizationalCommunicationSectionEnhanced';
import ContactPersonsSection from './sections/ContactPersonsSectionEnhanced';
import DelegatedAuthoritySection from './sections/DelegatedAuthoritySection';
import CustomSectionsSection from './sections/CustomSectionsSection';
import { validateBasicInformation, getCompletedSections } from '../../utils/basicInformationValidation';
import { useNetlifyBasicInformationApi } from '../../hooks/useNetlifyBasicInformationApi';
import { SECTION_COLORS } from './constants';
import { OrganizationProvider, useOrganization } from '../../contexts/OrganizationContext';

const initialFormData: BasicInformationFormData = {
  taxIdentification: {
    taxIdType: 'federal_ein',
  },
  organizationIdentity: {
    orgLegalName: '',
    operatingLanguages: ['English'],
    preferredLanguage: 'English',
    accessibilityServices: [],
    stateOfIncorporation: '',
    statesOfOperation: [],
    foreignEntityRegistered: false,
    registeredFictitiousNames: [],
    alsoKnownAs: [],
    hasParentOrg: false,
    hasSubsidiaries: false,
    hasFiscalSponsor: false,
  },
  organizationalAddress: {
    addresses: [],
  },
  taxExemptStatus: {
    is501c3: false,
    hasGroupExemption: false,
  },
  organizationalCommunication: {
    autoPopulateComm: false,
    organizationPhone: '',
    primaryEmail: '',
    country: 'United States',
  },
  contactPersons: {
    primaryContact: {
      id: '1',
      fullName: '',
      title: '',
      email: '',
      phone: '',
    },
    additionalContacts: [],
  },
  delegatedAuthority: {
    spokespersons: [],
    authorizedSigners: [],
    authorizedApplicants: [],
    boardMembers: [],
  },
  customSections: [],
};

const BasicInformationContinuous: React.FC = () => {
  const [formData, setFormData] = useState<BasicInformationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [_completedSections] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { setOrganizationId, setOrganizationEIN, setOrganizationName } = useOrganization();
  
  const {
    loading,
    error,
    saving,
    lastSaved,
    saveData,
    clearError,
    exportData,
  } = useNetlifyBasicInformationApi();

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges) return;

    const timeoutId = setTimeout(() => {
      saveData(formData);
      setHasChanges(false);
    }, 30000); // Auto-save after 30 seconds

    return () => clearTimeout(timeoutId);
  }, [formData, hasChanges, saveData]);

  // Validation
  useEffect(() => {
    const validationErrors = validateBasicInformation(formData);
    setErrors(validationErrors);
    
    getCompletedSections(formData);
  }, [formData]);

  const handleFieldChange = (section: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BasicInformationFormData],
        [field]: value,
      },
    }));
    setHasChanges(true);
    
    // Update organization context when EIN is changed
    if (section === 'taxIdentification' && field === 'ein' && value) {
      const einValue = String(value);
      setOrganizationEIN(einValue);
      // Use EIN as organizationId for now
      setOrganizationId(einValue.replace(/-/g, ''));
    }
    
    // Update organization name when changed
    if (section === 'organizationIdentity' && field === 'orgLegalName' && value) {
      setOrganizationName(String(value));
    }
  };

  const handleSaveNow = async () => {
    try {
      await saveData(formData);
      setHasChanges(false);
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error('Failed to save data. Please try again.');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      await exportData(format, false);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    }
  };

  const getSectionColor = (sectionKey: string): string => {
    return SECTION_COLORS[sectionKey as keyof typeof SECTION_COLORS] || 'bg-gray-50';
  };

  const getSectionTitle = (sectionKey: string): string => {
    const titles: Record<string, string> = {
      taxIdentification: 'Tax Identification',
      organizationIdentity: 'Organization Identity',
      organizationalAddress: 'Organizational Address',
      taxExemptStatus: 'Tax Exempt Status',
      organizationalCommunication: 'Organizational Communication',
      contactPersons: 'Contact Persons',
      delegatedAuthority: 'Delegated Authority',
      customSections: 'Custom Sections',
    };
    return titles[sectionKey] || sectionKey;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            marginTop: '80px', // Move below header
          },
        }}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Basic Information Form</h1>
            <div className="flex items-center gap-4">
              {/* Save Status */}
              <div className="text-sm text-gray-600">
                {lastSaved && (
                  <span>
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                    {hasChanges && <span className="text-orange-600 ml-2">(Unsaved changes)</span>}
                  </span>
                )}
              </div>
              
              {/* Save Button */}
              <button
                onClick={handleSaveNow}
                disabled={saving || !hasChanges}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  saving || !hasChanges
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saving ? 'Saving...' : 'Save Now'}
              </button>
              
              {/* Export Menu */}
              <div className="relative group">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">
                  Export
                  <svg className="w-4 h-4 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex justify-between items-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content - All Sections in One Page */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tax Identification Section */}
          <section className={`${getSectionColor('taxIdentification')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('taxIdentification')}
            </h2>
            <TaxIdentificationSection
              data={formData.taxIdentification}
              onChange={(field, value) => handleFieldChange('taxIdentification', field, value)}
              errors={errors.taxIdentification}
            />
          </section>

          {/* Organization Identity Section */}
          <section className={`${getSectionColor('organizationIdentity')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('organizationIdentity')}
            </h2>
            <OrganizationIdentitySection
              data={formData.organizationIdentity}
              onChange={(field, value) => handleFieldChange('organizationIdentity', field, value)}
              errors={errors.organizationIdentity}
            />
          </section>

          {/* Organizational Address Section */}
          <section className={`${getSectionColor('organizationalAddress')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('organizationalAddress')}
            </h2>
            <OrganizationalAddressSection
              data={formData.organizationalAddress}
              onChange={(field, value) => handleFieldChange('organizationalAddress', field, value)}
              errors={errors.organizationalAddress}
            />
          </section>

          {/* Tax Exempt Status Section */}
          <section className={`${getSectionColor('taxExemptStatus')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('taxExemptStatus')}
            </h2>
            <TaxExemptStatusSection
              data={formData.taxExemptStatus}
              onChange={(field, value) => handleFieldChange('taxExemptStatus', field, value)}
              errors={errors.taxExemptStatus}
            />
          </section>

          {/* Organizational Communication Section */}
          <section className={`${getSectionColor('organizationalCommunication')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('organizationalCommunication')}
            </h2>
            <OrganizationalCommunicationSection
              data={formData.organizationalCommunication}
              onChange={(field, value) => handleFieldChange('organizationalCommunication', field, value)}
              errors={errors.organizationalCommunication}
            />
          </section>

          {/* Contact Persons Section */}
          <section className={`${getSectionColor('contactPersons')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('contactPersons')}
            </h2>
            <ContactPersonsSection
              data={formData.contactPersons}
              onChange={(field, value) => handleFieldChange('contactPersons', field, value)}
              errors={errors.contactPersons}
            />
          </section>

          {/* Delegated Authority Section */}
          <section className={`${getSectionColor('delegatedAuthority')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('delegatedAuthority')}
            </h2>
            <DelegatedAuthoritySection
              data={formData.delegatedAuthority}
              onChange={(field, value) => handleFieldChange('delegatedAuthority', field, value)}
              errors={errors.delegatedAuthority}
            />
          </section>

          {/* Custom Sections */}
          <section id="custom-sections" className={`${getSectionColor('customSections')} rounded-lg p-6 shadow-sm`}>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {getSectionTitle('customSections')}
            </h2>
            <CustomSectionsSection
              data={formData}
              onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              errors={errors.customSections}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

const BasicInformationWithProvider: React.FC = () => {
  return (
    <OrganizationProvider>
      <BasicInformationContinuous />
    </OrganizationProvider>
  );
};

export default BasicInformationWithProvider;