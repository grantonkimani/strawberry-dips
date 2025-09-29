import { Heart, Star, Truck } from "lucide-react";
import { Button } from "./ui/Button";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 to-red-50 py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Premium Chocolate
                <span className="text-pink-600 block">Covered Strawberries</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Hand-dipped fresh strawberries in premium chocolate. Perfect for gifts, 
                celebrations, and those special moments that deserve something extraordinary.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                <span className="text-sm sm:text-base font-medium">Made with Love</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="text-sm sm:text-base font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                <span className="text-sm sm:text-base font-medium">Same-Day Delivery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a 
                href="/menu"
                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              >
                Order Now
              </a>
              <a 
                href="/menu"
                className="w-full sm:w-auto border-2 border-pink-600 text-pink-600 hover:bg-pink-50 hover:border-pink-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center bg-white"
              >
                View Menu
              </a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="aspect-square bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-200 to-red-200 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🍓</span>
                    </div>
                    <p className="text-gray-600 font-medium text-sm sm:text-base">Fresh Strawberries</p>
                    <p className="text-xs sm:text-sm text-gray-500">Premium Chocolate Coating</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-200 rounded-full opacity-60"></div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-32 sm:h-32 bg-pink-200 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
