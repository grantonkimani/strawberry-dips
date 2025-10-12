'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Always start in loading state to keep SSR and first client render consistent
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      checkSession();
    }
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        cache: 'no-store', // Always check fresh session
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.authenticated) {
          setUser(data.user);
          setToken(data.token);
        } else {
          // No valid session
          setUser(null);
          setToken(null);
        }
      } else {
        // Clear any existing session data if verification fails
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear session data on error
      setUser(null);
      setToken(null);
    } finally {
      // Reduce delay for better performance
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
