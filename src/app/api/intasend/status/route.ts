import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/intasend';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
          
          // Send confirmation email ONLY when payment is confirmed (COMPLETE)
          // This is a backup in case webhook doesn't fire
          if (statusResponse.invoice?.state === 'COMPLETE' && updateData.payment_status === 'completed') {
            try {
              // Fetch full order details with items for email
              const { data: fullOrder, error: fetchError } = await supabase
                .from('orders')
                .select(`
                  *,
                  order_items (*)
                `)
                .eq(orderId ? 'id' : 'intasend_invoice_id', orderId || invoice_id)
                .single();

              if (!fetchError && fullOrder) {
                // Check if email was already sent (to avoid duplicates)
                // We'll check by looking at a flag or just send it (idempotent)
                const vatAmount = Math.max(
                  parseFloat(
                    (
                      (fullOrder.total || 0) -
                      (fullOrder.subtotal || 0) -
                      (fullOrder.delivery_fee || 0) +
                      (fullOrder.discount || 0)
                    ).toFixed(2)
                  ),
                  0
                );

                const emailResult = await sendOrderConfirmationEmail({
                  id: fullOrder.id,
                  created_at: fullOrder.created_at,
                  customer_name: fullOrder.customer_first_name 
                    ? `${fullOrder.customer_first_name} ${fullOrder.customer_last_name || ''}`.trim() 
                    : 'Customer',
                  customer_email: fullOrder.customer_email,
                  phone: fullOrder.customer_phone,
                  delivery_address: fullOrder.delivery_address,
                  delivery_date: fullOrder.delivery_date,
                  delivery_time: fullOrder.delivery_time,
                  notes: fullOrder.special_instructions,
                  subtotal: fullOrder.subtotal || (fullOrder.total - (fullOrder.delivery_fee || 0)),
                  delivery_fee: fullOrder.delivery_fee || 0,
                  discount: 0,
                  vat_amount: vatAmount,
                  total: fullOrder.total,
                  order_items: fullOrder.order_items?.map((item: any) => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    line_total: item.total_price || (item.unit_price * item.quantity)
                  })) || [],
                });

                if (!emailResult.success) {
                  console.warn('Order confirmation email failed in status check:', emailResult.error);
                } else {
                  console.log('Order confirmation email sent successfully after status check confirmation');
                }
              }
            } catch (emailError) {
              console.error('Email sending error in status check:', emailError);
              // Don't fail the status check if email fails
            }
          }
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

