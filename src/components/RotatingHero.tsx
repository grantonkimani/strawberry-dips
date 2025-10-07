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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Try to prepend uploaded hero if present
  useEffect(() => {
    const candidate = "/uploads/hero.webp";
    const img = new Image();
    img.onload = () => setImages((prev) => [candidate, ...prev]);
    img.onerror = () => {
      const jpg = "/uploads/hero.jpg";
      const img2 = new Image();
      img2.onload = () => setImages((prev) => [jpg, ...prev]);
      img2.src = jpg;
    };
    img.src = candidate;
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused || images.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5500);
    return () => clearInterval(id);
  }, [paused, images.length]);

  const current = useMemo(() => images[index] ?? builtIns[0], [images, index]);

  return (
    <section className="relative isolate select-none">
      <div
        className="relative h-[70vh] min-h-[420px] w-full overflow-hidden"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Indulge in Handcrafted Strawberrydips
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Premium chocolate-dipped strawberries and gift boxes made fresh for every order.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
            />)
          )}
        </div>
      </div>
    </section>
  );
}


