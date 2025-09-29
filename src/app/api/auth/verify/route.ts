import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-session')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No session token found'
      });
    }

    // In a real app, you'd verify the token signature and check expiration
    // For simplicity, we'll just check if it exists and get user info
    // You could decode the token to get user ID and fetch from database
    
    // For now, return a mock user since we know the token exists
    // In production, you'd decode the token and fetch the actual user
    const mockUser = {
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@strawberrydips.com',
      full_name: 'Administrator'
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: mockUser,
      token: token
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Internal server error'
    });
  }
}

