'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { User, Organization } from '@/types/api';

interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  updateOrganization: (org: Organization) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getAuthToken();
        const userData = authService.getCurrentUser();
        
        if (token && userData) {
          setUser(userData);
          
          // Try to get current organization
          try {
            const { organization } = await authService.getCurrentOrganization();
            setCurrentOrganization(organization);
          } catch (error) {
            console.warn('Failed to load current organization:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: any) => {
    authService.setAuthToken(token);
    
    // Convert the basic login response to our User format
    const user: User = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name || userData.email.split('@')[0], // Fallback
      current_organization_id: userData.current_organization_id,
    };
    
    setUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  };

  const logout = () => {
    authService.removeAuthToken();
    setUser(null);
    setCurrentOrganization(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };

  const updateOrganization = (org: Organization) => {
    setCurrentOrganization(org);
  };

  const value: AuthContextType = {
    user,
    currentOrganization,
    isAuthenticated: !!user && !!authService.getAuthToken(),
    isLoading,
    login,
    logout,
    updateUser,
    updateOrganization,
  };

  return (
    <AuthContext.Provider value={value}>
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