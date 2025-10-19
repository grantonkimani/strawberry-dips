import nodemailer from 'nodemailer';

// Gmail SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // App password, not regular password
    },
  });
};

// Email templates
export const emailTemplates = {
  orderConfirmed: (orderData: any) => ({
    subject: `Order Confirmed - Strawberry Dips #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
          <p style="color: #666; margin: 5px 0;">Premium Chocolate Covered Strawberries</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Order Confirmed! 🎉</h2>
          <p>Thank you for your order! We've received your payment and are preparing your fresh strawberries.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">#${orderData.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KSH ${orderData.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Delivery Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(orderData.delivery_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Delivery Time:</strong></td>
              <td style="padding: 8px 0;">${orderData.delivery_time}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #2e7d32; margin-top: 0;">What's Next?</h3>
          <ul style="color: #2e7d32; margin: 0; padding-left: 20px;">
            <li>We'll prepare your fresh strawberries</li>
            <li>You'll receive updates on your order status</li>
            <li>We'll deliver on your scheduled date and time</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>Questions? Contact us at <a href="mailto:support@strawberrydips.com" style="color: #e91e63;">support@strawberrydips.com</a></p>
          <p>Track your order at: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/track" style="color: #e91e63;">strawberrydips.shop/track</a></p>
        </div>
      </div>
    `
  }),
  
  statusUpdate: (orderData: any) => ({
    subject: `Order Update - Strawberry Dips #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
          <p style="color: #666; margin: 5px 0;">Premium Chocolate Covered Strawberries</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Order Status Update</h2>
          <p>Your order status has been updated:</p>
          <div style="background: #fff; padding: 15px; border-radius: 6px; border-left: 4px solid #e91e63; margin: 15px 0;">
            <strong style="color: #e91e63; font-size: 18px;">${getStatusDisplayName(orderData.status)}</strong>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">#${orderData.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KSH ${orderData.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Delivery Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(orderData.delivery_date).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #1976d2; margin-top: 0;">${getStatusMessage(orderData.status)}</h3>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>Questions? Contact us at <a href="mailto:support@strawberrydips.com" style="color: #e91e63;">support@strawberrydips.com</a></p>
          <p>Track your order at: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/track" style="color: #e91e63;">strawberrydips.shop/track</a></p>
        </div>
      </div>
    `
  }),

  verification: (verificationData: any) => ({
    subject: 'Verify Your Email - Strawberry Dips',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
          <p style="color: #666; margin: 5px 0;">Premium Chocolate Covered Strawberries</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Welcome to Strawberry Dips!</h2>
          <p>Hi ${verificationData.firstName},</p>
          <p>Thank you for signing up! Please verify your email address to complete your account setup.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/verify-email?token=${verificationData.verificationToken}" 
               style="background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-top: 0;">What's Next?</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Verify your email to activate your account</li>
            <li>Start ordering delicious chocolate-covered strawberries</li>
            <li>Track your orders and manage your profile</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/verify-email?token=${verificationData.verificationToken}
          </p>
          <p>Need help? Contact us at <a href="mailto:support@strawberrydips.com" style="color: #e91e63;">support@strawberrydips.com</a></p>
        </div>
      </div>
    `
  }),

  passwordReset: (data: {
    firstName: string;
    lastName: string;
    resetToken: string;
  }) => ({
    subject: 'Reset Your Password - Strawberry Dips',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
          <p style="color: #666; margin: 5px 0;">Premium Chocolate Covered Strawberries</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Password Reset Request</h2>
          <p>Hi ${data.firstName},</p>
          <p>We received a request to reset your password for your Strawberry Dips account.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/account/reset-password?token=${data.resetToken}" 
               style="background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-top: 0;">Security Notice</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will remain unchanged until you click the link above</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop'}/account/reset-password?token=${data.resetToken}
          </p>
          <p>Need help? Contact us at <a href="mailto:support@strawberrydips.com" style="color: #e91e63;">support@strawberrydips.com</a></p>
        </div>
      </div>
    `
  })
};

// Helper functions
function getStatusDisplayName(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Payment Pending',
    'paid': 'Payment Confirmed',
    'confirmed': 'Order Confirmed',
    'preparing': 'Preparing Your Order',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

function getStatusMessage(status: string): string {
  const messageMap: { [key: string]: string } = {
    'pending': 'We\'re waiting for your payment confirmation.',
    'paid': 'Payment received! We\'re preparing your order.',
    'confirmed': 'Your order is confirmed and being prepared.',
    'preparing': 'Our chefs are preparing your fresh strawberries.',
    'out_for_delivery': 'Your order is on the way to you!',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.'
  };
  return messageMap[status] || 'Your order status has been updated.';
}

// Generic email sending function
export async function sendOrderEmail(to: string, templateType: keyof typeof emailTemplates, data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateType](data);

    await transporter.sendMail({
      from: `"Strawberry Dips" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html,
    });

    console.log(`Email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Send verification email
export async function sendVerificationEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendOrderEmail(data.email, 'verification', data);
}

// Send password reset email
export async function sendPasswordResetEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  resetToken: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendOrderEmail(data.email, 'passwordReset', data);
}

// Send order confirmation email (called after payment success)
export async function sendOrderConfirmationEmail(orderData: any) {
  return await sendOrderEmail(orderData.customer_email, 'orderConfirmed', orderData);
}

// Send status update email (called when admin changes status)
export async function sendStatusUpdateEmail(orderData: any) {
  return await sendOrderEmail(orderData.customer_email, 'statusUpdate', orderData);
}