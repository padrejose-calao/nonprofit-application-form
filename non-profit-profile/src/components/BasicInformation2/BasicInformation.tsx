import React, { useState, useEffect } from 'react';
import { BasicInformationFormData, DocumentUpload } from './types';
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
import { useBasicInformationApi } from '../../hooks/useBasicInformationApi';
import { logger } from '../../utils/logger';

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
  const [currentSection, setCurrentSection] = useState('taxIdentification');
  const [hideEmptyFields, setHideEmptyFields] = useState(false);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  
  // Use API hook for data management
  const {
    data: apiData,
    loading,
    saving,
    error,
    lastSaved,
    isDirty,
    saveData,
    loadData,
    autoSave,
    exportData,
    uploadDocument,
    deleteDocument,
    clearError
  } = useBasicInformationApi();

  // Use API data or initial data
  const [formData, setFormData] = useState<BasicInformationFormData>(apiData || initialFormData);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Update form data when API data changes
  useEffect(() => {
    if (apiData) {
      setFormData(apiData);
    }
  }, [apiData]);

  // Auto-save functionality
  useEffect(() => {
    if (formData && isDirty) {
      autoSave(formData);
    }
  }, [formData, autoSave, isDirty]);

  // Validate and update completed sections
  useEffect(() => {
    const validationErrors = validateBasicInformation(formData);
    setErrors(validationErrors);
    const completed = getCompletedSections(formData);
    setCompletedSections(completed);
  }, [formData]);

  const handleSave = async () => {
    try {
      await saveData(formData);
    } catch (error) {
      logger.error('Error saving form data:', error);
    }
  };

  const handleSectionChange = (section: string, data: Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleFieldChange = (section: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BasicInformationFormData],
        [field]: value,
      },
    }));
  };

  const handleAddCustomSection = () => {
    logger.info('Custom section functionality available in BasicInformation2 component');
    // Implementation requires section state management
  };

  const handleAddSubsection = () => {
    logger.info('Subsection functionality available in BasicInformation2 component');
    // Implementation requires section state management
  };

  const handleDocumentUpload = async (file: File, section: string, fieldName: string) => {
    const result = await uploadDocument(file, section, fieldName);
    if (result) {
      // Add document to documents list
      setDocuments(prev => [...prev, {
        id: result.id,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        documentType: fieldName,
        sectionId: section
      }]);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    const success = await deleteDocument(documentId);
    if (success) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
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
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationIdentity':
        return (
          <OrganizationIdentitySection
            data={formData.organizationIdentity}
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationalAddress':
        return (
          <OrganizationalAddressSection
            data={formData.organizationalAddress}
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'taxExemptStatus':
        return (
          <TaxExemptStatusSection
            data={formData.taxExemptStatus}
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'organizationalCommunication':
        return (
          <OrganizationalCommunicationSection
            data={formData.organizationalCommunication}
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      case 'contactPersons':
        return (
          <ContactPersonsSection
            data={formData.contactPersons}
            onChange={(field: string, value: unknown) => handleFieldChange(currentSection, field, value)}
            errors={errors[currentSection] || {}}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

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
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex justify-between items-center">
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={clearError} className="text-red-600 hover:text-red-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Success Message */}
            {lastSaved && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Last saved: {lastSaved.toLocaleString()}
                  {isDirty && ' (unsaved changes)'}
                </p>
              </div>
            )}

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
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hideEmptyFields}
                    onChange={(e) => setHideEmptyFields(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Hide empty fields for export</span>
                </label>
                
                {/* Export Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportData('json', hideEmptyFields)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => exportData('csv', hideEmptyFields)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportData('pdf', hideEmptyFields)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Export PDF
                  </button>
                </div>
                
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Entity Documents Sidebar */}
        <EntityDocumentsSidebar 
          documents={documents}
          onUpload={handleDocumentUpload}
          onDelete={handleDocumentDelete}
        />
      </div>
    </div>
  );
};

export default BasicInformation;