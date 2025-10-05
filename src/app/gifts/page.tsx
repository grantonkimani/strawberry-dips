'use client';

import { useState, useEffect } from 'react';
import { GiftProductGrid } from '@/components/GiftProductGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gift, Filter, Grid, List } from 'lucide-react';

interface GiftCategory {
  category: string;
  count: number;
}

export default function GiftsPage() {
  const [categories, setCategories] = useState<GiftCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/gift-products');
        const data = await response.json();
        
        if (response.ok) {
          const products = data.giftProducts || [];
          const categoryCounts = products.reduce((acc: Record<string, number>, product: any) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
          }, {});
          
          const categoryList = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count: count as number
          }));
          
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'flowers': return '🌸';
      case 'liquor': return '🍷';
      case 'chocolates': return '🍫';
      case 'services': return '🎁';
      case 'cards': return '💌';
      default: return '🎁';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-pink-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Gift Products</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Perfect complements to your strawberry order. Choose from our curated selection of flowers, 
          liquor, chocolates, and special services to make your gift even more memorable.
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
                {categories.reduce((total, cat) => total + cat.count, 0)} products
              </p>
            </div>
          </Card>

          {categories.map((category) => (
            <Card
              key={category.category}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedCategory === category.category 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
              }`}
              onClick={() => setSelectedCategory(category.category)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{getCategoryIcon(category.category)}</div>
                <h3 className="font-medium text-gray-900">{category.category}</h3>
                <p className="text-sm text-gray-500">{category.count} products</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory} Products` : 'All Gift Products'}
          </h2>
        </div>

        <GiftProductGrid 
          category={selectedCategory || undefined}
          showCategory={!selectedCategory}
        />
      </div>

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
