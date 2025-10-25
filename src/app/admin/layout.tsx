'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Skip authentication check for login page
  const isLoginPage = pathname === '/admin/login';
  
  // Session timeout configuration
  const {
    isWarning,
    timeLeft,
    formatTime,
    extendSession
  } = useSessionTimeout({
    timeoutMinutes: 30, // 30 minutes timeout
    warningMinutes: 5,  // Show warning 5 minutes before
    onTimeout: async () => {
      await logout();
    }
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated (after loading is complete)
  useEffect(() => {
    if (mounted && !isLoginPage && !isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [mounted, isLoading, isAuthenticated, router, isLoginPage]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For login page, just render children without any auth checks
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
      {/* Navigation - Only show when authenticated */}
      <AdminNav />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {children}
      </div>
      
      {/* Session Timeout Warning - Only show when authenticated */}
      <SessionTimeoutWarning
        isVisible={isWarning}
        timeLeft={timeLeft}
        formatTime={formatTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </div>
  );
}
