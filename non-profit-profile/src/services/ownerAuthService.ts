/**
 * Owner Authentication Service
 * Manages hardcoded owner/superuser accounts with protected access
 */

import { logger } from '../utils/logger';

export interface OwnerAccount {
  id: string;
  name: string;
  emails: string[];
  primaryEmail: string;
  role: 'owner' | 'superuser';
  permissions: string[];
  isProtected: boolean; // Cannot be removed or modified
}

// Hardcoded owner accounts - NEVER remove or modify these
const PROTECTED_OWNERS: OwnerAccount[] = [
  {
    id: 'OWNER_001',
    name: 'Jose Rodriguez',
    emails: ['jose@calao.com', 'padrejoserodriguez.fl@gmail.com', 'jose@calao.co'],
    primaryEmail: 'jose@calao.co',
    role: 'owner',
    permissions: ['*'], // All permissions
    isProtected: true
  },
  {
    id: 'OWNER_002', 
    name: 'Henry Mendoza',
    emails: ['henry@calao.co', 'henry@renacer.live'],
    primaryEmail: 'henry@calao.co',
    role: 'owner',
    permissions: ['*'], // All permissions
    isProtected: true
  }
];

class OwnerAuthService {
  /**
   * Check if an email belongs to a protected owner account
   */
  isProtectedOwner(email: string): boolean {
    if (!email) return false;
    
    const normalizedEmail = email.toLowerCase().trim();
    return PROTECTED_OWNERS.some(owner => 
      owner.emails.some(ownerEmail => 
        ownerEmail.toLowerCase() === normalizedEmail
      )
    );
  }

  /**
   * Get owner account by email
   */
  getOwnerByEmail(email: string): OwnerAccount | null {
    if (!email) return null;
    
    const normalizedEmail = email.toLowerCase().trim();
    return PROTECTED_OWNERS.find(owner =>
      owner.emails.some(ownerEmail =>
        ownerEmail.toLowerCase() === normalizedEmail
      )
    ) || null;
  }

  /**
   * Verify if a user can modify another user
   * Protected owners cannot be modified by anyone
   */
  canModifyUser(modifierEmail: string, targetEmail: string): boolean {
    // Check if target is a protected owner
    if (this.isProtectedOwner(targetEmail)) {
      logger.warn(`Attempt to modify protected owner account: ${targetEmail}`);
      return false;
    }
    
    // Protected owners can modify anyone (except other protected owners)
    if (this.isProtectedOwner(modifierEmail)) {
      return true;
    }
    
    return true; // Regular permission checks apply
  }

  /**
   * Verify if a user can revoke access
   * Protected owners cannot have their access revoked
   */
  canRevokeAccess(revokerEmail: string, targetEmail: string): boolean {
    if (this.isProtectedOwner(targetEmail)) {
      logger.warn(`Attempt to revoke access for protected owner: ${targetEmail}`);
      return false;
    }
    
    return true; // Regular permission checks apply
  }

  /**
   * Get all owner emails for authentication
   */
  getAllOwnerEmails(): string[] {
    return PROTECTED_OWNERS.flatMap(owner => owner.emails);
  }

  /**
   * Authenticate via Google OAuth
   * Returns owner account if email matches
   */
  authenticateGoogleUser(googleProfile: {
    email: string;
    name?: string;
    picture?: string;
  }): { isOwner: boolean; account: OwnerAccount | null } {
    const account = this.getOwnerByEmail(googleProfile.email);
    
    if (account) {
      logger.info(`Owner authenticated: ${account.name} (${googleProfile.email})`);
      return { isOwner: true, account };
    }
    
    return { isOwner: false, account: null };
  }

  /**
   * Get owner permissions
   * Owners have all permissions by default
   */
  getOwnerPermissions(email: string): string[] {
    const owner = this.getOwnerByEmail(email);
    return owner ? owner.permissions : [];
  }
}

// Export singleton instance
export const ownerAuthService = new OwnerAuthService();