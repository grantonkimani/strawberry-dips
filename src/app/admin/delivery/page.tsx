'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Calendar, Search, X, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
  payment_status: string;
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
  order_note?: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export default function DeliveryManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'delivery_date'>('date_desc');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders to only show paid orders and apply other filters
  useEffect(() => {
    let filtered = orders.filter(order => 
      order.status === 'paid' || 
      order.status === 'confirmed' || 
      order.status === 'preparing' || 
      order.status === 'out_for_delivery' || 
      order.status === 'delivered'
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => (
        order.id.toLowerCase().includes(query) ||
        order.id.slice(0, 8).toLowerCase().includes(query) ||
        `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        order.delivery_address.toLowerCase().includes(query)
      ));
    }

    // Sort
    if (sortBy === 'date_desc') {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'date_asc') {
      filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'delivery_date') {
      filtered = [...filtered].sort((a, b) => new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime());
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.orders) {
        setOrders(data.orders);
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

  const loadOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.order) {
        setSelectedOrder(json.order);
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, order_items: json.order.order_items || [] } : o)) as Order[]);
        setFilteredOrders(prev => prev.map(o => (o.id === orderId ? { ...o, order_items: json.order.order_items || [] } : o)) as Order[]);
      }
    } catch {}
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
        
        alert(`Order status updated to ${newStatus}${data.message.includes('email sent') ? ' and email sent!' : ''}`);
      } else {
        alert(`Failed to update order status: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'paid':
        return 'preparing';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
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
          <p className="text-gray-600">Loading delivery orders...</p>
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
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchOrders();
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-pink-100 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Delivery Management</h1>
          <p className="text-gray-600">Manage paid orders through the delivery process</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>Paid Orders ({filteredOrders.length})</CardTitle>
                <div className="flex flex-col gap-2 w-full md:flex-row md:flex-wrap md:items-center md:justify-end md:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto"
                      title="Filter by status"
                    >
                      <option value="all">All paid orders</option>
                      <option value="paid">Paid</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto"
                    title="Sort orders"
                  >
                    <option value="date_desc">Newest first</option>
                    <option value="date_asc">Oldest first</option>
                    <option value="delivery_date">Delivery date</option>
                  </select>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Address..."
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
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No paid orders found</h3>
                  <p className="text-gray-600">
                    {orders.filter(o => o.status === 'paid' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'out_for_delivery' || o.status === 'delivered').length === 0
                      ? 'No paid orders available for delivery management.'
                      : 'Try adjusting your search terms or filters.'
                    }
                  </p>
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
                      onClick={() => {
                        setSelectedOrder(order);
                        if (!order.order_items) {
                          loadOrderDetails(order.id);
                        }
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="w-full sm:w-auto">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              #{order.id.slice(0, 8)}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status.replace('_', ' ')}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.customer_first_name} {order.customer_last_name}
                          </p>
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.delivery_city}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.delivery_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="font-semibold text-gray-900">KSH {order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, getNextStatus(order.status)!);
                              }}
                              disabled={updatingStatus === order.id}
                              className="mt-2 bg-pink-600 hover:bg-pink-700 text-white"
                            >
                              {updatingStatus === order.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                `Mark as ${getNextStatus(order.status)?.replace('_', ' ')}`
                              )}
                            </Button>
                          )}
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
                        <span className="ml-1 capitalize">
                          {selectedOrder.status.replace('_', ' ')}
                        </span>
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
                      <p><span className="font-medium">Delivery Instructions:</span> {selectedOrder.special_instructions}</p>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.order_note && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Order Notes</h3>
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">{selectedOrder.order_note}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                  <div className="space-y-2">
                    {(selectedOrder.order_items || []).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">KSH {item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                    {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) && (
                      <p className="text-sm text-gray-500">No items to display.</p>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                  <div className="space-y-2">
                    {getNextStatus(selectedOrder.status) && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                        disabled={updatingStatus === selectedOrder.id}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        {updatingStatus === selectedOrder.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          `Mark as ${getNextStatus(selectedOrder.status)?.replace('_', ' ')}`
                        )}
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'preparing' ? 'default' : 'outline'}
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        className={selectedOrder.status === 'preparing' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        Preparing
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedOrder.status === 'out_for_delivery' ? 'default' : 'outline'}
                        onClick={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                        className={selectedOrder.status === 'out_for_delivery' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        Out for Delivery
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className={`w-full ${selectedOrder.status === 'delivered' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      Delivered
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                <p className="text-gray-600">Click on an order to view details and manage delivery</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
