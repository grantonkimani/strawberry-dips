import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // For now, we'll just log the email content
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid, Mailgun, AWS SES, Resend, etc.
    
    const emailContent = generateEmailContent(order);
    
    // Log the email content (in production, send actual email)
    console.log('=== ORDER CONFIRMATION EMAIL ===');
    console.log(`To: ${order.customer_email}`);
    console.log(`Subject: Order Confirmation - Strawberry Dips #${order.id.slice(0, 8).toUpperCase()}`);
    console.log('Content:');
    console.log(emailContent);
    console.log('=== END EMAIL ===');

    // TODO: Integrate with actual email service
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: order.customer_email,
      subject: `Order Confirmation - Strawberry Dips #${order.id.slice(0, 8).toUpperCase()}`,
      html: emailContent,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      // In development, we'll return the email content for testing
      emailContent: process.env.NODE_ENV === 'development' ? emailContent : undefined
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

function generateEmailContent(order: any): string {
  const orderItems = order.order_items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.product_name}</strong><br>
        <small style="color: #6b7280;">${item.product_category}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        KSH ${item.unit_price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong>KSH ${item.total_price.toFixed(2)}</strong>
      </td>
    </tr>
  `).join('');

  const formatDeliveryTime = (time: string) => {
    switch (time) {
      case 'morning': return 'Morning (9 AM - 12 PM)';
      case 'afternoon': return 'Afternoon (12 PM - 5 PM)';
      case 'evening': return 'Evening (5 PM - 8 PM)';
      default: return time;
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Strawberry Dips</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 10px;">
        <h1 style="color: #ec4899; margin: 0; font-size: 28px;">🍓 Strawberry Dips</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Premium Chocolate Covered Strawberries</p>
      </div>

      <!-- Success Message -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #166534; margin: 0 0 10px 0; display: flex; align-items: center;">
          ✅ Order Confirmed!
        </h2>
        <p style="color: #15803d; margin: 0;">
          Thank you ${order.customer_first_name}! Your delicious strawberries are being prepared with love.
        </p>
      </div>

      <!-- Order Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">📦 Order Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
            <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">#${order.id.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Order Date:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Status:</td>
            <td style="padding: 8px 0;">
              <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                CONFIRMED
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Order Items -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">🛍️ Your Order</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Item</th>
              <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
              <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 12px; font-weight: 600;">Subtotal:</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">KSH ${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 12px; font-weight: 600;">Delivery Fee:</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">KSH ${order.delivery_fee.toFixed(2)}</td>
            </tr>
            <tr style="background: #ec4899; color: white;">
              <td colspan="3" style="padding: 15px; font-weight: bold; font-size: 16px;">Total Paid:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">KSH ${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Delivery Information -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">🚚 Delivery Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #0369a1; font-weight: 600;">Address:</td>
            <td style="padding: 8px 0;">${order.delivery_address}, ${order.delivery_city}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #0369a1; font-weight: 600;">Delivery Date:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(order.delivery_date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #0369a1; font-weight: 600;">Delivery Time:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDeliveryTime(order.delivery_time)}</td>
          </tr>
          ${order.special_instructions ? `
          <tr>
            <td style="padding: 8px 0; color: #0369a1; font-weight: 600;">Special Instructions:</td>
            <td style="padding: 8px 0;">${order.special_instructions}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- What's Next -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">📋 What's Next?</h3>
        <div style="display: flex; align-items: start; margin-bottom: 15px;">
          <div style="background: #fce7f3; color: #ec4899; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</div>
          <div>
            <strong style="color: #374151;">Order Confirmation</strong><br>
            <span style="color: #6b7280; font-size: 14px;">You're receiving this email now ✓</span>
          </div>
        </div>
        <div style="display: flex; align-items: start; margin-bottom: 15px;">
          <div style="background: #fce7f3; color: #ec4899; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</div>
          <div>
            <strong style="color: #374151;">Preparation</strong><br>
            <span style="color: #6b7280; font-size: 14px;">We'll start preparing your fresh strawberries</span>
          </div>
        </div>
        <div style="display: flex; align-items: start;">
          <div style="background: #fce7f3; color: #ec4899; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</div>
          <div>
            <strong style="color: #374151;">Delivery</strong><br>
            <span style="color: #6b7280; font-size: 14px;">We'll deliver on ${new Date(order.delivery_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 10px 0;">Need Help?</h3>
        <p style="color: #6b7280; margin: 0 0 15px 0;">
          If you have any questions about your order, don't hesitate to contact us.
        </p>
        <p style="color: #6b7280; margin: 0;">
          📧 Email: support@strawberrydips.com<br>
          📱 Phone: +254 700 123 456
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p style="margin: 0 0 10px 0;">Thank you for choosing Strawberry Dips! 🍓</p>
        <p style="margin: 0; font-size: 12px;">
          This email was sent to ${order.customer_email}. Please save this email for your records.
        </p>
      </div>

    </body>
    </html>
  `;
}
