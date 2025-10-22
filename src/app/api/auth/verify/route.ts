import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, error } = await verifyAdminSession(request);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: error || 'Authentication failed'
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: user,
      token: request.cookies.get('admin-session')?.value
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

