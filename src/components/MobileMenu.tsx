'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export function MobileMenu({ isOpen, onClose, onOpenCart }: MobileMenuProps) {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render anything on server or before mount
  if (!mounted) return null;

  // Debug: Always render a test element
  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 99999,
        fontSize: '12px'
      }}>
        MobileMenu Component Loaded - State: {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
    );
  }

  // Debug: Force mobile menu to always render for testing
  const forceOpen = true;

  const mobileMenuContent = (
    <>
      {/* Overlay */}
      {forceOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-[9998] transition-opacity duration-300 mobile-menu-overlay"
          onClick={onClose}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed left-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[9999] transform transition-all duration-300 ease-out mobile-menu ${
          forceOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <Menu className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Navigation
                </h2>
                <p className="text-gray-600 text-sm">
                  Menu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <Link 
                href="/" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                href="/menu" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">🍓</span>
                <span className="font-medium">Menu</span>
              </Link>
              
              <Link 
                href="/track" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">📦</span>
                <span className="font-medium">Track Order</span>
              </Link>
              
              <Link 
                href="/about" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">ℹ️</span>
                <span className="font-medium">About</span>
              </Link>
              
              <Link 
                href="/support" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">💬</span>
                <span className="font-medium">Support</span>
              </Link>
              
              <Link 
                href="/contact" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">📞</span>
                <span className="font-medium">Contact</span>
              </Link>
            </nav>

            {/* Additional Mobile Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <button 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors w-full"
                  onClick={() => {
                    onClose();
                    if (onOpenCart) onOpenCart();
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">View Cart</span>
                  {state.items.length > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-2 flex items-center justify-center">
                      {state.items.reduce((total, item) => total + (item.quantity || 1), 0)}
                    </span>
                  )}
                </button>
                
                <Link 
                  href="/account" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">My Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return mobileMenuContent;
}
