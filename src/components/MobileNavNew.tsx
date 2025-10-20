'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronRight, Phone } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Don't render anything on server or before mount
  if (!mounted) return null;

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
      onClose();
    }
  };

  const mobileNavContent = (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
          onClick={onClose}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile Navigation - Dark Theme */}
      <div 
        className={`fixed left-0 top-0 h-screen w-full max-w-sm bg-red-900 shadow-2xl z-[9999] transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-red-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-red-900 font-bold text-sm">SD</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Strawberry</h2>
                <p className="text-red-200 text-sm">Dips</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-red-800 h-8 w-8"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-red-800">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {/* Best Sellers */}
              <Link 
                href="/?featured=true" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="font-medium">Best Sellers</span>
              </Link>

              {/* Chocolate Covered */}
              <Link 
                href="/menu" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="font-medium">Chocolate Covered</span>
              </Link>

              {/* Birthday */}
              <Link 
                href="/gifts?occasion=birthday" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="font-medium">Birthday</span>
              </Link>

              {/* By Type - Dropdown */}
              <div>
                <button
                  onClick={() => toggleExpanded('by-type')}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                >
                  <span className="font-medium">By Type</span>
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${
                      expandedItems.includes('by-type') ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedItems.includes('by-type') && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link 
                      href="/menu?category=classic" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Classic Milk
                    </Link>
                    <Link 
                      href="/menu?category=dark" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Dark Chocolate
                    </Link>
                    <Link 
                      href="/menu?category=white" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      White Chocolate
                    </Link>
                  </div>
                )}
              </div>

              {/* Occasion - Dropdown */}
              <div>
                <button
                  onClick={() => toggleExpanded('occasion')}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">♿</span>
                    <span className="font-medium">Occasion</span>
                  </div>
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${
                      expandedItems.includes('occasion') ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedItems.includes('occasion') && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link 
                      href="/gifts?occasion=valentine" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Valentine's Day
                    </Link>
                    <Link 
                      href="/gifts?occasion=anniversary" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Anniversary
                    </Link>
                    <Link 
                      href="/gifts?occasion=graduation" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Graduation
                    </Link>
                  </div>
                )}
              </div>

              {/* Wine - Dropdown */}
              <div>
                <button
                  onClick={() => toggleExpanded('wine')}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                >
                  <span className="font-medium">Wine</span>
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${
                      expandedItems.includes('wine') ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedItems.includes('wine') && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link 
                      href="/wines-liquor?category=wine" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Wine Collection
                    </Link>
                    <Link 
                      href="/wines-liquor?category=liquor" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Liquor Collection
                    </Link>
                  </div>
                )}
              </div>

              {/* Sympathy */}
              <Link 
                href="/gifts?occasion=sympathy" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="font-medium">Sympathy</span>
              </Link>

              {/* Corporate */}
              <Link 
                href="/gifts?type=corporate" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="font-medium">Corporate</span>
              </Link>

              {/* Next Day - Special CTA */}
              <Link 
                href="/checkout?delivery=next-day" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors border-t border-red-800 mt-4 pt-4"
                onClick={onClose}
              >
                <span className="font-medium underline">Next Day</span>
              </Link>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-red-800">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Call Us</span>
              </div>
              <span className="text-sm font-medium">+254 700 000 000</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(mobileNavContent, document.body);
}
