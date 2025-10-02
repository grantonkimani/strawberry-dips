'use client';

import { useState } from 'react';
import { ArrowLeft, Smartphone, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCart } from '@/contexts/CartContext';
import { PaymentOptions } from '@/components/PaymentOptions';
import Link from 'next/link';

// Major Kenyan Cities
const KENYAN_CITIES = [
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'mombasa', label: 'Mombasa' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'eldoret', label: 'Eldoret' },
  { value: 'thika', label: 'Thika' },
  { value: 'machakos', label: 'Machakos' },
  { value: 'meru', label: 'Meru' },
  { value: 'nyeri', label: 'Nyeri' },
  { value: 'kericho', label: 'Kericho' },
  { value: 'kitale', label: 'Kitale' },
  { value: 'malindi', label: 'Malindi' },
  { value: 'lamu', label: 'Lamu' },
  { value: 'garissa', label: 'Garissa' },
  { value: 'kakamega', label: 'Kakamega' },
  { value: 'bungoma', label: 'Bungoma' },
  { value: 'embu', label: 'Embu' },
  { value: 'isiolo', label: 'Isiolo' },
  { value: 'marsabit', label: 'Marsabit' },
  { value: 'moyale', label: 'Moyale' },
  { value: 'wajir', label: 'Wajir' },
  { value: 'mandera', label: 'Mandera' },
  { value: 'turkana', label: 'Turkana' },
  { value: 'west-pokot', label: 'West Pokot' },
  { value: 'samburu', label: 'Samburu' },
  { value: 'laikipia', label: 'Laikipia' },
  { value: 'nyandarua', label: 'Nyandarua' },
  { value: 'murang\'a', label: 'Murang\'a' },
  { value: 'kiambu', label: 'Kiambu' },
  { value: 'kajiado', label: 'Kajiado' },
  { value: 'narok', label: 'Narok' },
  { value: 'bomet', label: 'Bomet' },
  { value: 'nandi', label: 'Nandi' },
  { value: 'uasin-gishu', label: 'Uasin Gishu' },
  { value: 'trans-nzoia', label: 'Trans Nzoia' },
  { value: 'elgeyo-marakwet', label: 'Elgeyo Marakwet' },
  { value: 'baringo', label: 'Baringo' },
];

// Kenyan Counties (for City field)
const KENYAN_COUNTIES = [
  { value: 'nairobi', label: 'Nairobi County' },
  { value: 'mombasa', label: 'Mombasa County' },
  { value: 'kisumu', label: 'Kisumu County' },
  { value: 'nakuru', label: 'Nakuru County' },
  { value: 'eldoret', label: 'Uasin Gishu County' },
  { value: 'thika', label: 'Kiambu County' },
  { value: 'machakos', label: 'Machakos County' },
  { value: 'meru', label: 'Meru County' },
  { value: 'nyeri', label: 'Nyeri County' },
  { value: 'kericho', label: 'Kericho County' },
  { value: 'kitale', label: 'Trans Nzoia County' },
  { value: 'malindi', label: 'Kilifi County' },
  { value: 'lamu', label: 'Lamu County' },
  { value: 'garissa', label: 'Garissa County' },
  { value: 'kakamega', label: 'Kakamega County' },
  { value: 'bungoma', label: 'Bungoma County' },
  { value: 'embu', label: 'Embu County' },
  { value: 'isiolo', label: 'Isiolo County' },
  { value: 'marsabit', label: 'Marsabit County' },
  { value: 'moyale', label: 'Marsabit County' },
  { value: 'wajir', label: 'Wajir County' },
  { value: 'mandera', label: 'Mandera County' },
  { value: 'turkana', label: 'Turkana County' },
  { value: 'west-pokot', label: 'West Pokot County' },
  { value: 'samburu', label: 'Samburu County' },
  { value: 'laikipia', label: 'Laikipia County' },
  { value: 'nyandarua', label: 'Nyandarua County' },
  { value: 'murang\'a', label: 'Murang\'a County' },
  { value: 'kiambu', label: 'Kiambu County' },
  { value: 'kajiado', label: 'Kajiado County' },
  { value: 'narok', label: 'Narok County' },
  { value: 'bomet', label: 'Bomet County' },
  { value: 'nandi', label: 'Nandi County' },
  { value: 'uasin-gishu', label: 'Uasin Gishu County' },
  { value: 'trans-nzoia', label: 'Trans Nzoia County' },
  { value: 'elgeyo-marakwet', label: 'Elgeyo Marakwet County' },
  { value: 'baringo', label: 'Baringo County' },
];

// Kenyan Areas/Subcounties (for Area field) – sample major Nairobi areas
const KENYAN_AREAS = [
  { value: 'kasarani', label: 'Kasarani' },
  { value: 'westlands', label: 'Westlands' },
  { value: 'embakasi', label: 'Embakasi' },
  { value: 'kibra', label: 'Kibra' },
  { value: 'langata', label: 'Langata' },
  { value: 'karen', label: 'Karen' },
  { value: 'runda', label: 'Runda' },
  { value: 'kileleshwa', label: 'Kileleshwa' },
  { value: 'kilimani', label: 'Kilimani' },
  { value: 'parklands', label: 'Parklands' },
  { value: 'eastleigh', label: 'Eastleigh' },
  { value: 'south-c', label: 'South C' },
  { value: 'south-b', label: 'South B' },
  { value: 'lavington', label: 'Lavington' },
  { value: 'muthaiga', label: 'Muthaiga' },
  { value: 'gigiri', label: 'Gigiri' },
  { value: 'spring-valley', label: 'Spring Valley' },
  { value: 'riverside', label: 'Riverside' },
  { value: 'hurlingham', label: 'Hurlingham' },
  { value: 'ngong-road', label: 'Ngong Road' },
  { value: 'adams-arcade', label: 'Adams Arcade' },
  { value: 'kiambu-road', label: 'Kiambu Road' },
  { value: 'thika-road', label: 'Thika Road' },
  { value: 'mombasa-road', label: 'Mombasa Road' },
  { value: 'jogoo-road', label: 'Jogoo Road' },
  { value: 'outering-road', label: 'Outering Road' },
  { value: 'donholm', label: 'Donholm' },
  { value: 'buru-buru', label: 'Buru Buru' },
  { value: 'umoja', label: 'Umoja' },
  { value: 'kayole', label: 'Kayole' },
  { value: 'dandora', label: 'Dandora' },
  { value: 'mathare', label: 'Mathare' },
  { value: 'korogocho', label: 'Korogocho' },
  { value: 'kawangware', label: 'Kawangware' },
];

export default function CheckoutPage() {
  const { state, clearCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Delivery Info
    city: '',
    area: '',
    deliveryDate: '',
    deliveryTime: '',
    specialInstructions: '',
    
    // Payment Info
    paymentMethod: 'mpesa',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateFormField = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by the payment components
    // This prevents the default form submission behavior
  };

  const handlePaymentSuccess = async (paymentIntentId: string, paymentMethod: string) => {
    setIsProcessing(true);
    
    try {
      // For IntaSend payments, the order is already created in /api/intasend/initiate
      // We just need to update the payment status to completed
      if (paymentMethod === 'intasend') {
        // Order already exists, just mark as successful
        setPaymentSuccess(true);
        setOrderId(paymentIntentId);
        
        // Clear cart and redirect to success page after a short delay
        // Use the orderId from the IntaSend response, not the invoice ID
        setTimeout(() => {
          clearCart();
          // The paymentIntentId should be the orderId from IntaSend response
          window.location.href = `/order-success/${paymentIntentId}`;
        }, 2000);
        return;
      }

      // For other payment methods, create the order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          items: state.items,
          total: getTotalPrice() + 5.99,
          paymentIntentId,
          paymentMethod
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Order saved successfully:', result.orderId);
        
        // Clear cart and redirect to success page
        clearCart();
        window.location.href = `/order-success/${result.orderId}`;
      } else {
        throw new Error(result.error || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setPaymentError('Payment successful but failed to save order. Please contact support.');
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setIsProcessing(false);
  };

  if (state.items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some delicious strawberries to get started!</p>
          <Link href="/">
            <Button className="bg-pink-600 hover:bg-pink-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              PROCESSING YOUR ORDER
            </h2>
            <p className="text-lg text-pink-600 font-semibold mb-4">
              PLEASE WAIT - DO NOT CLOSE THIS WINDOW
            </p>
            <p className="text-gray-600 text-sm">
              {paymentSuccess 
                ? 'Payment successful! Redirecting to order confirmation...'
                : 'We\'re confirming your payment and preparing your order confirmation. This may take a few moments...'
              }
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">Complete your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 checkout-form">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-pink-600" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., +254 700 123 456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide a number where you can be easily reached for delivery updates
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    <span>Delivery Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        City *
                      </label>
                      <SearchableSelect
                        options={KENYAN_COUNTIES}
                        value={formData.city}
                        onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                        placeholder="Search or select your city..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Area/Subcounty *
                      </label>
                      <SearchableSelect
                        options={KENYAN_AREAS}
                        value={formData.area}
                        onChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                        placeholder="Search or select your area..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Delivery Date *
                      </label>
                      
                      {/* Quick Date Selection Buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            updateFormField('deliveryDate', tomorrow.toISOString().split('T')[0]);
                          }}
                          className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const dayAfter = new Date();
                            dayAfter.setDate(dayAfter.getDate() + 2);
                            updateFormField('deliveryDate', dayAfter.toISOString().split('T')[0]);
                          }}
                          className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors"
                        >
                          Day After
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const weekend = new Date();
                            weekend.setDate(weekend.getDate() + (6 - weekend.getDay())); // Next Saturday
                            updateFormField('deliveryDate', weekend.toISOString().split('T')[0]);
                          }}
                          className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors"
                        >
                          Weekend
                        </button>
                      </div>
                      
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Click the calendar icon or use quick buttons above
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Delivery Time *
                      </label>
                      <select
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Delivery Instructions & Location Details
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., Near the red gate, opposite the pharmacy, apartment block B, specific building name, landmark references..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please provide specific location details, landmarks, building names, or any special delivery instructions to help our delivery person find you easily
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
                        <p className="text-green-700 mb-4">Your order has been placed and payment processed via M-Pesa.</p>
                        {orderId && (
                          <div className="bg-white border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                            <p className="font-mono text-sm text-gray-900">#{orderId.slice(0, 8)}</p>
                          </div>
                        )}
                        <p className="text-sm text-green-600">
                          You will receive a confirmation email shortly. Redirecting to homepage in 5 seconds...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-800 text-sm">
                            <strong>Payment Error:</strong> {paymentError}
                          </p>
                        </div>
                      )}
                      
                      <PaymentOptions
                        amount={getTotalPrice() + 5.99}
                        customerPhone={formData.phone}
                        customerEmail={formData.email}
                        customerName={`${formData.firstName} ${formData.lastName}`}
                        cartItems={state.items}
                        deliveryInfo={{
                          city: formData.city,
                          area: formData.area,
                          deliveryDate: formData.deliveryDate,
                          deliveryTime: formData.deliveryTime,
                          specialInstructions: formData.specialInstructions,
                        }}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🍓</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          KSH {(item.price * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">KSH {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="text-gray-900">KSH 5.99</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-pink-600">KSH {(getTotalPrice() + 5.99).toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button - Hidden when payment form is shown */}
                {!paymentSuccess && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm text-center">
                      Complete payment above to place your order
                    </p>
                  </div>
                )}
                
                {paymentSuccess && (
                  <Link href="/">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                      Continue Shopping
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
