import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';

interface StaffRole {
  id: number;
  name: string;
}

interface StaffDetails {
  role: {
    name: string;
  };
}

interface RoleDebug {
  role_name: string;
}

// Export the User interface
export interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  active: boolean;
  staffDetails?: StaffDetails;
  role_debug?: RoleDebug;
}

interface AuthContextType {
  user: User | null;
  can: (permission: string) => boolean;
  isStaff: () => boolean;
  isClient: () => boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  user 
}: { 
  children: ReactNode;
  user: User | null;
}) {
  // Check if user has permission
  const can = (permission: string): boolean => {
    if (!user || !user.active) return false;
    
    // Define permissions based on user type and role
    const permissions: Record<string, string[]> = {
      'view-dashboard': ['Staff'],
      'manage-jobs': ['Staff'],
      'view-jobs': ['Staff', 'Client'],
      'manage-collections': ['Staff'],
      'view-collections': ['Staff', 'Client'],
      'manage-users': ['Staff'],
      'driver-only': ['Staff'],
      'manage-staff': ['Staff'],
      'manage-clients': ['Staff'],
    };
    
    // Check if user type has permission
    if (permissions[permission]?.includes(user.type)) {
      return true;
    }
    
    return false;
  };
  
  const isStaff = (): boolean => {
    return user?.type === 'Staff' && user.active;
  };
  
  const isClient = (): boolean => {
    return user?.type === 'Client' && user.active;
  };
  
  // Update the hasRole function in AuthContext.tsx
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.active) return false;
    
    // First check if we have staffDetails with role
    if (user.staffDetails?.role?.name) {
      return user.staffDetails.role.name.toLowerCase() === roleName.toLowerCase();
    }
    
    // Fallback to role_debug if available
    if (user.role_debug?.role_name) {
      return user.role_debug.role_name.toLowerCase() === roleName.toLowerCase();
    }
    
    return false;
  };
  
  return (
    <AuthContext.Provider value={{ user, can, isStaff, isClient, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}