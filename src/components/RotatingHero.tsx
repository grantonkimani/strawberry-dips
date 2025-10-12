"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const builtIns = [
  "/images/mixed-berry.jpg",
  "/images/white-chocolate.jpg",
  "/images/dark-chocolate.jpg",
  "/images/classic-milk.jpg",
];

interface Slide {
  image_url: string;
  alt?: string;
  headline?: string;
  subtext?: string;
  cta_label?: string;
  cta_href?: string;
  overlay?: number;
}

export function RotatingHero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [overlay, setOverlay] = useState(0.55);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // No preloaded uploads/built-ins; we will only show admin banners when available

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  // Fetch dynamic banners; use banners only. If none, fall back to uploaded or built-ins.
  useEffect(() => {
    (async () => {
      try {
        // Add caching and timeout for better performance
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const res = await fetch('/api/banners', { 
          cache: 'force-cache', // Enable caching
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        const json = await res.json();
        const apiSlides: Slide[] = (json?.banners || [])
          .map((b: any) => ({
            image_url: b.image_url,
            alt: b.alt,
            headline: b.headline,
            subtext: b.subtext,
            cta_label: b.cta_label,
            cta_href: b.cta_href,
            overlay: typeof b.overlay === 'number' ? b.overlay : undefined,
          }))
          .filter((s: Slide) => Boolean(s.image_url));
        if (apiSlides.length) {
          setSlides(apiSlides);
          if (typeof apiSlides[0]?.overlay === 'number') setOverlay(apiSlides[0].overlay as number);
        }
      } catch (error) {
        // Fallback to built-in images if API fails
        console.warn('Failed to load banners, using fallback images');
      }
    })();
  }, []);

  const current = useMemo(() => slides[index] ?? { image_url: builtIns[0] }, [slides, index]);
  const currentOverlay = current.overlay ?? overlay;

  return (
    <section className="relative isolate select-none">
      <div
        className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[320px] sm:min-h-[380px] w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        {slides.map((s, i) => (
          <img
            key={s.image_url + i}
            src={s.image_url}
            alt={s.alt || ''}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            onError={(e) => {
              // Fallback to built-in images if external image fails
              if (builtIns.includes(s.image_url)) return;
              const fallbackIndex = i % builtIns.length;
              e.currentTarget.src = builtIns[fallbackIndex];
            }}
          />
        ))}
        
        {/* Fallback for when no slides are loaded yet */}
        {slides.length === 0 && (
          <img
            src={builtIns[0]}
            alt="Strawberry Dips Hero"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
        )}

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" style={{ opacity: currentOverlay }} />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {current.headline || 'Indulge in Handcrafted Strawberrydips'}
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/90">
                {current.subtext || 'Premium chocolate-dipped strawberries and gift boxes made fresh for every order.'}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                {current.cta_label && current.cta_href ? (
                  <Link href={current.cta_href}>
                    <Button className="h-11 px-6 text-base shadow-lg shadow-pink-700/30">{current.cta_label}</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/checkout">
                      <Button className="h-11 px-6 text-base shadow-lg shadow-pink-700/30">Order Now</Button>
                    </Link>
                    <Link href="/menu">
                      <Button variant="outline" className="h-11 px-6 text-base bg-white/90 backdrop-blur hover:bg-white">View Menu</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
            />)
          )}
        </div>
      </div>
    </section>
  );
}


