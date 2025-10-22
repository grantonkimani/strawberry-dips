import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuth } from '@/lib/auth-middleware';

async function analyzeTestData() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get total counts
    const { data: totalOrders, error: totalError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact' });

    if (totalError) {
      console.error('Error getting total orders:', totalError);
      return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
    }

    // Get test orders (orders with test-like emails or names)
    const { data: testOrders, error: testOrdersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .or(`
        customer_email.ilike.%test%,
        customer_email.ilike.%@example%,
        customer_email.ilike.%@test%,
        customer_first_name.ilike.%test%,
        customer_email.ilike.%admin%
      `);

    if (testOrdersError) {
      console.error('Error getting test orders:', testOrdersError);
      return NextResponse.json({ error: 'Failed to analyze test data' }, { status: 500 });
    }

    // Get test order items count
    const testOrderIds = testOrders?.map(order => order.id) || [];
    let testOrderItemsCount = 0;
    
    if (testOrderIds.length > 0) {
      const { count: orderItemsCount, error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .select('*', { count: 'exact' })
        .in('order_id', testOrderIds);

      if (!orderItemsError) {
        testOrderItemsCount = orderItemsCount || 0;
      }
    }

    // Get test customers count
    const testCustomerEmails = testOrders?.map(order => order.customer_email) || [];
    let testCustomersCount = 0;
    
    if (testCustomerEmails.length > 0) {
      const { count: customersCount, error: customersError } = await supabaseAdmin
        .from('customers')
        .select('*', { count: 'exact' })
        .in('email', testCustomerEmails);

      if (!customersError) {
        testCustomersCount = customersCount || 0;
      }
    }

    // Get sample test orders (limit to 10)
    const sampleOrders = testOrders?.slice(0, 10).map(order => ({
      id: order.id,
      customer_email: order.customer_email,
      customer_first_name: order.customer_first_name,
      customer_last_name: order.customer_last_name,
      status: order.status,
      payment_status: order.payment_status,
      total: order.total,
      created_at: order.created_at
    })) || [];

    return NextResponse.json({
      totalOrders: totalOrders?.length || 0,
      testOrders: testOrders?.length || 0,
      testOrderItems: testOrderItemsCount,
      testCustomers: testCustomersCount,
      sampleOrders
    });

  } catch (error) {
    console.error('Error analyzing test data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

// Protected admin endpoints
export const GET = withAdminAuth(analyzeTestData);
export const POST = withAdminAuth(deleteTestData);
