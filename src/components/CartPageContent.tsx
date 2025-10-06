'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/Button';
import { X, Plus, Minus, ShoppingBag, Gift, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface GiftProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
}

export function CartPageContent() {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);

  // Fetch gift products from API
  useEffect(() => {
    const fetchGiftProducts = async () => {
      try {
        const response = await fetch('/api/gift-products');
        const data = await response.json();
        setGiftProducts(data.giftProducts || []);
      } catch (error) {
        console.error('Error fetching gift products:', error);
      } finally {
        setLoadingGifts(false);
      }
    };

    fetchGiftProducts();
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleGiftToggle = (giftId: string) => {
    setSelectedGifts(prev => {
      const isSelected = prev.includes(giftId);
      const next = isSelected ? prev.filter(id => id !== giftId) : [...prev, giftId];

      // Sync with cart: add or remove the gift as a normal cart item
      const gift = giftProducts.find(g => g.id === giftId);
      if (gift) {
        if (!isSelected) {
          addItem({
            id: gift.id,
            name: gift.name,
            price: gift.price,
            image: gift.image_url || '',
            category: gift.category || 'Gift'
          });
        } else {
          removeItem(gift.id);
        }
      }

      return next;
    });
  };

  const getGiftTotal = () => 0; // gifts are now real cart items; totals come from cart

  const getGrandTotal = () => getTotalPrice();

  // No grouping; render a flat grid like before

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
        <p className="text-sm sm:text-base text-gray-600">Review your items and add gifts before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pink-600" />
                Cart Items
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">
                {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some delicious chocolate-covered strawberries to get started!</p>
                <Link href="/menu">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍓</span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base break-words">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 capitalize mb-1 break-words">{item.category}</p>
                      <p className="text-sm sm:text-lg font-bold text-pink-600">KSH {item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls and Remove Button */}
                    <div className="flex flex-col items-center space-y-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200 shadow-sm"
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-sm sm:text-lg font-medium text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200 shadow-sm"
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gift Section */}
          {state.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pink-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Gifts</h2>
              </div>

              {loadingGifts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading gift options...</p>
                </div>
              ) : giftProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No gift products available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {giftProducts.map((gift) => (
                    <div
                      key={gift.id}
                      className={`group cursor-pointer transition-all duration-300 overflow-hidden rounded-lg border-2 ${
                        selectedGifts.includes(gift.id)
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300 hover:shadow-lg'
                      }`}
                      onClick={() => handleGiftToggle(gift.id)}
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {gift.image_url ? (
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-gift.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                            <span className="text-4xl">🎁</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-4">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                            {gift.category}
                          </span>
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {gift.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {gift.description}
                        </p>
                        
                        {/* Price and Selection Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-pink-600">
                            KSH {gift.price.toFixed(2)}
                          </span>
                          {selectedGifts.includes(gift.id) && (
                            <div className="flex items-center text-pink-600 font-medium">
                              <span className="text-sm">✓ Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-pink-600" />
              Order Summary
            </h2>

            {/* Cart Items Total */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({state.items.length})</span>
                <span className="font-medium">KSH {getTotalPrice().toFixed(2)}</span>
              </div>
              
              {/* Gift line items are now part of cart items and included above */}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-pink-600">KSH {getGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/checkout">
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <button
                onClick={clearCart}
                className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Clear Cart
              </button>
              
              <Link href="/menu">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
