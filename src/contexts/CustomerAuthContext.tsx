'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkCustomerSession();
    }
  }, []);

  const checkCustomerSession = async () => {
    try {
      const response = await fetch('/api/customers/verify-session', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.authenticated) {
          setCustomer(data.customer);
          setToken(data.token);
        } else {
          setCustomer(null);
          setToken(null);
        }
      } else {
        setCustomer(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Customer session check failed:', error);
      setCustomer(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
        setToken(data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Customer login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/customers/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Customer logout failed:', error);
    } finally {
      setCustomer(null);
      setToken(null);
    }
  };

  const value: CustomerAuthContextType = {
    customer,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!customer && !!token,
    refreshSession: checkCustomerSession,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextType {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
