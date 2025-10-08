import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer by email (avoid filtering by is_active in query to prevent 401 if column missing/false)
    const db = supabaseAdmin ?? supabase;
    const { data: customer, error: findError } = await db
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !customer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is disabled (if column exists and is false)
    if (typeof customer.is_active === 'boolean' && customer.is_active === false) {
      return NextResponse.json(
        { error: 'This account has been disabled. Contact support.' },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!customer.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in. Check your inbox for verification instructions.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token (HS256) using jose
    const token = await new SignJWT({
      customerId: customer.id,
      email: customer.email,
      type: 'customer',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecretKey());

    // Update last login
    await db
      .from('customers')
      .update({ last_login: new Date().toISOString() })
      .eq('id', customer.id);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        emailVerified: customer.email_verified
      },
      token: token
    });

    // Set HTTP-only cookie
    response.cookies.set('customer-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
