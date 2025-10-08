import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    const format = searchParams.get('format') || 'csv';

    console.log('Export request received:', { period, format });

    // Calculate date range
    const now = new Date();
    let startDate: string;
    
    switch (period) {
      case 'day':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    console.log('Date range:', { startDate, period });

    // Get orders data - only confirmed/paid orders for accurate analytics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total, created_at, customer_first_name, customer_last_name, customer_email, customer_phone, payment_method')
      .gte('created_at', startDate)
      .in('status', ['delivered', 'preparing', 'confirmed', 'paid']) // Only include successful orders
      .order('created_at', { ascending: false });

    console.log('Orders query result:', { ordersCount: orders?.length, error: ordersError });

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json({ 
        error: `Failed to fetch orders data: ${ordersError.message}`,
        details: ordersError 
      }, { status: 500 });
    }

    // Calculate basic stats - only confirmed orders
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const preparingOrders = orders?.filter(order => order.status === 'preparing').length || 0;
    const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
    const confirmedOrders = orders?.filter(order => order.status === 'confirmed').length || 0;
    const paidOrders = orders?.filter(order => order.status === 'paid').length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    console.log('Calculated stats:', { totalOrders, totalRevenue, averageOrderValue });

    if (format === 'csv') {
      // Generate simple CSV content
      let csv = '';
      
      // Header
      csv += 'STRAWBERRY DIPS ANALYTICS REPORT\n';
      csv += `Period: ${period}\n`;
      csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      
      // Summary
      csv += 'SUMMARY STATISTICS (Confirmed Orders Only)\n';
      csv += 'Metric,Value\n';
      csv += `Total Confirmed Orders,${totalOrders}\n`;
      csv += `Total Revenue,KES ${totalRevenue.toFixed(2)}\n`;
      csv += `Average Order Value,KES ${averageOrderValue.toFixed(2)}\n`;
      csv += `Orders In Progress,${preparingOrders}\n`;
      csv += `Completed Orders,${completedOrders}\n`;
      csv += `Confirmed Orders,${confirmedOrders}\n`;
      csv += `Paid Orders,${paidOrders}\n\n`;
      
      // Orders detail
      csv += 'DETAILED ORDERS (Confirmed/Paid Only)\n';
      csv += 'Order ID,Date,Customer Name,Email,Phone,Status,Total,Payment Method\n';
      
      if (orders && orders.length > 0) {
        orders.forEach((order) => {
          const customerName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim();
          csv += `"${order.id}","${new Date(order.created_at).toLocaleDateString()}","${customerName}","${order.customer_email || ''}","${order.customer_phone || ''}","${order.status}","KES ${order.total || 0}","${order.payment_method || ''}"\n`;
        });
      } else {
        csv += 'No orders found for the selected period\n';
      }

      const filename = `strawberry-dips-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      
      console.log('CSV generated successfully, filename:', filename);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ 
      error: 'Only CSV format is supported' 
    }, { status: 400 });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}