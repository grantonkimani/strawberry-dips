'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';

interface IntaSendPaymentProps {
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  cartItems?: any[];
  deliveryInfo?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function IntaSendPayment({
  amount,
  customerEmail,
  customerPhone,
  customerName,
  cartItems = [],
  deliveryInfo = {},
  onSuccess,
  onError
}: IntaSendPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [statusMessage, setStatusMessage] = useState('');
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);

  const handlePayment = async () => {
    if (!customerEmail || !customerPhone) {
      const error = 'Please provide email and phone number';
      setStatusMessage(error);
      onError?.(error);
      return;
    }

    setIsProcessing(true);
    setIsWaitingForConfirmation(true);
    setStatusMessage('');

    try {
      const orderId = `ORDER-${Date.now()}`;

      // Set a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/intasend/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'KES',
          paymentMethod,
          customerName,
          customerEmail,
          customerPhone,
          cartItems,
          deliveryInfo,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.success) {
        if (paymentMethod === 'mpesa') {
          setIsWaitingForConfirmation(false);
          setStatusMessage('M-Pesa STK push sent to your phone. Please enter your PIN to complete payment.');

          // Start polling for payment status
          pollPaymentStatus(data.invoiceId, data.orderId);
        } else if (data.checkoutUrl) {
          setIsWaitingForConfirmation(false);
          setStatusMessage('Redirecting to card payment...');
          if (typeof window !== 'undefined') {
            // Navigate to IntaSend checkout for card details entry
            window.location.href = data.checkoutUrl as string;
          }

          // Start polling for payment status
          pollPaymentStatus(data.invoiceId, data.orderId);
        } else {
          // For card payments, we must have a checkout URL to collect card details.
          if (paymentMethod === 'card') {
            setIsWaitingForConfirmation(false);
            setStatusMessage('Card checkout is unavailable right now. Please try again or use M-Pesa.');
            onError?.('Card checkout URL missing');
            return;
          }
          setIsWaitingForConfirmation(false);
          setStatusMessage('Payment initiated successfully.');
          onSuccess?.(data);
        }
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('IntaSend payment error:', error);
      let errorMessage = 'Payment failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Payment request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setIsWaitingForConfirmation(false);
      setStatusMessage(`Payment failed: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (invoiceId: string, orderId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      try {
        const response = await fetch(`/api/intasend/status?invoiceId=${invoiceId}&orderId=${orderId}`);
        const data = await response.json();

        if (data.success) {
          if (data.paid) {
            setStatusMessage('Payment successful! 🎉');
            onSuccess?.(data);
            return;
          } else if (data.status === 'FAILED') {
            setStatusMessage('Payment failed. Please try again.');
            onError?.('Payment failed');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setStatusMessage('Payment status check timed out. Please check your order status.');
        }
      } catch (error) {
        console.error('Status polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">IntaSend Payment</h3>

        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Payment Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="mpesa"
                checked={paymentMethod === 'mpesa'}
                onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                className="mr-2"
              />
              <span className="text-sm">M-Pesa</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="mr-2"
              />
              <span className="text-sm">Credit/Debit Card</span>
            </label>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold">KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="text-sm">{customerEmail}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Phone:</span>
            <span className="text-sm">{customerPhone}</span>
          </div>
        </div>

        {/* Payment Method Info */}
        {paymentMethod === 'mpesa' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              📱 You will receive an M-Pesa STK push on your phone. Enter your M-Pesa PIN to complete the payment.
            </p>
            <p className="text-xs text-green-700 mt-1">
              ⏱️ Please wait a moment after clicking "Pay" - we're preparing your payment request.
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💳 You will be redirected to a secure payment page to enter your card details.
            </p>
          </div>
        )}

        {/* Status Message */}
        {(statusMessage || isWaitingForConfirmation) && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            isWaitingForConfirmation
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : statusMessage.includes('successful') || statusMessage.includes('🎉')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : statusMessage.includes('failed') || statusMessage.includes('error')
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            {isWaitingForConfirmation ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span>Please wait as we confirm your order...</span>
              </div>
            ) : (
              statusMessage
            )}
          </div>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || isWaitingForConfirmation}
          className={`w-full ${
            paymentMethod === 'mpesa'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white ${(isProcessing || isWaitingForConfirmation) ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isProcessing || isWaitingForConfirmation ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isWaitingForConfirmation ? 'Confirming Order...' : 'Processing...'}
            </div>
          ) : (
            `Pay KES ${amount.toLocaleString()} with ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'}`
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Secure payment powered by IntaSend
        </p>
      </div>
    </div>
  );
}

