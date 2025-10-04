'use client';

import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Button } from "./ui/Button";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "./CartSidebar";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function Header() {
  const { state } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Update body class when cart or mobile menu opens/closes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isCartOpen || isMobileMenuOpen) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('menu-open');
      };
    }
  }, [isCartOpen, isMobileMenuOpen]);

  // Prevent any swipe gestures from opening the cart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preventSwipe = (e: TouchEvent) => {
        // Prevent any horizontal swipe gestures
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      const preventGesture = (e: Event) => {
        e.preventDefault();
      };

      // Add event listeners to prevent swipe gestures
      document.addEventListener('touchstart', preventSwipe, { passive: false });
      document.addEventListener('touchmove', preventSwipe, { passive: false });
      document.addEventListener('gesturestart', preventGesture, { passive: false });
      document.addEventListener('gesturechange', preventGesture, { passive: false });

      // Cleanup
      return () => {
        document.removeEventListener('touchstart', preventSwipe);
        document.removeEventListener('touchmove', preventSwipe);
        document.removeEventListener('gesturestart', preventGesture);
        document.removeEventListener('gesturechange', preventGesture);
      };
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/strawberry-dip-logo.svg" 
              alt="Strawberrydips Logo" 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline';
                }
              }}
            />
            <span className="text-2xl" style={{display: 'none'}}>🍓</span>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Strawberrydips</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Menu
            </Link>
            <Link href="/track" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Track Order
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Support
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = searchQuery.trim();
                      router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
                    }
                  }}
                  placeholder="Search products or categories..."
                  className="w-64 md:w-72 lg:w-80 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
                <button
                  onClick={() => {
                    const q = searchQuery.trim();
                    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
                  aria-label="Search"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 active:bg-pink-50 relative h-11 w-11 md:h-9 md:w-9">
              <Heart className="h-7 w-7 md:h-5 md:w-5" strokeWidth={2.25} />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] md:text-xs rounded-full h-5 min-w-[1.25rem] px-1 md:px-0 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-pink-600 active:bg-pink-50 relative h-11 w-11 md:h-9 md:w-9"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-7 w-7 md:h-5 md:w-5" strokeWidth={2.25} />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] md:text-xs rounded-full h-5 min-w-[1.25rem] px-1 md:px-0 flex items-center justify-center">
                  {state.items.reduce((total, item) => total + (item.quantity || 1), 0)}
                </span>
              )}
            </Button>

            {/* User Account */}
            <Link href="/account">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 active:bg-pink-50 h-11 w-11 md:h-9 md:w-9">
                <User className="h-7 w-7 md:h-5 md:w-5" strokeWidth={2.25} />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-600 hover:text-pink-600 active:bg-pink-50 h-11 w-11"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-7 w-7" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000] transition-opacity duration-300 mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ touchAction: 'none' }}
          />

          {/* Mobile Menu */}
          <div 
            className={`fixed left-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[10001] transform transition-all duration-300 ease-out mobile-menu ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">🏠</span>
                    <span className="font-medium">Home</span>
                  </Link>
                  
                  <Link 
                    href="/menu" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">🍓</span>
                    <span className="font-medium">Menu</span>
                  </Link>
                  
                  <Link 
                    href="/track" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">📦</span>
                    <span className="font-medium">Track Order</span>
                  </Link>
                  
                  <Link 
                    href="/about" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">ℹ️</span>
                    <span className="font-medium">About</span>
                  </Link>
                  
                  <Link 
                    href="/support" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">💬</span>
                    <span className="font-medium">Support</span>
                  </Link>
                  
                  <Link 
                    href="/contact" 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
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
                        setIsMobileMenuOpen(false);
                        setIsCartOpen(true);
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
                      onClick={() => setIsMobileMenuOpen(false)}
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
      )}
    </header>
  );
}
