'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

interface GiftProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
}

interface GiftCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GiftProductGridProps {
  category?: string;
  limit?: number;
  showCategory?: boolean;
}

export function GiftProductGrid({ category, limit, showCategory = true }: GiftProductGridProps) {
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [giftCategories, setGiftCategories] = useState<GiftCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = category 
          ? `/api/gift-products?category=${encodeURIComponent(category)}`
          : '/api/gift-products';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          let products = data.giftProducts || [];
          
          // Apply limit if specified
          if (limit) {
            products = products.slice(0, limit);
          }
          
          setGiftProducts(products);
        } else {
          setError(data.error || 'Failed to load gift products');
        }

        // Also fetch categories for icons
        const categoriesResponse = await fetch('/api/gift-categories?includeInactive=true');
        const categoriesData = await categoriesResponse.json();
        if (categoriesResponse.ok) {
          setGiftCategories(categoriesData.giftCategories || []);
        }
      } catch (error) {
        console.error('Error fetching gift products:', error);
        setError('Failed to load gift products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, limit]);

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    const categoryInfo = giftCategories.find(cat => cat.name === categoryName);
    return categoryInfo?.icon || '🎁';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit || 8 }).map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (giftProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gift Products Available</h3>
        <p className="text-gray-600">
          {category ? `No products found in ${category} category` : 'No gift products have been added yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {giftProducts.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
          <Link href={`/gifts/${product.id}`}>
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-gift.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                  <span className="text-4xl">🎁</span>
                </div>
              )}
            </div>
          </Link>
          
          <div className="p-4">
            {/* Category Badge */}
            {showCategory && (
              <div className="mb-2">
                <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full flex items-center w-fit">
                  <span className="mr-1">{getCategoryIcon(product.category)}</span>
                  {product.category}
                </span>
              </div>
            )}
            
            {/* Product Name */}
            <Link href={`/gifts/${product.id}`}>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-pink-600">
                  KSH {product.price.toFixed(2)}
                </span>
                {!product.is_active && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex items-center space-x-2">
              <Button
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm py-2"
                disabled={!product.is_active}
                onClick={() => {
                  // Add to cart logic here
                  alert('Gift products will be added to cart in the next update!');
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add Gift
              </Button>
              
              <button
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Add to wishlist"
              >
                <Heart className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
