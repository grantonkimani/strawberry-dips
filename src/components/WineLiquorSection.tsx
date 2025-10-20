'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Wine, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ProductImage } from '@/components/OptimizedImage';
import { ImagePerformanceMonitor } from '@/components/ImagePerformanceMonitor';

interface WineLiquorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  alcohol_content?: string;
  volume?: string;
  vintage?: string;
  region?: string;
  producer?: string;
  is_active: boolean;
}

export function WineLiquorSection() {
  const { addItem } = useCart();
  const [wineLiquorProducts, setWineLiquorProducts] = useState<WineLiquorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWineLiquorProducts = async () => {
      try {
        const response = await fetch('/api/wine-liquor-products?limit=6');
        const data = await response.json();
        
        if (response.ok) {
          setWineLiquorProducts(data.wineLiquorProducts || []);
        }
      } catch (error) {
        console.error('Error fetching wine/liquor products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWineLiquorProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-pulse w-8 h-8 bg-red-200 rounded mr-3"></div>
              <div className="animate-pulse h-8 w-64 bg-red-200 rounded"></div>
            </div>
            <div className="animate-pulse h-6 w-96 bg-red-200 rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-red-200 mb-4" />
                <div className="h-5 w-3/4 rounded bg-red-200 mb-2" />
                <div className="h-4 w-1/2 rounded bg-red-200 mb-3" />
                <div className="h-9 w-full rounded-md bg-red-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (wineLiquorProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-amber-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Wine className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">Wines & Liquor</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Premium selection of wines, spirits, and champagne to complement your strawberry order
          </p>
          
          {/* Age Verification Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                <span className="font-medium">18+ Only:</span> Age verification required for alcohol purchases
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wineLiquorProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <ProductImage 
                src={product.image_url} 
                alt={product.name}
                className="aspect-square"
                fallbackIcon="🍷"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-red-600">
                    KES {product.price.toLocaleString()}
                  </span>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image_url,
                        category: 'wine-liquor',
                        quantity: 1
                      });
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/wines-liquor">
            <Button 
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-8 py-3"
            >
              View All Wines & Liquor
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <ImagePerformanceMonitor />
      </div>
    </section>
  );
}
