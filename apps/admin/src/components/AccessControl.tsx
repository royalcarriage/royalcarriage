/**
 * Access Control Components
 *
 * React components for role-based access control in the UI.
 */

import React from 'react';
import type { Role } from '../types';
import {
  hasPermission,
  isAtLeastRole,
  canPerformAction,
  type Permission,
} from '../lib/permissions';
import { Lock, ShieldAlert, AlertCircle } from 'lucide-react';

interface AccessControlProps {
  role: Role;
  requiredPermission?: Permission;
  requiredRole?: Role;
  action?: string;
  fallback?: React.ReactNode;
  showLock?: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper component that conditionally renders children based on role/permission
 */
export function AccessControl({
  role,
  requiredPermission,
  requiredRole,
  action,
  fallback,
  showLock = false,
  children,
}: AccessControlProps) {
  // Check permission
  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(role, requiredPermission);
  }

  if (requiredRole && hasAccess) {
    hasAccess = isAtLeastRole(role, requiredRole);
  }

  if (action && hasAccess) {
    hasAccess = canPerformAction(role, action);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or lock indicator
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLock) {
    return (
      <div className="inline-flex items-center gap-1 text-slate-400 cursor-not-allowed">
        <Lock className="w-4 h-4" />
        <span className="text-sm">Restricted</span>
      </div>
    );
  }

  return null;
}

/**
 * Button wrapper that disables based on permissions
 */
interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  role: Role;
  action: string;
  children: React.ReactNode;
}

export function ProtectedButton({
  role,
  action,
  children,
  disabled,
  className = '',
  ...props
}: ProtectedButtonProps) {
  const hasAccess = canPerformAction(role, action);
  const isDisabled = disabled || !hasAccess;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={!hasAccess ? 'You do not have permission for this action' : undefined}
    >
      {children}
      {!hasAccess && <Lock className="w-3 h-3 ml-1 inline" />}
    </button>
  );
}

/**
 * Access denied page component
 */
export function AccessDenied({ requiredRole }: { requiredRole?: Role }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="p-4 rounded-full bg-red-100 mb-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-600 max-w-md">
        You don't have permission to access this page.
        {requiredRole && (
          <span className="block mt-1 text-sm">
            Required role: <span className="font-semibold capitalize">{requiredRole}</span>
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * Role badge component
 */
export function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
    editor: 'bg-blue-50 text-blue-700 border-blue-200',
    admin: 'bg-amber-50 text-amber-700 border-amber-200',
    superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const labels: Record<Role, string> = {
    viewer: 'Viewer',
    editor: 'Editor',
    admin: 'Admin',
    superadmin: 'Super Admin',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role]}`}
    >
      {labels[role]}
    </span>
  );
}

/**
 * Permission indicator for action buttons
 */
export function PermissionIndicator({
  role,
  action,
  children,
}: {
  role: Role;
  action: string;
  children: React.ReactNode;
}) {
  const hasAccess = canPerformAction(role, action);

  if (!hasAccess) {
    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Lock className="w-3 h-3" />
            <span>No access</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Admin only wrapper - shortcut for superadmin/admin access
 */
export function AdminOnly({
  role,
  children,
  fallback,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AccessControl role={role} requiredRole="admin" fallback={fallback}>
      {children}
    </AccessControl>
  );
}

/**
 * Super admin only wrapper
 */
export function SuperAdminOnly({
  role,
  children,
  fallback,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AccessControl role={role} requiredRole="superadmin" fallback={fallback}>
      {children}
    </AccessControl>
  );
}

/**
 * Editor+ wrapper (editor, admin, superadmin)
 */
export function EditorOrAbove({
  role,
  children,
  fallback,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AccessControl role={role} requiredRole="editor" fallback={fallback}>
      {children}
    </AccessControl>
  );
}
