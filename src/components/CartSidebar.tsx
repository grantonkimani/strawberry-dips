'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Menu, ShoppingCart, User, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render anything on server or before mount
  if (!mounted) return null;

  const mobileNavContent = (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-[9998] transition-opacity duration-300 cart-overlay"
          onClick={onClose}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile Navigation */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[9999] transform transition-all duration-300 ease-out cart-sidebar ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
                href="/gifts" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">🎁</span>
                <span className="font-medium">Gifts</span>
              </Link>
              
              <Link 
                href="/wines-liquor" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">🍷</span>
                <span className="font-medium">Wines & Liquor</span>
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
                href="/custom" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">✨</span>
                <span className="font-medium">Custom Order</span>
              </Link>
              
              {/* About/Support/Contact removed per footer duplication */}
            </nav>

            {/* Additional Mobile Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    // open help drawer by dispatching a custom event handled by Header
                    const ev = new CustomEvent('open-help');
                    window.dispatchEvent(ev);
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-medium">Help & Support</span>
                </button>
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">View Cart</span>
                  {state.items.length > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-2 flex items-center justify-center">
                      {state.items.reduce((total, item) => total + (item.quantity || 1), 0)}
                    </span>
                  )}
                </Link>
                
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

  return createPortal(mobileNavContent, document.body);
}
