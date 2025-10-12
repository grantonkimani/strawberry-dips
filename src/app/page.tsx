'use client';

import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { SupportSection } from "@/components/SupportSection";
import { WhyChoose } from "@/components/WhyChoose";
import { RotatingHero } from "@/components/RotatingHero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { TrustStrip } from "@/components/TrustStrip";
import { Testimonials } from "@/components/Testimonials";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import heavy components to improve initial load
const LazyFeaturedProducts = dynamic(() => import("@/components/FeaturedProducts").then(mod => ({ default: mod.FeaturedProducts })), {
  loading: () => (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
            <p className="text-gray-600">Customer favorites, freshly made</p>
          </div>
        </div>
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
      </div>
    </section>
  )
});

const LazySupportSection = dynamic(() => import("@/components/SupportSection").then(mod => ({ default: mod.SupportSection })), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      
      {/* Critical above-the-fold content loads immediately */}
      <RotatingHero />
      <TrustStrip />
      
      {/* Defer non-critical sections */}
      <Suspense fallback={
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
                <p className="text-gray-600">Customer favorites, freshly made</p>
              </div>
            </div>
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
          </div>
        </section>
      }>
        <LazyFeaturedProducts />
      </Suspense>
      
      <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading products…</div>}>
        <ProductGrid />
      </Suspense>
      
      {/* Static content loads immediately */}
      <WhyChoose />
      <Testimonials />

      {/* Support Section - Lazy loaded */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our products or need assistance with your order? 
              We're here to help!
            </p>
          </div>
          <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <LazySupportSection />
          </Suspense>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
