import { Header } from "@/components/Header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Strawberrydips</h1>
          <p className="text-xl text-gray-600">Hand-crafted chocolate covered strawberries made with love</p>
        </div>
        
        <div className="prose prose-lg mx-auto">
          <p className="text-gray-700 mb-6">
            Welcome to Strawberrydips, where we transform the finest fresh strawberries into 
            premium chocolate-covered delights. Our passion for quality and attention to detail 
            ensures every bite is a moment of pure indulgence.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Founded with a simple mission: to create the most delicious chocolate-covered strawberries 
            using only the freshest ingredients and traditional hand-dipping techniques. Each strawberry 
            is carefully selected and individually dipped in premium chocolate.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quality Promise</h2>
          <p className="text-gray-700 mb-6">
            We source our strawberries from local farms and use only the finest Belgian chocolate. 
            Every order is made fresh to order, ensuring maximum freshness and flavor.
          </p>
          
          <div className="text-center mt-12">
            <Link href="/menu" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View Our Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}








