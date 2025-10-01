import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { SupportSection } from "@/components/SupportSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductGrid />
      
      {/* Support Section */}
      <section className="py-16 px-4 bg-gray-50">
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
          <SupportSection />
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
