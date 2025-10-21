import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/intasend';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const orderId = searchParams.get('orderId');

    if (!invoiceId && !orderId) {
      return NextResponse.json(
        { error: 'Missing invoiceId or orderId parameter' },
        { status: 400 }
      );
    }

    let invoice_id = invoiceId;

    // If we have orderId but no invoiceId, get it from database
    if (!invoiceId && orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('intasend_invoice_id, payment_reference')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      invoice_id = order.intasend_invoice_id || order.payment_reference;
    }

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'No invoice ID found for this order' },
        { status: 400 }
      );
    }

    // Check payment status with IntaSend
    const statusResponse = await checkPaymentStatus(invoice_id);
    
    console.log(`Checking status for order ${orderId || invoice_id}:`, {
      invoiceState: statusResponse.invoice?.state,
      failedReason: statusResponse.invoice?.failed_reason
    });

    // Update order status in database based on IntaSend response
    if (orderId || invoiceId) {
      let updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Map IntaSend status to our order status
      if (statusResponse.invoice?.state === 'COMPLETE') {
        updateData.payment_status = 'completed';
        updateData.status = 'paid';
        console.log(`🟢 Payment COMPLETE - updating to paid`);
      } else if (statusResponse.invoice?.state === 'PENDING') {
        updateData.payment_status = 'pending';
        console.log(`🟡 Payment PENDING - keeping as pending`);
      } else if (statusResponse.invoice?.state === 'FAILED') {
        updateData.payment_status = 'failed';
        updateData.status = 'cancelled';
        if (statusResponse.invoice.failed_reason) {
          updateData.payment_error = statusResponse.invoice.failed_reason;
        }
        console.log(`🔴 Payment FAILED - updating PENDING order to cancelled`);
      }

      // Always update if we have status information
      if (statusResponse.invoice?.state) {
        console.log(`📝 Attempting to update order ${orderId || invoice_id} with data:`, updateData);
        
        const { error: updateError } = orderId
          ? await supabase
              .from('orders')
              .update(updateData)
              .eq('id', orderId)
          : await supabase
              .from('orders')
              .update(updateData)
              .eq('intasend_invoice_id', invoice_id);

        if (updateError) {
          console.error('❌ Error updating order status:', updateError);
        } else {
          console.log(`✅ Order ${orderId || invoice_id} successfully updated:`, updateData);
        }
      } else {
        console.log(`⚠️ No invoice state found for order ${orderId || invoice_id}`);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderId, // Include the orderId in the response
      status: statusResponse.invoice?.state || 'UNKNOWN',
      amount: statusResponse.invoice?.net_amount || 0,
      currency: statusResponse.invoice?.currency || 'KES',
      reference: statusResponse.invoice?.invoice_id || invoice_id,
      paid: statusResponse.invoice?.state === 'COMPLETE',
      details: statusResponse,
    });

  } catch (error) {
    console.error('IntaSend status check error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

