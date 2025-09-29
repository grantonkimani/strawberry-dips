'use client';

import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  product_count?: number;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategorySelect }: CategoryTabsProps) {
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="mb-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            selectedCategory === null
              ? 'bg-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
          }`}
        >
          All Products
          <span className="ml-2 text-sm opacity-75">
            ({categories.reduce((total, cat) => total + (cat.product_count || 0), 0)})
          </span>
        </button>
        
        {sortedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
            }`}
          >
            {category.name}
            <span className="ml-2 text-sm opacity-75">
              ({category.product_count || 0})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}


