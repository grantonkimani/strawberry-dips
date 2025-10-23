import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const {
      customer,
      items,
      total,
      paymentIntentId,
      paymentMethod
    } = await request.json();

    console.log('Order creation request:', { customer, items: items?.length, total, paymentIntentId, paymentMethod });

    // Validate required fields
    if (!customer || !items || !total || !paymentIntentId) {
      console.error('Missing required fields:', { customer: !!customer, items: !!items, total: !!total, paymentIntentId: !!paymentIntentId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate customer fields
    if (!customer.email || !customer.firstName || !customer.lastName) {
      console.error('Missing customer fields:', customer);
      return NextResponse.json(
        { error: 'Missing customer information' },
        { status: 400 }
      );
    }

    // Start a transaction-like operation
    // First, create or get customer
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single();

    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from('customers')
        .insert({
          email: customer.email,
          first_name: customer.firstName,
          last_name: customer.lastName,
          phone: customer.phone,
          email_verified: false, // Guest customers are not verified
          is_active: true
        })
        .select('id')
        .single();

      if (newCustomerError) {
        console.error('Customer creation error:', newCustomerError);
        return NextResponse.json(
          { error: `Failed to create customer: ${newCustomerError.message}` },
          { status: 500 }
        );
      }
      customerId = newCustomer.id;
    }

    // Generate tracking code
    const generateTrackingCode = () =>
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        customer_account_id: customerId, // Link to customer account
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
        subtotal: total - 5.99, // Subtract delivery fee
        delivery_fee: 5.99,
        total: total,
        customer_email: customer.email,
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        customer_phone: customer.phone,
        delivery_address: customer.address || 'N/A',
        delivery_city: customer.city,
        delivery_state: customer.area || customer.state || 'N/A', // Use area from form
        delivery_zip_code: customer.zipCode || 'N/A', // Make optional
        delivery_date: customer.deliveryDate || new Date().toISOString().split('T')[0],
        delivery_time: customer.deliveryTime || null,
        special_instructions: customer.specialInstructions || null,
        payment_method: 'intasend', // Default payment method
        payment_status: 'completed',
        tracking_code: generateTrackingCode()
      })
      .select('id, tracking_code')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: `Database error: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name,
      product_category: item.category,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      // Gift metadata persisted
      is_gift: item.isGift ?? false,
      recipient_name: item.recipientName ?? null,
      gift_note: item.giftNote ?? null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // Send order confirmation email with invoice
    try {
      const emailResult = await sendOrderConfirmationEmail({
        id: order.id,
        created_at: order.created_at,
        customer_name: customer.name,
        customer_email: customer.email,
        phone: customer.phone,
        delivery_address: `${customer.address}, ${customer.city}, ${customer.area || customer.state || 'N/A'}`,
        delivery_date: customer.deliveryDate || new Date().toISOString().split('T')[0],
        delivery_time: customer.deliveryTime || null,
        notes: customer.specialInstructions || null,
        subtotal: total - (deliveryFee || 0),
        delivery_fee: deliveryFee || 0,
        discount: 0,
        total: total,
        order_items: items.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity
        })),
        tracking_code: order.tracking_code,
      });
      
      if (!emailResult.success) {
        console.warn('Order confirmation email failed:', emailResult.error);
        // Don't fail the request if email fails
      } else {
        console.log('Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      trackingCode: order.tracking_code,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

