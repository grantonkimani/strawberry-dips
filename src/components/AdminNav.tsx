'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingBag, Settings, Home, FileText, LogOut, User, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
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
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
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
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <User className="h-4 w-4" />
              <span>{user?.full_name || 'Admin'}</span>
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


