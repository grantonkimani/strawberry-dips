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
    
    // Diagnostic logging
    console.log(`[CUSTOMER LOGIN] Attempting login for email: ${email?.toLowerCase()}`);

    if (!email || !password) {
      console.log(`[CUSTOMER LOGIN] Missing credentials - email: ${!!email}, password: ${!!password}`);
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Test database connection first
    console.log(`[CUSTOMER LOGIN] Testing database connection...`);
    const db = supabaseAdmin ?? supabase;
    try {
      const { data: testData, error: testError } = await db
        .from('customers')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error(`[CUSTOMER LOGIN] Database connection test failed:`, testError);
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 500 }
        );
      }
      console.log(`[CUSTOMER LOGIN] Database connection test successful`);
    } catch (connectionError) {
      console.error(`[CUSTOMER LOGIN] Database connection error:`, connectionError);
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }

    // Find customer by email with retry logic
    console.log(`[CUSTOMER LOGIN] Searching for customer: ${email.toLowerCase()}`);
    let customer = null;
    let findError = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const result = await db
          .from('customers')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
          
        customer = result.data;
        findError = result.error;
        
        if (!findError) {
          console.log(`[CUSTOMER LOGIN] Customer found - ID: ${customer.id}, email_verified: ${customer.email_verified}, is_active: ${customer.is_active}`);
          break;
        }
        
        // If it's a connection error, retry
        if (findError.message.includes('fetch failed') || findError.message.includes('timeout')) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`[CUSTOMER LOGIN] Retrying customer search (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        
        break;
      } catch (retryError) {
        console.error(`[CUSTOMER LOGIN] Retry error (attempt ${retryCount + 1}):`, retryError);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`[CUSTOMER LOGIN] Retrying customer search in ${retryCount * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        } else {
          throw retryError;
        }
      }
    }

    if (findError || !customer) {
      console.log(`[CUSTOMER LOGIN] Customer not found - email: ${email.toLowerCase()}, error: ${findError?.message || 'No error'}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log(`[CUSTOMER LOGIN] Customer found - ID: ${customer.id}, email_verified: ${customer.email_verified}, is_active: ${customer.is_active}`);

    // Check if account is disabled (if column exists and is false)
    if (typeof customer.is_active === 'boolean' && customer.is_active === false) {
      console.log(`[CUSTOMER LOGIN] Account disabled - ID: ${customer.id}`);
      return NextResponse.json(
        { error: 'This account has been disabled. Contact support.' },
        { status: 403 }
      );
    }

    // Check if email is verified (with development bypass)
    const skipEmailVerification = process.env.NODE_ENV === 'development' && process.env.SKIP_EMAIL_VERIFICATION === 'true';
    if (!customer.email_verified && !skipEmailVerification) {
      console.log(`[CUSTOMER LOGIN] Email not verified - ID: ${customer.id}`);
      return NextResponse.json(
        { error: 'Please verify your email before logging in. Check your inbox for verification instructions.' },
        { status: 401 }
      );
    }
    
    if (skipEmailVerification && !customer.email_verified) {
      console.log(`[CUSTOMER LOGIN] Skipping email verification for development - ID: ${customer.id}`);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password_hash);
    
    if (!isValidPassword) {
      console.log(`[CUSTOMER LOGIN] Invalid password - ID: ${customer.id}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log(`[CUSTOMER LOGIN] Password valid - proceeding with token generation for ID: ${customer.id}`);

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

    // Update last login with retry logic
    console.log(`[CUSTOMER LOGIN] Updating last login for ID: ${customer.id}`);
    try {
      await db
        .from('customers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', customer.id);
      console.log(`[CUSTOMER LOGIN] Last login updated successfully`);
    } catch (updateError) {
      console.warn(`[CUSTOMER LOGIN] Failed to update last login (non-critical):`, updateError);
      // Don't fail the login if last_login update fails
    }

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

    console.log(`[CUSTOMER LOGIN] Login successful - ID: ${customer.id}, email: ${customer.email}`);

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
    console.error('[CUSTOMER LOGIN] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
