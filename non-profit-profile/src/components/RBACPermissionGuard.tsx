import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { rbacService, Permission } from '../services/rbacService';
import { logger } from '../utils/logger';

interface RBACPermissionGuardProps {
  permission?: Permission;
  sectionId?: string;
  fieldId?: string;
  userId?: string;
  fallback?: React.ReactNode;
  showWarning?: boolean;
  children: React.ReactNode;
}

export const RBACPermissionGuard: React.FC<RBACPermissionGuardProps> = ({
  permission,
  sectionId,
  fieldId,
  userId,
  fallback,
  showWarning = true,
  children
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission, sectionId, fieldId, userId]);

  const checkPermission = async () => {
    setLoading(true);
    try {
      let allowed = false;

      if (permission) {
        allowed = rbacService.hasPermission(permission, userId);
      } else if (sectionId && fieldId) {
        allowed = rbacService.canEditField(fieldId, userId);
      } else if (sectionId) {
        allowed = rbacService.canEditSection(sectionId, userId);
      } else if (fieldId) {
        allowed = rbacService.canEditField(fieldId, userId);
      } else {
        // Default to checking general edit permission
        allowed = rbacService.hasPermission('edit_all', userId);
      }

      setHasPermission(allowed);
    } catch (error) {
      logger.error('Failed to check permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showWarning) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Access Restricted</p>
              <p className="text-xs text-gray-500">You don't have permission to edit this content</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

interface RBACSectionGuardProps {
  sectionId: string;
  userId?: string;
  children: React.ReactNode;
  viewMode?: boolean;
}

export const RBACSectionGuard: React.FC<RBACSectionGuardProps> = ({
  sectionId,
  userId,
  children,
  viewMode = false
}) => {
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, userId, viewMode]);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const viewAllowed = rbacService.canViewSection(sectionId, userId);
      const editAllowed = rbacService.canEditSection(sectionId, userId);
      
      setCanView(viewAllowed);
      setCanEdit(editAllowed);
    } catch (error) {
      logger.error('Failed to check section permissions:', error);
      setCanView(false);
      setCanEdit(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Section Access Denied</p>
            <p className="text-sm text-red-600">You don't have permission to view this section</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode || canEdit) {
    return <>{children}</>;
  }

  // Can view but not edit
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-50 bg-opacity-50 z-10 rounded-lg"></div>
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 flex items-center gap-2">
          <Eye className="w-4 h-4 text-yellow-700" />
          <span className="text-sm font-medium text-yellow-800">View Only</span>
        </div>
      </div>
      <div className="pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
};

interface RBACFieldGuardProps {
  fieldId: string;
  userId?: string;
  children: React.ReactNode;
  hideWhenNoAccess?: boolean;
}

export const RBACFieldGuard: React.FC<RBACFieldGuardProps> = ({
  fieldId,
  userId,
  children,
  hideWhenNoAccess = false
}) => {
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, userId]);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const viewAllowed = rbacService.canViewField(fieldId, userId);
      const editAllowed = rbacService.canEditField(fieldId, userId);
      
      setCanView(viewAllowed);
      setCanEdit(editAllowed);
    } catch (error) {
      logger.error('Failed to check field permissions:', error);
      setCanView(false);
      setCanEdit(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!canView) {
    if (hideWhenNoAccess) {
      return null;
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <EyeOff className="w-5 h-5 text-gray-400" />
        </div>
        <div className="opacity-0 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  if (canEdit) {
    return <>{children}</>;
  }

  // Can view but not edit - make field read-only
  return (
    <div className="relative">
      <div className="pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 cursor-not-allowed" title="View only - you don't have edit permission"></div>
    </div>
  );
};

interface PermissionBadgeProps {
  userId?: string;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({ userId }) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = rbacService.getUserRole(userId);
    if (role) {
      setUserRole(role.role);
    }
  }, [userId]);

  if (!userRole) return null;

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-orange-100 text-orange-700',
    editor: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[userRole as keyof typeof roleColors]}`}>
      <Shield className="w-3 h-3" />
      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    </div>
  );
};

export default RBACPermissionGuard;