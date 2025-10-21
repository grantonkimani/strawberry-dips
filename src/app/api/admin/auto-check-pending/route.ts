import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkPaymentStatus } from '@/lib/intasend';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Starting automatic pending order check...');

    // Get all pending orders that have IntaSend invoice IDs
    // Also include orders older than 24 hours that should be auto-cancelled
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, intasend_invoice_id, payment_reference, status, payment_status, created_at')
      .eq('status', 'pending')
      .not('intasend_invoice_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching pending orders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending orders', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending orders with IntaSend invoice IDs found',
        updated: 0,
        total: 0
      });
    }

    console.log(`🔍 Found ${pendingOrders.length} pending orders to check`);

    let updatedCount = 0;
    const updatePromises = pendingOrders.map(async (order) => {
      try {
        const invoiceId = order.intasend_invoice_id || order.payment_reference;
        
        if (!invoiceId) {
          console.log(`⚠️ Order ${order.id} has no invoice ID, skipping`);
          return;
        }

        // Check if order is older than 24 hours - auto-cancel it
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          console.log(`⏰ Order ${order.id} is ${Math.round(hoursDiff)} hours old - auto-cancelling`);
          
          const updateData = {
            status: 'cancelled',
            payment_status: 'timeout',
            payment_error: 'Order timeout - payment not completed within 24 hours',
            updated_at: new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order.id);

          if (updateError) {
            console.error(`❌ Error auto-cancelling order ${order.id}:`, updateError);
          } else {
            updatedCount++;
            console.log(`✅ Auto-cancelled old order ${order.id}`);
          }
          return;
        }

        console.log(`🔍 Checking payment status for order ${order.id}, invoice ${invoiceId}`);
        
        // Check payment status with IntaSend
        const statusResponse = await checkPaymentStatus(invoiceId);
        
        if (!statusResponse.invoice) {
          console.log(`⚠️ No invoice data for ${invoiceId}, skipping`);
          return;
        }

        const invoiceState = statusResponse.invoice.state;
        console.log(`📊 Order ${order.id} payment state: ${invoiceState}`);

        let updateData: any = {
          updated_at: new Date().toISOString(),
        };

        // Update based on IntaSend status
        if (invoiceState === 'COMPLETE') {
          updateData.payment_status = 'completed';
          updateData.status = 'paid';
          console.log(`✅ Order ${order.id} payment completed, updating to paid`);
        } else if (invoiceState === 'FAILED') {
          updateData.payment_status = 'failed';
          updateData.status = 'cancelled';
          if (statusResponse.invoice.failed_reason) {
            updateData.payment_error = statusResponse.invoice.failed_reason;
          }
          console.log(`❌ Order ${order.id} payment failed, updating to cancelled`);
        } else if (invoiceState === 'PENDING') {
          // Still pending, no update needed
          console.log(`⏳ Order ${order.id} still pending, no update needed`);
          return;
        } else {
          console.log(`❓ Order ${order.id} unknown state: ${invoiceState}`);
          return;
        }

        // Update the order
        const { error: updateError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id);

        if (updateError) {
          console.error(`❌ Error updating order ${order.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Successfully updated order ${order.id} to ${updateData.status}`);
        }

      } catch (error) {
        console.error(`❌ Error checking order ${order.id}:`, error);
      }
    });

    await Promise.all(updatePromises);

    console.log(`🎯 Automatic check complete. Updated ${updatedCount} out of ${pendingOrders.length} orders`);

    return NextResponse.json({
      success: true,
      message: `Checked ${pendingOrders.length} pending orders`,
      updated: updatedCount,
      total: pendingOrders.length
    });

  } catch (error) {
    console.error('❌ Automatic pending order check error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check pending orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
