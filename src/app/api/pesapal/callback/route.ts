import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Pesapal Callback received:', JSON.stringify(body, null, 2));

    // Extract callback data
    const {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
      PaymentStatusDescription,
      PaymentAccount,
      Amount,
      Currency
    } = body;

    if (!OrderTrackingId) {
      console.error('No OrderTrackingId in callback');
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Determine order status based on payment status
    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    if (PaymentStatusDescription === 'COMPLETED') {
      orderStatus = 'paid';
      paymentStatus = 'completed';
    } else if (PaymentStatusDescription === 'FAILED') {
      orderStatus = 'payment_failed';
      paymentStatus = 'failed';
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        payment_reference: PaymentAccount,
        payment_error: PaymentStatusDescription === 'FAILED' ? 'Payment failed' : null,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', OrderTrackingId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log('Order updated successfully:', {
      OrderTrackingId,
      OrderMerchantReference,
      PaymentStatusDescription,
      Amount,
      Currency
    });

    // Return success response to Pesapal
    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('Pesapal callback error:', error);
    return NextResponse.json(
      { 
        error: 'Callback processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}