'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, FileText, Calendar, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  is_available: boolean;
  created_at: string;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers'>('sales');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      // Ensure we have arrays
      setOrders(Array.isArray(ordersData) ? ordersData : Array.isArray(ordersData?.orders) ? ordersData.orders : []);
      setProducts(Array.isArray(productsData) ? productsData : Array.isArray(productsData?.products) ? productsData.products : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return startDate;
  };

  const getFilteredOrders = () => {
    if (!Array.isArray(orders)) {
      return [];
    }
    const startDate = getDateRangeFilter();
    return orders.filter(order => new Date(order.created_at) >= startDate);
  };

  const getSalesStats = () => {
    const filteredOrders = getFilteredOrders();
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      orders: filteredOrders
    };
  };

  const getProductStats = () => {
    const filteredOrders = getFilteredOrders();
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    filteredOrders.forEach(order => {
      order.order_items.forEach(item => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product_name].quantity += item.quantity;
        productSales[item.product_name].revenue += item.total_price;
      });
    });

    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  };

  const getCustomerStats = () => {
    const filteredOrders = getFilteredOrders();
    const customerOrders: { [key: string]: { name: string; email: string; orders: number; total: number } } = {};

    filteredOrders.forEach(order => {
      const key = order.customer_email;
      if (!customerOrders[key]) {
        customerOrders[key] = {
          name: `${order.customer_first_name} ${order.customer_last_name}`,
          email: order.customer_email,
          orders: 0,
          total: 0
        };
      }
      customerOrders[key].orders += 1;
      customerOrders[key].total += order.total;
    });

    return Object.values(customerOrders).sort((a, b) => b.total - a.total);
  };

  const generateReport = () => {
    const stats = getSalesStats();
    const productStats = getProductStats();
    const customerStats = getCustomerStats();
    const dateRangeText = dateRange.charAt(0).toUpperCase() + dateRange.slice(1);

    let reportContent = `
STRAWBERRY DIPS - BUSINESS REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${dateRangeText}

=== SALES SUMMARY ===
Total Revenue: KSH ${stats.totalRevenue.toFixed(2)}
Total Orders: ${stats.totalOrders}
Average Order Value: KSH ${stats.averageOrderValue.toFixed(2)}

=== TOP PRODUCTS ===
`;

    productStats.slice(0, 10).forEach((product, index) => {
      reportContent += `${index + 1}. ${product.name}
   Quantity Sold: ${product.quantity}
   Revenue: KSH ${product.revenue.toFixed(2)}

`;
    });

    reportContent += `
=== TOP CUSTOMERS ===
`;

    customerStats.slice(0, 10).forEach((customer, index) => {
      reportContent += `${index + 1}. ${customer.name} (${customer.email})
   Orders: ${customer.orders}
   Total Spent: KSH ${customer.total.toFixed(2)}

`;
    });

    reportContent += `
=== RECENT ORDERS ===
`;

    stats.orders.slice(0, 20).forEach(order => {
      reportContent += `Order #${order.id}
Customer: ${order.customer_first_name} ${order.customer_last_name}
Date: ${new Date(order.created_at).toLocaleDateString()}
Total: KSH ${order.total.toFixed(2)}
Status: ${order.status}

`;
    });

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strawberry-dips-report-${dateRange}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading report data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Reports</h1>
            <p className="text-gray-600">Generate and download comprehensive business reports</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              There are no orders or products to generate reports from yet.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Add some products to your inventory</p>
              <p>• Process some orders</p>
              <p>• Come back to generate reports</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSalesStats();
  const productStats = getProductStats();
  const customerStats = getCustomerStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">Business Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive business reports</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="sales">Sales Report</option>
                <option value="products">Product Performance</option>
                <option value="customers">Customer Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateReport}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Generate Report</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSH {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Last {dateRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-gray-500">Last {dateRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSH {stats.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Top Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productStats.slice(0, 5).map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KSH {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Customers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerStats.slice(0, 5).map((customer, index) => (
                  <div key={customer.email} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KSH {customer.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
