import { ShoppingCart, Heart, Play } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";

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
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Get category name (new structure or legacy)
  const categoryName = product.categories?.name || product.category || 'Uncategorized';
  const price = product.base_price || 0;
  
  // Mock stock status for now - in real implementation, this would come from the database
  const stockStatus = Math.random() > 0.7 ? 'low' : 'in-stock';
  const stockCount = stockStatus === 'low' ? Math.floor(Math.random() * 3) + 1 : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      image: product.image_url || '',
      category: categoryName,
    });
  };

  return (
    <Card className="group hover:shadow-md hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-200">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <div className="aspect-[6/5] bg-gray-100">
              <Link href={`/products/${product.id}`} prefetch={true}>
                <Image 
                  src={product.image_url}
                  alt={product.name}
                  width={800}
                  height={650}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {categoryName}
            </span>
          </div>
          
          {/* Stock Status Badge */}
          {stockStatus === 'low' && stockCount && (
            <div className="absolute top-2 right-12">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                Only {stockCount} left!
              </span>
            </div>
          )}
          
          {/* In Stock Badge */}
          {stockStatus === 'in-stock' && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                ✓ In Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2.5 space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">
              {product.name}
            </h3>
            <p className="text-gray-700 text-xs mt-1 line-clamp-3">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                KSH {price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className={`w-full h-10 md:h-9 text-sm ${
            stockStatus === 'low' 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-pink-600 hover:bg-pink-700'
          } text-white`}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-2" />
          {stockStatus === 'low' ? 'Order Now!' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
