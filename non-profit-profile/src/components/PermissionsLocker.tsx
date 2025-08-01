import React, { useState, useContext, createContext, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Shield, 
  User, 
  Users, 
  Eye, 
  Edit3, 
  Download,
  Settings,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

// Permission Types
export type UserRole = 'super_admin' | 'admin' | 'user' | 'viewer';

export interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  download: boolean;
  print: boolean;
  lock: boolean;
  unlock: boolean;
}

export interface UserPermissions {
  role: UserRole;
  assignedProfiles?: string[]; // For admin role
  permissions: {
    global: Permission;
    sections?: Record<string, Permission>;
  };
}

// Default permissions by role
const defaultPermissions: Record<UserRole, Permission> = {
  super_admin: {
    read: true,
    write: true,
    delete: true,
    download: true,
    print: true,
    lock: true,
    unlock: true
  },
  admin: {
    read: true,
    write: true,
    delete: true,
    download: true,
    print: true,
    lock: true,
    unlock: true
  },
  user: {
    read: true,
    write: true,
    delete: false,
    download: true,
    print: true,
    lock: true,
    unlock: true
  },
  viewer: {
    read: true,
    write: false,
    delete: false,
    download: false,
    print: false,
    lock: false,
    unlock: false
  }
};

// Context
interface PermissionsContextType {
  currentUser: UserPermissions | null;
  sectionLocks: Record<string, boolean>;
  checkPermission: (action: keyof Permission, section?: string) => boolean;
  lockSection: (sectionId: string) => void;
  unlockSection: (sectionId: string) => void;
  isLocked: (sectionId: string) => boolean;
  updateUserRole: (userId: string, role: UserRole) => void;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};

// Provider Component
interface PermissionsProviderProps {
  children: React.ReactNode;
  currentUserId: string;
  currentUserRole?: UserRole;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  children,
  currentUserId,
  currentUserRole = 'user'
}) => {
  const [currentUser, setCurrentUser] = useState<UserPermissions>({
    role: currentUserRole,
    permissions: {
      global: defaultPermissions[currentUserRole]
    }
  });

  const [sectionLocks, setSectionLocks] = useState<Record<string, boolean>>({});

  // Load saved locks from localStorage
  useEffect(() => {
    const savedLocks = localStorage.getItem('sectionLocks');
    if (savedLocks) {
      setSectionLocks(JSON.parse(savedLocks));
    }
  }, []);

  // Save locks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sectionLocks', JSON.stringify(sectionLocks));
  }, [sectionLocks]);

  const checkPermission = (action: keyof Permission, section?: string): boolean => {
    if (!currentUser) return false;

    // Super admin always has all permissions
    if (currentUser.role === 'super_admin') return true;

    // Check section-specific permissions first
    if (section && currentUser.permissions.sections?.[section]) {
      return currentUser.permissions.sections[section][action];
    }

    // Admin can only access assigned profiles
    if (currentUser.role === 'admin' && section && currentUser.assignedProfiles) {
      if (!currentUser.assignedProfiles.includes(section)) {
        return false;
      }
    }

    // Fall back to global permissions
    return currentUser.permissions.global[action];
  };

  const lockSection = (sectionId: string) => {
    if (!checkPermission('lock', sectionId)) {
      toast.error('You do not have permission to lock this section');
      return;
    }

    setSectionLocks(prev => ({ ...prev, [sectionId]: true }));
    toast.success('Section locked successfully');
  };

  const unlockSection = (sectionId: string) => {
    if (!checkPermission('unlock', sectionId)) {
      toast.error('You do not have permission to unlock this section');
      return;
    }

    setSectionLocks(prev => ({ ...prev, [sectionId]: false }));
    toast.success('Section unlocked successfully');
  };

  const isLocked = (sectionId: string): boolean => {
    return sectionLocks[sectionId] || false;
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    if (!checkPermission('write')) {
      toast.error('You do not have permission to change user roles');
      return;
    }

    // In a real app, this would update the backend
    setCurrentUser({
      role,
      permissions: {
        global: defaultPermissions[role]
      }
    });
    toast.success('User role updated successfully');
  };

  return (
    <PermissionsContext.Provider
      value={{
        currentUser,
        sectionLocks,
        checkPermission,
        lockSection,
        unlockSection,
        isLocked,
        updateUserRole
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

// Section Lock Component
interface SectionLockProps {
  sectionId: string;
  position?: 'top' | 'bottom' | 'both';
  className?: string;
}

export const SectionLock: React.FC<SectionLockProps> = ({
  sectionId,
  position = 'both',
  className = ''
}) => {
  const { isLocked, lockSection, unlockSection, checkPermission } = usePermissions();
  const locked = isLocked(sectionId);
  const canLock = checkPermission('lock', sectionId);
  const canUnlock = checkPermission('unlock', sectionId);

  const handleToggle = () => {
    if (locked && canUnlock) {
      unlockSection(sectionId);
    } else if (!locked && canLock) {
      lockSection(sectionId);
    }
  };

  const LockButton = () => (
    <button
      onClick={handleToggle}
      disabled={locked ? !canUnlock : !canLock}
      className={`p-2 rounded-lg transition-colors ${
        locked 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={locked ? 'Unlock section' : 'Lock section'}
    >
      {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
    </button>
  );

  if (position === 'both') {
    return (
      <>
        <div className="flex justify-end mb-2">
          <LockButton />
        </div>
        <div className="flex justify-end mt-2">
          <LockButton />
        </div>
      </>
    );
  }

  return <LockButton />;
};

// Permissions Admin Panel
export const PermissionsAdminPanel: React.FC = () => {
  const { currentUser, updateUserRole } = usePermissions();
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  if (currentUser?.role !== 'super_admin') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 left-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Permissions Settings"
      >
        <Shield className="h-5 w-5" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Permissions Management</h2>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Role Overview */}
                <div>
                  <h3 className="text-lg font-medium mb-4">User Roles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(defaultPermissions).map(([role, permissions]) => (
                      <div
                        key={role}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedRole(role as UserRole)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {role.replace('_', ' ')}
                          </h4>
                          {role === 'super_admin' && (
                            <Shield className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          {Object.entries(permissions).map(([perm, allowed]) => (
                            <div key={perm} className="flex items-center gap-2">
                              {allowed ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <X className="h-3 w-3 text-red-600" />
                              )}
                              <span className="capitalize">{perm}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Details */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Role Details</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium capitalize mb-3">
                      {selectedRole.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      {selectedRole === 'super_admin' && (
                        <p className="text-sm text-gray-600">
                          Full access to all profiles and system settings. Can manage all users and permissions.
                        </p>
                      )}
                      {selectedRole === 'admin' && (
                        <p className="text-sm text-gray-600">
                          Access to assigned profiles only. Can manage content within assigned profiles.
                        </p>
                      )}
                      {selectedRole === 'user' && (
                        <p className="text-sm text-gray-600">
                          Can read and write content within their profile. Cannot delete content or manage users.
                        </p>
                      )}
                      {selectedRole === 'viewer' && (
                        <p className="text-sm text-gray-600">
                          View-only access. Cannot download or print content. No editing capabilities.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Important Note</p>
                      <p className="text-yellow-700 mt-1">
                        Changing user permissions affects their ability to access and modify content. 
                        Ensure you understand the implications before making changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPanel(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper component to check permissions before rendering
interface PermissionGateProps {
  permission: keyof Permission;
  section?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  section,
  children,
  fallback = null
}) => {
  const { checkPermission } = usePermissions();

  if (checkPermission(permission, section)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};