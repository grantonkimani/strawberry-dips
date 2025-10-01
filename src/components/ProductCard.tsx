import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
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
            <div className="aspect-[5/4] bg-gray-100">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="aspect-[5/4] bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center hidden">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-red-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-2xl">🍓</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{categoryName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[5/4] bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-red-200 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl">🍓</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">{categoryName}</p>
              </div>
            </div>
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
              <span className="text-sm text-gray-500 ml-1">per dozen</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white h-9 text-sm"
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
