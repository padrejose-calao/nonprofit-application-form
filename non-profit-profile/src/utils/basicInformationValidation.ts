import { BasicInformationFormData } from '../components/BasicInformation/types';
import { VALIDATION_PATTERNS } from '../components/BasicInformation/constants';

export interface ValidationErrors {
  [section: string]: {
    [field: string]: string;
  };
}

export const validateBasicInformation = (data: BasicInformationFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Tax Identification validation
  errors.taxIdentification = {};
  if (data.taxIdentification.taxIdType === 'federal_ein') {
    if (!data.taxIdentification.ein) {
      errors.taxIdentification.ein = 'Federal EIN is required';
    } else if (!VALIDATION_PATTERNS.ein.test(data.taxIdentification.ein)) {
      errors.taxIdentification.ein = 'Invalid EIN format (XX-XXXXXXX)';
    }
  } else if (data.taxIdentification.taxIdType === 'state_nonprofit') {
    if (!data.taxIdentification.stateEntityState) {
      errors.taxIdentification.stateEntityState = 'State is required';
    }
    if (!data.taxIdentification.stateEntityNumber) {
      errors.taxIdentification.stateEntityNumber = 'State entity number is required';
    }
  } else if (data.taxIdentification.taxIdType === 'foreign_entity') {
    if (!data.taxIdentification.foreignCountry) {
      errors.taxIdentification.foreignCountry = 'Country is required';
    }
    if (!data.taxIdentification.foreignRegistrationNumber) {
      errors.taxIdentification.foreignRegistrationNumber = 'Registration number is required';
    }
  } else if (data.taxIdentification.taxIdType === 'fiscal_sponsor') {
    if (!data.taxIdentification.fiscalSponsorName) {
      errors.taxIdentification.fiscalSponsorName = 'Fiscal sponsor name is required';
    }
    if (!data.taxIdentification.fiscalSponsorEIN) {
      errors.taxIdentification.fiscalSponsorEIN = 'Fiscal sponsor EIN is required';
    } else if (!VALIDATION_PATTERNS.ein.test(data.taxIdentification.fiscalSponsorEIN)) {
      errors.taxIdentification.fiscalSponsorEIN = 'Invalid EIN format (XX-XXXXXXX)';
    }
  } else if (data.taxIdentification.taxIdType === 'no_tax_id') {
    if (!data.taxIdentification.noTaxIdReason) {
      errors.taxIdentification.noTaxIdReason = 'Reason is required';
    }
  }

  // Organization Identity validation
  errors.organizationIdentity = {};
  if (!data.organizationIdentity.orgLegalName) {
    errors.organizationIdentity.orgLegalName = 'Organization legal name is required';
  }
  if (!data.organizationIdentity.stateOfIncorporation) {
    errors.organizationIdentity.stateOfIncorporation = 'State of incorporation is required';
  }
  if (data.organizationIdentity.operatingLanguages.length === 0) {
    errors.organizationIdentity.operatingLanguages = 'At least one operating language is required';
  }
  if (!data.organizationIdentity.preferredLanguage) {
    errors.organizationIdentity.preferredLanguage = 'Preferred language is required';
  }

  // Organizational Address validation
  errors.organizationalAddress = {};
  data.organizationalAddress.addresses.forEach((address, index) => {
    if (!address.address) {
      errors.organizationalAddress[`addresses.${index}.address`] = 'Address is required';
    }
    if (!address.city) {
      errors.organizationalAddress[`addresses.${index}.city`] = 'City is required';
    }
    if (!address.state) {
      errors.organizationalAddress[`addresses.${index}.state`] = 'State is required';
    }
    if (!address.zipCode) {
      errors.organizationalAddress[`addresses.${index}.zipCode`] = 'ZIP code is required';
    } else if (!VALIDATION_PATTERNS.zipCode.test(address.zipCode)) {
      errors.organizationalAddress[`addresses.${index}.zipCode`] = 'Invalid ZIP code format';
    }
  });

  // Tax Exempt Status validation
  errors.taxExemptStatus = {};
  if (data.taxExemptStatus.is501c3 === false && !data.taxExemptStatus.organizationType) {
    errors.taxExemptStatus.organizationType = 'Organization type is required';
  }
  if (data.taxExemptStatus.hasGroupExemption) {
    if (!data.taxExemptStatus.centralOrgName) {
      errors.taxExemptStatus.centralOrgName = 'Central organization name is required';
    }
    if (!data.taxExemptStatus.centralOrgEIN) {
      errors.taxExemptStatus.centralOrgEIN = 'Central organization EIN is required';
    } else if (!VALIDATION_PATTERNS.ein.test(data.taxExemptStatus.centralOrgEIN)) {
      errors.taxExemptStatus.centralOrgEIN = 'Invalid EIN format (XX-XXXXXXX)';
    }
    if (!data.taxExemptStatus.groupExemptionNumber) {
      errors.taxExemptStatus.groupExemptionNumber = 'Group exemption number is required';
    } else if (!VALIDATION_PATTERNS.gen.test(data.taxExemptStatus.groupExemptionNumber)) {
      errors.taxExemptStatus.groupExemptionNumber = 'GEN must be 4 digits';
    }
  }

  // Organizational Communication validation
  errors.organizationalCommunication = {};
  if (!data.organizationalCommunication.organizationPhone) {
    errors.organizationalCommunication.organizationPhone = 'Organization phone is required';
  } else if (!VALIDATION_PATTERNS.phone.test(data.organizationalCommunication.organizationPhone)) {
    errors.organizationalCommunication.organizationPhone = 'Invalid phone format (XXX-XXX-XXXX)';
  }
  if (!data.organizationalCommunication.primaryEmail) {
    errors.organizationalCommunication.primaryEmail = 'Primary email is required';
  } else if (!VALIDATION_PATTERNS.email.test(data.organizationalCommunication.primaryEmail)) {
    errors.organizationalCommunication.primaryEmail = 'Invalid email format';
  }
  if (data.organizationalCommunication.preferredEmail && 
      !VALIDATION_PATTERNS.email.test(data.organizationalCommunication.preferredEmail)) {
    errors.organizationalCommunication.preferredEmail = 'Invalid email format';
  }
  if (data.organizationalCommunication.website && 
      !VALIDATION_PATTERNS.url.test(data.organizationalCommunication.website)) {
    errors.organizationalCommunication.website = 'Invalid URL format';
  }

  // Contact Persons validation
  errors.contactPersons = {};
  if (!data.contactPersons.primaryContact.fullName) {
    errors.contactPersons.fullName = 'Primary contact name is required';
  }
  if (!data.contactPersons.primaryContact.title) {
    errors.contactPersons.title = 'Primary contact title is required';
  }
  if (!data.contactPersons.primaryContact.email) {
    errors.contactPersons.email = 'Primary contact email is required';
  } else if (!VALIDATION_PATTERNS.email.test(data.contactPersons.primaryContact.email)) {
    errors.contactPersons.email = 'Invalid email format';
  }
  if (!data.contactPersons.primaryContact.phone) {
    errors.contactPersons.phone = 'Primary contact phone is required';
  } else if (!VALIDATION_PATTERNS.phone.test(data.contactPersons.primaryContact.phone)) {
    errors.contactPersons.phone = 'Invalid phone format (XXX-XXX-XXXX)';
  }

  // Clean up empty error objects
  Object.keys(errors).forEach(section => {
    if (Object.keys(errors[section]).length === 0) {
      delete errors[section];
    }
  });

  return errors;
};

export const isSectionComplete = (section: string, data: BasicInformationFormData): boolean => {
  const errors = validateBasicInformation(data);
  return !errors[section] || Object.keys(errors[section]).length === 0;
};

export const getCompletedSections = (data: BasicInformationFormData): string[] => {
  const sections = Object.keys(data);
  return sections.filter(section => isSectionComplete(section, data));
};