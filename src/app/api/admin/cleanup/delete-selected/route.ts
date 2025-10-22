import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuth } from '@/lib/auth-middleware';

async function deleteSelectedOrders(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });
    }

    // Delete order items first (due to foreign key constraints)
    const { error: deleteOrderItemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .in('order_id', orderIds);

    if (deleteOrderItemsError) {
      console.error('Error deleting order items:', deleteOrderItemsError);
      return NextResponse.json({ error: 'Failed to delete order items' }, { status: 500 });
    }

    // Delete selected orders
    const { error: deleteOrdersError } = await supabaseAdmin
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (deleteOrdersError) {
      console.error('Error deleting orders:', deleteOrdersError);
      return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${orderIds.length} orders and their items` 
    });

  } catch (error) {
    console.error('Error deleting selected orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Protected admin endpoint
export const POST = withAdminAuth(deleteSelectedOrders);
