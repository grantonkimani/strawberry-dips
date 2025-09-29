'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Calendar, MapPin, Phone, Mail, ArrowLeft, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

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
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
        // Send confirmation email
        sendConfirmationEmail(data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async (orderData: Order) => {
    try {
      const response = await fetch('/api/orders/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderData.id }),
      });
      
      if (response.ok) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  };

  const formatDeliveryTime = (time: string) => {
    switch (time) {
      case 'morning': return 'Morning (9 AM - 12 PM)';
      case 'afternoon': return 'Afternoon (12 PM - 5 PM)';
      case 'evening': return 'Evening (5 PM - 8 PM)';
      default: return time;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create HTML content for download
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation - ${order?.id.slice(0, 8).toUpperCase()}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 10px; }
        .header h1 { color: #ec4899; margin: 0; font-size: 28px; }
        .success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .info-item { padding: 15px; background: #f9fafb; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: 600; }
        .total-row { background: #ec4899; color: white; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍓 Strawberry Dips</h1>
        <p>Premium Chocolate Covered Strawberries</p>
    </div>
    
    <div class="success">
        <h2>✅ Order Confirmed!</h2>
        <p>Thank you ${order?.customer_first_name}! Your delicious strawberries are being prepared with love.</p>
    </div>
    
    <div class="info-grid">
        <div class="info-item">
            <strong>Order ID:</strong><br>
            #${order?.id.slice(0, 8).toUpperCase()}
        </div>
        <div class="info-item">
            <strong>Date:</strong><br>
            ${order ? new Date(order.created_at).toLocaleDateString() : ''}
        </div>
        <div class="info-item">
            <strong>Status:</strong><br>
            ${order?.status === 'paid' ? 'Confirmed' : order?.status || ''}
        </div>
        <div class="info-item">
            <strong>Total:</strong><br>
            KSH ${order?.total.toFixed(2)}
        </div>
    </div>
    
    <h3>📦 Order Items</h3>
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${order?.order_items.map(item => `
                <tr>
                    <td><strong>${item.product_name}</strong><br><small>${item.product_category}</small></td>
                    <td>${item.quantity}</td>
                    <td>KSH ${item.unit_price.toFixed(2)}</td>
                    <td>KSH ${item.total_price.toFixed(2)}</td>
                </tr>
            `).join('') || ''}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3"><strong>Subtotal:</strong></td>
                <td><strong>KSH ${order?.subtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td colspan="3"><strong>Delivery Fee:</strong></td>
                <td><strong>KSH ${order?.delivery_fee.toFixed(2)}</strong></td>
            </tr>
            <tr class="total-row">
                <td colspan="3"><strong>Total:</strong></td>
                <td><strong>KSH ${order?.total.toFixed(2)}</strong></td>
            </tr>
        </tfoot>
    </table>
    
    <h3>🚚 Delivery Information</h3>
    <div class="info-item">
        <p><strong>Address:</strong> ${order?.delivery_address}, ${order?.delivery_city}</p>
        <p><strong>Delivery Date:</strong> ${order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : ''}</p>
        <p><strong>Delivery Time:</strong> ${order?.delivery_time}</p>
        ${order?.special_instructions ? `<p><strong>Special Instructions:</strong> ${order.special_instructions}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <h3>Thank you for choosing Strawberry Dips! 🍓</h3>
        <p>For questions, contact us at support@strawberrydips.com or +254 700 123 456</p>
    </div>
</body>
</html>`;

    // Create and download file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strawberry-dips-order-${order?.id.slice(0, 8).toUpperCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-pink-600 hover:bg-pink-700">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
                <p className="text-gray-600">Thank you for your order!</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Order Placed Successfully!</h2>
              <p className="text-green-700">
                Thank you for choosing Strawberry Dips! Your delicious strawberries are being prepared with love.
              </p>
              {emailSent && (
                <p className="text-sm text-green-600 mt-1">
                  📧 Confirmation email sent to {order.customer_email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-pink-600" />
                  <span>Order Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-lg font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status === 'paid' ? 'Confirmed' : order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {order.payment_method || 'IntaSend'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-pink-600" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium text-gray-900">
                    {order.delivery_address}<br />
                    {order.delivery_city}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date</p>
                    <p className="font-medium text-gray-900 flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Time</p>
                    <p className="font-medium text-gray-900">
                      {formatDeliveryTime(order.delivery_time)}
                    </p>
                  </div>
                </div>
                {order.special_instructions && (
                  <div>
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <p className="font-medium text-gray-900">{order.special_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items & Summary */}
          <div className="space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🍓</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">{item.product_category}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × KSH {item.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          KSH {item.total_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">KSH {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="text-gray-900">KSH {order.delivery_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total Paid:</span>
                    <span className="text-pink-600">KSH {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-pink-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-pink-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparation</p>
                    <p className="text-sm text-gray-600">We'll start preparing your fresh strawberries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-pink-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">We'll deliver on {new Date(order.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3 print:hidden">
              <Link href="/">
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Thank You for Choosing Strawberry Dips! 🍓</h3>
          <p className="text-gray-600">
            We're excited to deliver these delicious treats to you. If you have any questions, 
            don't hesitate to contact our customer support team.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Save this page for your records or print it for future reference.
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
