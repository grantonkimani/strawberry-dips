'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Wine, Filter, Grid, List, Sparkles, Shield, Clock } from 'lucide-react';
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
  is_active: boolean;
}

interface WineLiquorCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function WinesLiquorPage() {
  const { addItem } = useCart();
  const [wineLiquorCategories, setWineLiquorCategories] = useState<WineLiquorCategory[]>([]);
  const [wineLiquorProducts, setWineLiquorProducts] = useState<WineLiquorProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both wine/liquor categories and products
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/wine-liquor-categories?includeInactive=true'),
          fetch('/api/wine-liquor-products?includeInactive=true')
        ]);

        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        if (categoriesResponse.ok) {
          setWineLiquorCategories(categoriesData.wineLiquorCategories || []);
        }

        if (productsResponse.ok) {
          setWineLiquorProducts(productsData.wineLiquorProducts || []);
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
  const groupedProducts = wineLiquorProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, WineLiquorProduct[]>);

  // Get category info for a given category name
  const getCategoryInfo = (categoryName: string) => {
    return wineLiquorCategories.find(cat => cat.name === categoryName);
  };

  // Get product count for a category
  const getCategoryProductCount = (categoryName: string) => {
    return groupedProducts[categoryName]?.length || 0;
  };

  // Filter active categories that have products
  const activeCategoriesWithProducts = wineLiquorCategories
    .filter(cat => cat.is_active && getCategoryProductCount(cat.name) > 0)
    .sort((a, b) => a.display_order - b.display_order);

  // Age verification modal
  const AgeVerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Age Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You must be 18 years or older to view and purchase alcoholic beverages. 
            By clicking "I am 18+" you confirm that you meet the legal drinking age requirement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setAgeVerified(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              I am 18+
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              I am under 18
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!ageVerified) {
    return <AgeVerificationModal />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wines & liquor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Wine className="h-8 w-8 text-red-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Wines & Liquor</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Premium selection of wines, spirits, and champagne to complement your strawberry order. 
          Perfect for special occasions and celebrations.
        </p>
        
        {/* Legal Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-3xl mx-auto">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Notice:</p>
              <p>
                Alcoholic beverages are only available for customers 18+ years old. 
                Valid ID required upon delivery. Delivery times may vary for alcohol orders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-red-600" />
            Browse by Category
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-red-100 text-red-600' 
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
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
            onClick={() => setSelectedCategory('')}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🍷</div>
              <h3 className="font-medium text-gray-900">All Products</h3>
              <p className="text-sm text-gray-500">
                {wineLiquorProducts.length} products
              </p>
            </div>
          </Card>

          {activeCategoriesWithProducts.map((category) => (
            <Card
              key={category.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedCategory === category.name 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
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
                {getCategoryInfo(selectedCategory)?.icon || '🍷'}
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

          {/* Product Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {groupedProducts[selectedCategory]?.map((product) => (
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

              {/* Product Grid for Category */}
              <div className={`grid gap-6 mb-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {groupedProducts[category.name]?.slice(0, 4).map((product) => (
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

              {getCategoryProductCount(category.name) > 4 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(category.name)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
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
      <div className="text-center py-12 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Add These to Your Order?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Browse our main menu to add strawberry products to your cart, then come back here to 
          add the perfect wines and liquor to complete your order.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-8 py-3"
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
      
      <ImagePerformanceMonitor />
    </div>
  );
}
