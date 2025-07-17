import { BasicInformationFormData } from '../components/BasicInformation2/types';

export interface ValidationErrors {
  [key: string]: {
    [key: string]: string;
  };
}

const EIN_PATTERN = /^\d{2}-\d{7}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const validateBasicInformation = (data: BasicInformationFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Tax Identification validation
  errors.taxIdentification = {};
  if (data.taxIdentification.taxIdType === 'ein' && data.taxIdentification.ein) {
    if (!EIN_PATTERN.test(data.taxIdentification.ein)) {
      errors.taxIdentification.ein = 'EIN must be in format XX-XXXXXXX';
    }
  }
  if (data.taxIdentification.taxIdType === 'state' && !data.taxIdentification.stateId) {
    errors.taxIdentification.stateId = 'State Tax ID is required';
  }
  if (!data.taxIdentification.fiscalYearEnd) {
    errors.taxIdentification.fiscalYearEnd = 'Fiscal year end is required';
  }

  // Organization Identity validation
  errors.organizationIdentity = {};
  if (!data.organizationIdentity.legalName || data.organizationIdentity.legalName.trim() === '') {
    errors.organizationIdentity.legalName = 'Legal name is required';
  }
  if (!data.organizationIdentity.incorporationState) {
    errors.organizationIdentity.incorporationState = 'Incorporation state is required';
  }
  if (!data.organizationIdentity.incorporationDate) {
    errors.organizationIdentity.incorporationDate = 'Incorporation date is required';
  }
  if (!data.organizationIdentity.organizationType) {
    errors.organizationIdentity.organizationType = 'Organization type is required';
  }
  if (data.organizationIdentity.organizationType === 'other' && !data.organizationIdentity.otherOrganizationType) {
    errors.organizationIdentity.otherOrganizationType = 'Please specify organization type';
  }
  if (!data.organizationIdentity.missionStatement || data.organizationIdentity.missionStatement.trim() === '') {
    errors.organizationIdentity.missionStatement = 'Mission statement is required';
  }

  // Organizational Address validation
  errors.physicalAddress = {};
  if (!data.organizationalAddress.physicalAddress.street1) {
    errors.physicalAddress.street1 = 'Street address is required';
  }
  if (!data.organizationalAddress.physicalAddress.city) {
    errors.physicalAddress.city = 'City is required';
  }
  if (!data.organizationalAddress.physicalAddress.state) {
    errors.physicalAddress.state = 'State is required';
  }
  if (!data.organizationalAddress.physicalAddress.zipCode) {
    errors.physicalAddress.zipCode = 'ZIP code is required';
  } else if (!ZIP_PATTERN.test(data.organizationalAddress.physicalAddress.zipCode)) {
    errors.physicalAddress.zipCode = 'Invalid ZIP code format';
  }

  // Mailing Address validation (only if different from physical)
  if (!data.organizationalAddress.mailingAddress.sameAsPhysical) {
    errors.mailingAddress = {};
    if (!data.organizationalAddress.mailingAddress.street1) {
      errors.mailingAddress.street1 = 'Street address is required';
    }
    if (!data.organizationalAddress.mailingAddress.city) {
      errors.mailingAddress.city = 'City is required';
    }
    if (!data.organizationalAddress.mailingAddress.state) {
      errors.mailingAddress.state = 'State is required';
    }
    if (!data.organizationalAddress.mailingAddress.zipCode) {
      errors.mailingAddress.zipCode = 'ZIP code is required';
    } else if (!ZIP_PATTERN.test(data.organizationalAddress.mailingAddress.zipCode)) {
      errors.mailingAddress.zipCode = 'Invalid ZIP code format';
    }
  }

  // Tax Exempt Status validation
  errors.taxExemptStatus = {};
  if (!data.taxExemptStatus.status) {
    errors.taxExemptStatus.status = 'Tax exempt status is required';
  }
  if (data.taxExemptStatus.status === 'approved' && !data.taxExemptStatus.determinationLetterDate) {
    errors.taxExemptStatus.determinationLetterDate = 'Determination letter date is required';
  }
  if (data.taxExemptStatus.status === 'revoked' && !data.taxExemptStatus.revocationDate) {
    errors.taxExemptStatus.revocationDate = 'Revocation date is required';
  }

  // Communication validation
  errors.organizationalCommunication = {};
  if (!data.organizationalCommunication.primaryPhone) {
    errors.organizationalCommunication.primaryPhone = 'Primary phone is required';
  } else if (!PHONE_PATTERN.test(data.organizationalCommunication.primaryPhone)) {
    errors.organizationalCommunication.primaryPhone = 'Phone must be in format (XXX) XXX-XXXX';
  }

  if (!data.organizationalCommunication.primaryEmail) {
    errors.organizationalCommunication.primaryEmail = 'Primary email is required';
  } else if (!EMAIL_PATTERN.test(data.organizationalCommunication.primaryEmail)) {
    errors.organizationalCommunication.primaryEmail = 'Invalid email format';
  }

  if (data.organizationalCommunication.secondaryEmail && !EMAIL_PATTERN.test(data.organizationalCommunication.secondaryEmail)) {
    errors.organizationalCommunication.secondaryEmail = 'Invalid email format';
  }

  if (data.organizationalCommunication.website && !URL_PATTERN.test(data.organizationalCommunication.website)) {
    errors.organizationalCommunication.website = 'Invalid URL format';
  }

  // Contact Persons validation
  errors.contactPersons = {};
  if (!data.contactPersons.executiveDirector.name) {
    errors.contactPersons.executiveDirectorName = 'Executive Director name is required';
  }
  if (!data.contactPersons.executiveDirector.email) {
    errors.contactPersons.executiveDirectorEmail = 'Executive Director email is required';
  } else if (!EMAIL_PATTERN.test(data.contactPersons.executiveDirector.email)) {
    errors.contactPersons.executiveDirectorEmail = 'Invalid email format';
  }

  if (!data.contactPersons.boardChair.name) {
    errors.contactPersons.boardChairName = 'Board Chair name is required';
  }
  if (!data.contactPersons.boardChair.email) {
    errors.contactPersons.boardChairEmail = 'Board Chair email is required';
  } else if (!EMAIL_PATTERN.test(data.contactPersons.boardChair.email)) {
    errors.contactPersons.boardChairEmail = 'Invalid email format';
  }

  // Clean up empty error objects
  Object.keys(errors).forEach(key => {
    if (Object.keys(errors[key]).length === 0) {
      delete errors[key];
    }
  });

  return errors;
};