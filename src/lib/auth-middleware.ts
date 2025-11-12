import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Helper function to get JWT secret key
function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY environment variable is required. Please set it in your .env.local file.');
  }
  return new TextEncoder().encode(secret);
}

// Helper function to verify admin session token
export async function verifyAdminSession(request: NextRequest): Promise<{ isValid: boolean; user?: any; error?: string }> {
  try {
    const token = request.cookies.get('admin-session')?.value;

    if (!token) {
      return { isValid: false, error: 'No session token found' };
    }

    // Verify JWT token
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
      
      // Check if token is for admin user
      if (payload.type !== 'admin') {
        return { isValid: false, error: 'Invalid token type' };
      }

      // Check token expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { isValid: false, error: 'Token expired' };
      }

      // Return user data from token
      return { 
        isValid: true, 
        user: {
          id: payload.userId,
          username: payload.username,
          email: payload.email,
          full_name: payload.full_name
        }
      };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return { isValid: false, error: 'Invalid token signature' };
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return { isValid: false, error: 'Token verification failed' };
  }
}

// Middleware wrapper for admin API routes
export function withAdminAuth(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const { isValid, error } = await verifyAdminSession(request);
    
    if (!isValid) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, ...args);
  };
}

// Helper to check if a request is for an admin API route
export function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/admin') || 
         pathname.startsWith('/api/banners') ||
         pathname.startsWith('/api/products') && pathname.includes('admin') ||
         pathname.startsWith('/api/orders') && pathname.includes('admin');
}
