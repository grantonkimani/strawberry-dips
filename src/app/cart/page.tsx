import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartPageContent } from "@/components/CartPageContent";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <CartPageContent />
      <Footer />
    </div>
  );
}
