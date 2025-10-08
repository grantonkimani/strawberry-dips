import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges
    const now = new Date();
    let dateFilter = '';
    
    if (startDate && endDate) {
      dateFilter = `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else {
      switch (period) {
        case 'day':
          const today = now.toISOString().split('T')[0];
          dateFilter = `AND created_at >= '${today}'`;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          dateFilter = `AND created_at >= '${weekAgo}'`;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          dateFilter = `AND created_at >= '${monthAgo}'`;
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          dateFilter = `AND created_at >= '${yearAgo}'`;
          break;
      }
    }

    // Get order statistics - only confirmed/paid orders for accurate analytics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['delivered', 'preparing', 'confirmed', 'paid']); // Only include successful orders

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
      pending_orders: preparingOrders, // Renamed to be more accurate
      completed_orders: completedOrders,
      cancelled_orders: 0, // Not included in our query anymore
      average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };

    // Get product performance - only for confirmed orders
    const { data: productStats, error: productError } = await supabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        total_price,
        orders!inner(created_at, status)
      `)
      .gte('orders.created_at', startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('orders.status', ['delivered', 'preparing', 'confirmed', 'paid']);

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
    const { data: paymentStats, error: paymentError } = await supabase
      .from('orders')
      .select('payment_method')
      .gte('created_at', startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const paymentMethods = paymentStats?.reduce((acc: any, order: any) => {
      const method = order.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get customer statistics
    const { data: customerStats, error: customerError } = await supabase
      .from('customers')
      .select('id, created_at, email_verified')
      .gte('created_at', startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

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
