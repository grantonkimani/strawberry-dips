'use client';

import IntaSendPayment from './IntaSendPayment';

interface PaymentOptionsProps {
  amount: number;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  cartItems?: any[];
  deliveryInfo?: any;
  onSuccess: (paymentIntentId: string, paymentMethod: string) => void;
  onError: (error: string) => void;
}

export function PaymentOptions({
  amount,
  customerPhone,
  customerEmail,
  customerName,
  cartItems,
  deliveryInfo,
  onSuccess,
  onError
}: PaymentOptionsProps) {
  const handleIntaSendSuccess = (data: any) => {
    onSuccess(data.invoiceId || data.reference, 'intasend');
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
        onSuccess={handleIntaSendSuccess}
        onError={onError}
      />
    </div>
  );
}