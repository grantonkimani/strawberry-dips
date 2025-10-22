import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuth } from '@/lib/auth-middleware';

async function deleteTestData() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // First, get all test order IDs
    const { data: testOrders, error: testOrdersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .or(`
        customer_email.ilike.%test%,
        customer_email.ilike.%@example%,
        customer_email.ilike.%@test%,
        customer_first_name.ilike.%test%,
        customer_email.ilike.%admin%
      `);

    if (testOrdersError) {
      console.error('Error getting test orders:', testOrdersError);
      return NextResponse.json({ error: 'Failed to get test orders' }, { status: 500 });
    }

    const testOrderIds = testOrders?.map(order => order.id) || [];

    if (testOrderIds.length === 0) {
      return NextResponse.json({ message: 'No test data found to delete' });
    }

    // Delete order items first (due to foreign key constraints)
    const { error: deleteOrderItemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .in('order_id', testOrderIds);

    if (deleteOrderItemsError) {
      console.error('Error deleting order items:', deleteOrderItemsError);
      return NextResponse.json({ error: 'Failed to delete order items' }, { status: 500 });
    }

    // Delete test orders
    const { error: deleteOrdersError } = await supabaseAdmin
      .from('orders')
      .delete()
      .in('id', testOrderIds);

    if (deleteOrdersError) {
      console.error('Error deleting orders:', deleteOrdersError);
      return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Successfully deleted ${testOrderIds.length} test orders and their items` 
    });

  } catch (error) {
    console.error('Error deleting test data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Protected admin endpoint
export const POST = withAdminAuth(deleteTestData);
