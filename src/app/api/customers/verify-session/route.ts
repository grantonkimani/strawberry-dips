import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Force Node.js runtime so jsonwebtoken (CJS) works under Next/Turbopack
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production';
function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('customer-session')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No session token found'
      });
    }

    // Verify JWT token
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
      
      if (payload.type !== 'customer') {
        return NextResponse.json({
          success: false,
          authenticated: false,
          message: 'Invalid token type'
        });
      }

      // Get customer data from database (do not filter by is_active here to avoid false negatives)
      const db = supabaseAdmin ?? supabase;
      let { data: customer, error } = await db
        .from('customers')
        .select('id, email, first_name, last_name, phone, email_verified')
        .eq('id', payload.customerId as string)
        .single();

      // Fallback: if not found by id, try by email from token
      if ((error || !customer) && payload.email) {
        const byEmail = await db
          .from('customers')
          .select('id, email, first_name, last_name, phone, email_verified')
          .eq('email', String(payload.email).toLowerCase())
          .single();
        if (!byEmail.error && byEmail.data) {
          customer = byEmail.data;
        }
      }

      if (!customer) {
        return NextResponse.json({
          success: false,
          authenticated: false,
          message: 'Customer not found'
        });
      }

      // Optional: if project has is_active, you can check it in a separate query

      // If token customerId mismatched but we recovered by email, re-issue cookie with correct id
      let outToken = token;
      if (payload.customerId !== customer.id) {
        outToken = await new SignJWT({
          customerId: customer.id,
          email: customer.email,
          type: 'customer',
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(getJwtSecretKey());
      }

      const resp = NextResponse.json({
        success: true,
        authenticated: true,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone,
          emailVerified: customer.email_verified
        },
        token: outToken
      });

      if (outToken !== token) {
        resp.cookies.set('customer-session', outToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      }

      return resp;

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Internal server error'
    });
  }
}
