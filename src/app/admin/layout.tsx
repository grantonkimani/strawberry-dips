'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, logout, isAuthenticated } = useAuth();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
      {/* Navigation - Only show when authenticated */}
      {isAuthenticated && <AdminNav />}
      
      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 ${isAuthenticated ? 'py-8' : ''}`}>
        {children}
      </div>
      
      {/* Session Timeout Warning - Only show when authenticated */}
      {isAuthenticated && (
        <SessionTimeoutWarning
          isVisible={isWarning}
          timeLeft={timeLeft}
          formatTime={formatTime}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
    </div>
  );
}
