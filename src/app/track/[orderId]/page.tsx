'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle, Truck, Package, MapPin, Calendar, Phone, Mail } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_date: string;
  delivery_time: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: { 
    label: 'Payment Pending', 
    icon: Clock, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    description: 'Waiting for payment confirmation'
  },
  paid: { 
    label: 'Payment Confirmed', 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    description: 'Payment received, preparing your order'
  },
  confirmed: { 
    label: 'Order Confirmed', 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    description: 'Order confirmed and being prepared'
  },
  preparing: { 
    label: 'Preparing', 
    icon: Package, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    description: 'Our chefs are preparing your fresh strawberries'
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    icon: Truck, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    description: 'Your order is on the way to you'
  },
  delivered: { 
    label: 'Delivered', 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    description: 'Order delivered successfully'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: Clock, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    description: 'Order has been cancelled'
  }
};

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
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found. Please check your order ID and try again.');
        } else {
          setError('Failed to load order details. Please try again later.');
        }
        return;
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-red-600 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Back to Home
                </Button>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="outline"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your Strawberry Dips order</p>
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.slice(0, 8)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{statusInfo.description}</p>
                <p className="text-sm text-gray-500">
                  Last updated: {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">KSH {item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-pink-600">KSH {order.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{order.customer_email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{order.customer_phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-gray-600">{order.delivery_address}</p>
                <p className="text-gray-600">{order.delivery_city}, {order.delivery_state}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Schedule</h4>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{formatDate(order.delivery_date)}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{formatTime(order.delivery_time)}</span>
                </div>
              </div>

              {order.special_instructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                  <p className="text-gray-600">{order.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Order More Strawberries
            </Button>
            <Button 
              onClick={() => window.location.href = '/account/signup'}
              variant="outline"
            >
              Create Account for Easy Tracking
            </Button>
            <Button 
              onClick={() => window.location.href = '/contact'}
              variant="outline"
            >
              Contact Support
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Need help? Contact us at support@strawberrydips.com or call +254 700 000 000
          </p>
        </div>
      </div>
    </div>
  );
}