'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RotatingHero } from "@/components/RotatingHero";
import { TrustStrip } from "@/components/TrustStrip";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import heavy components to improve initial load
const LazyFeaturedProducts = dynamic(() => import("@/components/FeaturedProducts").then(mod => ({ default: mod.FeaturedProducts })), {
  loading: () => (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Special Offers</h2>
            <p className="text-sm sm:text-base text-gray-600">Customer favorites, freshly made</p>
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

const LazyProductGrid = dynamic(() => import("@/components/ProductGrid").then(mod => ({ default: mod.ProductGrid })), {
  loading: () => (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Collection</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Hand-crafted chocolate covered strawberries made with the finest ingredients 
            and delivered fresh to your door.
          </p>
        </div>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-3 h-9 w-full rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
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

const LazyWhyChoose = dynamic(() => import("@/components/WhyChoose").then(mod => ({ default: mod.WhyChoose })), {
  loading: () => (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
});

const LazyWineLiquorSection = dynamic(() => import("@/components/WineLiquorSection").then(mod => ({ default: mod.WineLiquorSection })), {
  loading: () => (
    <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-pulse w-8 h-8 bg-red-200 rounded mr-3"></div>
            <div className="animate-pulse h-8 w-64 bg-red-200 rounded"></div>
          </div>
          <div className="animate-pulse h-6 w-96 bg-red-200 rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-red-200 mb-4" />
              <div className="h-5 w-3/4 rounded bg-red-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-red-200 mb-3" />
              <div className="h-9 w-full rounded-md bg-red-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
});

const LazyTestimonials = dynamic(() => import("@/components/Testimonials").then(mod => ({ default: mod.Testimonials })), {
  loading: () => (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Special Offers</h2>
                <p className="text-sm sm:text-base text-gray-600">Customer favorites, freshly made</p>
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
      
      <Suspense fallback={
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Collection</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                Hand-crafted chocolate covered strawberries made with the finest ingredients 
                and delivered fresh to your door.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
                    <div className="mt-3 h-9 w-full rounded-md bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      }>
        <LazyProductGrid />
      </Suspense>
      
      {/* Lazy load non-critical sections */}
      <LazyWineLiquorSection />
      <LazyWhyChoose />
      <LazyTestimonials />
      
      {/* Trust Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Guarantee</h3>
              <p className="text-gray-600">Made fresh daily or your money back</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Same Day Delivery</h3>
              <p className="text-gray-600">Order by 2PM for same-day delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Gifts</h3>
              <p className="text-gray-600">Beautifully packaged for any occasion</p>
            </div>
          </div>
        </div>
      </section>

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
