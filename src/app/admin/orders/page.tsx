'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, DollarSign, Eye, MapPin, Calendar, Search, X, ChevronDown, ChevronUp, ShoppingBag, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  product_name: string;
  product_category: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  product_image_url?: string | null;
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
  order_items?: OrderItem[]; // not included in list API; fetched on demand
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFailedOrders, setShowFailedOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled' | 'out_for_delivery' | 'confirmed' | 'failed' | 'timeout' | 'document_pending'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'status'>('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchOrders(0, page);
  }, [page]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // First filter out failed orders if toggle is off
    if (!showFailedOrders) {
      const failedStatuses = ['intasend_timeout', 'failed', 'document_pending'];
      filtered = orders.filter(order => !failedStatuses.includes(order.payment_status));
    }

    // Apply explicit status filter if selected
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'failed') return order.payment_status === 'failed';
        if (statusFilter === 'timeout') return order.payment_status === 'intasend_timeout';
        if (statusFilter === 'document_pending') return order.payment_status === 'document_pending';
        if (statusFilter === 'confirmed') return order.status === 'paid' || order.status === 'confirmed';
        if (statusFilter === 'out_for_delivery') return order.status === 'out_for_delivery';
        return order.status === statusFilter;
      });
    }

    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => (
        order.id.toLowerCase().includes(query) ||
        order.id.slice(0, 8).toLowerCase().includes(query) ||
        `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query)
      ));
    }

    // Sort
    if (sortBy === 'date_desc') {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'date_asc') {
      filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'status') {
      const precedence: Record<string, number> = {
        // delivery lifecycle first if present
        out_for_delivery: 5,
        confirmed: 4,
        paid: 4,
        pending: 3,
        cancelled: 1,
        // payment failure buckets
        document_pending: 2,
        intasend_timeout: 2,
        failed: 0,
        default: 2,
      };
      filtered = [...filtered].sort((a, b) => {
        const aKey = (a.status || 'default').toLowerCase();
        const bKey = (b.status || 'default').toLowerCase();
        const aPay = (a.payment_status || '').toLowerCase();
        const bPay = (b.payment_status || '').toLowerCase();
        const aRank = precedence[aKey] ?? precedence[aPay] ?? precedence.default;
        const bRank = precedence[bKey] ?? precedence[bPay] ?? precedence.default;
        if (aRank !== bRank) return bRank - aRank; // higher first
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, showFailedOrders, statusFilter, sortBy]);

  const fetchOrders = async (retryCount = 0, pageArg?: number) => {
    try {
      const currentPage = pageArg ?? page;
      const params = new URLSearchParams({ page: String(currentPage), pageSize: String(pageSize) });
      const response = await fetch(`/api/orders?${params.toString()}`, {
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOrders(data);
        setFilteredOrders(data);
        setTotal(data.length);
        setHasMore(false);
        setError(null); // Clear any previous errors
      } else if (data.orders) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        setTotal(typeof data.total === 'number' ? data.total : data.orders.length);
        setHasMore(!!data.hasMore);
        setError(null); // Clear any previous errors
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      
      // Retry logic for network errors
      if (retryCount < 2) {
        console.log(`Retrying orders fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          fetchOrders(retryCount + 1, pageArg);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return; // Don't set loading to false yet
      }
      
      setError(`Failed to fetch orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      if (retryCount === 0) { // Only set loading to false on first attempt
        setLoading(false);
      }
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.order) {
        setSelectedOrder(json.order);
        // also update in the list copy to include items for that one order (optional)
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, order_items: json.order.order_items || [] } : o)) as Order[]);
        setFilteredOrders(prev => prev.map(o => (o.id === orderId ? { ...o, order_items: json.order.order_items || [] } : o)) as Order[]);
      }
    } catch {}
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

  const getStatusColor = (status: string, paymentStatus?: string) => {
    // Check payment status first for failed orders
    if (paymentStatus === 'intasend_timeout') {
      return 'bg-orange-100 text-orange-800';
    }
    if (paymentStatus === 'failed') {
      return 'bg-red-100 text-red-800';
    }
    if (paymentStatus === 'document_pending') {
      return 'bg-blue-100 text-blue-800';
    }
    
    // Then check order status
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Order Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
      </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle>Orders ({filteredOrders.length}{filteredOrders.length !== orders.length ? ` of ${orders.length}` : ''})</CardTitle>
                  <div className="flex flex-col gap-2 w-full md:flex-row md:flex-wrap md:items-center md:justify-end md:w-auto">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showFailedOrders}
                        onChange={(e) => setShowFailedOrders(e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span>Show failed orders</span>
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto"
                      title="Filter by status"
                    >
                      <option value="all">All statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="out_for_delivery">Out for delivery</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="failed">Failed</option>
                      <option value="timeout">Timeout</option>
                      <option value="document_pending">Document pending</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto"
                      title="Sort orders"
                    >
                      <option value="date_desc">Newest first</option>
                      <option value="date_asc">Oldest first</option>
                      <option value="status">Status</option>
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
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status, order.payment_status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">
                                  {order.payment_status === 'intasend_timeout' ? 'Timeout' :
                                   order.payment_status === 'failed' ? 'Failed' :
                                   order.payment_status === 'document_pending' ? 'Document Pending' :
                                   order.status}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.customer_first_name} {order.customer_last_name}
                            </p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="font-semibold text-gray-900">KSH {order.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination Controls */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
                      <div className="text-sm text-gray-600">
                        Page {page} · {orders.length} of {total} orders
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
                        <Button
                          variant="outline"
                          disabled={page <= 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          disabled={!hasMore}
                          onClick={() => setPage(p => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
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
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status, selectedOrder.payment_status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1 capitalize">
                            {selectedOrder.payment_status === 'intasend_timeout' ? 'Timeout' :
                             selectedOrder.payment_status === 'failed' ? 'Failed' :
                             selectedOrder.payment_status === 'document_pending' ? 'Document Pending' :
                             selectedOrder.status}
                          </span>
                        </span>
                      </p>
                      {selectedOrder.payment_status && (
                        <p><span className="font-medium">Payment Status:</span> 
                          <span className="ml-2 text-sm text-gray-600 capitalize">{selectedOrder.payment_status.replace('_', ' ')}</span>
                        </p>
                      )}
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
                    <div className="space-y-3">
                      {(selectedOrder.order_items || []).map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 py-2 sm:py-1">
                          <div className="flex-1 min-w-0">
                            {item.product_image_url ? (
                              <a
                                href={item.product_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-pink-600 hover:text-pink-700 active:text-pink-800 hover:underline active:underline inline-flex items-center gap-1.5 sm:gap-1 cursor-pointer min-h-[44px] sm:min-h-0 py-2 sm:py-0 px-1 -mx-1 sm:mx-0 rounded transition-colors"
                                style={{ touchAction: 'manipulation' }}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`View image for ${item.product_name}`}
                              >
                                <span className="break-words">{item.product_name}</span>
                                <ExternalLink className="h-4 w-4 sm:h-3 sm:w-3 flex-shrink-0" aria-hidden="true" />
                              </a>
                            ) : (
                              <p className="font-medium break-words">{item.product_name}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <p className="font-medium text-sm sm:text-base">KSH {item.total_price.toFixed(2)}</p>
                          </div>
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
    </>
  );
}


