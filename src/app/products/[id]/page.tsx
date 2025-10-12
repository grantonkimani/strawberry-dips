'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { GiftProductGrid } from '@/components/GiftProductGrid';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronLeft, Home, Menu } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  categories?: { id: string; name: string };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [giftsLoaded, setGiftsLoaded] = useState(false);
  const [bestSellersLoaded, setBestSellersLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Add caching for better performance
        const res = await fetch(`/api/products/${params.id}`, {
          cache: 'force-cache',
          next: { revalidate: 300 } // Revalidate every 5 minutes
        });
        const json = await res.json();
        if (json?.product) setProduct(json.product);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  // Fetch best sellers for "You may also like" - Defer this to improve initial load
  useEffect(() => {
    let cancelled = false;
    // Delay this fetch to prioritize main product loading
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/products?available=true&limit=8');
        const data = await res.json();
        const items: Product[] = Array.isArray(data)
          ? data
          : (data.products ?? []);
        if (!cancelled) setBestSellers(items);
      } catch {
        // ignore silently; section will hide
      } finally {
        if (!cancelled) setBestSellersLoaded(true);
      }
    }, 100); // Small delay to let main product load first
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image skeleton */}
          <div className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-10">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="flex items-center hover:text-pink-600 transition-colors">
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <Link href="/menu" className="flex items-center hover:text-pink-600 transition-colors">
          <Menu className="h-4 w-4 mr-1" />
          Menu
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={product.image_url || '/images/placeholder-gift.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-gray-700">{product.description || 'Delicious handcrafted strawberry treats.'}</p>
          <div className="mt-4 text-3xl font-semibold">KES {product.base_price.toFixed(2)}</div>

          <div className="mt-5 border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2">
              <input id="gift" type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
              <label htmlFor="gift" className="font-medium">Is this a gift?</label>
            </div>
            {gift && (
              <div className="mt-3 space-y-3">
                <input className="w-full border p-2 rounded" placeholder="Recipient name (optional)" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                <textarea className="w-full border p-2 rounded" rows={3} maxLength={250} placeholder="Gift note (max 250 characters)" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="text-xs text-gray-500">{250 - note.length} characters left</div>
              </div>
            )}
            <Button className="mt-4 w-full" onClick={() => {
              if (!product) return;
              addItem({
                id: product.id,
                name: product.name,
                price: product.base_price,
                image: product.image_url || '',
                category: product.categories?.name || 'Uncategorized',
                isGift: gift,
                recipientName: gift ? recipient : undefined,
                giftNote: gift ? note : undefined,
              });
            }}>Add to Cart</Button>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <Link href="/menu" className="flex items-center text-gray-600 hover:text-pink-600 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Menu
            </Link>
            <Link href="/" className="flex items-center text-gray-600 hover:text-pink-600 transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended - Lazy loaded */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">You may also like</h2>
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[6/5] rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        }>
          {!bestSellersLoaded ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[6/5] rounded-lg bg-gray-200" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="text-gray-600 text-sm">No recommendations available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers
                .slice()
                .sort((a, b) => {
                  const ca = (a.categories as any)?.name || '';
                  const cb = (b.categories as any)?.name || '';
                  if (ca !== cb) return ca.localeCompare(cb);
                  return a.name.localeCompare(b.name);
                })
                .map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    description: p.description ?? '',
                    base_price: p.base_price,
                    image_url: p.image_url,
                    categories: p.categories as any,
                  }}
                />
              ))}
            </div>
          )}
        </Suspense>
      </section>

      {/* Gifts - Lazy loaded */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Popular Gifts</h2>
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        }>
          <GiftProductGrid limit={8} showCategory={false} />
        </Suspense>
      </section>
    </div>
  );
}


