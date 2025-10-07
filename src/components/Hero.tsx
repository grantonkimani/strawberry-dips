"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function Hero() {
  const [src, setSrc] = useState("/uploads/hero.jpg");
  return (
    <section className="relative isolate">
      <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={src}
          alt="Smash heart gift box with strawberries"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onError={() => setSrc("/images/valentines.jpg")}
        />

        {/* gradient + scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Indulge in Handcrafted Strawberry Dips
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Premium chocolate-dipped strawberries and gift boxes made fresh for every order.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/checkout">
                  <Button className="h-11 px-6 text-base shadow-lg shadow-pink-700/30">
                    Order Now
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="h-11 px-6 text-base bg-white/90 backdrop-blur hover:bg-white">
                    View Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


