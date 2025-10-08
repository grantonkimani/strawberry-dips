import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find customer with this verification token
    const { data: customer, error: findError } = await supabase
      .from('customers')
      .select('id, email, first_name, email_verified, verification_token_expires_at')
      .eq('verification_token', token)
      .single();

    if (findError || !customer) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (customer.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        verified: true
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(customer.verification_token_expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify the email
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      verified: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
