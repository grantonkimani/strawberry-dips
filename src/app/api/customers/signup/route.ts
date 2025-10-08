import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

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

    // Check if email already exists (avoid selecting columns that may not exist yet)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

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

    // Create customer account
    const { data: newCustomer, error: insertError } = await supabase
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

    if (insertError) {
      // Unique violation -> email already exists
      const pgErr: any = insertError as any;
      if (pgErr?.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      console.error('Database error:', insertError);
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
        verificationToken: verificationToken
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the signup if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        firstName: newCustomer.first_name,
        lastName: newCustomer.last_name
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
