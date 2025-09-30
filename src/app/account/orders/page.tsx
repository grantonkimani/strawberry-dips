import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function OrderHistory() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Order History</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            View and track your order history with Strawberrydips.
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Coming Soon</h2>
          <p className="text-gray-600">
            Our order history feature is being developed. Please contact us directly 
            at <a href="mailto:Strawberrydips.ke@gmail.com" className="text-pink-600 hover:text-pink-700">
            Strawberrydips.ke@gmail.com</a> or call <a href="tel:0757567614" className="text-pink-600 hover:text-pink-700">
            0757567614</a> for order inquiries.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
