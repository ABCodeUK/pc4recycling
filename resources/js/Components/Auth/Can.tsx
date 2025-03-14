import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useAuth();
  
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

interface StaffOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function StaffOnly({ children, fallback = null }: StaffOnlyProps) {
  const { isStaff } = useAuth();
  
  return isStaff() ? <>{children}</> : <>{fallback}</>;
}

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const { isClient } = useAuth();
  
  return isClient() ? <>{children}</> : <>{fallback}</>;
}

interface RoleProps {
  role: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Role({ role, children, fallback = null }: RoleProps) {
  const { hasRole } = useAuth();
  
  // Split the role string by pipe character and check if user has any of the roles
  const hasAnyRole = role.split('|').some(singleRole => {
    // Trim whitespace from role name
    const trimmedRole = singleRole.trim();
    // Skip empty roles
    if (!trimmedRole) return false;
    // Check if user has this role
    return hasRole(trimmedRole);
  });
  
  return hasAnyRole ? <>{children}</> : <>{fallback}</>;
}