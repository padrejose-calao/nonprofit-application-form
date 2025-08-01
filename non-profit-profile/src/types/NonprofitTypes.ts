// Shared type definitions for Nonprofit Application

export interface BoardMember {
  id: string | number;
  name: string;
  role: string;
  retained: boolean;
  title: string;
  email: string;
  phone: string;
  termStart?: string;
  termEnd?: string;
  bio?: string;
  expertise?: string;
  conflicts?: string;
  attendance?: any[];
  committees?: any[];
}

export interface AdvisoryMember {
  id: string | number;
  name: string;
  retained: boolean;
}

export interface Committee {
  id: string | number;
  name: string;
  members: AdvisoryMember[];
  description?: string;
  chair?: string;
  meetings?: any[];
}

export interface BoardMeeting {
  id: string;
  date: string;
  type: string;
  attendees: string | any[];
  topics: string;
  minutes: string;
  uploaded: boolean;
  agenda?: string;
  quorum?: boolean;
  decisions?: any[];
}

export interface Contact {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressHistory: Array<{
    address: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    startDate: string;
    endDate?: string;
  }>;
  projectRoles: string[];
  tags: string[];
  notes: string;
  createdDate: string;
  lastModified: string;
  dataCompleteness: number;
  isOrganization?: boolean;
  hasW9?: boolean;
  w9File?: any;
  ssn?: string;
  groups?: string[];
  boardInfo?: {
    role?: string;
    committees?: string[];
    termStart?: string;
    termEnd?: string;
    attendance?: number;
  };
  givingHistory?: Array<{
    id: string;
    date: string;
    amount: number;
    type: 'grant' | 'donation' | 'sponsorship' | 'in-kind';
    source: string;
    purpose: string;
    impact: string;
    story?: string;
    recognition?: string;
  }>;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  team: string[];
  objectives: string[];
  outcomes: string[];
  createdDate: string;
  lastModified: string;
}

export interface SectionLock {
  [key: string]: boolean;
}

export interface SectionStatus {
  [key: string]: string;
}

export interface FormData {
  [key: string]: any;
  address2?: string;
  dba?: string[];
  parentOrganization?: string;
  fiscalSponsor?: string;
  zipCode4?: string;
  contactPerson?: string;
  contactPhone?: string;
  ssn?: string;
  use1099?: boolean;
  contactHasW9?: boolean;
  contactW9?: any;
  w9Form?: any;
  articlesOfIncorporation?: any;
  bylaws?: any;
  goodStanding?: any;
  annualReport?: any;
  charitableRegistration?: any;
  organizationWhatsApp?: string;
  preferredOrgEmail?: string;
  correspondenceInstructions?: string;
}

export interface Errors {
  [key: string]: string;
}

export interface FieldOrder {
  [key: string]: string[];
}

export interface HiddenFields {
  [sectionId: string]: { [field: string]: boolean };
}

export interface CustomFields {
  [key: string]: any;
}

export interface SectionProgress {
  basicInfo: number;
  narrative: number;
  governance: number;
  management: number;
  financials: number;
  programs: number;
  impact: number;
  compliance: number;
  technology: number;
  communications: number;
  riskManagement: number;
  insurance: number;
  otherLocations: number;
  additionalInfo: number;
  leadershipDetails: number;
  boardMemberDetails: number;
  staffDetails: number;
  donations: number;
  references: number;
}

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  'District of Columbia', 'Puerto Rico', 'Virgin Islands', 'Guam', 'American Samoa', 'Northern Mariana Islands'
];