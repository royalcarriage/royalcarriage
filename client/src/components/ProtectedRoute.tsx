import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, hasRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "user" | "admin" | "super_admin";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (
      !isLoading &&
      requiredRole &&
      user &&
      !hasRole(user, requiredRole)
    ) {
      // User is authenticated but doesn't have required role
      setLocation("/unauthorized");
    }
  }, [isLoading, isAuthenticated, user, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !hasRole(user, requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
