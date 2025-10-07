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

export function RotatingHero() {
  const [images, setImages] = useState<string[]>([...builtIns]);
  const [overlay, setOverlay] = useState(0.55);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Try to prepend uploaded hero images if present (hero.webp, hero.jpg, hero-1.webp ...)
  useEffect(() => {
    const candidates = [
      "/uploads/hero.webp",
      "/uploads/hero.jpg",
      "/uploads/hero-1.webp",
      "/uploads/hero-2.webp",
      "/uploads/hero-3.webp",
    ];
    const found: string[] = [];
    let cancelled = false;
    candidates.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        if (!cancelled) {
          found.push(url);
          setImages((prev) => [...found, ...builtIns.filter((b) => !found.includes(b))]);
        }
      };
      img.src = url;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused || images.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5500);
    return () => clearInterval(id);
  }, [paused, images.length]);

  // Fetch dynamic banners if available
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/banners', { cache: 'no-store' });
        const json = await res.json();
        if (json?.banners?.length) {
          setImages(json.banners.map((b: any) => b.image_url));
          if (typeof json.banners[0]?.overlay === 'number') setOverlay(json.banners[0].overlay);
        }
      } catch {}
    })();
  }, []);

  const current = useMemo(() => images[index] ?? builtIns[0], [images, index]);

  return (
    <section className="relative isolate select-none">
      <div
        className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[320px] sm:min-h-[380px] w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        {images.map((src, i) => (
          <div
            key={src + i}
            className={`absolute inset-0 transition-opacity duration-700 ease-out bg-center bg-cover ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== index}
          />
        ))}

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" style={{ opacity: overlay }} />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Indulge in Handcrafted Strawberrydips
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/90">
                Premium chocolate-dipped strawberries and gift boxes made fresh for every order.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <Link href="/checkout">
                  <Button className="h-11 px-6 text-base shadow-lg shadow-pink-700/30">Order Now</Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="h-11 px-6 text-base bg-white/90 backdrop-blur hover:bg-white">View Menu</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
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


