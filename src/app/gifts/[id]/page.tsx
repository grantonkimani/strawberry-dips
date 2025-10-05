'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

interface GiftProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GiftProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<GiftProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/gift-products/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data.giftProduct);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/menu">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-pink-600">Home</Link>
        <span>/</span>
        <Link href="/menu" className="hover:text-pink-600">Menu</Link>
        <span>/</span>
        <Link href="/gifts" className="hover:text-pink-600">Gifts</Link>
        <span>/</span>
        <span className="text-gray-900">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-gift.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                <span className="text-6xl">🎁</span>
              </div>
            )}
          </div>
          
          {/* Additional Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Add to Wishlist</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-medium rounded-full">
                {product.category}
              </span>
              {product.is_active ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Available
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  Unavailable
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-pink-600">KSH {product.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available for this gift product.'}
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Choose This Gift?</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Perfect complement to your strawberry order</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">High-quality {product.category.toLowerCase()}</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Same-day delivery available</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Beautifully packaged</span>
              </li>
            </ul>
          </div>

          {/* Add to Cart */}
          <div className="pt-6 border-t border-gray-200">
            {product.is_active ? (
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    // Add to cart logic here
                    alert('Gift products will be added to cart in the next update!');
                  }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add Gift to Order
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  This gift will be added to your current order
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">This gift is currently unavailable</p>
                <Link href="/menu">
                  <Button variant="outline" className="w-full">
                    Browse Other Gifts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">More from {product.category}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* This would be populated with related gift products */}
          <div className="text-center py-8 text-gray-500">
            <p>Related gifts will be shown here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
