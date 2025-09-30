'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminNav } from '@/components/AdminNav';

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    display_order: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
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

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Category Management</h1>
            <p className="text-gray-600 mt-2">Manage product categories for your store</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
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

        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
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

        {/* Categories List */}
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
              <p className="text-gray-500">No categories found. Add your first category to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
