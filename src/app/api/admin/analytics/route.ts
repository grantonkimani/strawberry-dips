import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year, all
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges
    const now = new Date();
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    if (startDate && endDate) {
      rangeStart = new Date(startDate).toISOString();
      rangeEnd = new Date(endDate).toISOString();
    } else {
      switch (period) {
        case 'day': {
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          rangeStart = todayStart.toISOString();
          rangeEnd = now.toISOString();
          break;
        }
        case 'week': {
          rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          rangeEnd = now.toISOString();
          break;
        }
        case 'month': {
          rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          rangeEnd = now.toISOString();
          break;
        }
        case 'year': {
          rangeStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          rangeEnd = now.toISOString();
          break;
        }
        case 'all':
        default: {
          rangeStart = null;
          rangeEnd = null;
        }
      }
    }

    // Get order statistics - only confirmed/paid orders for accurate analytics
    let ordersQuery = supabase
      .from('orders')
      .select('*')
      .in('status', ['delivered', 'preparing', 'confirmed', 'paid']);
    if (rangeStart) ordersQuery = ordersQuery.gte('created_at', rangeStart);
    if (rangeEnd) ordersQuery = ordersQuery.lte('created_at', rangeEnd);
    const { data: orders, error: ordersError } = await ordersQuery; // Only include successful orders

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to fetch order statistics' }, { status: 500 });
    }

    // Calculate stats manually - only for confirmed orders
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
    const paidOrders = orders.filter(order => order.status === 'paid').length;

    const orderStats = {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      pending_orders: preparingOrders, // preparing
      completed_orders: completedOrders,
      confirmed_orders: confirmedOrders,
      paid_orders: paidOrders,
      cancelled_orders: 0,
      average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };

    // Get product performance - only for confirmed orders
    let productQuery = supabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        total_price,
        orders!inner(created_at, status)
      `)
      .in('orders.status', ['delivered', 'preparing', 'confirmed', 'paid']);
    if (rangeStart) productQuery = productQuery.gte('orders.created_at', rangeStart);
    if (rangeEnd) productQuery = productQuery.lte('orders.created_at', rangeEnd);
    const { data: productStats, error: productError } = await productQuery;

    // Process product data
    const productPerformance = productStats?.reduce((acc: any, item: any) => {
      const productName = item.product_name;
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          quantity_sold: 0,
          revenue: 0,
          orders: 0
        };
      }
      acc[productName].quantity_sold += item.quantity;
      acc[productName].revenue += item.total_price;
      acc[productName].orders += 1;
      return acc;
    }, {}) || {};

    const topProducts = Object.values(productPerformance)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get payment method statistics
    let paymentQuery = supabase
      .from('orders')
      .select('payment_method');
    if (rangeStart) paymentQuery = paymentQuery.gte('created_at', rangeStart);
    if (rangeEnd) paymentQuery = paymentQuery.lte('created_at', rangeEnd);
    const { data: paymentStats, error: paymentError } = await paymentQuery;

    const paymentMethods = paymentStats?.reduce((acc: any, order: any) => {
      const method = order.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get customer statistics
    let customerQuery = supabase
      .from('customers')
      .select('id, created_at, email_verified');
    if (rangeStart) customerQuery = customerQuery.gte('created_at', rangeStart);
    if (rangeEnd) customerQuery = customerQuery.lte('created_at', rangeEnd);
    const { data: customerStats, error: customerError } = await customerQuery;

    const newCustomers = customerStats?.length || 0;
    const verifiedCustomers = customerStats?.filter(c => c.email_verified).length || 0;

    // Get recent orders for activity feed
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        customer_first_name,
        customer_last_name,
        customer_email
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        period,
        orderStats: orderStats,
        topProducts,
        paymentMethods,
        customerStats: {
          new_customers: newCustomers,
          verified_customers: verifiedCustomers,
          verification_rate: newCustomers > 0 ? (verifiedCustomers / newCustomers) * 100 : 0
        },
        recentOrders: recentOrders || []
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
