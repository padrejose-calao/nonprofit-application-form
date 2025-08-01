// Comprehensive type definitions for the Nonprofit Application Form

export interface NonprofitFormData {
  // Basic Information
  orgName: string;
  dba: string;
  yearEst: string;
  ein: string;
  noEin: boolean;
  noEinReason: string;
  website: string;
  noWebsite: boolean;
  noWebsiteReason: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  phone: string;
  email: string;
  preferredContactMethod: string;
  irsDetermination: boolean;
  irs501c3: boolean;
  irs501cType: string;
  use1099: boolean;

  // Contact Information
  directorName: string;
  directorTitle: string;
  directorEmail: string;
  directorPhone: string;
  directorBio: string;
  altContactName: string;
  altContactTitle: string;
  altContactEmail: string;
  altContactPhone: string;
  contactForCommunications: string;
  boardChairName: string;
  boardChairEmail: string;
  boardChairPhone: string;

  // Narrative
  mission: string;
  visionStatement: string;
  history: string;
  coreValues: string;
  theoryOfChange: string;
  statementOfNeed: string;
  uniqueApproach: string;
  targetDemographics: string;
  geographicArea: string;
  evidenceBasedPractices: string;
  culturalCompetence: string;
  inclusivityStatement: string;

  // Governance
  boardSize: number;
  boardMeetingFrequency: string;
  boardTermLimits: string;
  boardGivingPolicy: boolean;
  boardGivingPercentage: string;
  executiveCommittee: boolean;
  boardCommittees: string[];
  boardDiversity: string;
  conflictOfInterestPolicy: boolean;
  boardTraining: string;
  boardEvaluations: boolean;
  strategicPlan: boolean;
  strategicPlanDate: string;
  successionPlan: boolean;

  // Management
  fullTimeStaff: number;
  partTimeStaff: number;
  volunteers: number;
  volunteerHours: number;
  staffTurnoverRate: string;
  performanceReviews: boolean;
  staffDevelopment: string;
  hrPolicies: boolean;
  employeeHandbook: boolean;
  safetyProtocols: boolean;
  backgroundChecks: boolean;

  // Financial
  operatingBudget: string;
  fiscalYearEnd: string;
  auditRequired: boolean;
  lastAuditDate: string;
  cashReserves: string;
  monthsOfReserves: number;
  endowment: boolean;
  endowmentSize: string;
  budgetBreakdown: {
    programs: number;
    admin: number;
    fundraising: number;
  };
  revenueSources: {
    grants: number;
    donations: number;
    events: number;
    programs: number;
    other: number;
  };
  topFunders: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  inKindSupport: string;
  financialPolicies: boolean;
  internalControls: string;

  // Programs
  primaryPrograms: Array<{
    name: string;
    description: string;
    targetPopulation: string;
    peopleServed: number;
    budget: string;
    staffing: string;
    outcomes: string;
    evaluation: string;
  }>;
  evaluationMethods: string;
  dataCollection: string;
  programPartnerships: string;
  capacityBuilding: string;

  // Impact
  impactStatement: string;
  successStories: string;
  mediaRecognition: string;
  awards: string;
  testimonials: Array<{
    source: string;
    quote: string;
    date: string;
  }>;
  communityPartners: string;
  collaborations: string;
  advocacy: string;

  // Communications
  communicationChannels: string[];
  socialMediaPlatforms: string[];
  hasWebsite: boolean;
  newsletter: boolean;
  annualReport: boolean;
  marketingBudget: string;
  brandGuidelines: boolean;
  mediaRelations: string;
  crisisComPlan: boolean;

  // Compliance
  taxExemptStatus: boolean;
  charitableRegistration: string[];
  lobbying: boolean;
  lobbyingBudget: string;
  politicalActivity: boolean;
  unrelatedBusinessIncome: boolean;
  whistleblowerPolicy: boolean;
  documentRetention: boolean;
  privacyPolicy: boolean;
  cyberSecurityPolicy: boolean;

  // Risk Management
  insurance: {
    generalLiability: boolean;
    directorsAndOfficers: boolean;
    professionalLiability: boolean;
    propertyInsurance: boolean;
    workersComp: boolean;
    cyberLiability: boolean;
  };
  riskAssessment: boolean;
  businessContinuity: boolean;
  emergencyPlan: boolean;
  dataBackup: boolean;
  financialControls: string;

  // Additional fields
  accreditations: string;
  memberships: string;
  futureGoals: string;
  challengesAndOpportunities: string;
  technicalAssistanceNeeds: string;
  additionalInfo: string;

  // System fields
  submittedAt?: Date;
  lastUpdated?: Date;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  version?: number;
  organizationId?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Type for form errors
export interface FormErrors {
  [key: string]: string | undefined;
}

// Type for section progress
export interface SectionProgress {
  basicInfo: number;
  contact: number;
  narrative: number;
  governance: number;
  management: number;
  financials: number;
  programs: number;
  impact: number;
  communications: number;
  compliance: number;
  technology: number;
  riskManagement: number;
  insurance: number;
  additionalInfo: number;
  documents: number;
  references: number;
}

// Type for form sections
export type FormSection = keyof SectionProgress;

// Type for form validation rules
export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Type for form field metadata
export interface FormFieldMeta {
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file' | 'array';
  required: boolean;
  placeholder?: string;
  hint?: string;
  validation?: ValidationRule[];
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
  min?: number;
  max?: number;
}

// Type for document uploads
export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: string;
  category: string;
  description?: string;
  url?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Type for contacts
export interface Contact {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  tags?: string[];
  lastContacted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type for board members
export interface BoardMember {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise?: string[];
  committees?: string[];
  termStart: Date;
  termEnd?: Date;
  isActive: boolean;
  attendance?: number;
  givingStatus?: 'yes' | 'no' | 'pending';
}

// Type for programs
export interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
  targetPopulation: string;
  geographicScope: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'planned';
  budget: number;
  staffCount: number;
  volunteerCount: number;
  participantsServed: number;
  outcomes: string[];
  metrics: Array<{
    name: string;
    target: number;
    actual: number;
    unit: string;
  }>;
  evaluationMethod: string;
  partners?: string[];
  fundingSources?: string[];
}

// Export a type guard to check if an object is NonprofitFormData
export function isNonprofitFormData(obj: unknown): obj is NonprofitFormData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'orgName' in obj &&
    'ein' in obj
  );
}

// Export utility type for partial form data during editing
export type PartialFormData = Partial<NonprofitFormData>;

// Export type for form field paths
export type FormFieldPath = keyof NonprofitFormData | `${keyof NonprofitFormData}.${string}`;