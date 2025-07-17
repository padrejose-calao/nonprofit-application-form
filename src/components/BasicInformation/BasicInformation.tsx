import React, { useState, useEffect } from 'react';
import { BasicInformationFormData } from './types';
import TaxIdentificationSection from './sections/TaxIdentificationSection';
import OrganizationIdentitySection from './sections/OrganizationIdentitySection';
import OrganizationalAddressSection from './sections/OrganizationalAddressSection';
import TaxExemptStatusSection from './sections/TaxExemptStatusSection';
import OrganizationalCommunicationSection from './sections/OrganizationalCommunicationSection';
import ContactPersonsSection from './sections/ContactPersonsSection';
import EntityDocumentsSidebar from './components/EntityDocumentsSidebar';
import NavigationSidebar from './components/NavigationSidebar';
import ProgressIndicator from './components/ProgressIndicator';
import { SECTION_COLORS } from './constants';
import { validateBasicInformation, getCompletedSections } from '../../utils/basicInformationValidation';

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
    addresses: [{
      type: 'Main Office',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    }],
  },
  taxExemptStatus: {
    is501c3: true,
    hasGroupExemption: false,
  },
  organizationalCommunication: {
    autoPopulateComm: false,
    organizationPhone: '',
    primaryEmail: '',
    country: 'US',
  },
  contactPersons: {
    primaryContact: {
      id: '',
      fullName: '',
      title: '',
      email: '',
      phone: '',
    },
    additionalContacts: [],
  },
};

const BasicInformation: React.FC = () => {
  const [formData, setFormData] = useState<BasicInformationFormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState('taxIdentification');
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [hideEmptyFields, setHideEmptyFields] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveFormData();
    }, 30000); // Save every 30 seconds

    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Validate and update completed sections
  useEffect(() => {
    const validationErrors = validateBasicInformation(formData);
    setErrors(validationErrors);
    const completed = getCompletedSections(formData);
    setCompletedSections(completed);
  }, [formData]);

  const saveFormData = async () => {
    try {
      // API call to save form data
      console.log('Auto-saving form data...');
      // await api.saveFormDraft(formData);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const handleSectionChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BasicInformationFormData],
        [field]: value,
      },
    }));
  };

  const handleAddCustomSection = () => {
    // TODO: Implement custom section addition
    console.log('Adding custom section...');
  };

  const handleAddSubsection = () => {
    // TODO: Implement subsection addition
    console.log('Adding subsection...');
  };

  const getSectionColor = (section: string): string => {
    const colorMap: Record<string, string> = {
      taxIdentification: SECTION_COLORS.taxIdentification,
      organizationIdentity: SECTION_COLORS.organizationIdentity,
      organizationalAddress: SECTION_COLORS.physicalAddress,
      taxExemptStatus: SECTION_COLORS.businessHours,
      organizationalCommunication: SECTION_COLORS.businessHours,
      contactPersons: SECTION_COLORS.keyPersonnel,
    };
    return colorMap[section] || 'bg-white';
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'taxIdentification':
        return (
          <TaxIdentificationSection
            data={formData.taxIdentification}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationIdentity':
        return (
          <OrganizationIdentitySection
            data={formData.organizationIdentity}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationalAddress':
        return (
          <OrganizationalAddressSection
            data={formData.organizationalAddress}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'taxExemptStatus':
        return (
          <TaxExemptStatusSection
            data={formData.taxExemptStatus}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationalCommunication':
        return (
          <OrganizationalCommunicationSection
            data={formData.organizationalCommunication}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'contactPersons':
        return (
          <ContactPersonsSection
            data={formData.contactPersons}
            onChange={(field: string, value: any) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Basic Information Form</h1>
            <ProgressIndicator 
              sections={Object.keys(formData)} 
              currentSection={currentSection} 
              completedSections={completedSections} 
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          sections={Object.keys(formData)}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          completedSections={completedSections}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className={`${getSectionColor(currentSection)} rounded-lg p-6 mb-6`}>
            {renderSection()}
          </div>

          {/* Bottom Controls */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  onClick={handleAddCustomSection}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  + Add Custom Section
                </button>
                <button
                  onClick={handleAddSubsection}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  + Add Subsection
                </button>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hideEmptyFields}
                  onChange={(e) => setHideEmptyFields(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Hide empty fields for export</span>
              </label>
            </div>
          </div>
        </main>

        {/* Entity Documents Sidebar */}
        <EntityDocumentsSidebar documents={documents} />
      </div>
    </div>
  );
};

export default BasicInformation;