/**
 * NetlifyContactService - Handles contact management via Netlify functions
 * Replaces localStorage for contact data persistence
 */

import { PersonContact, OrganizationContact, Contact } from './contactService';
import { netlifySettingsService } from './netlifySettingsService';
import { googleDriveBackupService } from './googleDriveBackupService';
import { logger } from '../utils/logger';

class NetlifyContactService {
  private static instance: NetlifyContactService;
  private readonly STORAGE_KEY = 'nonprofit-contacts';

  private constructor() {
    // Initialize service
  }

  static getInstance(): NetlifyContactService {
    if (!NetlifyContactService.instance) {
      NetlifyContactService.instance = new NetlifyContactService();
    }
    return NetlifyContactService.instance;
  }




  // Get all contacts
  async getContacts(): Promise<Contact[]> {
    try {
      const stored = await netlifySettingsService.get(this.STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        return stored;
      }
      return [];
    } catch (error) {
      logger.error('Failed to get contacts:', error);
      return [];
    }
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
  async getContactById(id: string): Promise<Contact | null> {
    const contacts = await this.getContacts();
    return contacts.find(c => c.id === id) || null;
  }

  // Save contact
  async saveContact(contact: Contact): Promise<Contact> {
    try {
      const currentContacts = await this.getContacts();
      
      // Generate ID if not provided
      if (!contact.id) {
        contact.id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Find existing contact
      const existingIndex = currentContacts.findIndex(c => c.id === contact.id);
      
      // Create saved contact with timestamps
      const savedContact = {
        ...contact,
        updatedAt: new Date().toISOString(),
        createdAt: existingIndex !== -1 ? currentContacts[existingIndex].createdAt : new Date().toISOString()
      };
      
      // Update or add contact
      const updatedContacts = [...currentContacts];
      if (existingIndex !== -1) {
        updatedContacts[existingIndex] = savedContact;
      } else {
        updatedContacts.push(savedContact);
      }
      
      // Save to Netlify settings
      await netlifySettingsService.set(this.STORAGE_KEY, updatedContacts, 'organization');
      
      // Queue for Google Drive backup
      googleDriveBackupService.queueBackup('contacts', updatedContacts);
      
      return savedContact;
    } catch (error) {
      logger.error('Failed to save contact:', error);
      throw error;
    }
  }

  // Delete contact
  async deleteContact(contactId: string): Promise<boolean> {
    try {
      const currentContacts = await this.getContacts();
      const updatedContacts = currentContacts.filter(c => c.id !== contactId);
      await netlifySettingsService.set(this.STORAGE_KEY, updatedContacts, 'organization');
      
      // Queue for Google Drive backup
      googleDriveBackupService.queueBackup('contacts', updatedContacts);
      
      return true;
    } catch (error) {
      logger.error('Failed to delete contact:', error);
      return false;
    }
  }

  // Search contacts
  async searchContacts(query: string): Promise<Contact[]> {
    const contacts = await this.getContacts();
    const lowerQuery = query.toLowerCase();
    
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
          contact.firstName.toLowerCase().includes(lowerQuery) ||
          contact.lastName.toLowerCase().includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          (contact.organization || '').toLowerCase().includes(lowerQuery)
        );
      }
    });
  }

  // Import contacts
  async importContacts(contacts: Contact[]): Promise<number> {
    let imported = 0;
    
    for (const contact of contacts) {
      try {
        await this.saveContact(contact);
        imported++;
      } catch (error) {
        logger.error('Failed to import contact:', contact, error as any);
      }
    }
    
    return imported;
  }

  // Export contacts
  async exportContacts(): Promise<Contact[]> {
    return this.getContacts();
  }

  // Link contacts
  async linkContacts(contactId1: string, contactId2: string): Promise<boolean> {
    try {
      const contact1 = await this.getContactById(contactId1);
      const contact2 = await this.getContactById(contactId2);

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

      await this.saveContact(contact1);
      await this.saveContact(contact2);

      return true;
    } catch (error) {
      logger.error('Failed to link contacts:', error);
      return false;
    }
  }

  // Unlink contacts
  async unlinkContacts(contactId1: string, contactId2: string): Promise<boolean> {
    try {
      const contact1 = await this.getContactById(contactId1);
      const contact2 = await this.getContactById(contactId2);

      if (!contact1 || !contact2) return false;

      // Remove from linkedCards
      if (contact1.linkedCards) {
        contact1.linkedCards = contact1.linkedCards.filter(id => id !== contactId2);
      }
      if (contact2.linkedCards) {
        contact2.linkedCards = contact2.linkedCards.filter(id => id !== contactId1);
      }

      await this.saveContact(contact1);
      await this.saveContact(contact2);

      return true;
    } catch (error) {
      logger.error('Failed to unlink contacts:', error);
      return false;
    }
  }

}

// Export singleton instance
export const netlifyContactService = NetlifyContactService.getInstance();