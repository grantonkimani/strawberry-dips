'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, DollarSign, Eye, MapPin, Calendar, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  product_name: string;
  product_category: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  stripe_payment_intent_id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip_code: string;
  delivery_date: string;
  delivery_time: string;
  special_instructions: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(query) ||
          order.id.slice(0, 8).toLowerCase().includes(query) ||
          `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(query) ||
          order.customer_email.toLowerCase().includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
        setFilteredOrders(data);
      } else if (data.orders) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
      </div>

      {/* Navigation */}
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Orders ({filteredOrders.length}{filteredOrders.length !== orders.length ? ` of ${orders.length}` : ''})</CardTitle>
                </div>
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Order ID or Customer Name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or clear the search to see all orders.</p>
                    <Button onClick={clearSearch} variant="outline" className="mt-4">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                #{order.id.slice(0, 8)}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.customer_first_name} {order.customer_last_name}
                            </p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">KSH {order.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Order ID:</span> #{selectedOrder.id.slice(0, 8)}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1 capitalize">{selectedOrder.status}</span>
                        </span>
                      </p>
                      <p><span className="font-medium">Total:</span> KSH {selectedOrder.total.toFixed(2)}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Address:</span> {selectedOrder.delivery_address}</p>
                      <p><span className="font-medium">City:</span> {selectedOrder.delivery_city}, {selectedOrder.delivery_state} {selectedOrder.delivery_zip_code}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.delivery_date).toLocaleDateString()}</p>
                      <p><span className="font-medium">Time:</span> {selectedOrder.delivery_time}</p>
                      {selectedOrder.special_instructions && (
                        <p><span className="font-medium">Instructions:</span> {selectedOrder.special_instructions}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">KSH {item.total_price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'paid' ? 'default' : 'outline'}
                        onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                        className={selectedOrder.status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        Paid
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                        className={selectedOrder.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'cancelled' ? 'default' : 'outline'}
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        className={selectedOrder.status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                  <p className="text-gray-600">Click on an order to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


