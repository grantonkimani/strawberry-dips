'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to find order by tracking code
      const response = await fetch(`/api/orders/track/${trackingCode.trim()}`);
      const data = await response.json();

      if (data.success && data.order) {
        // Redirect to the tracking page with the order ID
        router.push(`/track/${data.order.id}`);
      } else {
        setError(data.error || 'Order not found with this tracking code');
      }
    } catch (err) {
      setError('Failed to search for order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-pink-100 rounded-full">
              <Package className="h-8 w-8 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            Enter your tracking code to see the status of your strawberry order
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Order Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Code
                </label>
                <input
                  type="text"
                  id="trackingCode"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Enter your tracking code (e.g., A1B2C3D4)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center text-lg font-mono tracking-wider"
                  maxLength={16}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !trackingCode.trim()}
                className="w-full py-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Track Order</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Your tracking code was sent to your email after placing the order</p>
              <p>• Tracking codes are 8 characters long (e.g., A1B2C3D4)</p>
              <p>• If you can't find your tracking code, check your email or contact support</p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/support')}
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
