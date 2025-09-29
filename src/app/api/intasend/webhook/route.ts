import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('IntaSend webhook received:', body);

    // IntaSend webhook payload structure
    const {
      invoice_id,
      state,
      net_amount,
      currency,
      value,
      account,
      api_ref,
      mpesa_reference,
      host,
      failed_reason,
      failed_code
    } = body;

    if (!invoice_id && !api_ref) {
      console.error('Missing invoice_id or api_ref in webhook');
      return NextResponse.json(
        { error: 'Missing invoice_id or api_ref' },
        { status: 400 }
      );
    }

    // Find the order by api_ref (which should be our order ID) or by invoice_id
    let order = null;
    let orderQuery = supabase.from('orders').select('*');

    if (api_ref) {
      const { data, error } = await orderQuery.eq('id', api_ref).single();
      if (!error && data) order = data;
    }

    if (!order && invoice_id) {
      const { data, error } = await orderQuery.eq('intasend_invoice_id', invoice_id).single();
      if (!error && data) order = data;
    }

    if (!order) {
      console.error('Order not found for webhook:', { invoice_id, api_ref });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order based on webhook data
    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map IntaSend states to our order status
    switch (state) {
      case 'COMPLETE':
        updateData.payment_status = 'completed';
        updateData.status = 'confirmed';
        if (mpesa_reference) {
          updateData.payment_reference = mpesa_reference;
        }
        break;
      case 'PENDING':
        updateData.payment_status = 'pending';
        break;
      case 'FAILED':
        updateData.payment_status = 'failed';
        updateData.status = 'cancelled';
        if (failed_reason) {
          updateData.payment_error = failed_reason;
        }
        break;
      default:
        console.log('Unknown IntaSend state:', state);
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order from webhook:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log('Order updated successfully from webhook:', {
      orderId: order.id,
      newStatus: updateData.status,
      paymentStatus: updateData.payment_status
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('IntaSend webhook processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

