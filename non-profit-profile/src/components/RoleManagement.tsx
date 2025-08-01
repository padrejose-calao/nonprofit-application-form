import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { 
  Shield, Users, Key, Lock, Unlock, UserCheck, 
  UserX, Settings, Save, X, Plus, Trash2, 
  Edit2, Clock, AlertTriangle, Check
} from 'lucide-react';
import { rbacService, Role, Permission, UserRole } from '../services/rbacService';
import { toast } from 'react-toastify';

interface RoleManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  organizationId: string;
}

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: Role;
  customPermissions?: Permission[];
  expiresAt?: Date;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  isOpen,
  onClose,
  currentUserId,
  organizationId
}) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [_userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('viewer');
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');

  const allPermissions: Permission[] = [
    'view_all',
    'edit_all',
    'delete_all',
    'manage_users',
    'manage_roles',
    'view_section',
    'edit_section',
    'lock_section',
    'view_financials',
    'edit_financials',
    'view_governance',
    'edit_governance',
    'export_data',
    'import_data',
    'view_audit_logs',
    'manage_settings'
  ];

  const roleDescriptions: Record<Role, string> = {
    admin: 'Full access to all features and settings',
    manager: 'Can view and edit all sections, manage content',
    editor: 'Can view and edit most sections',
    viewer: 'Read-only access to all sections'
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Initialize RBAC service
      await rbacService.initialize(organizationId, currentUserId);
      
      // Load user roles
      const roles = await rbacService.getAllUserRoles();
      setUserRoles(roles);
      
      // For demo purposes, create sample users
      // In production, this would come from your user management system
      const sampleUsers: UserWithRole[] = [
        { id: '1', name: 'John Admin', email: 'john@example.com' },
        { id: '2', name: 'Jane Manager', email: 'jane@example.com' },
        { id: '3', name: 'Bob Editor', email: 'bob@example.com' },
        { id: '4', name: 'Alice Viewer', email: 'alice@example.com' }
      ];
      
      // Map roles to users
      const usersWithRoles = sampleUsers.map(user => {
        const userRole = roles.find(r => r.userId === user.id);
        return {
          ...user,
          role: userRole?.role,
          customPermissions: userRole?.customPermissions,
          expiresAt: userRole?.expiresAt
        };
      });
      
      setUsers(usersWithRoles);
    } catch (error) {
      logger.error('Failed to load role data:', error);
      toast.error('Failed to load role management data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const success = await rbacService.assignRole(
        selectedUser.id,
        selectedRole,
        customPermissions.length > 0 ? customPermissions : undefined,
        expiresAt ? new Date(expiresAt) : undefined
      );
      
      if (success) {
        toast.success(`Role assigned to ${selectedUser.name}`);
        await loadData();
        setSelectedUser(null);
        setCustomPermissions([]);
        setExpiresAt('');
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      logger.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async (userId: string) => {
    if (!window.confirm('Are you sure you want to revoke this user\'s role?')) return;
    
    setLoading(true);
    try {
      const success = await rbacService.revokeRole(userId);
      
      if (success) {
        toast.success('Role revoked successfully');
        await loadData();
      } else {
        toast.error('Failed to revoke role');
      }
    } catch (error) {
      logger.error('Failed to revoke role:', error);
      toast.error('Failed to revoke role');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: Permission) => {
    setCustomPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              User Roles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Key className="w-4 h-4" />
              Role Definitions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              Permissions
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* User List */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current User Roles</h3>
                    <div className="space-y-3">
                      {users.map(user => (
                        <div key={user.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              {user.role && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.role === 'manager' ? 'bg-orange-100 text-orange-700' :
                                    user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </span>
                                  {user.expiresAt && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Expires {new Date(user.expiresAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.role || 'viewer');
                                setCustomPermissions(user.customPermissions || []);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit role"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.role && (
                              <button
                                onClick={() => handleRevokeRole(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke role"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assign Role Form */}
                  {selectedUser && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Assign Role to {selectedUser.name}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Role
                          </label>
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-600">
                            {roleDescriptions[selectedRole]}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiration Date (Optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Permissions (Optional)
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {allPermissions.map(permission => (
                              <label key={permission} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={customPermissions.includes(permission)}
                                  onChange={() => togglePermission(permission)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">
                                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleAssignRole}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Role
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(null);
                              setCustomPermissions([]);
                              setExpiresAt('');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Role Hierarchy</h3>
                  <div className="space-y-4">
                    {(['admin', 'manager', 'editor', 'viewer'] as Role[]).map(role => {
                      const permissions = rbacService.getRolePermissions(role);
                      return (
                        <div key={role} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                role === 'admin' ? 'bg-red-100' :
                                role === 'manager' ? 'bg-orange-100' :
                                role === 'editor' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                                <Shield className={`w-5 h-5 ${
                                  role === 'admin' ? 'text-red-600' :
                                  role === 'manager' ? 'text-orange-600' :
                                  role === 'editor' ? 'text-blue-600' :
                                  'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 capitalize">{role}</h4>
                                <p className="text-sm text-gray-600">{roleDescriptions[role]}</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {permissions.map(permission => (
                              <div key={permission} className="flex items-center gap-2 text-xs">
                                <Check className="w-3 h-3 text-green-500" />
                                <span className="text-gray-700">
                                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">Permission</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Admin</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Manager</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Editor</th>
                          <th className="border px-4 py-2 text-center text-sm font-medium text-gray-700">Viewer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPermissions.map(permission => (
                          <tr key={permission} className="hover:bg-gray-50">
                            <td className="border px-4 py-2 text-sm text-gray-700">
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            {(['admin', 'manager', 'editor', 'viewer'] as Role[]).map(role => {
                              const hasPermission = rbacService.getRolePermissions(role).includes(permission);
                              return (
                                <td key={role} className="border px-4 py-2 text-center">
                                  {hasPermission ? (
                                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Important Notes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Permissions are cumulative - higher roles inherit all permissions from lower roles</li>
                          <li>Custom permissions can be added to any role for specific use cases</li>
                          <li>Section-specific permissions override general permissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;