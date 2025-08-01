import { ContactCard } from '../components/BasicInformation2/types';
import { logger } from './logger';

/**
 * VCF (vCard) utility functions for contact card import/export
 * Implements vCard 3.0 specification for maximum compatibility
 */

export interface VCFData {
  version: string;
  fn?: string; // Full Name
  n?: string; // Name components (Last;First;Middle;Prefix;Suffix)
  org?: string; // Organization
  title?: string; // Job Title
  email?: string; // Email address
  tel?: string; // Phone number
  adr?: string; // Address (;;Street;City;State;Postal;Country)
  note?: string; // Notes
  uid?: string; // Unique identifier
  rev?: string; // Revision timestamp
}

/**
 * Convert ContactCard to VCF format string
 */
export function contactCardToVCF(contactCard: ContactCard): string {
  const lines: string[] = [];
  
  // VCF Header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  
  // Full Name (FN is required)
  lines.push(`FN:${escapeVCFValue(contactCard.displayName || contactCard.name)}`);
  
  // Name components for person
  if (contactCard.type === 'person') {
    // Parse name into components if possible
    const nameParts = contactCard.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    lines.push(`N:${escapeVCFValue(lastName)};${escapeVCFValue(firstName)};;;`);
  } else {
    // For organizations, use organization name in N field
    lines.push(`N:${escapeVCFValue(contactCard.name)};;;;`);
  }
  
  // Organization
  if (contactCard.type === 'organization') {
    lines.push(`ORG:${escapeVCFValue(contactCard.name)}`);
  } else if (contactCard.organization) {
    lines.push(`ORG:${escapeVCFValue(contactCard.organization)}`);
  }
  
  // Title/Position
  if (contactCard.title) {
    lines.push(`TITLE:${escapeVCFValue(contactCard.title)}`);
  }
  
  // Email
  if (contactCard.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCFValue(contactCard.email)}`);
  }
  
  // Phone
  if (contactCard.phone) {
    lines.push(`TEL;TYPE=VOICE:${escapeVCFValue(contactCard.phone)}`);
  }
  
  // Address
  if (contactCard.address) {
    const addr = contactCard.address;
    const adrValue = `;;${escapeVCFValue(addr.street || '')};${escapeVCFValue(addr.city || '')};${escapeVCFValue(addr.state || '')};${escapeVCFValue(addr.zipCode || '')};${escapeVCFValue(addr.country || 'United States')}`;
    lines.push(`ADR;TYPE=WORK:${adrValue}`);
  }
  
  // Notes (include roles, tax ID, etc.)
  const notes: string[] = [];
  if (contactCard.roles && contactCard.roles.length > 0) {
    notes.push(`Roles: ${contactCard.roles.join(', ')}`);
  }
  if (contactCard.taxId) {
    notes.push(`Tax ID: ${contactCard.taxId}`);
  }
  if (contactCard.w9OnFile) {
    notes.push('W-9 on file');
  }
  if (notes.length > 0) {
    lines.push(`NOTE:${escapeVCFValue(notes.join(' | '))}`);
  }
  
  // Unique identifier
  lines.push(`UID:${contactCard.id}`);
  
  // Revision timestamp
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  
  // VCF Footer
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

/**
 * Parse VCF string and convert to ContactCard
 */
export function vcfToContactCard(vcfContent: string): ContactCard | null {
  try {
    const lines = vcfContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter(line => line.trim());
    
    const vcfData: Partial<VCFData> = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const field = line.substring(0, colonIndex).toUpperCase();
      const value = unescapeVCFValue(line.substring(colonIndex + 1));
      
      // Handle field parameters (e.g., EMAIL;TYPE=INTERNET)
      const fieldParts = field.split(';');
      const fieldName = fieldParts[0];
      
      switch (fieldName) {
        case 'FN':
          vcfData.fn = value;
          break;
        case 'N':
          vcfData.n = value;
          break;
        case 'ORG':
          vcfData.org = value;
          break;
        case 'TITLE':
          vcfData.title = value;
          break;
        case 'EMAIL':
          vcfData.email = value;
          break;
        case 'TEL':
          vcfData.tel = value;
          break;
        case 'ADR':
          vcfData.adr = value;
          break;
        case 'NOTE':
          vcfData.note = value;
          break;
        case 'UID':
          vcfData.uid = value;
          break;
        case 'REV':
          vcfData.rev = value;
          break;
      }
    }
    
    // Convert VCF data to ContactCard
    const contactCard: ContactCard = {
      id: vcfData.uid || `imported-${Date.now()}`,
      type: vcfData.org ? 'organization' : 'person',
      name: vcfData.fn || '',
      displayName: vcfData.fn || '',
      email: vcfData.email,
      phone: vcfData.tel,
      title: vcfData.title,
      organization: vcfData.org,
    };
    
    // Parse address if available
    if (vcfData.adr) {
      const addrParts = vcfData.adr.split(';');
      if (addrParts.length >= 7) {
        contactCard.address = {
          street: addrParts[2] || '',
          city: addrParts[3] || '',
          state: addrParts[4] || '',
          zipCode: addrParts[5] || '',
          country: addrParts[6] || 'United States'
        };
      }
    }
    
    // Parse notes for additional information
    if (vcfData.note) {
      const notes = vcfData.note.split(' | ');
      const roles: string[] = [];
      
      for (const note of notes) {
        if (note.startsWith('Roles: ')) {
          roles.push(...note.substring(7).split(', '));
        } else if (note.startsWith('Tax ID: ')) {
          contactCard.taxId = note.substring(8);
        } else if (note === 'W-9 on file') {
          contactCard.w9OnFile = true;
        }
      }
      
      if (roles.length > 0) {
        contactCard.roles = roles;
      }
    }
    
    return contactCard;
  } catch (error) {
    logger.error('Error parsing VCF:', error);
    return null;
  }
}

/**
 * Export multiple contact cards as a single VCF file
 */
export function exportMultipleContactsToVCF(contactCards: ContactCard[]): string {
  return contactCards
    .map(card => contactCardToVCF(card))
    .join('\r\n\r\n');
}

/**
 * Parse multiple VCF entries from a single file
 */
export function parseMultipleVCF(vcfContent: string): ContactCard[] {
  const vcardBlocks = vcfContent
    .split(/BEGIN:VCARD/i)
    .slice(1) // Remove empty first element
    .map(block => 'BEGIN:VCARD' + block);
  
  return vcardBlocks
    .map(block => vcfToContactCard(block))
    .filter((card): card is ContactCard => card !== null);
}

/**
 * Download VCF content as a file
 */
export function downloadVCF(vcfContent: string, filename: string = 'contacts.vcf'): void {
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Escape special characters for VCF format
 */
function escapeVCFValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')   // Escape backslashes
    .replace(/;/g, '\\;')     // Escape semicolons
    .replace(/,/g, '\\,')     // Escape commas
    .replace(/\n/g, '\\n')    // Escape newlines
    .replace(/\r/g, '');      // Remove carriage returns
}

/**
 * Unescape VCF special characters
 */
function unescapeVCFValue(value: string): string {
  return value
    .replace(/\\n/g, '\n')    // Unescape newlines
    .replace(/\\,/g, ',')     // Unescape commas
    .replace(/\\;/g, ';')     // Unescape semicolons
    .replace(/\\\\/g, '\\');  // Unescape backslashes
}