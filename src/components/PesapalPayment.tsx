'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PesapalPaymentProps {
  amount: number;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  cartItems?: any[];
  deliveryInfo?: any;
  onSuccess: (orderTrackingId: string) => void;
  onError: (error: string) => void;
}

export function PesapalPayment({ 
  amount, 
  orderId, 
  customerName, 
  customerEmail, 
  customerPhone,
  cartItems,
  deliveryInfo,
  onSuccess, 
  onError 
}: PesapalPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  const handlePayment = async () => {
    if (!customerEmail) {
      onError('Please provide your email address');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('/api/pesapal/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: Math.round(amount), // Pesapal requires whole numbers
          currency: 'KES',
          description: `Payment for order ${orderId}`,
          customerName: customerName || 'Customer',
          customerEmail,
          customerPhone: customerPhone || '254700000000',
          cartItems: cartItems || [],
          deliveryInfo: deliveryInfo || {},
          callbackUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://strawberrydips.shop'}/checkout?order=${orderId}&status=success`,
          cancellationUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://strawberrydips.shop'}/checkout?order=${orderId}&status=cancelled`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.success && data.redirectUrl) {
        // Redirect to Pesapal payment page
        if (typeof window !== 'undefined') {
          window.location.href = data.redirectUrl;
        }
      } else {
        throw new Error('No redirect URL received from Pesapal');
      }

    } catch (error) {
      console.error('Pesapal payment error:', error);
      setPaymentStatus('failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Pay with Pesapal</h3>
        <p className="text-sm text-blue-700">
          Pay securely using M-Pesa, Airtel Money, or your card. You'll be redirected to Pesapal's secure payment page.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount:</span>
          <span className="font-bold text-lg">KES {amount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Order ID:</span>
          <span className="font-mono text-sm">{orderId}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing || !customerEmail}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Pay with Pesapal'
        )}
      </Button>

      {paymentStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            Payment failed. Please try again or contact support.
          </p>
        </div>
      )}

      {!customerEmail && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            Please provide your email address to proceed with payment.
          </p>
        </div>
      )}
    </div>
  );
}