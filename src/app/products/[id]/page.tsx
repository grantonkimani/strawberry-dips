'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { GiftProductGrid } from '@/components/GiftProductGrid';
import { ProductCard } from '@/components/ProductCard';

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
        const res = await fetch(`/api/products/${params.id}`);
        const json = await res.json();
        if (json?.product) setProduct(json.product);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  // Fetch best sellers for "You may also like"
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10">Loading…</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-10">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img src={product.image_url || '/images/placeholder-gift.svg'} alt={product.name} className="w-full h-full object-cover" />
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

          <div className="mt-4 text-sm text-gray-600">
            <Link href="/menu" className="underline">Back to menu</Link>
          </div>
        </div>
      </div>

      {/* Recommended */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">You may also like</h2>
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
      </section>

      {/* Gifts */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Popular Gifts</h2>
        {/* Reuse existing grid; limit to 8, hide categories for compactness */}
        <GiftProductGrid limit={8} showCategory={false} />
      </section>
    </div>
  );
}


