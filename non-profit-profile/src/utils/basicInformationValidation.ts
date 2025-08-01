import { BasicInformationFormData } from '../components/BasicInformation2/types';

export interface ValidationErrors {
  [key: string]: {
    [key: string]: string;
  };
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (allows various formats)
const phoneRegex = /^[\d\s\-()+.]+$/;

// EIN validation regex (XX-XXXXXXX format)
const einRegex = /^\d{2}-\d{7}$/;

// ZIP code validation regex (5 digits or 5+4 format)
const zipRegex = /^\d{5}(-\d{4})?$/;

// Website URL validation regex
const urlRegex = /^https?:\/\/.+/;

export const validateBasicInformation = (data: BasicInformationFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Validate Tax Identification Section
  if (data.taxIdentification) {
    const taxErrors: Record<string, string> = {};
    
    if (!data.taxIdentification.taxIdType) {
      taxErrors.taxIdType = 'Tax identification type is required';
    }
    
    if (data.taxIdentification.taxIdType === 'federal_ein') {
      if (!data.taxIdentification.ein) {
        taxErrors.ein = 'EIN is required';
      } else if (!einRegex.test(data.taxIdentification.ein)) {
        taxErrors.ein = 'EIN must be in format XX-XXXXXXX';
      }
    }
    
    if (data.taxIdentification.taxIdType === 'state_nonprofit') {
      if (!data.taxIdentification.stateEntityState) {
        taxErrors.stateEntityState = 'State is required';
      }
      if (!data.taxIdentification.stateEntityNumber) {
        taxErrors.stateEntityNumber = 'State entity number is required';
      }
    }
    
    if (data.taxIdentification.taxIdType === 'foreign_entity') {
      if (!data.taxIdentification.foreignCountry) {
        taxErrors.foreignCountry = 'Country is required';
      }
      if (!data.taxIdentification.foreignRegistrationNumber) {
        taxErrors.foreignRegistrationNumber = 'Registration number is required';
      }
    }
    
    if (data.taxIdentification.taxIdType === 'fiscal_sponsor') {
      if (!data.taxIdentification.fiscalSponsorName) {
        taxErrors.fiscalSponsorName = 'Fiscal sponsor name is required';
      }
      if (!data.taxIdentification.fiscalSponsorEIN) {
        taxErrors.fiscalSponsorEIN = 'Fiscal sponsor EIN is required';
      } else if (!einRegex.test(data.taxIdentification.fiscalSponsorEIN)) {
        taxErrors.fiscalSponsorEIN = 'EIN must be in format XX-XXXXXXX';
      }
      if (data.taxIdentification.fiscalSponsorEmail && !emailRegex.test(data.taxIdentification.fiscalSponsorEmail)) {
        taxErrors.fiscalSponsorEmail = 'Invalid email format';
      }
    }
    
    if (data.taxIdentification.taxIdType === 'no_tax_id') {
      if (!data.taxIdentification.noTaxIdReason) {
        taxErrors.noTaxIdReason = 'Please explain why no tax ID is available';
      }
    }
    
    // Validate additional tax info fields
    if (data.taxIdentification.additionalTaxInfo) {
      const additionalInfo = data.taxIdentification.additionalTaxInfo;
      
      // Validate previousEin format if provided
      if (additionalInfo.previousEin && !einRegex.test(additionalInfo.previousEin)) {
        taxErrors['additionalTaxInfo.previousEin'] = 'Previous EIN must be in format XX-XXXXXXX';
      }
      
      // Validate reinstatedDate if revokedStatus is true
      if (additionalInfo.revokedStatus && !additionalInfo.reinstatedDate) {
        taxErrors['additionalTaxInfo.reinstatedDate'] = 'Reinstated date is required when tax-exempt status was revoked';
      }
      
      // Validate VAT/GST numbers format
      if (additionalInfo.vatGstNumbers && additionalInfo.vatGstNumbers.length > 0) {
        additionalInfo.vatGstNumbers.forEach((vatNumber, index) => {
          if (vatNumber && vatNumber.trim() === '') {
            taxErrors[`additionalTaxInfo.vatGstNumbers.${index}`] = 'VAT/GST number cannot be empty';
          }
        });
      }
    }
    
    if (Object.keys(taxErrors).length > 0) {
      errors.taxIdentification = taxErrors;
    }
  } else {
    errors.taxIdentification = { taxIdType: 'Tax identification information is required' };
  }
  
  // Validate Organization Identity Section
  if (data.organizationIdentity) {
    const orgErrors: Record<string, string> = {};
    
    if (!data.organizationIdentity.orgLegalName) {
      orgErrors.orgLegalName = 'Organization legal name is required';
    }
    
    if (!data.organizationIdentity.stateOfIncorporation) {
      orgErrors.stateOfIncorporation = 'State of incorporation is required';
    }
    
    if (!data.organizationIdentity.preferredLanguage) {
      orgErrors.preferredLanguage = 'Preferred language is required';
    }
    
    if (!data.organizationIdentity.operatingLanguages || data.organizationIdentity.operatingLanguages.length === 0) {
      orgErrors.operatingLanguages = 'At least one operating language is required';
    }
    
    // Validate parent organization details if applicable
    if (data.organizationIdentity.hasParentOrg && data.organizationIdentity.parentOrgDetails) {
      if (!data.organizationIdentity.parentOrgDetails.parentName) {
        orgErrors['parentOrgDetails.parentName'] = 'Parent organization name is required';
      }
      if (!data.organizationIdentity.parentOrgDetails.parentTaxId) {
        orgErrors['parentOrgDetails.parentTaxId'] = 'Parent organization tax ID is required';
      }
    }
    
    // Validate subsidiaries if applicable
    if (data.organizationIdentity.hasSubsidiaries && data.organizationIdentity.subsidiaries) {
      data.organizationIdentity.subsidiaries.forEach((sub, index) => {
        if (!sub.name) {
          orgErrors[`subsidiaries.${index}.name`] = 'Subsidiary name is required';
        }
        if (!sub.ein) {
          orgErrors[`subsidiaries.${index}.ein`] = 'Subsidiary EIN is required';
        } else if (!einRegex.test(sub.ein)) {
          orgErrors[`subsidiaries.${index}.ein`] = 'EIN must be in format XX-XXXXXXX';
        }
        if (sub.email && !emailRegex.test(sub.email)) {
          orgErrors[`subsidiaries.${index}.email`] = 'Invalid email format';
        }
      });
    }
    
    if (Object.keys(orgErrors).length > 0) {
      errors.organizationIdentity = orgErrors;
    }
  } else {
    errors.organizationIdentity = { orgLegalName: 'Organization identity information is required' };
  }
  
  // Validate Organizational Address Section
  if (data.organizationalAddress) {
    const addressErrors: Record<string, string> = {};
    
    if (!data.organizationalAddress.addresses || data.organizationalAddress.addresses.length === 0) {
      addressErrors.addresses = 'At least one address is required';
    } else {
      // Find main office address
      const mainOffice = data.organizationalAddress.addresses.find(addr => addr.type === 'Main Office');
      if (!mainOffice) {
        addressErrors.addresses = 'Main office address is required';
      }
      
      // Validate each address
      data.organizationalAddress.addresses.forEach((addr, index) => {
        if (!addr.address) {
          addressErrors[`addresses.${index}.address`] = 'Street address is required';
        }
        if (!addr.city) {
          addressErrors[`addresses.${index}.city`] = 'City is required';
        }
        if (!addr.state) {
          addressErrors[`addresses.${index}.state`] = 'State is required';
        }
        if (!addr.zipCode) {
          addressErrors[`addresses.${index}.zipCode`] = 'ZIP code is required';
        } else if (!zipRegex.test(addr.zipCode)) {
          addressErrors[`addresses.${index}.zipCode`] = 'Invalid ZIP code format';
        }
        if (!addr.country) {
          addressErrors[`addresses.${index}.country`] = 'Country is required';
        }
      });
    }
    
    if (Object.keys(addressErrors).length > 0) {
      errors.organizationalAddress = addressErrors;
    }
  } else {
    errors.organizationalAddress = { addresses: 'Address information is required' };
  }
  
  // Validate Tax Exempt Status Section
  if (data.taxExemptStatus) {
    const taxExemptErrors: Record<string, string> = {};
    
    if (data.taxExemptStatus.is501c3 === undefined) {
      taxExemptErrors.is501c3 = 'Please indicate if organization is 501(c)(3)';
    }
    
    if (!data.taxExemptStatus.is501c3 && !data.taxExemptStatus.organizationType) {
      taxExemptErrors.organizationType = 'Organization type is required';
    }
    
    if (data.taxExemptStatus.hasGroupExemption) {
      if (!data.taxExemptStatus.centralOrgName) {
        taxExemptErrors.centralOrgName = 'Central organization name is required';
      }
      if (!data.taxExemptStatus.groupExemptionNumber) {
        taxExemptErrors.groupExemptionNumber = 'Group exemption number is required';
      }
    }
    
    if (Object.keys(taxExemptErrors).length > 0) {
      errors.taxExemptStatus = taxExemptErrors;
    }
  }
  
  // Validate Organizational Communication Section
  if (data.organizationalCommunication) {
    const commErrors: Record<string, string> = {};
    
    if (!data.organizationalCommunication.organizationPhone) {
      commErrors.organizationPhone = 'Organization phone is required';
    } else if (!phoneRegex.test(data.organizationalCommunication.organizationPhone)) {
      commErrors.organizationPhone = 'Invalid phone number format';
    }
    
    if (!data.organizationalCommunication.primaryEmail) {
      commErrors.primaryEmail = 'Primary email is required';
    } else if (!emailRegex.test(data.organizationalCommunication.primaryEmail)) {
      commErrors.primaryEmail = 'Invalid email format';
    }
    
    if (data.organizationalCommunication.preferredEmail && !emailRegex.test(data.organizationalCommunication.preferredEmail)) {
      commErrors.preferredEmail = 'Invalid email format';
    }
    
    if (data.organizationalCommunication.website && !urlRegex.test(data.organizationalCommunication.website)) {
      commErrors.website = 'Website must start with http:// or https://';
    }
    
    if (!data.organizationalCommunication.country) {
      commErrors.country = 'Country is required';
    }
    
    if (Object.keys(commErrors).length > 0) {
      errors.organizationalCommunication = commErrors;
    }
  } else {
    errors.organizationalCommunication = { organizationPhone: 'Communication information is required' };
  }
  
  // Validate Contact Persons Section
  if (data.contactPersons) {
    const contactErrors: Record<string, string> = {};
    
    // Validate primary contact
    if (!data.contactPersons.primaryContact) {
      contactErrors.primaryContact = 'Primary contact is required';
    } else {
      if (!data.contactPersons.primaryContact.fullName) {
        contactErrors['primaryContact.fullName'] = 'Primary contact name is required';
      }
      if (!data.contactPersons.primaryContact.title) {
        contactErrors['primaryContact.title'] = 'Primary contact title is required';
      }
      if (!data.contactPersons.primaryContact.email) {
        contactErrors['primaryContact.email'] = 'Primary contact email is required';
      } else if (!emailRegex.test(data.contactPersons.primaryContact.email)) {
        contactErrors['primaryContact.email'] = 'Invalid email format';
      }
      if (!data.contactPersons.primaryContact.phone) {
        contactErrors['primaryContact.phone'] = 'Primary contact phone is required';
      } else if (!phoneRegex.test(data.contactPersons.primaryContact.phone)) {
        contactErrors['primaryContact.phone'] = 'Invalid phone number format';
      }
    }
    
    // Validate additional contacts
    if (data.contactPersons.additionalContacts) {
      data.contactPersons.additionalContacts.forEach((contact, index) => {
        if (!contact.fullName) {
          contactErrors[`additionalContacts.${index}.fullName`] = 'Contact name is required';
        }
        if (!contact.title) {
          contactErrors[`additionalContacts.${index}.title`] = 'Contact title is required';
        }
        if (!contact.email) {
          contactErrors[`additionalContacts.${index}.email`] = 'Contact email is required';
        } else if (!emailRegex.test(contact.email)) {
          contactErrors[`additionalContacts.${index}.email`] = 'Invalid email format';
        }
        if (!contact.phone) {
          contactErrors[`additionalContacts.${index}.phone`] = 'Contact phone is required';
        } else if (!phoneRegex.test(contact.phone)) {
          contactErrors[`additionalContacts.${index}.phone`] = 'Invalid phone number format';
        }
      });
    }
    
    if (Object.keys(contactErrors).length > 0) {
      errors.contactPersons = contactErrors;
    }
  } else {
    errors.contactPersons = { primaryContact: 'Contact person information is required' };
  }
  
  // Validate Delegated Authority Section (if present)
  if (data.delegatedAuthority) {
    const delegatedErrors: Record<string, string> = {};
    
    // Check that at least one authorized signer exists
    if (!data.delegatedAuthority.authorizedSigners || data.delegatedAuthority.authorizedSigners.length === 0) {
      delegatedErrors.authorizedSigners = 'At least one authorized signer is required';
    }
    
    if (Object.keys(delegatedErrors).length > 0) {
      errors.delegatedAuthority = delegatedErrors;
    }
  }
  
  return errors;
};

export const getCompletedSections = (data: BasicInformationFormData): string[] => {
  const completed: string[] = [];
  
  // Check Tax Identification completion
  if (data.taxIdentification?.taxIdType) {
    let isComplete = true;
    
    switch (data.taxIdentification.taxIdType) {
      case 'federal_ein':
        isComplete = !!data.taxIdentification.ein && einRegex.test(data.taxIdentification.ein);
        break;
      case 'state_nonprofit':
        isComplete = !!data.taxIdentification.stateEntityState && !!data.taxIdentification.stateEntityNumber;
        break;
      case 'foreign_entity':
        isComplete = !!data.taxIdentification.foreignCountry && !!data.taxIdentification.foreignRegistrationNumber;
        break;
      case 'fiscal_sponsor':
        isComplete = !!data.taxIdentification.fiscalSponsorName && 
                    !!data.taxIdentification.fiscalSponsorEIN && 
                    einRegex.test(data.taxIdentification.fiscalSponsorEIN);
        break;
      case 'no_tax_id':
        isComplete = !!data.taxIdentification.noTaxIdReason;
        break;
    }
    
    if (isComplete) {
      completed.push('taxIdentification');
    }
  }
  
  // Check Organization Identity completion
  if (data.organizationIdentity?.orgLegalName && 
      data.organizationIdentity?.stateOfIncorporation &&
      data.organizationIdentity?.preferredLanguage &&
      data.organizationIdentity?.operatingLanguages?.length > 0) {
    completed.push('organizationIdentity');
  }
  
  // Check Organizational Address completion
  if (data.organizationalAddress?.addresses?.length > 0) {
    const hasMainOffice = data.organizationalAddress.addresses.some(addr => 
      addr.type === 'Main Office' &&
      addr.address && addr.city && addr.state && addr.zipCode && addr.country
    );
    
    if (hasMainOffice) {
      completed.push('organizationalAddress');
    }
  }
  
  // Check Tax Exempt Status completion
  if (data.taxExemptStatus?.is501c3 !== undefined) {
    if (data.taxExemptStatus.is501c3 || data.taxExemptStatus.organizationType) {
      completed.push('taxExemptStatus');
    }
  }
  
  // Check Organizational Communication completion
  if (data.organizationalCommunication?.organizationPhone &&
      data.organizationalCommunication?.primaryEmail &&
      data.organizationalCommunication?.country &&
      phoneRegex.test(data.organizationalCommunication.organizationPhone) &&
      emailRegex.test(data.organizationalCommunication.primaryEmail)) {
    completed.push('organizationalCommunication');
  }
  
  // Check Contact Persons completion
  if (data.contactPersons?.primaryContact?.fullName &&
      data.contactPersons?.primaryContact?.title &&
      data.contactPersons?.primaryContact?.email &&
      data.contactPersons?.primaryContact?.phone &&
      emailRegex.test(data.contactPersons.primaryContact.email) &&
      phoneRegex.test(data.contactPersons.primaryContact.phone)) {
    completed.push('contactPersons');
  }
  
  // Check Delegated Authority completion (optional section)
  if (data.delegatedAuthority) {
    if (data.delegatedAuthority.authorizedSigners?.length > 0) {
      completed.push('delegatedAuthority');
    }
  }
  
  return completed;
};

// Helper function to check if a section has errors
export const sectionHasErrors = (sectionName: string, errors: ValidationErrors): boolean => {
  return errors[sectionName] && Object.keys(errors[sectionName]).length > 0;
};

// Helper function to get field-specific error
export const getFieldError = (sectionName: string, fieldName: string, errors: ValidationErrors): string | undefined => {
  return errors[sectionName]?.[fieldName];
};

// Helper function to check if entire form is valid
export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};

// Helper function to count total errors
export const countErrors = (errors: ValidationErrors): number => {
  return Object.values(errors).reduce((total, sectionErrors) => {
    return total + Object.keys(sectionErrors).length;
  }, 0);
};