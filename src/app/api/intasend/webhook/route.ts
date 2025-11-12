import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';
import crypto from 'crypto';

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    console.log('IntaSend webhook received:', { hasBody: !!rawBody });

    // HMAC signature verification (if signing secret is configured)
    // Prefer INTASEND_WEBHOOK_SIGNING_SECRET; fallback to INTASEND_SECRET_KEY if provided
    const signingSecret = process.env.INTASEND_WEBHOOK_SIGNING_SECRET || process.env.INTASEND_SECRET_KEY;
    const signatureHeader =
      request.headers.get('x-intasend-signature') ||
      request.headers.get('X-IntaSend-Signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('X-Signature');

    if (signingSecret) {
      if (!signatureHeader) {
        console.error('Missing IntaSend signature header');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const computed = crypto
        .createHmac('sha256', signingSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      if (!timingSafeEqual(computed, signatureHeader)) {
        console.error('Invalid IntaSend signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Optional shared-secret validation (legacy challenge). Only check if no HMAC signingSecret was used.
    if (!signingSecret) {
      const expectedSecret = process.env.INTASEND_WEBHOOK_SECRET;
      if (expectedSecret) {
        const provided = (body && (body.challenge || body.Challenge)) as string | undefined;
        if (!provided || provided !== expectedSecret) {
          console.error('Invalid IntaSend webhook secret/challenge');
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

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

    // Idempotency and monotonic status updates
    const precedence: Record<string, number> = { failed: 0, pending: 1, completed: 2 };
    const currentPaymentStatus = (order as any)?.payment_status || 'pending';

    // Map IntaSend states to our payment status and order status
    let nextPaymentStatus: 'pending' | 'completed' | 'failed' | undefined;
    let nextOrderStatus: string | undefined;
    const updateData: any = { updated_at: new Date().toISOString() };

    if (state === 'COMPLETE') {
      nextPaymentStatus = 'completed';
      nextOrderStatus = 'paid'; // Set to 'paid' instead of 'confirmed' for delivery workflow
      if (mpesa_reference) updateData.payment_reference = mpesa_reference;
    } else if (state === 'PENDING') {
      nextPaymentStatus = 'pending';
    } else if (state === 'FAILED') {
      nextPaymentStatus = 'failed';
      nextOrderStatus = 'cancelled';
      if (failed_reason) updateData.payment_error = failed_reason;
    } else {
      console.log('Unknown IntaSend state:', state);
    }

    // Attach invoice id if we have it and it's missing
    if (invoice_id && !(order as any)?.intasend_invoice_id) {
      updateData.intasend_invoice_id = invoice_id;
    }

    // If we have a next payment status, decide whether to update based on precedence
    if (nextPaymentStatus) {
      const shouldUpdate =
        precedence[nextPaymentStatus] > (precedence[currentPaymentStatus] ?? 0) ||
        // Always allow setting same status to be idempotent (no-op update allowed)
        nextPaymentStatus === currentPaymentStatus;

      if (!shouldUpdate) {
        return NextResponse.json({ success: true, message: 'No status change' });
      }

      updateData.payment_status = nextPaymentStatus;
      if (nextOrderStatus) updateData.status = nextOrderStatus;
    }

    // Update the order (idempotent: if no fields to change, avoid DB call)
    if (Object.keys(updateData).length > 1) {
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
    }

    // If no update was needed or it succeeded, continue

    console.log('Order updated successfully from webhook:', {
      orderId: order.id,
      newStatus: (updateData as any).status || currentPaymentStatus,
      paymentStatus: (updateData as any).payment_status || currentPaymentStatus
    });

    // Send confirmation email ONLY when payment is confirmed (COMPLETE)
    if (state === 'COMPLETE' && nextPaymentStatus === 'completed') {
      try {
        // Fetch full order details with items for email
        const { data: fullOrder, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('id', order.id)
          .single();

        if (!fetchError && fullOrder) {
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
            total: fullOrder.total,
            order_items: fullOrder.order_items?.map((item: any) => ({
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              line_total: item.total_price || (item.unit_price * item.quantity)
            })) || [],
          });

          if (!emailResult.success) {
            console.warn('Order confirmation email failed:', emailResult.error);
          } else {
            console.log('Order confirmation email sent successfully after payment confirmation');
          }
        }
      } catch (emailError) {
        console.error('Email sending error in webhook:', emailError);
        // Don't fail the webhook if email fails
      }
    }

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

