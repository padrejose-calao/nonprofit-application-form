// Standard Contact Card Interface for Contact Manager Integration
export interface ContactCard {
  id: string;
  type: 'person' | 'organization';
  name: string;
  displayName: string;
  email?: string;
  phone?: string;
  title?: string;
  organization?: string;
  taxId?: string;
  w9OnFile?: boolean;
  state?: string;
  roles?: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  documentIds?: string[];
  // Enhanced naming for persons
  personName?: {
    prefix?: string; // Stacked titles (The Rev. Dr., The Hon. Ms., etc.)
    firstName: string;
    middleName?: string;
    lastNameFirst: string; // Primary last name for alphabetization
    lastNameSecond?: string; // Second last name (optional)
    suffix?: string; // Jr., Sr., III, etc.
    courtesyTitle?: string; // Father, Padre, Elder, etc.
    preferredDisplayName?: string; // Override for how they prefer to be called
  };
}

// Field Group Interface for Universal Name Field
export interface FieldGroup {
  [key: string]: {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    type?: 'text' | 'email' | 'tel' | 'address';
  };
}

export interface TaxIdentificationData {
  taxIdType: 'federal_ein' | 'state_nonprofit' | 'foreign_entity' | 'fiscal_sponsor' | 'no_tax_id';
  ein?: string;
  stateEntityState?: string;
  stateEntityNumber?: string;
  foreignCountry?: string;
  foreignRegistrationNumber?: string;
  fiscalSponsorName?: string;
  fiscalSponsorEIN?: string;
  fiscalSponsorContact?: string;
  fiscalSponsorEmail?: string;
  noTaxIdReason?: string;
  additionalTaxInfo?: {
    stateTaxId?: string;
    stateOfRegistration?: string;
    stateCharityNumber?: string;
    taxExemptStatus?: 'Active' | 'Pending' | 'Revoked' | 'Not Applicable';
    exemptionDate?: string;
    classification?: 'Public Charity' | 'Private Foundation' | 'Other';
    itin?: string;
    vatGstNumbers?: string[];
    taxTreaty?: boolean;
    disregardedEntity?: boolean;
    churchAutomatic?: boolean;
    governmentEntity?: boolean;
    tribalGovernment?: boolean;
    previousEin?: string;
    revokedStatus?: boolean;
    reinstatedDate?: string;
  };
  documents?: {
    irsDeterminationLetter?: string;
    stateNonProfitRegistration?: string;
    foreignEntityDocs?: string;
    fiscalSponsorshipAgreement?: string;
  };
}

export interface OrganizationIdentityData {
  orgLegalName: string;
  orgNameDocs?: string;
  operatingLanguages: string[];
  preferredLanguage: string;
  accessibilityServices: string[];
  stateOfIncorporation: string;
  incorporationDate?: string;
  articlesUpload?: string;
  bylawsUpload?: string;
  amendments?: Array<{
    documentType: string;
    amendmentDate: string;
    fileUpload: string;
  }>;
  statesOfOperation: string[];
  foreignEntityRegistered: boolean;
  foreignRegistrations?: Record<string, {
    registrationNumber: string;
    registrationDate: string;
    registeredAgentName: string;
    registeredAgentAddress: Address;
    certificateUpload?: string;
    annualReportUpload?: string;
  }>;
  registeredFictitiousNames: Array<{
    name: string;
    state: string;
    certificateNumber: string;
    filingDate: string;
    expirationDate: string;
    status: 'Active' | 'Expired' | 'Pending';
    certificateUpload?: string;
  }>;
  alsoKnownAs: Array<{
    name: string;
    usageContext?: string;
  }>;
  hasParentOrg: boolean;
  parentOrgDetails?: {
    parentName: string;
    parentTaxId: string;
    relationshipType: 'Wholly-owned subsidiary' | 'Chapter' | 'Affiliate' | 'Other';
    relationshipDescription: string;
    documentationUpload?: string;
  };
  hasSubsidiaries: boolean;
  subsidiaries?: Array<{
    name: string;
    ein: string;
    contactPerson: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  hasFiscalSponsor: boolean;
  fiscalSponsorDetails?: {
    sponsorName: string;
    sponsorEIN: string;
    sponsorContact?: string;
    sponsorEmail?: string;
    agreementUpload?: string;
  };
}

export interface Address {
  type: 'Main Office' | 'Mailing Address' | 'Physical Location' | 'Satellite Office' | 'Branch Location' | 'Shipment Address' | 'Alternate Address';
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessHours?: string;
  businessDays?: string;
  isMailingAddress?: boolean;
}

export interface OrganizationalAddressData {
  addresses: Address[];
  adaCompliant?: boolean;
}

export interface TaxExemptStatusData {
  is501c3: boolean;
  organizationType?: string;
  hasGroupExemption: boolean;
  centralOrgName?: string;
  groupExemptionNumber?: string;
  subordinateNumber?: string;
  centralOrgEIN?: string;
  determinationLetterDate?: string;
  parentOrgName?: string;
  stateNonprofitNumber?: string;
  stateOfRegistration?: string;
  otherOrgTypeDescription?: string;
  federalTaxId?: string;
  taxExemptDocuments?: Array<{
    id: string;
    type: string;
    description: string;
    fileName?: string;
    uploadDate?: Date;
    expirationDate?: Date;
    status: 'active' | 'pending' | 'expired';
  }>;
}

export interface OrganizationalCommunicationData {
  autoPopulateComm: boolean;
  organizationPhone: string;
  whatsappNumber?: string;
  primaryEmail: string;
  preferredEmail?: string;
  website?: string;
  country: string;
}

export interface ContactPerson {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  w9Status?: boolean;
}

export interface ContactPersonsData {
  primaryContact: ContactPerson;
  additionalContacts: ContactPerson[];
}

export interface DelegatedContact {
  id: string;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  contactCardId?: string;
}

export interface DelegatedAuthorityData {
  spokespersons: DelegatedContact[];
  authorizedSigners: DelegatedContact[];
  authorizedApplicants: DelegatedContact[];
  boardMembers: DelegatedContact[];
}

export interface BasicInformationFormData {
  taxIdentification: TaxIdentificationData;
  organizationIdentity: OrganizationIdentityData;
  organizationalAddress: OrganizationalAddressData;
  taxExemptStatus: TaxExemptStatusData;
  organizationalCommunication: OrganizationalCommunicationData;
  contactPersons: ContactPersonsData;
  delegatedAuthority?: DelegatedAuthorityData;
  customSections?: unknown[];
}

export interface SectionProps {
  data: unknown;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  documentType: string;
  sectionId: string;
}

