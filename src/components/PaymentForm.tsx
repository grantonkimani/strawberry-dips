interface PaymentFormProps {
  amount: number;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  amount,
  customerPhone,
  customerEmail,
  customerName,
  onSuccess,
  onError
}: PaymentFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // IntaSend payment logic - this is a placeholder
      // Replace with your actual IntaSend integration code

      // Example IntaSend API call (you'll need to replace this)
      const response = await fetch('/api/intasend/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phone: customerPhone,
          email: customerEmail,
          name: customerName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.paymentId);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      onError('Payment processing failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={customerPhone || ''}
            onChange={(e) => {/* Handle phone change */}}
            placeholder="0712345678"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Optional)
          </label>
          <input
            type="email"
            value={customerEmail || ''}
            onChange={(e) => {/* Handle email change */}}
            placeholder="customer@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              Total: KSH {amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              IntaSend Payment
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Pay with IntaSend
        </button>
      </div>
    </form>
  );
}

