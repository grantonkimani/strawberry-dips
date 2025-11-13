'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';

interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  video_url?: string | null;
  featured?: boolean;
  category_id?: string | null;
  categories?: {
    id: string;
    name: string;
    description?: string;
    display_order: number;
  };
  category?: string;
  offer?: {
    offer_price: number;
    discount_percentage: number;
    end_date: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch products, offers, and categories in parallel
        const [productsRes, offersRes, categoriesRes] = await Promise.all([
          fetch('/api/products?available=true&limit=1000', {
            cache: 'no-store',
            next: { revalidate: 0 }
          }),
          fetch('/api/offers', {
            cache: 'no-store',
            next: { revalidate: 0 }
          }),
          fetch('/api/categories', {
            cache: 'no-store',
            next: { revalidate: 0 }
          })
        ]);

        const productsData = await productsRes.json();
        const offersData = await offersRes.json();
        const categoriesData = await categoriesRes.json();

        let productsList: ApiProduct[] = Array.isArray(productsData) 
          ? productsData 
          : (productsData.products || []);

        const categoriesList: Category[] = Array.isArray(categoriesData)
          ? categoriesData
          : (categoriesData.categories || []);

        // Build quick lookups for offers and categories
        const activeOffers = offersData.offers || [];
        const today = new Date().toISOString().split('T')[0];
        const offersMap = new Map<string, typeof activeOffers[0]>();
        activeOffers.forEach((offer: any) => {
          if (
            offer.product_id &&
            offer.is_active &&
            offer.start_date <= today &&
            offer.end_date >= today
          ) {
            offersMap.set(offer.product_id, offer);
          }
        });

        const categoryOrder = categoriesList
          .slice()
          .sort((a, b) => a.display_order - b.display_order)
          .map(cat => ({ id: cat.id, name: cat.name, displayOrder: cat.display_order }));

        // Attach offers to products
        productsList = productsList.map((product: ApiProduct) => {
          const offer = offersMap.get(product.id);
          if (offer) {
            return {
              ...product,
              offer: {
                offer_price: offer.offer_price,
                discount_percentage: offer.discount_percentage,
                end_date: offer.end_date
              }
            };
          }
          return product;
        });

        // Group products by category
        const bucket = new Map<string, ApiProduct[]>();
        productsList.forEach(product => {
          const catId =
            product.category_id ||
            product.categories?.id ||
            product.category ||
            'uncategorized';
          if (!bucket.has(catId)) {
            bucket.set(catId, []);
          }
          bucket.get(catId)!.push(product);
        });

        // Helper to pick best product per category (prefer offers, highest discount)
        const selectProductForCategory = (items: ApiProduct[]) => {
          const withOffers = items
            .filter(p => p.offer)
            .sort(
              (a, b) =>
                (b.offer?.discount_percentage || 0) -
                (a.offer?.discount_percentage || 0)
            );
          if (withOffers.length > 0) return withOffers[0];
          return items[0];
        };

        const selected: ApiProduct[] = [];
        const used = new Set<string>();

        const orderedCategoryIds =
          categoryOrder.length > 0
            ? categoryOrder.map(cat => cat.id).filter(id => bucket.has(id))
            : Array.from(bucket.keys());

        for (const categoryId of orderedCategoryIds) {
          if (selected.length >= 6) break;
          const items = bucket.get(categoryId);
          if (!items || items.length === 0) continue;

          const chosen = selectProductForCategory(
            items.filter(item => !used.has(item.id))
          );
          if (!chosen) continue;

          selected.push(chosen);
          used.add(chosen.id);
        }

        // Fill remaining slots with other offered products, then any products
        if (selected.length < 6) {
          const remainingOffers = productsList
            .filter(p => p.offer && !used.has(p.id))
            .sort(
              (a, b) =>
                (b.offer?.discount_percentage || 0) -
                (a.offer?.discount_percentage || 0)
            );
          for (const product of remainingOffers) {
            if (selected.length >= 6) break;
            selected.push(product);
            used.add(product.id);
          }
        }

        if (selected.length < 6) {
          for (const product of productsList) {
            if (selected.length >= 6) break;
            if (used.has(product.id)) continue;
            selected.push(product);
            used.add(product.id);
          }
        }

        setProducts(selected.slice(0, 6));
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Special Offers</h2>
            <p className="text-sm sm:text-base text-gray-600">
              {products.filter(p => p.offer).length > 0
                ? 'Hand-picked deals from every collection'
                : 'Customer favorites, freshly made'}
            </p>
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  description: p.description || '',
                  base_price: p.base_price,
                  image_url: p.image_url || '/images/placeholder-gift.svg',
                  video_url: p.video_url || undefined,
                  categories: p.categories,
                  category: p.category,
                  offer: p.offer,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


