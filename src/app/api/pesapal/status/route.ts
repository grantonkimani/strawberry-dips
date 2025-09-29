import { NextRequest, NextResponse } from 'next/server';
import { getPesapalTransactionStatus } from '@/lib/pesapal';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('orderTrackingId');

    if (!orderTrackingId) {
      return NextResponse.json(
        { error: 'Missing orderTrackingId parameter' },
        { status: 400 }
      );
    }

    // Get transaction status from Pesapal
    const transactionStatus = await getPesapalTransactionStatus(orderTrackingId);

    // Update order status based on Pesapal response
    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    if (transactionStatus.payment_status_description === 'COMPLETED') {
      orderStatus = 'paid';
      paymentStatus = 'completed';
    } else if (transactionStatus.payment_status_description === 'FAILED') {
      orderStatus = 'payment_failed';
      paymentStatus = 'failed';
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        payment_reference: transactionStatus.payment_account,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', orderTrackingId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
    }

    return NextResponse.json({
      success: true,
      orderTrackingId,
      paymentStatus: transactionStatus.payment_status_description,
      amount: transactionStatus.amount,
      currency: transactionStatus.currency,
      orderStatus,
      paymentStatus
    });

  } catch (error) {
    console.error('Pesapal status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}