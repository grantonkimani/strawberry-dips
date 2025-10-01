import nodemailer from 'nodemailer';

// Gmail SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
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
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #2e7d32;">What's Next?</h4>
          <p style="margin: 0;">We'll send you updates as we prepare and deliver your order. You can track your order status anytime.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}/track/${orderData.id}" 
             style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Your Order
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Questions? Contact us at support@strawberrydips.com</p>
          <p>Thank you for choosing Strawberry Dips! 🍓</p>
        </div>
      </div>
    `,
  }),

  orderPreparing: (orderData: any) => ({
    subject: `Your Strawberries Are Being Prepared - Order #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
        </div>
        
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Your Strawberries Are Being Prepared Fresh! 👨‍🍳</h2>
          <p>Our expert chefs are hand-dipping your fresh strawberries in premium chocolate right now.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Order #${orderData.id.slice(0, 8)}</h4>
          <p style="margin: 0;">Expected delivery: <strong>${new Date(orderData.delivery_date).toLocaleDateString()} - ${orderData.delivery_time}</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}/track/${orderData.id}" 
             style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Your Order
          </a>
        </div>
      </div>
    `,
  }),

  orderOutForDelivery: (orderData: any) => ({
    subject: `Your Order Is Out for Delivery - Order #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #e91e63; margin-top: 0;">Your Order Is On The Way! 🚚</h2>
          <p>Your fresh strawberries are out for delivery and heading to your location.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Delivery Details</h4>
          <p style="margin: 5px 0;"><strong>Order:</strong> #${orderData.id.slice(0, 8)}</p>
          <p style="margin: 5px 0;"><strong>Expected Time:</strong> ${orderData.delivery_time}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${orderData.delivery_city}, ${orderData.delivery_state}</p>
          ${orderData.special_instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${orderData.special_instructions}</p>` : ''}
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #e65100;">Please Ensure:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Someone is available to receive the order</li>
            <li>Your phone is accessible for delivery updates</li>
            <li>Delivery location is clearly marked</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}/track/${orderData.id}" 
             style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Your Order
          </a>
        </div>
      </div>
    `,
  }),

  orderDelivered: (orderData: any) => ({
    subject: `Order Delivered - Enjoy Your Strawberries! 🍓 #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2e7d32; margin-top: 0;">Order Delivered Successfully! 🎉</h2>
          <p>Your fresh chocolate-covered strawberries have been delivered. We hope you enjoy them!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Order #${orderData.id.slice(0, 8)}</h4>
          <p style="margin: 5px 0;">Delivered on: <strong>${new Date().toLocaleDateString()}</strong></p>
          <p style="margin: 5px 0;">Total: <strong>KSH ${orderData.total.toFixed(2)}</strong></p>
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #e65100;">Storage Tips:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Keep refrigerated for best freshness</li>
            <li>Consume within 2-3 days for optimal taste</li>
            <li>Let sit at room temperature for 10 minutes before serving</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}" 
             style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
            Order Again
          </a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}/contact" 
             style="background: #666; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Leave Feedback
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for choosing Strawberry Dips! 🍓</p>
          <p>We hope to serve you again soon!</p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export async function sendOrderEmail(
  to: string,
  template: 'orderConfirmed' | 'orderPreparing' | 'orderOutForDelivery' | 'orderDelivered',
  orderData: any
) {
  try {
    // Check if email is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.log('Email not configured, skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template](orderData);

    const mailOptions = {
      from: `"Strawberry Dips" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send order confirmation email (called after payment success)
export async function sendOrderConfirmationEmail(orderData: any) {
  return await sendOrderEmail(orderData.customer_email, 'orderConfirmed', orderData);
}

// Send status update email (called when admin changes status)
export async function sendStatusUpdateEmail(orderData: any, newStatus: string) {
  let template: 'orderPreparing' | 'orderOutForDelivery' | 'orderDelivered';
  
  switch (newStatus) {
    case 'preparing':
      template = 'orderPreparing';
      break;
    case 'out_for_delivery':
      template = 'orderOutForDelivery';
      break;
    case 'delivered':
      template = 'orderDelivered';
      break;
    default:
      console.log('No email template for status:', newStatus);
      return { success: false, error: 'No email template for this status' };
  }
  
  return await sendOrderEmail(orderData.customer_email, template, orderData);
}
