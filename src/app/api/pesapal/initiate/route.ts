import { NextRequest, NextResponse } from 'next/server';
import { submitPesapalOrder, getPesapalTransactionStatus } from '@/lib/pesapal';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      amount, 
      currency = 'KES',
      description,
      customerName,
      customerEmail,
      customerPhone,
      cartItems = [],
      deliveryInfo = {},
      callbackUrl,
      cancellationUrl 
    } = body;

    // Validate required fields
    if (!orderId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerEmail' },
        { status: 400 }
      );
    }

    // Create a new order directly
    const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({
          customer_first_name: customerName?.split(' ')[0] || 'Customer',
          customer_last_name: customerName?.split(' ').slice(1).join(' ') || 'Name',
          customer_email: customerEmail,
          customer_phone: customerPhone || '254700000000',
          subtotal: amount - 5.99, // Assuming 5.99 delivery fee
          delivery_fee: 5.99,
          total: amount,
          status: 'pending',
          payment_method: 'pesapal',
          payment_status: 'pending',
          delivery_address: deliveryInfo.address || 'Not provided',
          delivery_city: deliveryInfo.city || 'Not provided',
          delivery_state: deliveryInfo.state || 'Not provided',
          delivery_zip_code: deliveryInfo.zipCode || '00000',
          delivery_date: deliveryInfo.deliveryDate || new Date().toISOString().split('T')[0],
          delivery_time: deliveryInfo.deliveryTime || 'morning',
          special_instructions: deliveryInfo.specialInstructions || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (createError) {
      console.error('Error creating order:', createError);
      return NextResponse.json(
        { error: 'Failed to create order', details: createError.message },
        { status: 500 }
      );
    }

    const order = newOrder;

    // Create order items if cart items are provided
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_name: item.name,
        product_category: item.category || 'Strawberry Dips',
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Don't fail the request, just log the error
      }
    }

    // Prepare Pesapal order data
    const pesapalOrderData = {
      id: order.id,
      currency: currency,
      amount: Math.round(amount), // Pesapal requires whole numbers
      description: description || `Payment for order ${orderId}`,
      callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?order=${orderId}&status=success`,
      cancellation_url: cancellationUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?order=${orderId}&status=cancelled`,
      notification_id: order.id,
      billing_address: {
        phone_number: customerPhone || '254700000000',
        email_address: customerEmail,
        country_code: 'KE',
        first_name: customerName?.split(' ')[0] || 'Customer',
        last_name: customerName?.split(' ').slice(1).join(' ') || 'Name',
      }
    };

    // Submit order to Pesapal
    const pesapalResponse = await submitPesapalOrder(pesapalOrderData);

    // Update order with Pesapal tracking ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: pesapalResponse.order_tracking_id,
        pesapal_order_tracking_id: pesapalResponse.order_tracking_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with Pesapal reference:', updateError);
    }

    return NextResponse.json({
      success: true,
      orderTrackingId: pesapalResponse.order_tracking_id,
      redirectUrl: pesapalResponse.redirect_url,
      message: 'Order submitted successfully. Redirect to payment page.'
    });

  } catch (error) {
    console.error('Pesapal order submission error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit order to Pesapal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}