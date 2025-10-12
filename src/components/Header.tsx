'use client';

import { ShoppingCart, Heart, User, Menu, HelpCircle, Instagram } from "lucide-react";
import { Button } from "./ui/Button";
import { useCart } from "@/contexts/CartContext";
import { MobileNav } from "./CartSidebar";
import { HelpDrawer } from "./HelpDrawer";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export function Header() {
  const { state } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();

  // Mark as hydrated after client-side mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/strawberry-dip-logo-header.svg" 
              alt="Strawberry Dip Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              loading="eager"
              decoding="async"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline';
                }
              }}
            />
            <span className="text-2xl" style={{display: 'none'}}>🍓</span>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent leading-tight">
                Strawberrydips
              </span>
              <span className="hidden xs:block text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide leading-tight">
                Chocolate Covered Strawberries
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Menu
            </Link>
            <Link href="/gifts" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Gifts
            </Link>
            <Link href="/track" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
              Track Order
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 pr-2 sm:pr-4">
            {/* Social Media Icons */}
            <div className="hidden md:flex items-center space-x-2">
              <a 
                href="https://www.instagram.com/strawberrydips_?igsh=NTJuNXhxb3hiYm55" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={2.25} />
              </a>
              <a 
                href="https://www.tiktok.com/@strawberrydips_ke?_t=ZM-8zfZO0XFS6y&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Follow us on TikTok"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>

            {/* Help */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 active:bg-pink-50 h-10 w-10 sm:h-11 sm:w-11 md:h-9 md:w-9" onClick={() => setIsHelpOpen(true)} aria-label="Help">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-5 md:w-5" strokeWidth={2.25} />
            </Button>
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    // debounce route updates for snappy UX
                    if (debounceTimer) clearTimeout(debounceTimer);
                    const t = setTimeout(() => {
                      const term = q.trim();
                      router.push(term ? `/?q=${encodeURIComponent(term)}` : '/');
                    }, 200);
                    setDebounceTimer(t);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (debounceTimer) clearTimeout(debounceTimer);
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
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 active:bg-pink-50 relative h-10 w-10 sm:h-11 sm:w-11 md:h-9 md:w-9">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-5 md:w-5" strokeWidth={2.25} />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] md:text-xs rounded-full h-5 min-w-[1.25rem] px-1 md:px-0 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-pink-600 active:bg-pink-50 relative h-10 w-10 sm:h-11 sm:w-11 md:h-9 md:w-9"
              >
                <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 md:h-5 md:w-5" strokeWidth={2.25} />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] md:text-xs rounded-full h-5 min-w-[1.25rem] px-1 md:px-0 flex items-center justify-center">
                  {isHydrated ? state.items.reduce((total, item) => total + (item.quantity || 1), 0) : 0}
                </span>
              </Button>
            </Link>

            {/* User Account */}
            <Link href={isAuthenticated ? "/account" : "/account/login"}>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-600 active:bg-pink-50 h-10 w-10 sm:h-11 sm:w-11 md:h-9 md:w-9">
                <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-5 md:w-5" strokeWidth={2.25} />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-600 hover:text-pink-600 active:bg-pink-50 h-10 w-10 sm:h-11 sm:w-11"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Help Drawer */}
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  );
}
