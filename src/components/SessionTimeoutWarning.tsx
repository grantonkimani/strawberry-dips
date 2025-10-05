'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SessionTimeoutWarningProps {
  isVisible: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({
  isVisible,
  timeLeft,
  formatTime,
  onExtend,
  onLogout
}: SessionTimeoutWarningProps) {
  const [isExtended, setIsExtended] = useState(false);

  if (!isVisible) return null;

  const handleExtend = () => {
    onExtend();
    setIsExtended(true);
    // Hide the warning for a moment to show success
    setTimeout(() => setIsExtended(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Your admin session will expire in{' '}
            <span className="font-semibold text-orange-600">
              {formatTime(timeLeft)}
            </span>{' '}
            due to inactivity.
          </p>
          
          {isExtended && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
              <p className="text-sm text-green-800">
                ✅ Session extended! You can continue working.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Auto-logout in {formatTime(timeLeft)}</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onLogout}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout Now
            </Button>
            
            <Button
              onClick={handleExtend}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              Extend Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
