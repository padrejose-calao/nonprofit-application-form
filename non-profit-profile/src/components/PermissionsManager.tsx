import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Lock, Unlock, Shield, Users, Settings, Eye, 
  EyeOff, Edit2, Download, Share2, Trash2, 
  Check, X, Plus, Search, Filter, AlertCircle,
  CheckCircle, Clock, User, Crown, Star, Key
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';

// Permission types
type PermissionType = 'read' | 'write' | 'delete' | 'share' | 'download' | 'admin';

// User roles
type UserRole = 'super_admin' | 'admin' | 'user' | 'viewer';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: PermissionType[];
  profiles: string[]; // Profile IDs user has access to
}

// Permission settings for a resource
interface ResourcePermissions {
  id: string;
  name: string;
  type: 'section' | 'document' | 'profile' | 'module';
  isLocked: boolean;
  owner: string;
  permissions: Record<string, PermissionType[]>; // userId -> permissions
  publicAccess: boolean;
  requiresApproval: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  expiresAt?: Date;
}

// Context for permissions
interface PermissionsContextType {
  currentUser: User | null;
  users: User[];
  resources: ResourcePermissions[];
  hasPermission: (resourceId: string, permission: PermissionType) => boolean;
  lockResource: (resourceId: string) => Promise<void>;
  unlockResource: (resourceId: string) => Promise<void>;
  updatePermissions: (resourceId: string, userId: string, permissions: PermissionType[]) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

// Permissions Provider Component
export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<ResourcePermissions[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize permissions data
  useEffect(() => {
    loadPermissionsData();
  }, []);

  const loadPermissionsData = async () => {
    setLoading(true);
    try {
      // Mock data - in reality, this would come from an API
      const mockCurrentUser: User = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'super_admin',
        isActive: true,
        permissions: ['read', 'write', 'delete', 'share', 'download', 'admin'],
        profiles: ['profile1', 'profile2'],
        lastLogin: new Date()
      };

      const mockUsers: User[] = [
        mockCurrentUser,
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          isActive: true,
          permissions: ['read', 'write', 'share', 'download'],
          profiles: ['profile1'],
          lastLogin: new Date('2024-01-15')
        },
        {
          id: 'user3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'user',
          isActive: true,
          permissions: ['read', 'write'],
          profiles: ['profile1'],
          lastLogin: new Date('2024-01-14')
        },
        {
          id: 'user4',
          name: 'Alice Brown',
          email: 'alice@example.com',
          role: 'viewer',
          isActive: true,
          permissions: ['read'],
          profiles: ['profile1'],
          lastLogin: new Date('2024-01-13')
        }
      ];

      const mockResources: ResourcePermissions[] = [
        {
          id: 'basic-info',
          name: 'Basic Information',
          type: 'section',
          isLocked: false,
          owner: 'user1',
          permissions: {
            'user1': ['read', 'write', 'delete', 'admin'],
            'user2': ['read', 'write'],
            'user3': ['read', 'write'],
            'user4': ['read']
          },
          publicAccess: false,
          requiresApproval: false
        },
        {
          id: 'governance',
          name: 'Governance',
          type: 'section',
          isLocked: true,
          owner: 'user1',
          permissions: {
            'user1': ['read', 'write', 'delete', 'admin'],
            'user2': ['read', 'write'],
            'user3': ['read'],
            'user4': ['read']
          },
          publicAccess: false,
          requiresApproval: true,
          lockedBy: 'user1',
          lockedAt: new Date()
        }
      ];

      setCurrentUser(mockCurrentUser);
      setUsers(mockUsers);
      setResources(mockResources);
    } catch (error) {
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has permission for a resource
  const hasPermission = (resourceId: string, permission: PermissionType): boolean => {
    if (!currentUser) return false;

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return false;

    // Super admin has all permissions
    if (currentUser.role === 'super_admin') return true;

    // Check if resource is locked
    if (resource.isLocked && resource.lockedBy !== currentUser.id) {
      return permission === 'read' && currentUser.permissions?.includes('read');
    }

    // Check user's permissions for this resource
    const userPermissions = resource.permissions[currentUser.id] || [];
    return userPermissions?.includes(permission) || false;
  };

  // Lock a resource
  const lockResource = async (resourceId: string): Promise<void> => {
    if (!currentUser || !hasPermission(resourceId, 'admin')) {
      toast.error('You do not have permission to lock this resource');
      return;
    }

    try {
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { 
              ...resource, 
              isLocked: true, 
              lockedBy: currentUser.id,
              lockedAt: new Date()
            }
          : resource
      ));

      toast.success('Resource locked successfully');
    } catch (error) {
      toast.error('Failed to lock resource');
    }
  };

  // Unlock a resource
  const unlockResource = async (resourceId: string): Promise<void> => {
    if (!currentUser) return;

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    // Check if user can unlock (admin permission or is the one who locked it)
    if (!hasPermission(resourceId, 'admin') && resource.lockedBy !== currentUser.id) {
      toast.error('You do not have permission to unlock this resource');
      return;
    }

    try {
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              isLocked: false, 
              lockedBy: undefined,
              lockedAt: undefined
            }
          : r
      ));

      toast.success('Resource unlocked successfully');
    } catch (error) {
      toast.error('Failed to unlock resource');
    }
  };

  // Update permissions for a user on a resource
  const updatePermissions = async (
    resourceId: string, 
    userId: string, 
    permissions: PermissionType[]
  ): Promise<void> => {
    if (!currentUser || !hasPermission(resourceId, 'admin')) {
      toast.error('You do not have permission to update permissions');
      return;
    }

    try {
      setResources(prev => prev.map(resource => 
        resource.id === resourceId 
          ? { 
              ...resource, 
              permissions: {
                ...resource.permissions,
                [userId]: permissions
              }
            }
          : resource
      ));

      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  // Add a new user
  const addUser = async (userData: Omit<User, 'id'>): Promise<void> => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      toast.error('Only super admins can add users');
      return;
    }

    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString()
      };

      setUsers(prev => [...prev, newUser]);
      toast.success('User added successfully');
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  // Update a user
  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.id !== userId)) {
      toast.error('You do not have permission to update this user');
      return;
    }

    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  // Delete a user
  const deleteUser = async (userId: string): Promise<void> => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      toast.error('Only super admins can delete users');
      return;
    }

    if (userId === currentUser.id) {
      toast.error('You cannot delete yourself');
      return;
    }

    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Remove user from all resource permissions
      setResources(prev => prev.map(resource => ({
        ...resource,
        permissions: Object.fromEntries(
          Object.entries(resource.permissions).filter(([id]) => id !== userId)
        )
      })));

      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const value: PermissionsContextType = {
    currentUser,
    users,
    resources,
    hasPermission,
    lockResource,
    unlockResource,
    updatePermissions,
    addUser,
    updateUser,
    deleteUser
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook to use permissions context
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Section Lock Component
interface SectionLockProps {
  resourceId: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SectionLock: React.FC<SectionLockProps> = ({
  resourceId,
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const { hasPermission, lockResource, unlockResource, resources, currentUser } = usePermissions();
  const resource = resources.find(r => r.id === resourceId);
  
  if (!resource) return null;

  const canLock = hasPermission(resourceId, 'admin');
  const isLocked = resource.isLocked;
  const isLockedByCurrentUser = resource.lockedBy === currentUser?.id;
  
  const handleToggleLock = async () => {
    if (isLocked) {
      await unlockResource(resourceId);
    } else {
      await lockResource(resourceId);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleToggleLock}
        disabled={!canLock}
        className={`${buttonSize} rounded-lg transition-colors ${
          isLocked
            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
            : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
        } ${!canLock ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isLocked ? 'Unlock section' : 'Lock section'}
      >
        {isLocked ? (
          <Lock className={iconSize} />
        ) : (
          <Unlock className={iconSize} />
        )}
      </button>
      
      {showLabel && (
        <div className="text-sm">
          {isLocked ? (
            <span className="text-red-600">
              Locked {isLockedByCurrentUser ? 'by you' : `by ${resource.lockedBy}`}
            </span>
          ) : (
            <span className="text-gray-600">Unlocked</span>
          )}
        </div>
      )}
    </div>
  );
};

// Permissions Manager Component
interface PermissionsManagerProps {
  resourceId: string;
  onClose?: () => void;
}

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  resourceId,
  onClose
}) => {
  const { 
    users, 
    resources, 
    updatePermissions, 
    hasPermission,
    currentUser 
  } = usePermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const { confirm, ConfirmationComponent } = useConfirmation();

  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return null;

  const canManagePermissions = hasPermission(resourceId, 'admin');

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handlePermissionChange = async (userId: string, permission: PermissionType, granted: boolean) => {
    if (!canManagePermissions) {
      toast.error('You do not have permission to manage permissions');
      return;
    }

    const currentPermissions = resource.permissions[userId] || [];
    const newPermissions = granted
      ? [...currentPermissions, permission]
      : currentPermissions.filter(p => p !== permission);

    await updatePermissions(resourceId, userId, newPermissions);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'user': return <User className="w-4 h-4 text-green-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'user': return 'User';
      case 'viewer': return 'Viewer';
      default: return 'Unknown';
    }
  };

  const permissionLabels: Record<PermissionType, string> = {
    read: 'Read',
    write: 'Write',
    delete: 'Delete',
    share: 'Share',
    download: 'Download',
    admin: 'Admin'
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Permissions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {resource.name} - {resource.type}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userPermissions = resource.permissions[user.id] || [];
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm font-medium text-gray-700">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Permissions Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(permissionLabels).map(([permission, label]) => {
                      const hasPermission = userPermissions?.includes(permission as PermissionType) || false;
                      const isDisabled = !canManagePermissions || 
                                       (user.role === 'super_admin' && permission === 'admin') ||
                                       (isCurrentUser && permission === 'admin');
                      
                      return (
                        <label
                          key={permission}
                          className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                            hasPermission
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={(e) => handlePermissionChange(
                              user.id, 
                              permission as PermissionType, 
                              e.target.checked
                            )}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

// Permission Guard Component
interface PermissionGuardProps {
  resourceId: string;
  permission: PermissionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resourceId,
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(resourceId, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionsManager;