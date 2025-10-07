'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';

interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  featured?: boolean;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/products?available=true&limit=12');
        const data = await res.json();
        const list: ApiProduct[] = Array.isArray(data) ? data : (data.products || []);
        // naive featured: top price or first 6 items; adapt when backend flag exists
        const selected = list.slice(0, 6);
        setProducts(selected);
      } catch (e) {
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
            <p className="text-gray-600">Customer favorites, freshly made</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-3 h-9 w-full rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  description: p.description || '',
                  base_price: p.base_price,
                  image_url: p.image_url || '/images/placeholder-gift.svg',
                  categories: undefined,
                  category: undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


