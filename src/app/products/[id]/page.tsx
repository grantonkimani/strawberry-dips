'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/SafeImage';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { GiftProductGrid } from '@/components/GiftProductGrid';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Home, Menu, Play, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  image_urls?: string[] | null;
  video_url?: string; // optional product video
  poster_url?: string; // optional poster image for video
  categories?: { id: string; name: string };
  offer?: {
    offer_price: number;
    discount_percentage: number;
    end_date: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [isTouch, setIsTouch] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [giftsLoaded, setGiftsLoaded] = useState(false);
  const [bestSellersLoaded, setBestSellersLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch product and offers in parallel
        const [productRes, offersRes] = await Promise.all([
          fetch(`/api/products/${params.id}`, {
            cache: 'no-store'
          }),
          fetch('/api/offers', {
            cache: 'no-store'
          })
        ]);
        
        const productJson = await productRes.json();
        const offersJson = await offersRes.json();
        
        if (productJson?.product) {
          const productData = productJson.product;
          
          // Find active offer for this product
          const activeOffers = offersJson.offers || [];
          const productOffer = activeOffers.find((offer: any) => 
            offer.product_id === productData.id && offer.is_active
          );
          
          // Attach offer to product if found
          if (productOffer) {
            productData.offer = {
              offer_price: productOffer.offer_price,
              discount_percentage: productOffer.discount_percentage,
              end_date: productOffer.end_date
            };
          }
          
          setProduct(productData);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    // Detect coarse pointer/touch devices to avoid autoplay and show controls
    try {
      const coarse = typeof window !== 'undefined' && (('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches);
      setIsTouch(!!coarse);
    } catch {
      setIsTouch(false);
    }
  }, []);

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

  // Keyboard navigation for gallery: always register to keep hook order stable
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!product) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        const total = ((product.image_urls && product.image_urls.length > 0) ? product.image_urls.length : (product.image_url ? 1 : 1));
        setActiveImageIndex(i => Math.min(total - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product]);

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

  const galleryImages: string[] = (() => {
    const urls = (product.image_urls || []).filter(Boolean);
    if (urls.length > 0) return urls as string[];
    return product.image_url ? [product.image_url] : ['/images/placeholder-gift.svg'];
  })();
  const mainImage = galleryImages[Math.min(activeImageIndex, galleryImages.length - 1)] || '/images/placeholder-gift.svg';

  const goPrev = () => setActiveImageIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveImageIndex((i) => Math.min(galleryImages.length - 1, i + 1));

  // (Removed per stable hook order; keyboard listener registered above)

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
        <div
          className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[6/5] md:aspect-square select-none"
          onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
          onTouchMove={(e) => setTouchEndX(e.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={() => {
            if (touchStartX != null && touchEndX != null) {
              const delta = touchEndX - touchStartX;
              if (Math.abs(delta) > 40) {
                if (delta < 0) goNext(); else goPrev();
              }
            }
            setTouchStartX(null); setTouchEndX(null);
          }}
        >
          {/* Always show image first */}
          <div className="relative w-full h-full">
            <SafeImage
              src={mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {showVideo && (
              <div className="absolute inset-0 bg-black/50" style={{ visibility: showVideo ? 'visible' : 'hidden' }} />
            )}
          </div>

          {/* Prev/Next controls */}
          {galleryImages.length > 1 && !showVideo && (
            <>
              <button
                aria-label="Previous image"
                onClick={goPrev}
                disabled={activeImageIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 text-white p-3.5 md:p-5 hover:bg-black/75 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 backdrop-blur-sm shadow-xl border border-white/30"
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 drop-shadow" aria-hidden="true" />
              </button>
              <button
                aria-label="Next image"
                onClick={goNext}
                disabled={activeImageIndex === galleryImages.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 text-white p-3.5 md:p-5 hover:bg-black/75 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 backdrop-blur-sm shadow-xl border border-white/30"
              >
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7 drop-shadow" aria-hidden="true" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {galleryImages.map((_, i) => (
                  <span key={i} className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ${i === activeImageIndex ? 'bg-white' : 'bg-white/70'}`} />
                ))}
              </div>
            </>
          )}

          {/* If there is a video, show play overlay until user clicks */}
          {product.video_url && !showVideo && (
            <button
              aria-label="Play product video"
              className="absolute inset-0 z-20 flex items-center justify-center group"
              onClick={() => setShowVideo(true)}
            >
              <span className="sr-only">Play video</span>
              <div className="bg-black/40 w-full h-full absolute inset-0 z-10" />
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white text-gray-900 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </button>
          )}

          {/* Render video only after user intent (click) */}
          {product.video_url && showVideo && (
            <div className="absolute inset-0 z-30">
              <video
                key={product.video_url}
                className="w-full h-full object-cover"
                playsInline
                // User initiated, so autoplay with controls
                autoPlay
                controls
                poster={product.poster_url || product.image_url || '/images/placeholder-gift.svg'}
                onError={(e) => {
                  // Hide video and fall back to image if it fails
                  setShowVideo(false);
                }}
              >
                <source src={product.video_url} type="video/mp4" />
              </video>

              {/* Close button to return to image */}
              <button
                aria-label="Close video"
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                onClick={() => setShowVideo(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {/* Thumbnails removed in favor of slider controls */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-gray-700">{product.description || 'Delicious handcrafted strawberry treats.'}</p>
          
          {/* Price Display with Offer */}
          {product.offer && product.offer.offer_price < product.base_price ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-red-600">KES {product.offer.offer_price.toFixed(2)}</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {product.offer.discount_percentage.toFixed(0)}% OFF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-500 line-through">KES {product.base_price.toFixed(2)}</span>
                <span className="text-sm text-gray-600">
                  Save KES {(product.base_price - product.offer.offer_price).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-3xl font-semibold">KES {product.base_price.toFixed(2)}</div>
          )}

          <div className="mt-5 border rounded-lg p-4 bg-white">
            <Button className="w-full" onClick={() => {
              if (!product) return;
              const displayPrice = product.offer && product.offer.offer_price < product.base_price 
                ? product.offer.offer_price 
                : product.base_price;
              addItem({
                id: product.id,
                name: product.name,
                price: displayPrice,
                image: product.image_url || '',
                category: product.categories?.name || 'Uncategorized',
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
                    video_url: (p as any).video_url,
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


