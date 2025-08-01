import { toast } from 'react-hot-toast';
import { netlifySettingsService } from './netlifySettingsService';
import { logger } from '../utils/logger';

// Contact Types
export interface PersonContact {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  whatsApp?: string;
  title?: string;
  organization?: string;
  w9OnFile?: boolean;
  type?: 'person' | 'contractor_1099';
  linkedCards?: string[];
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationContact {
  id: string;
  name: string;
  displayName: string;
  taxId: string;
  email: string;
  phone: string;
  website?: string;
  state?: string;
  linkedCards?: string[];
  roles?: string[];
  addresses?: Array<{
    type: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export type Contact = PersonContact | OrganizationContact;

// Contact Service for managing contact persistence
class ContactService {
  private static instance: ContactService;
  private readonly STORAGE_KEY = 'nonprofit-contacts';
  private listeners: ((contacts: Contact[]) => void)[] = [];

  private constructor() {
    // Initialize service
  }

  static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  // Subscribe to contact changes
  subscribe(listener: (contacts: Contact[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(contacts: Contact[]) {
    this.listeners.forEach(listener => listener(contacts));
  }

  // Get all contacts
  async getContacts(): Promise<Contact[]> {
    try {
      const stored = await netlifySettingsService.get(this.STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        return stored;
      }
    } catch (error) {
      logger.error('Failed to load contacts:', error);
    }
    return [];
  }

  // Get person contacts
  async getPersonContacts(): Promise<PersonContact[]> {
    const contacts = await this.getContacts();
    return contacts.filter(
      (contact): contact is PersonContact => !('taxId' in contact)
    );
  }

  // Get organization contacts
  async getOrganizationContacts(): Promise<OrganizationContact[]> {
    const contacts = await this.getContacts();
    return contacts.filter(
      (contact): contact is OrganizationContact => 'taxId' in contact
    );
  }

  // Get contact by ID
  async getContact(id: string): Promise<Contact | null> {
    const contacts = await this.getContacts();
    return contacts.find(contact => contact.id === id) || null;
  }

  // Save contact
  async saveContact(contact: Contact): Promise<Contact> {
    const contacts = await this.getContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    
    const timestamp = new Date().toISOString();
    const updatedContact = {
      ...contact,
      updatedAt: timestamp,
      createdAt: existingIndex === -1 ? timestamp : contact.createdAt || timestamp
    };

    if (existingIndex !== -1) {
      // Update existing
      contacts[existingIndex] = updatedContact;
    } else {
      // Add new
      contacts.push(updatedContact);
    }

    await this.saveContacts(contacts);
    toast.success(`Contact ${this.getContactName(contact)} saved`);
    return updatedContact;
  }

  // Delete contact
  async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return false;

    const contact = contacts[index];
    contacts.splice(index, 1);
    await this.saveContacts(contacts);
    toast.success(`Contact ${this.getContactName(contact)} deleted`);
    return true;
  }

  // Search contacts
  async searchContacts(query: string): Promise<Contact[]> {
    const lowerQuery = query.toLowerCase();
    const contacts = await this.getContacts();
    return contacts.filter(contact => {
      if ('taxId' in contact) {
        // Organization contact
        return (
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.displayName.toLowerCase().includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          contact.taxId.toLowerCase().includes(lowerQuery)
        );
      } else {
        // Person contact
        return (
          contact.displayName.toLowerCase().includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          contact.firstName.toLowerCase().includes(lowerQuery) ||
          contact.lastName.toLowerCase().includes(lowerQuery)
        );
      }
    });
  }

  // Import contacts
  async importContacts(contacts: Contact[]): Promise<number> {
    const existingContacts = await this.getContacts();
    const existingIds = new Set(existingContacts.map(c => c.id));
    
    let imported = 0;
    const timestamp = new Date().toISOString();
    
    contacts.forEach(contact => {
      if (!existingIds.has(contact.id)) {
        existingContacts.push({
          ...contact,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        imported++;
      }
    });

    if (imported > 0) {
      await this.saveContacts(existingContacts);
      toast.success(`Imported ${imported} contacts`);
    }

    return imported;
  }

  // Export contacts
  async exportContacts(): Promise<Contact[]> {
    return await this.getContacts();
  }

  // Link contacts
  async linkContacts(contactId1: string, contactId2: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const contact1 = contacts.find(c => c.id === contactId1);
    const contact2 = contacts.find(c => c.id === contactId2);

    if (!contact1 || !contact2) return false;

    // Add to linkedCards
    if (!contact1.linkedCards) contact1.linkedCards = [];
    if (!contact2.linkedCards) contact2.linkedCards = [];

    if (!contact1.linkedCards.includes(contactId2)) {
      contact1.linkedCards.push(contactId2);
    }
    if (!contact2.linkedCards.includes(contactId1)) {
      contact2.linkedCards.push(contactId1);
    }

    await this.saveContacts(contacts);
    toast.success('Contacts linked successfully');
    return true;
  }

  // Unlink contacts
  async unlinkContacts(contactId1: string, contactId2: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const contact1 = contacts.find(c => c.id === contactId1);
    const contact2 = contacts.find(c => c.id === contactId2);

    if (!contact1 || !contact2) return false;

    // Remove from linkedCards
    if (contact1.linkedCards) {
      contact1.linkedCards = contact1.linkedCards.filter(id => id !== contactId2);
    }
    if (contact2.linkedCards) {
      contact2.linkedCards = contact2.linkedCards.filter(id => id !== contactId1);
    }

    await this.saveContacts(contacts);
    toast.success('Contacts unlinked successfully');
    return true;
  }

  // Convert from ContactManager format
  convertFromContactManager(contact: unknown): Contact {
    const typedContact = contact as any;
    if (typedContact.isOrganization) {
      // Organization contact
      return {
        id: typedContact.id?.toString() || Date.now().toString(),
        name: typedContact.organization || `${typedContact.firstName} ${typedContact.lastName}`.trim(),
        displayName: typedContact.displayName || typedContact.organization || `${typedContact.firstName} ${typedContact.lastName}`.trim(),
        taxId: typedContact.taxId || '',
        email: typedContact.email || '',
        phone: typedContact.phone || '',
        website: typedContact.website || '',
        state: typedContact.state || '',
        linkedCards: typedContact.linkedCards || [],
        roles: typedContact.projectRoles || [],
        addresses: typedContact.address ? [{
          type: 'Main',
          address: typedContact.address || '',
          address2: typedContact.address2 || '',
          city: typedContact.city || '',
          state: typedContact.state || '',
          zipCode: typedContact.zipCode || '',
          country: typedContact.country || 'United States'
        }] : [],
        createdAt: typedContact.createdDate || new Date().toISOString(),
        updatedAt: typedContact.lastModified || new Date().toISOString()
      } as OrganizationContact;
    } else {
      // Person contact
      return {
        id: typedContact.id?.toString() || Date.now().toString(),
        displayName: typedContact.displayName || `${typedContact.firstName} ${typedContact.lastName}`.trim(),
        firstName: typedContact.firstName || '',
        lastName: typedContact.lastName || '',
        email: typedContact.email || '',
        phone: typedContact.phone || '',
        mobile: typedContact.mobile || '',
        whatsApp: typedContact.whatsApp || typedContact.mobile || '',
        title: typedContact.title || '',
        organization: typedContact.organization || '',
        w9OnFile: typedContact.w9OnFile || false,
        type: typedContact.type || 'person',
        linkedCards: typedContact.linkedCards || [],
        roles: typedContact.projectRoles || [],
        createdAt: typedContact.createdDate || new Date().toISOString(),
        updatedAt: typedContact.lastModified || new Date().toISOString()
      } as PersonContact;
    }
  }

  // Convert to ContactManager format
  convertToContactManager(contact: Contact): unknown {
    const baseContact = {
      id: parseInt(contact.id) || Date.now(),
      email: contact.email || '',
      phone: contact.phone || '',
      tags: [],
      notes: '',
      createdDate: contact.createdAt || new Date().toISOString(),
      lastModified: contact.updatedAt || new Date().toISOString(),
      dataCompleteness: 80,
      addressHistory: []
    };

    if ('taxId' in contact) {
      // Organization
      return {
        ...baseContact,
        prefix: '',
        firstName: '',
        lastName: '',
        organization: contact.name,
        title: '',
        mobile: '',
        website: contact.website || '',
        projectRoles: contact.roles || [],
        address: contact.addresses?.[0]?.address || '',
        address2: contact.addresses?.[0]?.address2 || '',
        city: contact.addresses?.[0]?.city || '',
        state: contact.addresses?.[0]?.state || '',
        zipCode: contact.addresses?.[0]?.zipCode || '',
        country: contact.addresses?.[0]?.country || 'United States',
        isOrganization: true,
        displayName: contact.displayName,
        taxId: contact.taxId
      };
    } else {
      // Person
      return {
        ...baseContact,
        prefix: '',
        firstName: contact.firstName,
        lastName: contact.lastName,
        organization: contact.organization || '',
        title: contact.title || '',
        mobile: contact.mobile || '',
        website: '',
        projectRoles: contact.roles || [],
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        isOrganization: false,
        displayName: contact.displayName,
        whatsApp: contact.whatsApp,
        w9OnFile: contact.w9OnFile,
        type: contact.type
      };
    }
  }

  // Private helper methods
  private async saveContacts(contacts: Contact[]) {
    try {
      await netlifySettingsService.set(this.STORAGE_KEY, contacts, 'organization');
      this.notifyListeners(contacts);
    } catch (error) {
      logger.error('Failed to save contacts:', error);
      toast.error('Failed to save contacts');
    }
  }

  private getContactName(contact: Contact): string {
    if ('displayName' in contact && contact.displayName) {
      return contact.displayName;
    } else if ('name' in contact) {
      return contact.name;
    }
    return 'Unknown Contact';
  }
}

// Export singleton instance
export const contactService = ContactService.getInstance();

// Export default for backward compatibility
export default contactService;