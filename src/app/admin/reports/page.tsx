'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  orderStats: {
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
  };
  topProducts: Array<{
    name: string;
    quantity_sold: number;
    revenue: number;
    orders: number;
  }>;
  paymentMethods: Record<string, number>;
  customerStats: {
    new_customers: number;
    verified_customers: number;
    verification_rate: number;
  };
  recentOrders: Array<{
  id: string;
    status: string;
    total: number;
    created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriod === 'custom') {
        if (customDateRange.startDate) params.append('startDate', customDateRange.startDate);
        if (customDateRange.endDate) params.append('endDate', customDateRange.endDate);
      } else {
        params.append('period', selectedPeriod);
      }

      const response = await fetch(`/api/admin/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch analytics:', result.error);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedPeriod === 'custom') {
        if (customDateRange.startDate) params.append('startDate', customDateRange.startDate);
        if (customDateRange.endDate) params.append('endDate', customDateRange.endDate);
      } else {
        params.append('period', selectedPeriod);
      }
      params.append('format', 'csv');

      const response = await fetch(`/api/admin/analytics/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strawberry-dips-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export failed:', response.statusText);
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'preparing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button 
              onClick={handleExport}
              className="bg-pink-600 hover:bg-pink-700 text-white flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Period:</label>
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  size="sm"
                  className={selectedPeriod === period.value ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  {period.label}
                </Button>
              ))}
            </div>
        </div>

          {selectedPeriod === 'custom' && (
            <div className="mt-4 flex items-center space-x-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </div>
              <Button
                onClick={fetchAnalytics}
                className="mt-6 bg-pink-600 hover:bg-pink-700 text-white"
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(data.orderStats.total_revenue)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Revenue growth</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.orderStats.total_orders}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Order volume</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(data.orderStats.average_order_value)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-purple-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Value per order</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.customerStats.new_customers}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-pink-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Customer growth</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Completed Orders</span>
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data.orderStats.completed_orders}
                  </div>
                  <p className="text-sm text-gray-600">
                    {data.orderStats.total_orders > 0 
                      ? `${((data.orderStats.completed_orders / data.orderStats.total_orders) * 100).toFixed(1)}% completion rate`
                      : 'No orders yet'
                    }
                  </p>
            </CardContent>
          </Card>

          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span>In Progress</span>
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {data.orderStats.pending_orders}
                  </div>
                  <p className="text-sm text-gray-600">
                    Orders being prepared
                  </p>
            </CardContent>
          </Card>

          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Confirmed Orders</span>
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data.orderStats.total_orders - data.orderStats.completed_orders - data.orderStats.pending_orders}
                  </div>
                  <p className="text-sm text-gray-600">
                    Orders confirmed and paid
                  </p>
            </CardContent>
          </Card>
        </div>

            {/* Top Products & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-pink-600" />
                <span>Top Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {data.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-pink-600">#{index + 1}</span>
                          </div>
                    <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.quantity_sold} sold</p>
                          </div>
                    </div>
                    <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                          <p className="text-sm text-gray-600">{product.orders} orders</p>
                    </div>
                  </div>
                ))}
                    {data.topProducts.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No product data available</p>
                    )}
              </div>
            </CardContent>
          </Card>

              {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-pink-600" />
                    <span>Recent Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {data.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                    <div>
                            <p className="font-medium text-gray-900">
                              {order.customer_first_name} {order.customer_last_name}
                            </p>
                            <p className="text-sm text-gray-600">#{order.id.slice(0, 8)}</p>
                          </div>
                    </div>
                    <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    ))}
                    {data.recentOrders.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No recent orders</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-pink-600" />
                    <span>Payment Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(data.paymentMethods).map(([method, count]) => (
                      <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{method}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
}