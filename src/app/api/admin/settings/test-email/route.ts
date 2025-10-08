import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// POST /api/admin/settings/test-email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Test email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const testEmail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Strawberry Dips - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Strawberry Dips</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p>If you received this email, your email settings are properly configured!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from your Strawberry Dips admin panel.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);

    return NextResponse.json({ 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
