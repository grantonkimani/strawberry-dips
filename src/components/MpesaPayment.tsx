'use client';

import { useState } from 'react';
import { Smartphone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface MpesaPaymentProps {
  amount: number;
  orderId: string;
  customerName?: string;
  onSuccess: (paymentReference: string) => void;
  onError: (error: string) => void;
}

export function MpesaPayment({ amount, orderId, customerName, onSuccess, onError }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format to 254xxxxxxxxx
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return `254${cleaned.slice(1)}`;
    } else if (cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      onError('Please enter your phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      onError('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: Math.round(amount), // M-Pesa requires whole numbers
          orderId,
          customerName: customerName || 'Customer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestId);
        
        // Show success message
        setTimeout(() => {
          onSuccess(data.checkoutRequestId);
        }, 2000);
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/status?checkoutRequestId=${requestId}`);
        const data = await response.json();

        if (data.success && data.order) {
          if (data.order.payment_status === 'completed') {
            setPaymentStatus('success');
            onSuccess(data.order.payment_reference);
            return;
          } else if (data.order.payment_status === 'failed') {
            setPaymentStatus('failed');
            onError(data.order.payment_error || 'Payment failed');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('failed');
          onError('Payment timeout - please check your phone or try again');
        }
      } catch (error) {
        console.error('Status polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('failed');
          onError('Unable to verify payment status');
        }
      }
    };

    poll();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Smartphone className="h-6 w-6 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment successful! Your order is being processed.';
      case 'failed':
        return 'Payment failed. Please try again or contact support.';
      case 'pending':
        return 'Please check your phone and enter your M-Pesa PIN to complete the payment.';
      default:
        return 'Enter your phone number to pay with M-Pesa';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>M-Pesa Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Amount Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center">
              <strong>Amount to Pay: KSH {amount.toFixed(2)}</strong>
            </p>
          </div>

          {/* Phone Number Input */}
          {!paymentStatus && (
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678 or 254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500">
                Enter your M-Pesa registered phone number
              </p>
            </div>
          )}

          {/* Status Message */}
          {paymentStatus && (
            <div className={`p-4 rounded-lg ${
              paymentStatus === 'success' ? 'bg-green-50 border border-green-200' :
              paymentStatus === 'failed' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-center ${
                paymentStatus === 'success' ? 'text-green-800' :
                paymentStatus === 'failed' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {getStatusMessage()}
              </p>
            </div>
          )}

          {/* Payment Button */}
          {!paymentStatus && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !phoneNumber.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initiating Payment...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Pay with M-Pesa
                </>
              )}
            </Button>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Enter your M-Pesa registered phone number</li>
              <li>2. Click "Pay with M-Pesa"</li>
              <li>3. Check your phone for M-Pesa prompt</li>
              <li>4. Enter your M-Pesa PIN to complete payment</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







