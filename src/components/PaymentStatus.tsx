'use client';

import { CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface PaymentStatusProps {
  className?: string;
}

export function PaymentStatus({ className = '' }: PaymentStatusProps) {
  const mpesaConfigured = !!(
    process.env.MPESA_CONSUMER_KEY && 
    process.env.MPESA_CONSUMER_SECRET && 
    process.env.MPESA_SHORTCODE && 
    process.env.MPESA_TILL_NUMBER && 
    process.env.MPESA_PASSKEY
  );

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Methods Status</h3>
      
      <div className="space-y-2">
        {/* M-Pesa Status */}
        <div className="flex items-center space-x-2">
          <Smartphone className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-700">M-Pesa Payments:</span>
          {mpesaConfigured ? (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">Ready</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-orange-600">Setup Required</span>
            </div>
          )}
        </div>
      </div>

      {!mpesaConfigured && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
          <p className="text-orange-700">
            <strong>To enable M-Pesa payments:</strong> Add M-Pesa credentials to your environment variables. See MPESA_SETUP.md for details.
          </p>
        </div>
      )}
    </div>
  );
}
