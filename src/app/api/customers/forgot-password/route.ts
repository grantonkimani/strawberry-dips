import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if customer exists
    console.log(`[FORGOT PASSWORD] Looking for customer with email: ${email.toLowerCase()}`);
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', email.toLowerCase())
      .single();

    console.log(`[FORGOT PASSWORD] Customer query result:`, { customer, customerError });

    if (customerError || !customer) {
      console.log(`[FORGOT PASSWORD] Customer not found or error:`, customerError);
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, you will receive password reset instructions.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes (1 hour)

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        customer_id: customer.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (tokenError) {
      console.error('Error storing password reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to generate reset token. Please try again.' },
        { status: 500 }
      );
    }

    // Send password reset email
    console.log(`[FORGOT PASSWORD] Attempting to send email to: ${customer.email}`);
    try {
      const emailResult = await sendPasswordResetEmail({
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        resetToken: resetToken
      });
      console.log(`[FORGOT PASSWORD] Email result:`, emailResult);
    } catch (emailError) {
      console.error('[FORGOT PASSWORD] Error sending password reset email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
