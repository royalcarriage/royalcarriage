import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasPermission } from '@/lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = UserRole.VIEWER,
  redirectTo = '/login' 
}) => {
  const { user, userData, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userData) {
    return <Redirect to={redirectTo} />;
  }

  // Check role permissions
  if (!hasPermission(userData.role, requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole}</p>
          <p className="text-sm text-gray-500">Your role: {userData.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
