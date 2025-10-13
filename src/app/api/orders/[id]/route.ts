import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders/[id] - Get order details for tracking
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | any
) {
  try {
    const orderId = (context as any)?.params?.id as string;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_category,
          unit_price,
          quantity,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform order items to match expected format
    const transformedOrder: any = {
      ...order,
      order_items: order.order_items?.map((item: any) => ({
        id: item.id,
        product_name: item.product_name,
        product_category: item.product_category,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price
      })) || []
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error('Error in order tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}