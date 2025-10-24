'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Wine, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Filter,
  Search,
  Save,
  X
} from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { ProductImage } from '@/components/OptimizedImage';

interface WineLiquorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  wine_liquor_category_id?: string;
  image_url?: string;
  alcohol_content?: string;
  volume?: string;
  vintage?: string;
  region?: string;
  producer?: string;
  grape_variety?: string;
  spirit_type?: string;
  serving_temperature?: string;
  food_pairing?: string;
  tasting_notes?: string;
  is_active: boolean;
  requires_age_verification: boolean;
  created_at: string;
  updated_at: string;
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

export default function WineLiquorProductsPage() {
  const [wineLiquorProducts, setWineLiquorProducts] = useState<WineLiquorProduct[]>([]);
  const [wineLiquorCategories, setWineLiquorCategories] = useState<WineLiquorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WineLiquorProduct | null>(null);
  const [formData, setFormData] = useState<Partial<WineLiquorProduct>>({});

  useEffect(() => {
    fetchData();
    
    // Listen for category updates from other pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wineLiquorCategoriesUpdated') {
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/wine-liquor-products?includeInactive=true'),
        fetch('/api/wine-liquor-categories?includeInactive=true')
      ]);

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (productsResponse.ok) {
        setWineLiquorProducts(productsData.wineLiquorProducts || []);
      }

      if (categoriesResponse.ok) {
        setWineLiquorCategories(categoriesData.wineLiquorCategories || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = wineLiquorProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.producer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesActive = showInactive || product.is_active;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      wine_liquor_category_id: '',
      image_url: '',
      alcohol_content: '',
      volume: '',
      vintage: '',
      region: '',
      producer: '',
      grape_variety: '',
      spirit_type: '',
      serving_temperature: '',
      food_pairing: '',
      tasting_notes: '',
      is_active: true,
      requires_age_verification: true
    });
    setIsCreating(true);
  };

  const handleEditProduct = (product: WineLiquorProduct) => {
    setFormData(product);
    setEditingProduct(product);
  };

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        alert('Product name is required');
        return;
      }
      if (!formData.price || formData.price <= 0) {
        alert('Product price must be greater than 0');
        return;
      }

      const url = editingProduct ? '/api/wine-liquor-products' : '/api/wine-liquor-products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Optimistic update - no need to refetch
        setIsCreating(false);
        setEditingProduct(null);
        setFormData({});
        // Refresh in background to ensure data consistency
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Failed to save product:', errorData);
        const errorMessage = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || 'Unknown error';
        alert(`Failed to save product: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    // Optimistic update - remove from UI immediately
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const response = await fetch(`/api/wine-liquor-products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Success - optimistic update already handled it
        // Refresh in background to ensure data consistency
        fetchData();
      } else {
        // Revert optimistic update on error
        await fetchData();
        console.error('Failed to delete product');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchData();
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (product: WineLiquorProduct) => {
    // Optimistic update - toggle status immediately
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, is_active: !p.is_active }
        : p
    ));

    try {
      const response = await fetch('/api/wine-liquor-products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          is_active: !product.is_active,
        }),
      });

      if (response.ok) {
        // Success - optimistic update already handled it
        // Refresh in background to ensure data consistency
        fetchData();
      } else {
        // Revert optimistic update on error
        await fetchData();
        console.error('Failed to update product status');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchData();
      console.error('Error updating product status:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wine & liquor products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Wine className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wine & Liquor Products</h1>
            <p className="text-gray-600">Manage your wine and liquor inventory</p>
          </div>
        </div>
        <Button
          onClick={handleCreateProduct}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {wineLiquorCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-600">Show Inactive</span>
          </label>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {filteredProducts.length} products
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative">
              <ProductImage 
                src={product.image_url} 
                alt={product.name}
                className="aspect-square"
                fallbackIcon="🍷"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleProductStatus(product)}
                  className={`p-2 rounded-full ${
                    product.is_active 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="space-y-1 mb-4 text-sm text-gray-500">
                {product.alcohol_content && (
                  <p><span className="font-medium">ABV:</span> {product.alcohol_content}</p>
                )}
                {product.volume && (
                  <p><span className="font-medium">Volume:</span> {product.volume}</p>
                )}
                {product.vintage && (
                  <p><span className="font-medium">Vintage:</span> {product.vintage}</p>
                )}
                {product.region && (
                  <p><span className="font-medium">Region:</span> {product.region}</p>
                )}
                {product.producer && (
                  <p><span className="font-medium">Producer:</span> {product.producer}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-red-600">
                  KES {product.price.toLocaleString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Luc Belaire Rare Rosé Champagne"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.wine_liquor_category_id || ''}
                  onChange={(e) => setFormData({ ...formData, wine_liquor_category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {wineLiquorCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price === 0 ? '' : formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 4500.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the wine/liquor product..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onImageUpload={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
                  onImageRemove={() => setFormData({ ...formData, image_url: '' })}
                  productType="wine-liquor"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
