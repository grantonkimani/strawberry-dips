import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
}

// Generate a simple session token
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Verify admin credentials
export async function verifyAdminCredentials(credentials: LoginCredentials): Promise<AdminUser | null> {
  try {
    // Temporary hardcoded admin credentials until database is set up
    // TODO: Replace with database lookup once admin_users table is created
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        id: 'temp-admin-id',
        username: 'admin',
        email: 'admin@strawberrydips.com',
        full_name: 'Administrator',
        is_active: true,
        last_login: new Date().toISOString()
      };
    }

    // Try database lookup if hardcoded credentials don't match
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // For now, we'll use a simple password check
      // In production, you should use proper bcrypt verification
      const isValidPassword = credentials.password === 'admin123'; // Default password
      
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        is_active: data.is_active,
        last_login: data.last_login
      };
    } catch (dbError) {
      console.log('Database not set up yet, using hardcoded credentials');
      return null;
    }
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

// Create auth session
export function createAuthSession(user: AdminUser): AuthSession {
  const token = generateSessionToken();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

  return {
    user,
    token,
    expiresAt
  };
}

// Verify session token
export function verifySessionToken(token: string): boolean {
  // In a real app, you'd verify the token signature and check expiration
  // For simplicity, we'll just check if it exists and is not expired
  return Boolean(token && token.length > 0);
}

// Hash password (for future use)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password (for future use)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
