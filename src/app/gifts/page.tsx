'use client';

import { useState, useEffect } from 'react';
import { GiftProductGrid } from '@/components/GiftProductGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gift, Filter, Grid, List, Sparkles } from 'lucide-react';

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

export default function GiftsPage() {
  const [giftCategories, setGiftCategories] = useState<GiftCategory[]>([]);
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both gift categories and products
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/gift-categories?includeInactive=true'),
          fetch('/api/gift-products?includeInactive=true')
        ]);

        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        if (categoriesResponse.ok) {
          setGiftCategories(categoriesData.giftCategories || []);
        }

        if (productsResponse.ok) {
          setGiftProducts(productsData.giftProducts || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group products by category
  const groupedProducts = giftProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, GiftProduct[]>);

  // Get category info for a given category name
  const getCategoryInfo = (categoryName: string) => {
    return giftCategories.find(cat => cat.name === categoryName);
  };

  // Get product count for a category
  const getCategoryProductCount = (categoryName: string) => {
    return groupedProducts[categoryName]?.length || 0;
  };

  // Filter active categories that have products
  const activeCategoriesWithProducts = giftCategories
    .filter(cat => cat.is_active && getCategoryProductCount(cat.name) > 0)
    .sort((a, b) => a.display_order - b.display_order);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-pink-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Gift Products</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Perfect complements to your strawberry order. Choose from our curated selection of gifts 
          to make your order even more special and memorable.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-pink-600" />
            Browse by Category
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedCategory === '' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
            }`}
            onClick={() => setSelectedCategory('')}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-medium text-gray-900">All Gifts</h3>
              <p className="text-sm text-gray-500">
                {giftProducts.length} products
              </p>
            </div>
          </Card>

          {activeCategoriesWithProducts.map((category) => (
            <Card
              key={category.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedCategory === category.name 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  {getCategoryProductCount(category.name)} products
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Products Display */}
      {selectedCategory ? (
        // Single Category View
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">
                {getCategoryInfo(selectedCategory)?.icon || '🎁'}
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedCategory} Products
                </h2>
                {getCategoryInfo(selectedCategory)?.description && (
                  <p className="text-gray-600 mt-1">
                    {getCategoryInfo(selectedCategory)?.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <GiftProductGrid 
            category={selectedCategory}
            showCategory={false}
          />
        </div>
      ) : (
        // Categorical Display - All Categories
        <div className="space-y-12">
          {activeCategoriesWithProducts.map((category) => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {getCategoryProductCount(category.name)} products available
                  </p>
                </div>
              </div>

              <GiftProductGrid 
                category={category.name}
                showCategory={false}
                limit={4} // Show first 4 products per category
              />

              {getCategoryProductCount(category.name) > 4 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(category.name)}
                    className="text-pink-600 border-pink-300 hover:bg-pink-50"
                  >
                    View All {category.name} Products
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center py-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Add These Gifts to Your Order?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Browse our main menu to add strawberry products to your cart, then come back here to 
          add the perfect gifts to complete your order.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3"
            onClick={() => window.location.href = '/menu'}
          >
            Browse Main Menu
          </Button>
          <Button 
            variant="outline" 
            className="px-8 py-3"
            onClick={() => window.location.href = '/cart'}
          >
            View Cart
          </Button>
        </div>
      </div>
    </div>
  );
}