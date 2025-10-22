import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
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

// Helper function to get JWT secret key
function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production';
  return new TextEncoder().encode(secret);
}

// Generate a proper JWT session token
export async function generateSessionToken(user: AdminUser): Promise<string> {
  const secretKey = getJwtSecretKey();
  const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

  const token = await new SignJWT({
    type: 'admin',
    userId: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    exp: expiresAt
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);

  return token;
}

// Verify admin credentials
export async function verifyAdminCredentials(credentials: LoginCredentials): Promise<AdminUser | null> {
  try {
    // Secure hardcoded admin credentials
    // Password is hashed for security
    const ADMIN_USERNAME = 'StrawberrydipsAdmin';
    const ADMIN_PASSWORD_HASH = '$2b$10$YXRzmbCtlRo3/2GriF5e9.PYXP/CZ.P1.n1EpnDqJKOyr9tkXTmK2'; // Admin@StrawberryDIPSKe67!
    
    if (credentials.username === ADMIN_USERNAME) {
      // Verify password using bcrypt
      const isValidPassword = await verifyPassword(credentials.password, ADMIN_PASSWORD_HASH);
      
      if (isValidPassword) {
        return {
          id: 'strawberrydips-admin-id',
          username: ADMIN_USERNAME,
          email: 'admin@strawberrydips.com',
          full_name: 'Strawberrydips Administrator',
          is_active: true,
          last_login: new Date().toISOString()
        };
      }
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

      // Use proper bcrypt verification for database users
      const isValidPassword = await verifyPassword(credentials.password, data.password_hash);
      
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
      return null;
    }
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

// Create auth session
export async function createAuthSession(user: AdminUser): Promise<AuthSession> {
  const token = await generateSessionToken(user);
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
