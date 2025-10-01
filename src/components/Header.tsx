'use client';

import { ShoppingCart, Heart, User, Menu } from "lucide-react";
import { Button } from "./ui/Button";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "./CartSidebar";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const { state } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Update body class when cart opens/closes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isCartOpen) {
        document.body.classList.add('cart-open');
      } else {
        document.body.classList.remove('cart-open');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('cart-open');
      };
    }
  }, [isCartOpen]);

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
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 relative">
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-pink-600 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.reduce((total, item) => total + (item.quantity || 1), 0)}
                </span>
              )}
            </Button>

            {/* User Account */}
            <Link href="/account">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden text-gray-600 hover:text-pink-600">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  );
}
