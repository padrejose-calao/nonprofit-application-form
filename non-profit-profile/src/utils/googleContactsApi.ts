/**
 * Google Contacts API integration for contact management
 * Provides search, import, and sync capabilities
 */

import { ContactCard } from '../components/BasicInformation2/types';
import { logger } from './logger';

interface GoogleContact {
  resourceName: string;
  etag: string;
  names?: Array<{
    displayName: string;
    familyName?: string;
    givenName?: string;
    middleName?: string;
    honorificPrefix?: string;
    honorificSuffix?: string;
  }>;
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
  }>;
  addresses?: Array<{
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    type?: string;
  }>;
}

interface GoogleContactsResponse {
  connections: GoogleContact[];
  nextPageToken?: string;
  totalItems?: number;
}

export class GoogleContactsIntegration {
  private static instance: GoogleContactsIntegration;
  private accessToken: string | null = null;
  private isInitialized = false;

  static getInstance(): GoogleContactsIntegration {
    if (!GoogleContactsIntegration.instance) {
      GoogleContactsIntegration.instance = new GoogleContactsIntegration();
    }
    return GoogleContactsIntegration.instance;
  }

  /**
   * Initialize Google Contacts API
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize Google API
      if (typeof window !== 'undefined' && (window as any).gapi) {
        await new Promise((resolve) => {
          (window as any).gapi.load('auth2', resolve);
        });

        const authInstance = (window as any).gapi.auth2.getAuthInstance();
        if (!authInstance) {
          await (window as any).gapi.auth2.init({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/contacts.readonly'
          });
        }

        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to initialize Google Contacts API:', error);
      return false;
    }
  }

  /**
   * Authenticate user with Google
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        const user = await authInstance.signIn();
        this.accessToken = user.getAuthResponse().access_token;
      } else {
        const user = authInstance.currentUser.get();
        this.accessToken = user.getAuthResponse().access_token;
      }

      return true;
    } catch (error) {
      logger.error('Google authentication failed:', error);
      return false;
    }
  }

  /**
   * Search Google Contacts
   */
  async searchContacts(query: string, limit: number = 20): Promise<ContactCard[]> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication failed');
        }
      }

      const response = await fetch(
        `https://people.googleapis.com/v1/people/me/connections?` +
        `personFields=names,emailAddresses,phoneNumbers,organizations,addresses&` +
        `pageSize=${limit}&` +
        `query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Contacts API error: ${response.status}`);
      }

      const data: GoogleContactsResponse = await response.json();
      return this.convertGoogleContactsToContactCards(data.connections || []);
    } catch (error) {
      logger.error('Failed to search Google Contacts:', error);
      return [];
    }
  }

  /**
   * Import all Google Contacts
   */
  async importAllContacts(pageSize: number = 100): Promise<ContactCard[]> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication failed');
        }
      }

      const allContacts: ContactCard[] = [];
      let nextPageToken: string | undefined;

      do {
        const url = new URL('https://people.googleapis.com/v1/people/me/connections');
        url.searchParams.set('personFields', 'names,emailAddresses,phoneNumbers,organizations,addresses');
        url.searchParams.set('pageSize', pageSize.toString());
        if (nextPageToken) {
          url.searchParams.set('pageToken', nextPageToken);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Google Contacts API error: ${response.status}`);
        }

        const data: GoogleContactsResponse = await response.json();
        const contacts = this.convertGoogleContactsToContactCards(data.connections || []);
        allContacts.push(...contacts);

        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      return allContacts;
    } catch (error) {
      logger.error('Failed to import Google Contacts:', error);
      return [];
    }
  }

  /**
   * Convert Google Contacts to ContactCard format
   */
  private convertGoogleContactsToContactCards(googleContacts: GoogleContact[]): ContactCard[] {
    return googleContacts.map((contact, index) => {
      const name = contact.names?.[0];
      const email = contact.emailAddresses?.[0];
      const phone = contact.phoneNumbers?.[0];
      const org = contact.organizations?.[0];
      const address = contact.addresses?.[0];

      const contactCard: ContactCard = {
        id: contact.resourceName || `google-${Date.now()}-${index}`,
        type: org?.name ? 'organization' : 'person',
        name: name?.displayName || 'Unknown',
        displayName: name?.displayName || 'Unknown',
        email: email?.value,
        phone: phone?.value,
        title: org?.title,
        organization: org?.name,
      };

      // Add address if available
      if (address) {
        contactCard.address = {
          street: address.streetAddress || '',
          city: address.city || '',
          state: address.region || '',
          zipCode: address.postalCode || '',
          country: address.country || 'United States'
        };
      }

      // Add enhanced name structure for persons
      if (contactCard.type === 'person' && name) {
        contactCard.personName = {
          prefix: name.honorificPrefix,
          firstName: name.givenName || '',
          middleName: name.middleName,
          lastNameFirst: name.familyName || '',
          suffix: name.honorificSuffix,
          preferredDisplayName: name.displayName
        };
      }

      return contactCard;
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    try {
      if (!this.isInitialized || typeof window === 'undefined') return false;
      
      const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
      return authInstance?.isSignedIn?.get() || false;
    } catch {
      return false;
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    try {
      if (this.isInitialized && typeof window !== 'undefined') {
        const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
        if (authInstance) {
          await authInstance.signOut();
        }
      }
      this.accessToken = null;
    } catch (error) {
      logger.error('Failed to sign out:', error);
    }
  }
}

/**
 * Hook for using Google Contacts integration in React components
 */
export function useGoogleContacts() {
  const api = GoogleContactsIntegration.getInstance();

  return {
    initialize: () => api.initialize(),
    authenticate: () => api.authenticate(),
    searchContacts: (query: string, limit?: number) => api.searchContacts(query, limit),
    importAllContacts: (pageSize?: number) => api.importAllContacts(pageSize),
    isAuthenticated: () => api.isAuthenticated(),
    signOut: () => api.signOut()
  };
}