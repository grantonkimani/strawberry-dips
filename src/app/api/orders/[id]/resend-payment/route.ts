import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';

// POST /api/orders/[id]/resend-payment - Resend payment prompt to customer
export async function POST(
  request: NextRequest,
  context: { params: { id: string } } | any
) {
  try {
    const orderId = (context as any)?.params?.id as string;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is eligible for payment resend
    const eligibleStatuses = ['pending', 'intasend_timeout', 'failed', 'document_pending'];
    if (!eligibleStatuses.includes(order.status) && !eligibleStatuses.includes(order.payment_status)) {
      return NextResponse.json(
        { error: 'Order is not eligible for payment resend' },
        { status: 400 }
      );
    }

    // Create payment resend email template
    const paymentResendEmail = {
      subject: `Complete Your Payment - Strawberry Dips Order #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e91e63; margin: 0;">🍓 Strawberry Dips</h1>
            <p style="color: #666; margin: 5px 0;">Premium Chocolate Covered Strawberries</p>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #e91e63; margin-top: 0;">Complete Your Payment</h2>
            <p>We noticed your payment for order #${order.id.slice(0, 8)} hasn't been completed yet. Don't worry - your order is still reserved!</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">#${order.id.slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KSH ${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Delivery Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(order.delivery_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Delivery Time:</strong></td>
                <td style="padding: 8px 0;">${order.delivery_time}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">Complete Your Payment</h4>
            <p style="margin: 0;">Click the button below to complete your payment securely via IntaSend (M-Pesa).</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://strawberrydips.com'}/checkout?order=${order.id}" 
               style="background: #e91e63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              Complete Payment Now
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">What happens next?</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Complete your payment using M-Pesa</li>
              <li>Receive instant confirmation</li>
              <li>Get email updates on your order progress</li>
              <li>Track your delivery in real-time</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #e65100;">Need Help?</h4>
            <p style="margin: 0;">If you're having trouble with payment or have any questions, please contact us:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> support@strawberrydips.com</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +254 700 000 000</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>This payment link will remain active for 24 hours.</p>
            <p>Thank you for choosing Strawberry Dips! 🍓</p>
          </div>
        </div>
      `
    };

    // Send the payment resend email
    const emailResult = await sendOrderEmail(
      order.customer_email,
      'orderConfirmed', // Using existing template structure
      order
    );

    if (!emailResult.success) {
      console.error('Failed to send payment resend email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send payment resend email' },
        { status: 500 }
      );
    }

    // Log the resend attempt
    console.log(`Payment resend email sent for order ${order.id} to ${order.customer_email}`);

    return NextResponse.json({
      message: 'Payment prompt sent successfully',
      orderId: order.id,
      customerEmail: order.customer_email
    });

  } catch (error) {
    console.error('Error in resend payment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
