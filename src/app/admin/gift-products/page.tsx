'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Plus, Edit, Trash2, Eye, EyeOff, Gift } from 'lucide-react';

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

export default function GiftProductsPage() {
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [giftCategories, setGiftCategories] = useState<GiftCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GiftProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_active: true
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch gift products
  const fetchGiftProducts = async () => {
    try {
      const response = await fetch('/api/gift-products?includeInactive=true');
      const data = await response.json();
      setGiftProducts(data.giftProducts || []);
    } catch (error) {
      console.error('Error fetching gift products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gift categories
  const fetchGiftCategories = async () => {
    try {
      const response = await fetch('/api/gift-categories?includeInactive=true');
      const data = await response.json();
      setGiftCategories(data.giftCategories || []);
    } catch (error) {
      console.error('Error fetching gift categories:', error);
    }
  };

  useEffect(() => {
    fetchGiftProducts();
    fetchGiftCategories();
    
    // Listen for category updates from other pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'giftCategoriesUpdated') {
        fetchGiftCategories();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `/api/gift-products/${editingProduct.id}`
        : '/api/gift-products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      if (response.ok) {
        await fetchGiftProducts();
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving gift product:', error);
      alert('Failed to save gift product');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift product?')) {
      return;
    }

    // Optimistic update - remove from UI immediately
    setGiftProducts(prev => prev.filter(p => p.id !== id));

    try {
      const response = await fetch(`/api/gift-products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Success - optimistic update already handled it
        // Refresh in background to ensure data consistency
        fetchGiftProducts();
      } else {
        // Revert optimistic update on error
        await fetchGiftProducts();
        alert('Failed to delete gift product');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchGiftProducts();
      console.error('Error deleting gift product:', error);
      alert('Failed to delete gift product');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (product: GiftProduct) => {
    // Optimistic update - toggle status immediately
    setGiftProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, is_active: !p.is_active }
        : p
    ));

    try {
      const response = await fetch(`/api/gift-products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          is_active: !product.is_active
        }),
      });

      if (response.ok) {
        // Success - optimistic update already handled it
        // Refresh in background to ensure data consistency
        fetchGiftProducts();
      } else {
        // Revert optimistic update on error
        await fetchGiftProducts();
        alert('Failed to update gift product status');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchGiftProducts();
      console.error('Error updating gift product:', error);
      alert('Failed to update gift product status');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_active: true
    });
    setUploadError(null);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  // Start editing
  const startEditing = (product: GiftProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      is_active: product.is_active
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Group products by category
  const groupedProducts = giftProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, GiftProduct[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-pink-100 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Gift Products Management</h1>
          <p className="text-gray-600">Manage flowers, liquor, and other gift products</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gift Product
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Gift Product' : 'Add New Gift Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {giftCategories
                    .filter(cat => cat.is_active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (KSH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
                  onError={(error) => setUploadError(error)}
                />
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Products by Category */}
      {Object.keys(groupedProducts).length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gift Products Yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first gift product</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Product
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([category, products]) => {
            const categoryInfo = giftCategories.find(cat => cat.name === category);
            return (
              <div key={category}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">
                    {categoryInfo?.icon || '🎁'}
                  </span>
                  {category}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({products.length} products)
                  </span>
                </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <p className="text-lg font-bold text-pink-600">KSH {product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`p-1 rounded ${
                            product.is_active 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={product.is_active ? 'Hide from customers' : 'Show to customers'}
                        >
                          {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => startEditing(product)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {product.image_url && (
                      <div className="mb-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </>
  );
}
