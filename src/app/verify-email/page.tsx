'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailInner() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/customers/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setCustomer(data.customer);
      } else {
        if (data.error.includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleContinue = () => {
    router.push('/account');
  };

  const handleResendEmail = () => {
    router.push('/account/login?resend=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/strawberry-dip-logo-official.svg" 
              alt="Strawberry Dip Logo" 
              className="h-20 w-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline';
                }
              }}
            />
            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Strawberry Dip</h1>
          <p className="text-gray-600 mt-2">Email Verification</p>
        </div>

        {/* Verification Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified! 🎉'}
              {status === 'error' && 'Verification Failed'}
              {status === 'expired' && 'Link Expired'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {/* Status Icon */}
              <div className="mb-6">
                {status === 'loading' && (
                  <Loader2 className="h-16 w-16 text-pink-600 animate-spin mx-auto" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                )}
                {(status === 'error' || status === 'expired') && (
                  <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                )}
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{message}</p>
                {customer && (
                  <p className="text-sm text-gray-600 mt-2">
                    Welcome, {customer.firstName}! Your account is now active.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {status === 'success' && (
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    Continue to My Account
                  </Button>
                )}
                
                {status === 'expired' && (
                  <Button
                    onClick={handleResendEmail}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md transition duration-200"
                  >
                    Request New Verification Email
                  </Button>
                )}
                
                {status === 'error' && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleResendEmail}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => router.push('/contact')}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md transition duration-200"
                    >
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 Strawberry Dips. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
