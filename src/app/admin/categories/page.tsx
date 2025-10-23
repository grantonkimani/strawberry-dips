'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Gift, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [giftCategories, setGiftCategories] = useState<GiftCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [editingGiftCategoryId, setEditingGiftCategoryId] = useState<string | null>(null);
  const [editingGiftCategory, setEditingGiftCategory] = useState<Partial<GiftCategory>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGiftForm, setShowAddGiftForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'gifts'>('products');
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    display_order: 0
  });
  const [newGiftCategory, setNewGiftCategory] = useState({
    name: '',
    description: '',
    icon: '🎁',
    display_order: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchGiftCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftCategories = async () => {
    try {
      const response = await fetch('/api/gift-categories?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        setGiftCategories(data.giftCategories || []);
      }
    } catch (error) {
      console.error('Error fetching gift categories:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Category created successfully!');
        await fetchCategories();
        setNewCategory({ name: '', description: '', display_order: 0 });
        setShowAddForm(false);
      } else {
        setError(data.error || 'Failed to create category');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });

      if (response.ok) {
        await fetchCategories();
        setEditingId(null);
        setEditingCategory({});
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Category deleted successfully!');
        await fetchCategories();
      } else {
        setError(data.error || 'Failed to delete category');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Network error. Please try again.');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory(category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCategory({});
  };

  // Gift Category Functions
  const handleAddGiftCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/gift-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGiftCategory)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Gift category created successfully!');
        await fetchGiftCategories();
        setNewGiftCategory({ name: '', description: '', icon: '🎁', display_order: 0 });
        setShowAddGiftForm(false);
      } else {
        setError(data.error || 'Failed to create gift category');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error adding gift category:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleEditGiftCategory = async (id: string) => {
    try {
      // If this is a fallback category (derived from products), create a real one instead
      const isFallback = id.startsWith('fallback-');
      const endpoint = isFallback ? '/api/gift-categories' : `/api/gift-categories/${id}`;
      const method = isFallback ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGiftCategory)
      });

      if (response.ok) {
        await fetchGiftCategories();
        setEditingGiftCategoryId(null);
        setEditingGiftCategory({});
      }
    } catch (error) {
      console.error('Error updating gift category:', error);
    }
  };

  const handleDeleteGiftCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift category?')) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/gift-categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Gift category deleted successfully!');
        await fetchGiftCategories();
      } else {
        setError(data.error || 'Failed to delete gift category');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error deleting gift category:', error);
      setError('Network error. Please try again.');
    }
  };

  const startEditGiftCategory = (category: GiftCategory) => {
    setEditingGiftCategoryId(category.id);
    setEditingGiftCategory(category);
  };

  const cancelEditGiftCategory = () => {
    setEditingGiftCategoryId(null);
    setEditingGiftCategory({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-pink-100 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Category Management</h1>
          <p className="text-gray-600">Manage product and gift categories for your store</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Product Categories
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gifts'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gift className="h-4 w-4 inline mr-2" />
              Gift Categories
            </button>
          </nav>
        </div>
      </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

      {/* Product Categories Tab */}
      {activeTab === 'products' && (
        <>
          {/* Action Button */}
          <div className="flex justify-end mb-8">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product Category
            </Button>
          </div>

        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
                <CardTitle>Add New Product Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={newCategory.display_order}
                      onChange={(e) => setNewCategory({ ...newCategory, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="mr-2 bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={2}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        )}

          {/* Product Categories List */}
        <div className="grid gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={editingCategory.display_order || 0}
                          onChange={(e) => setEditingCategory({ ...editingCategory, display_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => handleEditCategory(category.id)}
                          className="mr-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 mb-2">{category.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Order: {category.display_order}</span>
                        <span>Status: {category.is_active ? 'Active' : 'Inactive'}</span>
                        <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
                <p className="text-gray-500">No product categories found. Add your first category to get started.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Gift Categories Tab */}
      {activeTab === 'gifts' && (
        <>
          {/* Action Button */}
          <div className="flex justify-end mb-8">
            <Button
              onClick={() => setShowAddGiftForm(true)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Gift Category
            </Button>
          </div>

          {/* Add Gift Category Form */}
          {showAddGiftForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Gift Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGiftCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={newGiftCategory.name}
                        onChange={(e) => setNewGiftCategory({ ...newGiftCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Icon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={newGiftCategory.icon}
                        onChange={(e) => setNewGiftCategory({ ...newGiftCategory, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="🎁"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={newGiftCategory.display_order}
                        onChange={(e) => setNewGiftCategory({ ...newGiftCategory, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="mr-2 bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddGiftForm(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newGiftCategory.description}
                      onChange={(e) => setNewGiftCategory({ ...newGiftCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={2}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Gift Categories List */}
          <div className="grid gap-6">
            {giftCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  {editingGiftCategoryId === category.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            value={editingGiftCategory.name || ''}
                            onChange={(e) => setEditingGiftCategory({ ...editingGiftCategory, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Icon (Emoji)
                          </label>
                          <input
                            type="text"
                            value={editingGiftCategory.icon || ''}
                            onChange={(e) => setEditingGiftCategory({ ...editingGiftCategory, icon: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={editingGiftCategory.display_order || 0}
                            onChange={(e) => setEditingGiftCategory({ ...editingGiftCategory, display_order: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => handleEditGiftCategory(category.id)}
                            className="mr-2 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={cancelEditGiftCategory}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editingGiftCategory.description || ''}
                          onChange={(e) => setEditingGiftCategory({ ...editingGiftCategory, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{category.icon}</span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </h3>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 mb-2">{category.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Order: {category.display_order}</span>
                          <span>Status: {category.is_active ? 'Active' : 'Inactive'}</span>
                          <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditGiftCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGiftCategory(category.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {giftCategories.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gift Categories Yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first gift category</p>
                <Button
                  onClick={() => setShowAddGiftForm(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
            </CardContent>
          </Card>
          )}
        </>
        )}
    </>
  );
}
