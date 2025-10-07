'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

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
        <div className="text-gray-600 text-sm">Coming soon: related products from same category.</div>
      </section>

      {/* Gifts */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Popular Gifts</h2>
        <div className="text-gray-600 text-sm">Coming soon: top gift items.</div>
      </section>
    </div>
  );
}


