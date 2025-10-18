import { NextRequest, NextResponse } from 'next/server';
import { createMpesaPayment, createCardPayment } from '@/lib/intasend';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('IntaSend initiate API called');
    const body = await request.json();
    console.log('Request body:', { 
      orderId: body.orderId, 
      amount: body.amount, 
      paymentMethod: body.paymentMethod,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone 
    });
    const {
      orderId,
      amount,
      currency = 'KES',
      paymentMethod = 'mpesa', // 'mpesa' or 'card'
      customerName,
      customerEmail,
      customerPhone,
      cartItems = [],
      deliveryInfo = {}
    } = body;

    // Validate required fields
    if (!orderId || !amount || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerEmail, customerPhone' },
        { status: 400 }
      );
    }

    // Create a new order in Supabase
    const { data: newOrder, error: createError } = await supabase
      .from('orders')
      .insert({
        customer_first_name: customerName?.split(' ')[0] || 'Customer',
        customer_last_name: customerName?.split(' ').slice(1).join(' ') || 'Name',
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subtotal: amount - 5.99, // Assuming 5.99 delivery fee
        delivery_fee: 5.99,
        total: amount,
        status: 'pending',
        payment_method: 'intasend',
        payment_status: 'pending',
        delivery_address: deliveryInfo.address || 'Not provided',
        delivery_city: deliveryInfo.city || 'Not provided',
        delivery_state: deliveryInfo.state || 'Not provided',
        delivery_zip_code: deliveryInfo.area || 'Nairobi',
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

    // Prepare IntaSend payment data with proper phone number formatting
    const paymentData = {
      amount: Math.round(amount), // IntaSend requires whole numbers
      currency: currency,
      email: customerEmail,
      phone_number: (() => {
        let phone = customerPhone.replace(/^\+/, '');
        if (phone.startsWith('254')) {
          return phone;
        } else if (phone.startsWith('0')) {
          return '254' + phone.substring(1);
        } else {
          return '254' + phone;
        }
      })(),
      api_ref: order.id,
      first_name: customerName?.split(' ')[0] || 'Customer',
      last_name: customerName?.split(' ').slice(1).join(' ') || 'Name',
      address: deliveryInfo.address || 'Nairobi',
      city: deliveryInfo.city || 'Nairobi',
      state: deliveryInfo.state || 'Nairobi',
      zipcode: deliveryInfo.area || 'Nairobi',
      country: 'KE',
    };

    let intasendResponse;

    try {
      // Call IntaSend API directly (let IntaSend handle its own timeouts)
      if (paymentMethod === 'mpesa') {
        intasendResponse = await createMpesaPayment(paymentData);
      } else if (paymentMethod === 'card') {
        intasendResponse = await createCardPayment(paymentData);
      } else {
        return NextResponse.json(
          { error: 'Invalid payment method. Use "mpesa" or "card"' },
          { status: 400 }
        );
      }

    } catch (error) {
      // Surface more context from the IntaSend SDK/network layer
      const anyErr: any = error;
      const debugPayload = anyErr?.response?.data || anyErr?.data || anyErr?.message || anyErr;
      console.error('IntaSend API error:', debugPayload);

      // If IntaSend fails, mark order as failed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order status for failure:', updateError);
      }

      return NextResponse.json(
        {
          error: 'IntaSend payment failed',
          orderId: order.id,
          message: 'Payment failed. Please try again or contact support.',
          debug: typeof debugPayload === 'string' ? debugPayload : undefined
        },
        { status: 500 }
      );
    }

    // Update order with IntaSend reference
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: intasendResponse.invoice?.invoice_id || intasendResponse.id,
        intasend_invoice_id: intasendResponse.invoice?.invoice_id || intasendResponse.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with IntaSend reference:', updateError);
    }

    console.log('IntaSend response checkout URL:', intasendResponse.checkout_url);
    console.log('IntaSend response payment link:', intasendResponse.payment_link);
    console.log('IntaSend response invoice:', intasendResponse.invoice);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoiceId: intasendResponse.invoice?.invoice_id || intasendResponse.id,
      paymentMethod: paymentMethod,
      checkoutUrl: intasendResponse.checkout_url || intasendResponse.payment_link || null,
      message: paymentMethod === 'mpesa'
        ? 'M-Pesa STK push sent to your phone. Please enter your PIN to complete payment.'
        : (intasendResponse.checkout_url || intasendResponse.payment_link)
          ? 'Redirecting to card payment...'
          : 'Payment initiated successfully.',
    });

  } catch (error) {
    console.error('IntaSend initiate error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to initiate IntaSend payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

