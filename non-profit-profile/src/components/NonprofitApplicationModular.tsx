import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User as UserType } from '../services/api';
import { 
  FormData, 
  Errors, 
  SectionProgress,
  Contact,
  Project
} from '../types/NonprofitTypes';

// Import framework and sections
import ApplicationFramework from './ApplicationFramework';
import BasicInfoSection from './sections/BasicInfoSection';
import NarrativeSection from './sections/NarrativeSection';
import GovernanceSection from './sections/GovernanceSection';
import ManagementSection from './sections/ManagementSection';
import FinancialSection from './sections/FinancialSection';
import ProgramsSection from './sections/ProgramsSection';
import ImpactSection from './sections/ImpactSection';
import ComplianceSection from './sections/ComplianceSection';
import TechnologySection from './sections/TechnologySection';
import CommunicationsSection from './sections/CommunicationsSection';
import RiskManagementSection from './sections/RiskManagementSection';
import InsuranceSection from './sections/InsuranceSection';
import OtherLocationsSection from './sections/OtherLocationsSection';
import AdditionalInfoSection from './sections/AdditionalInfoSection';
import LeadershipDetailsSection from './sections/LeadershipDetailsSection';
import BoardMemberDetailsSection from './sections/BoardMemberDetailsSection';
import StaffDetailsSection from './sections/StaffDetailsSection';
import DonationsSection from './sections/DonationsSection';
import ReferencesSection from './sections/ReferencesSection';
import ContactManager from './ContactManager';
import ProgramManager from './ProgramManager';
import DocumentManager from './DocumentManager';

// Import validation utilities
import { 
  commonValidationRules, 
  runValidations, 
  conditionalValidationRules, 
  runConditionalValidations 
} from '../utils/formValidation';

interface NonprofitApplicationModularProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

const NonprofitApplicationModular: React.FC<NonprofitApplicationModularProps> = ({ 
  currentUser, 
  onLogout 
}) => {
  console.log('NonprofitApplicationModular rendering');

  // Core state
  const [activeSection, setActiveSection] = useState<string>('basicInfo');
  const [noEin, setNoEin] = useState<boolean>(false);
  const [einSequence, setEinSequence] = useState<number>(1);
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    ein: '',
    orgName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    zipCode4: '',
    country: 'United States',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    contactPhone: '',
    ssn: '',
    use1099: false,
    dba: [],
    parentOrganization: '',
    fiscalSponsor: '',
    organizationWhatsApp: '',
    preferredOrgEmail: '',
    correspondenceInstructions: ''
  });

  // Narrative state
  const [narrative, setNarrative] = useState({
    backgroundStatement: '',
    missionStatement: '',
    visionStatement: '',
    impactStatement: '',
    strategiesStatement: '',
    needsStatement: '',
    primaryAreasOfImpact: '',
    nteeCodes: '',
    populationServed: '',
    serviceAreas: '',
    serviceAreaDescription: '',
    searchKeywords: '',
    logoFile: null as File | null,
    bannerImage: null as File | null,
    socialMedia: '',
    externalAssessments: '',
    affiliations: '',
    videos: '',
    annualReport: null as File | null,
    strategicPlan: null as File | null,
  });

  // Section locks
  const [sectionLocks, setSectionLocks] = useState<{[key: string]: boolean}>({
    basicInfo: false,
    narrative: false,
    governance: false,
    management: false,
    financials: false,
    programs: false,
    impact: false,
    compliance: false,
    technology: false,
    communications: false,
    riskManagement: false,
    insurance: false,
    otherLocations: false,
    additionalInfo: false,
    leadershipDetails: false,
    boardMemberDetails: false,
    staffDetails: false,
    donations: false,
    references: false
  });

  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showSaveStatus, setShowSaveStatus] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Errors>({});
  const [narrativeErrors, setNarrativeErrors] = useState<any>({});

  // Progress tracking
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>({
    basicInfo: 0,
    narrative: 0,
    governance: 0,
    management: 0,
    financials: 0,
    programs: 0,
    impact: 0,
    compliance: 0,
    technology: 0,
    communications: 0,
    riskManagement: 0,
    insurance: 0,
    otherLocations: 0,
    additionalInfo: 0,
    leadershipDetails: 0,
    boardMemberDetails: 0,
    staffDetails: 0,
    donations: 0,
    references: 0
  });

  // Manager states
  const [showContactManager, setShowContactManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Governance state
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [boardMeetings, setBoardMeetings] = useState<any[]>([]);

  // Management state
  const [management, setManagement] = useState({
    fundraisingPlan: '',
    marketingPlan: '',
    volunteerRecruitment: '',
    organizationalChart: null as File | null,
    staffingPlan: '',
    successionPlan: '',
    developmentStrategy: '',
    donorRetention: ''
  });
  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  // Programs state
  const [programs, setPrograms] = useState<any[]>([]);

  // Impact state
  const [impactMetrics, setImpactMetrics] = useState<any[]>([]);

  // Compliance state
  const [complianceItems, setComplianceItems] = useState<any[]>([]);

  // Communications state
  const [communicationChannels, setCommunicationChannels] = useState<any[]>([]);

  // Risk Management state
  const [riskItems, setRiskItems] = useState<any[]>([]);

  // Insurance state
  const [insurancePolicies, setInsurancePolicies] = useState<any[]>([]);

  // Other Locations state
  const [locations, setLocations] = useState<any[]>([]);

  // Leadership Details state
  const [leadershipMembers, setLeadershipMembers] = useState<any[]>([]);

  // References state
  const [references, setReferences] = useState<any[]>([]);

  // Calculate section progress
  useEffect(() => {
    calculateAllProgress();
  }, [formData, narrative, boardMembers, management, programs, impactMetrics, 
      complianceItems, communicationChannels, riskItems, insurancePolicies, 
      locations, leadershipMembers, staffMembers, references]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(async () => {
      if (isAutoSaving) return;
      
      setIsAutoSaving(true);
      try {
        await handleSave(true); // Pass true for silent save
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, isAutoSaving, formData, narrative]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S to save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      // Ctrl+E to export
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleExport();
      }
      // Ctrl+Shift+S to toggle auto-save
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        setAutoSaveEnabled(!autoSaveEnabled);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [autoSaveEnabled]);

  const calculateAllProgress = () => {
    // Basic Info progress
    const basicInfoFields = ['ein', 'orgName', 'address', 'city', 'state', 'zipCode', 'phone', 'email'];
    const basicInfoFilled = basicInfoFields.filter(field => formData[field]).length;
    const basicInfoProgress = Math.round((basicInfoFilled / basicInfoFields.length) * 100);

    // Narrative progress
    const narrativeFields = ['backgroundStatement', 'missionStatement', 'visionStatement', 
                            'impactStatement', 'strategiesStatement', 'needsStatement',
                            'primaryAreasOfImpact', 'populationServed', 'serviceAreas'];
    const narrativeFilled = narrativeFields.filter(field => narrative[field as keyof typeof narrative]).length;
    const narrativeProgress = Math.round((narrativeFilled / narrativeFields.length) * 100);

    // Governance progress
    const governanceProgress = boardMembers.length > 0 ? 
      Math.min(100, (boardMembers.length / 5) * 100) : 0;

    // Management progress
    const managementFields = ['fundraisingPlan', 'marketingPlan', 'developmentStrategy'] as const;
    const managementFilled = managementFields.filter(field => management[field as keyof typeof management]).length;
    const managementProgress = Math.round((managementFilled / managementFields.length) * 100);

    // Financial progress
    const financialFields = ['operatingBudget', 'revenue2024', 'expenses2024'];
    const financialFilled = financialFields.filter(field => formData[field]).length;
    const financialProgress = Math.round((financialFilled / financialFields.length) * 100);

    // Programs progress
    const programsProgress = programs.length > 0 ? 
      Math.min(100, (programs.length / 3) * 100) : 0;

    // Impact progress
    const impactProgress = impactMetrics.length > 0 ? 
      Math.min(100, (impactMetrics.length / 5) * 100) : 0;

    // Compliance progress
    const complianceProgress = complianceItems.length > 0 ? 
      Math.round((complianceItems.filter(item => item.status === 'compliant').length / complianceItems.length) * 100) : 0;

    // Technology progress
    const technologyFields = ['techBudget', 'itSupportType'];
    const technologyFilled = technologyFields.filter(field => formData[field]).length;
    const technologyProgress = Math.round((technologyFilled / technologyFields.length) * 100);

    // Communications progress
    const communicationsProgress = communicationChannels.length > 0 ? 
      Math.min(100, (communicationChannels.length / 3) * 100) : 0;

    // Risk Management progress
    const riskProgress = riskItems.length > 0 ? 
      Math.min(100, (riskItems.length / 5) * 100) : 0;

    // Insurance progress
    const insuranceProgress = insurancePolicies.length > 0 ? 
      Math.min(100, (insurancePolicies.filter(p => p.status === 'active').length / insurancePolicies.length) * 100) : 0;

    // Other Locations progress
    const locationsProgress = locations.length > 0 ? 
      Math.min(100, (locations.length / 2) * 100) : 0;

    // Additional Info progress
    const additionalInfoFields = ['additionalDetails', 'futurePlans'];
    const additionalInfoFilled = additionalInfoFields.filter(field => formData[field]).length;
    const additionalInfoProgress = Math.round((additionalInfoFilled / additionalInfoFields.length) * 100);

    // Leadership Details progress
    const leadershipProgress = leadershipMembers.length > 0 ? 
      Math.min(100, (leadershipMembers.length / 3) * 100) : 0;

    // Board/Staff Details progress (calculated based on actual sections)
    const boardMemberDetailsProgress = boardMembers.length > 0 ? 100 : 0;
    const staffDetailsProgress = staffMembers.length > 0 ? 100 : 0;

    // Donations progress
    const donationsFields = ['fundraisingStrategy', 'donorRecognition'];
    const donationsFilled = donationsFields.filter(field => formData[field]).length;
    const donationsProgress = Math.round((donationsFilled / donationsFields.length) * 100);

    // References progress
    const referencesProgress = references.length > 0 ? 
      Math.min(100, (references.length / 3) * 100) : 0;

    setSectionProgress(prev => ({
      ...prev,
      basicInfo: basicInfoProgress,
      narrative: narrativeProgress,
      governance: governanceProgress,
      management: managementProgress,
      financials: financialProgress,
      programs: programsProgress,
      impact: impactProgress,
      compliance: complianceProgress,
      technology: technologyProgress,
      communications: communicationsProgress,
      riskManagement: riskProgress,
      insurance: insuranceProgress,
      otherLocations: locationsProgress,
      additionalInfo: additionalInfoProgress,
      leadershipDetails: leadershipProgress,
      boardMemberDetails: boardMemberDetailsProgress,
      staffDetails: staffDetailsProgress,
      donations: donationsProgress,
      references: referencesProgress
    }));
  };

  // Input handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleNarrativeChange = (field: string, value: any) => {
    setNarrative(prev => ({ ...prev, [field]: value }));
    setNarrativeErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleManagementChange = (field: string, value: any) => {
    setManagement(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File) => {
    if (field?.includes('narrative')) {
      setNarrative(prev => ({ ...prev, [field]: file }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
    toast.success(`File uploaded for ${field}`);
  };

  const handleFileRemove = (field: string) => {
    if (field?.includes('narrative')) {
      setNarrative(prev => ({ ...prev, [field]: null }));
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
    }
    toast.info(`File removed for ${field}`);
  };

  // Save handler
  const handleSave = async (silent = false) => {
    try {
      // Validate current section
      let validationErrors = {};
      
      if (activeSection === 'basicInfo') {
        validationErrors = validateBasicInfo();
      } else if (activeSection === 'narrative') {
        validationErrors = validateNarrative();
      }

      if (Object.keys(validationErrors).length > 0 && !silent) {
        toast.error('Please fix validation errors before saving');
        return;
      }

      // Save logic here - in a real app, this would save to backend
      setLastSaved(new Date());
      setShowSaveStatus(true);
      
      // Hide save status after 3 seconds
      setTimeout(() => setShowSaveStatus(false), 3000);
      
      if (!silent) {
        toast.success('Form saved successfully!');
      }
    } catch (error) {
      if (!silent) {
        toast.error('Error saving form');
      }
      console.error('Save error:', error);
    }
  };

  // Export handler
  const handleExport = () => {
    try {
      const exportData = {
        formData,
        narrative,
        contacts,
        projects,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser?.email
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nonprofit-application-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Application exported successfully!');
    } catch (error) {
      toast.error('Error exporting application');
      console.error('Export error:', error);
    }
  };

  // Import handler
  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.formData) setFormData(data.formData);
      if (data.narrative) setNarrative(data.narrative);
      if (data.contacts) setContacts(data.contacts);
      if (data.projects) setProjects(data.projects);
      
      toast.success('Application imported successfully!');
    } catch (error) {
      toast.error('Error importing application');
      console.error('Import error:', error);
    }
  };

  // Validation functions
  const validateBasicInfo = () => {
    const errors: any = {};
    if (!noEin && !formData.ein) errors.ein = 'EIN is required';
    if (!formData.orgName) errors.orgName = 'Organization name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    if (!formData.email) errors.email = 'Email is required';
    
    setErrors(errors);
    return errors;
  };

  const validateNarrative = () => {
    const errors: any = {};
    if (!narrative.backgroundStatement) errors.backgroundStatement = 'Background statement is required';
    if (!narrative.missionStatement) errors.missionStatement = 'Mission statement is required';
    if (!narrative.visionStatement) errors.visionStatement = 'Vision statement is required';
    if (!narrative.impactStatement) errors.impactStatement = 'Impact statement is required';
    if (!narrative.strategiesStatement) errors.strategiesStatement = 'Strategies statement is required';
    if (!narrative.needsStatement) errors.needsStatement = 'Needs statement is required';
    if (!narrative.primaryAreasOfImpact) errors.primaryAreasOfImpact = 'Primary areas of impact is required';
    if (!narrative.populationServed) errors.populationServed = 'Population served is required';
    if (!narrative.serviceAreas) errors.serviceAreas = 'Service areas is required';
    
    setNarrativeErrors(errors);
    return errors;
  };

  // Section change handler
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Handle special sections
    if (section === 'contacts') {
      setShowContactManager(true);
      setShowProjectManager(false);
      setShowDocumentManager(false);
    } else if (section === 'projects') {
      setShowProjectManager(true);
      setShowContactManager(false);
      setShowDocumentManager(false);
    } else if (section === 'documents') {
      setShowDocumentManager(true);
      setShowContactManager(false);
      setShowProjectManager(false);
    } else {
      setShowContactManager(false);
      setShowProjectManager(false);
      setShowDocumentManager(false);
    }
  };

  // Contact selector handler
  const handleShowContactSelector = (field: string, type: string) => {
    // Implementation for showing contact selector
    toast.info(`Opening contact selector for ${field}`);
  };

  // Render section content
  const renderSectionContent = () => {
    // Special managers
    if (showContactManager) {
      return (
        <ContactManager
          contacts={contacts}
          onContactsChange={setContacts}
          onClose={() => setShowContactManager(false)}
        />
      );
    }

    if (showProjectManager) {
      return (
        <ProgramManager
          programs={projects}
          onProgramsChange={setProjects}
          onClose={() => setShowProjectManager(false)}
        />
      );
    }

    if (showDocumentManager) {
      return (
        <DocumentManager
          isOpen={showDocumentManager}
          onClose={() => setShowDocumentManager(false)}
          documents={[]}
          onDocumentsChange={() => {}}
          editingDocumentId={null}
          onEditingDocumentChange={() => {}}
        />
      );
    }

    // Regular sections
    switch (activeSection) {
      case 'basicInfo':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            <BasicInfoSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.basicInfo}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
              onShowContactSelector={handleShowContactSelector}
              noEin={noEin}
              onNoEinChange={setNoEin}
            />
          </div>
        );

      case 'narrative':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Narrative</h2>
            <NarrativeSection
              narrative={narrative}
              errors={narrativeErrors}
              locked={sectionLocks.narrative}
              onNarrativeChange={handleNarrativeChange}
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
          </div>
        );

      case 'governance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Governance</h2>
            <GovernanceSection
              boardMembers={boardMembers}
              committees={committees}
              boardMeetings={boardMeetings}
              contacts={contacts}
              errors={errors}
              locked={sectionLocks.governance}
              onBoardMembersChange={setBoardMembers}
              onCommitteesChange={setCommittees}
              onBoardMeetingsChange={setBoardMeetings}
              onShowContactManager={() => {
                setShowContactManager(true);
              }}
              onInputChange={handleInputChange}
              formData={formData}
            />
          </div>
        );

      case 'management':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Management</h2>
            <ManagementSection
              management={management}
              staffMembers={staffMembers}
              errors={errors}
              locked={sectionLocks.management}
              onManagementChange={handleManagementChange}
              onStaffMembersChange={setStaffMembers}
              onShowStaffManager={() => {
                // Handle staff manager
              }}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'financials':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Financials</h2>
            <FinancialSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.financials}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'programs':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Programs</h2>
            <ProgramsSection
              programs={programs}
              errors={errors}
              locked={sectionLocks.programs}
              onProgramsChange={setPrograms}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'impact':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Impact & Evaluation</h2>
            <ImpactSection
              impactMetrics={impactMetrics}
              errors={errors}
              locked={sectionLocks.impact}
              onImpactMetricsChange={setImpactMetrics}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'compliance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Compliance</h2>
            <ComplianceSection
              complianceItems={complianceItems}
              errors={errors}
              locked={sectionLocks.compliance}
              onComplianceItemsChange={setComplianceItems}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'technology':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Technology</h2>
            <TechnologySection
              formData={formData}
              errors={errors}
              locked={sectionLocks.technology}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'communications':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Communications</h2>
            <CommunicationsSection
              communicationChannels={communicationChannels}
              errors={errors}
              locked={sectionLocks.communications}
              onCommunicationChannelsChange={setCommunicationChannels}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'riskManagement':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Risk Management</h2>
            <RiskManagementSection
              riskItems={riskItems}
              errors={errors}
              locked={sectionLocks.riskManagement}
              onRiskItemsChange={setRiskItems}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'insurance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Insurance</h2>
            <InsuranceSection
              insurancePolicies={insurancePolicies}
              errors={errors}
              locked={sectionLocks.insurance}
              onInsurancePoliciesChange={setInsurancePolicies}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'otherLocations':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Other Locations</h2>
            <OtherLocationsSection
              locations={locations}
              errors={errors}
              locked={sectionLocks.otherLocations}
              onLocationsChange={setLocations}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'additionalInfo':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
            <AdditionalInfoSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.additionalInfo}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'leadershipDetails':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Leadership Details</h2>
            <LeadershipDetailsSection
              leadershipMembers={leadershipMembers}
              errors={errors}
              locked={sectionLocks.leadershipDetails}
              onLeadershipMembersChange={setLeadershipMembers}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      case 'boardMemberDetails':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Board Member Details</h2>
            <BoardMemberDetailsSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.boardMemberDetails}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'staffDetails':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Staff Details</h2>
            <StaffDetailsSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.staffDetails}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'donations':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Donations</h2>
            <DonationsSection
              formData={formData}
              errors={errors}
              locked={sectionLocks.donations}
              onInputChange={handleInputChange}
              onFileUpload={handleFileUpload}
            />
          </div>
        );

      case 'references':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">References</h2>
            <ReferencesSection
              references={references}
              errors={errors}
              locked={sectionLocks.references}
              onReferencesChange={setReferences}
              onFileUpload={handleFileUpload}
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">{activeSection}</h2>
            <p className="text-gray-600">This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <>
      <ApplicationFramework
        currentUser={currentUser}
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sectionProgress={sectionProgress}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        autoSaveEnabled={autoSaveEnabled}
        onAutoSaveToggle={setAutoSaveEnabled}
        lastSaved={lastSaved}
        isAutoSaving={isAutoSaving}
      >
        {renderSectionContent()}
      </ApplicationFramework>

      {/* Floating Save Status Indicator */}
      {(showSaveStatus || isAutoSaving) && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2 z-50">
          {isAutoSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700">Auto-saving...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                Saved {lastSaved ? lastSaved.toLocaleTimeString() : 'now'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Auto-save Status in Corner */}
      <div className="fixed top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-xs text-gray-600 z-40">
        Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
        {lastSaved && (
          <div className="text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </>
  );
};

export default NonprofitApplicationModular;