import { ShoppingCart, Heart, Play } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { SafeImage } from '@/components/SafeImage';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  video_url?: string;
  categories?: {
    id: string;
    name: string;
    description?: string;
    display_order: number;
  };
  // Legacy support for old category field
  category?: string;
  // Offer information
  offer?: {
    offer_price: number;
    discount_percentage: number;
    end_date: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Get category name (new structure or legacy)
  const categoryName = product.categories?.name || product.category || 'Uncategorized';
  const basePrice = product.base_price || 0;
  
  // Check if product has an active offer
  const hasOffer = product.offer && product.offer.offer_price < basePrice;
  const displayPrice = hasOffer ? product.offer!.offer_price : basePrice;
  const originalPrice = hasOffer ? basePrice : null;
  
  // Mock stock status for now - in real implementation, this would come from the database
  const stockStatus = Math.random() > 0.7 ? 'low' : 'in-stock';
  const stockCount = stockStatus === 'low' ? Math.floor(Math.random() * 3) + 1 : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice, // Use offer price if available
      image: product.image_url || '',
      category: categoryName,
    });
  };

  return (
    <Card className="group hover:shadow-md hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-200 flex flex-col h-full">
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
          {product.image_url ? (
            <div className="aspect-[6/5] bg-gray-100 relative">
              <Link href={`/products/${product.id}`} prefetch={true}>
                <SafeImage 
                  src={product.image_url}
                  alt={product.name}
                  width={800}
                  height={650}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  quality={85}
                />
              </Link>
              <Link href={`/products/${product.id}`} prefetch={true} className="aspect-[6/5] bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center hidden">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-red-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-2xl">🍓</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{categoryName}</p>
                </div>
              </Link>
              {/* Play badge when product has video */}
              {product.video_url && (
                <div className="absolute bottom-2 right-2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                    <Play className="w-3.5 h-3.5" />
                    Video
                  </span>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/products/${product.id}`} prefetch={true} className="aspect-[6/5] bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-red-200 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl">🍓</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">{categoryName}</p>
              </div>
            </Link>
          )}
          
          {/* Wishlist Button - Hidden on mobile, shown on hover */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-pink-600 opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8"
          >
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Offer Badge - More Visible, Mobile Optimized */}
          {hasOffer && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20">
              <div className="relative">
                <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg shadow-lg border border-white sm:border-2 border-white animate-pulse">
                  {product.offer!.discount_percentage.toFixed(0)}% OFF
                </span>
                {/* Small triangle for extra emphasis - hidden on mobile */}
                <div className="hidden sm:block absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
              </div>
            </div>
          )}
          
          {/* Category Badge - Mobile Optimized */}
          <div className={`absolute ${hasOffer ? 'top-1.5 right-1.5 sm:top-2 sm:right-2' : 'top-1.5 left-1.5 sm:top-2 sm:left-2'} z-10`}>
            <span className="bg-pink-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
              {categoryName}
            </span>
          </div>
          
          {/* Stock Status Badge - Mobile Optimized */}
          {stockStatus === 'low' && stockCount && (
            <div className="absolute top-1.5 right-10 sm:top-2 sm:right-12 z-10">
              <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium animate-pulse">
                Only {stockCount} left!
              </span>
            </div>
          )}
          
          {/* In Stock Badge - Mobile Optimized */}
          {stockStatus === 'in-stock' && (
            <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10">
              <span className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                ✓ In Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-2.5 space-y-1.5 sm:space-y-2 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight sm:leading-snug line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-700 text-[10px] sm:text-xs mt-1 line-clamp-2 sm:line-clamp-3">
              {product.description}
            </p>
          </div>

          {/* Price - Mobile Optimized */}
          <div className="flex items-center justify-between mt-auto">
            <div className="w-full">
              {hasOffer ? (
                <div className="space-y-1.5 sm:space-y-2 bg-red-50 border border-red-200 sm:border-2 sm:border-red-200 rounded-lg p-2 sm:p-3 -mx-0.5 sm:-mx-1">
                  <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-red-600">
                      KSH {displayPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-red-700 bg-red-200 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded">
                      SALE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-xs sm:text-sm md:text-base text-gray-500 line-through font-medium">
                      KSH {originalPrice!.toFixed(2)}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-red-700 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-red-300">
                      Save KES {(originalPrice! - displayPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  KSH {displayPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 sm:p-4 pt-0 flex-shrink-0">
        <Button 
          onClick={handleAddToCart}
          className={`w-full h-9 sm:h-10 md:h-9 text-xs sm:text-sm font-semibold ${
            hasOffer
              ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg border border-red-400 sm:border-2'
              : stockStatus === 'low' 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' 
              : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
        >
          <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
          <span className="truncate">
            {hasOffer ? `Add to Cart - Save ${((originalPrice! - displayPrice) / originalPrice! * 100).toFixed(0)}%` : stockStatus === 'low' ? 'Order Now!' : 'Add to Cart'}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
