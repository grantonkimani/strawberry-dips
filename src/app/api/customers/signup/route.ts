import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();
    
    // Diagnostic logging
    console.log(`[CUSTOMER SIGNUP] Attempting signup for email: ${email?.toLowerCase()}`);

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Test Supabase connection first
    console.log(`[CUSTOMER SIGNUP] Testing Supabase connection...`);
    try {
      const { data: testData, error: testError } = await supabase
        .from('customers')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error(`[CUSTOMER SIGNUP] Supabase connection test failed:`, testError);
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 500 }
        );
      }
      console.log(`[CUSTOMER SIGNUP] Supabase connection test successful`);
    } catch (connectionError) {
      console.error(`[CUSTOMER SIGNUP] Supabase connection error:`, connectionError);
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }

    // Check if email already exists (avoid selecting columns that may not exist yet)
    console.log(`[CUSTOMER SIGNUP] Checking if email exists: ${email.toLowerCase()}`);
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
      
    if (checkError) {
      console.error(`[CUSTOMER SIGNUP] Database check error:`, checkError);
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      console.log(`[CUSTOMER SIGNUP] Email already exists: ${email.toLowerCase()}`);
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    console.log(`[CUSTOMER SIGNUP] Email available, proceeding with account creation`);

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Normalize and validate phone (optional field)
    let normalizedPhone: string | null = null;
    if (phone && typeof phone === 'string') {
      // Keep digits and leading +, remove spaces and other symbols
      const trimmed = phone.trim();
      const cleaned = trimmed.replace(/[^+\d]/g, '');
      // Enforce max length to match DB varchar(20)
      if (cleaned.length > 20) {
        return NextResponse.json(
          { error: 'Phone number is too long. Max 20 characters.' },
          { status: 400 }
        );
      }
      normalizedPhone = cleaned.length > 0 ? cleaned : null;
    }

    // Create customer account with retry logic
    console.log(`[CUSTOMER SIGNUP] Creating customer account...`);
    let insertError = null;
    let newCustomer = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const result = await supabase
          .from('customers')
          .insert({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone,
            email_verified: false,
            verification_token: verificationToken,
            verification_token_expires_at: verificationExpires.toISOString()
          })
          .select('id, email, first_name, last_name')
          .single();
          
        newCustomer = result.data;
        insertError = result.error;
        
        if (!insertError) {
          console.log(`[CUSTOMER SIGNUP] Account created successfully - ID: ${newCustomer?.id}`);
          break;
        }
        
        // If it's a connection error, retry
        if (insertError.message.includes('fetch failed') || insertError.message.includes('timeout')) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`[CUSTOMER SIGNUP] Retrying account creation (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        
        break;
      } catch (retryError) {
        console.error(`[CUSTOMER SIGNUP] Retry error (attempt ${retryCount + 1}):`, retryError);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`[CUSTOMER SIGNUP] Retrying account creation in ${retryCount * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        } else {
          throw retryError;
        }
      }
    }

    if (insertError) {
      console.error(`[CUSTOMER SIGNUP] Database insert error:`, insertError);
      // Unique violation -> email already exists
      const pgErr: any = insertError as any;
      if (pgErr?.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail({
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        verificationToken: verificationToken
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the signup if email fails - user can request resend
    }

    console.log(`[CUSTOMER SIGNUP] Signup completed successfully - ID: ${newCustomer?.id}`);
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      customer: {
        id: newCustomer?.id,
        email: newCustomer?.email,
        firstName: newCustomer?.first_name,
        lastName: newCustomer?.last_name
      }
    });

  } catch (error) {
    console.error('[CUSTOMER SIGNUP] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
