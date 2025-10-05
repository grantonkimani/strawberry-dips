'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout
}: SessionTimeoutProps = {}) {
  const [isWarning, setIsWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  const { logout } = useAuth();
  const router = useRouter();

  const resetTimer = useCallback(() => {
    setTimeLeft(timeoutMinutes * 60);
    setIsWarning(false);
  }, [timeoutMinutes]);

  const handleTimeout = useCallback(async () => {
    if (onTimeout) {
      onTimeout();
    } else {
      await logout();
      router.push('/admin/login');
    }
  }, [logout, router, onTimeout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startTimer = () => {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleTimeout();
            return 0;
          }
          
          const newTime = prev - 1;
          
          // Show warning when time is running out
          if (newTime <= warningMinutes * 60 && !isWarning) {
            setIsWarning(true);
          }
          
          return newTime;
        });
      }, 1000);
    };

    // Activity events that should reset the timer
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    startTimer();

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer, handleTimeout, warningMinutes, isWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extendSession = () => {
    resetTimer();
  };

  return {
    isWarning,
    timeLeft,
    formatTime,
    extendSession,
    resetTimer
  };
}
