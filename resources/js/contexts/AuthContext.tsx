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
  sustainability: number;
  staffDetails?: StaffDetails;
  role_debug?: RoleDebug;
}

interface AuthContextType {
  user: User | null;
  can: (permission: string) => boolean;
  isStaff: () => boolean;
  isClient: () => boolean;
  hasRole: (roleName: string) => boolean;
  isInitialized: boolean;
  refreshUserData: () => Promise<void>; // Add a function to refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  user 
}: { 
  children: ReactNode;
  user: User | null;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isInitialized, setIsInitialized] = useState(!!user && !!user.staffDetails?.role);
  const [retryCount, setRetryCount] = useState(0);

  const refreshUserData = async () => {
    try {
      // Add a cache-busting parameter to prevent browser caching
      const response = await axios.get(`/api/user?_=${new Date().getTime()}`);
      if (response.data) {
        console.log('Refreshed user data:', response.data);
        setCurrentUser(response.data);
        setIsInitialized(true);
        // Reset retry count on success
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      
      // If we get a 401, it might be because the session isn't fully established yet
      // Retry a few times with increasing delay
      if (retryCount < 5) { // Increase max retries to 5
        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 10000); // Exponential backoff with 10s max
        console.log(`Retrying in ${Math.round(delay)}ms (attempt ${retryCount + 1}/5)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      } else {
        // After max retries, mark as initialized anyway to prevent infinite loading
        console.warn('Max retries reached, forcing initialization');
        setIsInitialized(true);
        
        // Try one more time with a longer timeout
        setTimeout(() => {
          axios.get(`/api/user?_=${new Date().getTime()}`)
            .then(response => {
              if (response.data) {
                console.log('Final retry succeeded:', response.data);
                setCurrentUser(response.data);
              }
            })
            .catch(e => console.error('Final retry failed:', e));
        }, 3000);
      }
    }
  };

  // Effect to handle retries
  useEffect(() => {
    if (retryCount > 0 && !isInitialized) {
      refreshUserData();
    }
  }, [retryCount]);

  // Initial data load
  useEffect(() => {
    // Check if user data is complete
    const isUserDataComplete = user && 
      user.staffDetails && 
      user.staffDetails.role && 
      user.staffDetails.role.name;
    
    if (isUserDataComplete) {
      console.log('User data is complete:', user);
      setCurrentUser(user);
      setIsInitialized(true);
    } else {
      console.log('User data is incomplete, refreshing:', user);
      refreshUserData();
    }
  }, [user]);

  // Check if user has permission
  const can = (permission: string): boolean => {
    if (!currentUser || !currentUser.active) return false;
    
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
    if (permissions[permission]?.includes(currentUser.type)) {
      return true;
    }
    
    return false;
  };
  
  // Rest of your functions, updated to use currentUser
  const isStaff = (): boolean => {
    return currentUser?.type === 'Staff' && currentUser.active;
  };
  
  const isClient = (): boolean => {
    return currentUser?.type === 'Client' && currentUser.active;
  };
  
  const hasRole = (roleName: string): boolean => {
    if (!currentUser || !currentUser.active) return false;
    
    // First check if we have staffDetails with role
    if (currentUser.staffDetails?.role?.name) {
      return currentUser.staffDetails.role.name.toLowerCase() === roleName.toLowerCase();
    }
    
    // Fallback to role_debug if available
    if (currentUser.role_debug?.role_name) {
      return currentUser.role_debug.role_name.toLowerCase() === roleName.toLowerCase();
    }
    
    return false;
  };
  
  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      can, 
      isStaff, 
      isClient, 
      hasRole, 
      isInitialized,
      refreshUserData
    }}>
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