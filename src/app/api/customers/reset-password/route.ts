import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find valid reset token
    console.log(`[RESET PASSWORD] Looking for token: ${token}`);
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select(`
        *,
        customers (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('token', token)
      .is('used_at', null)
      .single();

    console.log(`[RESET PASSWORD] Token query result:`, { resetToken, tokenError });

    if (tokenError || !resetToken) {
      console.log(`[RESET PASSWORD] Token not found or error:`, tokenError);
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      console.log(`[RESET PASSWORD] Token expired: ${resetToken.expires_at}`);
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update customer password
    const { error: updateError } = await supabase
      .from('customers')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.customer_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
      // Don't fail the request, password was updated successfully
    }

    // Invalidate all other sessions for this customer (optional)
    // This would require implementing session management

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
