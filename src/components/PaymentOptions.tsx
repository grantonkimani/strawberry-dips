'use client';

import IntaSendPayment from './IntaSendPayment';

interface CheckoutPricing {
  subtotal: number;
  vatAmount: number;
  deliveryFee: number;
  total: number;
}

interface PaymentOptionsProps {
  amount: number;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  cartItems?: any[];
  deliveryInfo?: any;
  onSuccess: (paymentIntentId: string, paymentMethod: string) => void;
  onError: (error: string) => void;
  pricing?: CheckoutPricing;
}

export function PaymentOptions({
  amount,
  customerPhone,
  customerEmail,
  customerName,
  cartItems,
  deliveryInfo,
  onSuccess,
  onError,
  pricing
}: PaymentOptionsProps) {
  const handleIntaSendSuccess = (data: any) => {
    // Use orderId from IntaSend response, not invoiceId
    onSuccess(data.orderId || data.invoiceId || data.reference, 'intasend');
  };

  return (
    <div className="space-y-4">
      <IntaSendPayment
        amount={amount}
        customerName={customerName || 'Customer'}
        customerEmail={customerEmail || ''}
        customerPhone={customerPhone || ''}
        cartItems={cartItems}
        deliveryInfo={deliveryInfo}
        pricing={pricing}
        onSuccess={handleIntaSendSuccess}
        onError={onError}
      />
    </div>
  );
}