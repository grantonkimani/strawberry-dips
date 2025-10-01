'use client';

import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  categories?: {
    id: string;
    name: string;
    description?: string;
    display_order: number;
  };
  category?: string; // Legacy support
}

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export function CategorySection({ category, products }: CategorySectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      {/* Category Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {category.description}
          </p>
        )}
        <div className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
          {products.length} {products.length === 1 ? 'item' : 'items'} available
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}


