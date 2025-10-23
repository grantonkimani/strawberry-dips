'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronRight, Phone, Home, Menu, Gift, Wine, Package, User, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  product_count?: number;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { state } = useCart();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
              {/* Main Navigation - Match Desktop */}
              <Link 
                href="/" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </Link>

              <Link 
                href="/menu" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Menu className="h-5 w-5" />
                <span className="font-medium">Menu</span>
              </Link>

              <Link 
                href="/gifts" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Gift className="h-5 w-5" />
                <span className="font-medium">Gifts</span>
              </Link>

              <Link 
                href="/wines-liquor" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Wine className="h-5 w-5" />
                <span className="font-medium">Wines & Liquor</span>
              </Link>

              <Link 
                href="/track" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Track Order</span>
              </Link>

              <Link 
                href="/custom" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <span className="text-lg">✨</span>
                <span className="font-medium">Custom Order</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-red-800 my-4"></div>

              {/* Dynamic Categories - From Database */}
              {loading ? (
                <div className="px-4 py-2 text-red-200 text-sm">Loading categories...</div>
              ) : categories.length > 0 ? (
                <div>
                  <button
                    onClick={() => toggleExpanded('categories')}
                    className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Categories</span>
                    <ChevronRight 
                      className={`h-5 w-5 transition-transform ${
                        expandedItems.includes('categories') ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  {expandedItems.includes('categories') && (
                    <div className="ml-4 mt-1 space-y-1">
                      {categories
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((category) => (
                        <Link 
                          key={category.id}
                          href={`/menu?category=${category.id}`} 
                          className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                          onClick={onClose}
                        >
                          {category.name}
                          {category.product_count && (
                            <span className="ml-2 text-xs opacity-75">({category.product_count})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Occasions - Dropdown */}
              <div>
                <button
                  onClick={() => toggleExpanded('occasions')}
                  className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                >
                  <span className="font-medium">Occasions</span>
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform ${
                      expandedItems.includes('occasions') ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedItems.includes('occasions') && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link 
                      href="/gifts?occasion=birthday" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Birthday
                    </Link>
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
                    <Link 
                      href="/gifts?occasion=sympathy" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Sympathy
                    </Link>
                    <Link 
                      href="/gifts?occasion=corporate" 
                      className="block px-4 py-2 text-red-200 hover:bg-red-800 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Corporate
                    </Link>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-red-800 my-4"></div>

              {/* Support & Account */}
              <Link 
                href="/support" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Support</span>
              </Link>

              <Link 
                href="/account" 
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Account</span>
              </Link>

              {/* Special CTA */}
              <Link 
                href="/checkout?delivery=next-day" 
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-red-800 rounded-lg transition-colors border-t border-red-800 mt-4 pt-4"
                onClick={onClose}
              >
                <span className="font-medium underline">Next Day Delivery</span>
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
