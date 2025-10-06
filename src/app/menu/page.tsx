import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Suspense } from "react";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading menu…</div>}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}


















