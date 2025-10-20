'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingBag, Settings, Home, FileText, LogOut, Tag, MessageSquare, Gift, Clock, Cog, Wine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Safely get auth data with fallbacks
  let user, logout;
  try {
    const auth = useAuth();
    user = auth.user;
    logout = auth.logout;
  } catch (error) {
    console.warn('Auth context not available:', error);
    user = null;
    logout = async () => {
      router.push('/admin/login');
    };
  }

  // Session timeout info (only for display, actual timeout handled in layout)
  const { timeLeft, formatTime } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5
  });

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/gift-products', label: 'Gift Products', icon: Gift },
    { href: '/admin/wine-liquor-products', label: 'Wine & Liquor', icon: Wine },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/custom-requests', label: 'Custom Requests', icon: FileText },
    { href: '/admin/banners', label: 'Banners', icon: Settings },
    { href: '/admin/support', label: 'Support', icon: MessageSquare },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Cog },
  ];

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    router.push('/admin/login');
  };

  return (
    <nav className="bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Scrollable nav on mobile */}
          <div className="flex-1 overflow-x-auto no-scrollbar -mx-2 md:mx-0">
            <div className="flex whitespace-nowrap space-x-6 px-2 md:px-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                    className={`inline-flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-pink-600 text-pink-600'
                      : 'border-transparent text-gray-700 hover:text-pink-600 hover:border-pink-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            </div>
          </div>
          
          {/* Session Timer and Logout */}
          <div className="hidden md:flex items-center space-x-4 ml-4 flex-shrink-0">
            {/* Session Timer */}
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


