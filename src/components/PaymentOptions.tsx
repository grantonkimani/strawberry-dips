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
   // Optional guard for additional confirmation (e.g. delivery fee agreement)
   canProceedWithPayment?: boolean;
   onBlockedPaymentAttempt?: () => void;
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
  pricing,
  canProceedWithPayment,
  onBlockedPaymentAttempt,
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
        canProceed={canProceedWithPayment}
        onBlocked={onBlockedPaymentAttempt}
        onSuccess={handleIntaSendSuccess}
        onError={onError}
      />
    </div>
  );
}