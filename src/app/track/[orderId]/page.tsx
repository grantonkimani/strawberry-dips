'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, Clock, CheckCircle, XCircle, Mail, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'preparing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'out_for_delivery':
        return <MapPin className="h-6 w-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being processed';
      case 'paid':
        return 'Payment confirmed! We\'re preparing your strawberries';
      case 'preparing':
        return 'Your strawberries are being prepared fresh';
      case 'out_for_delivery':
        return 'Your order is out for delivery';
      case 'delivered':
        return 'Your order has been delivered! Enjoy your strawberries';
      case 'cancelled':
        return 'This order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your strawberry order status</p>
        </div>

        {/* Order Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span>Order #{order.id.slice(0, 8)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusMessage(order.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ordered on</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
              <p className="text-sm text-gray-600">{order.customer_first_name} {order.customer_last_name}</p>
              <p className="text-sm text-gray-600">{order.customer_email}</p>
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">KSH {item.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">KSH {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-gray-900">KSH {order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-pink-600">KSH {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-pink-600" />
                <span>Delivery Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">{order.delivery_address}</p>
                  <p className="text-sm text-gray-600">{order.delivery_city}, {order.delivery_state}</p>
                  <p className="text-sm text-gray-600">{order.delivery_zip_code}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Schedule</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date(order.delivery_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {order.delivery_time}
                  </p>
                </div>
                
                {order.special_instructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                    <p className="text-sm text-gray-600">{order.special_instructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, please contact us.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="mailto:support@strawberrydips.com" 
                  className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Support</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
