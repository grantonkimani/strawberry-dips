'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/Button';
import { X, Plus, Minus, ShoppingBag, Gift, CreditCard } from 'lucide-react';
import Link from 'next/link';

export function CartPageContent() {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleGiftToggle = (giftId: string) => {
    setSelectedGifts(prev => 
      prev.includes(giftId) 
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  const giftOptions = [
    { id: 'gift-wrap', name: 'Gift Wrapping', price: 5.00, description: 'Beautiful gift wrapping with ribbon' },
    { id: 'greeting-card', name: 'Greeting Card', price: 3.00, description: 'Personalized greeting card' },
    { id: 'chocolate-box', name: 'Premium Chocolate Box', price: 15.00, description: 'Additional chocolate assortment' },
    { id: 'delivery-note', name: 'Special Delivery Note', price: 2.00, description: 'Custom delivery message' },
  ];

  const getGiftTotal = () => {
    return selectedGifts.reduce((total, giftId) => {
      const gift = giftOptions.find(g => g.id === giftId);
      return total + (gift?.price || 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return getTotalPrice() + getGiftTotal();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
        <p className="text-gray-600">Review your items and add gifts before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-pink-600" />
                Cart Items
              </h2>
              <span className="text-sm text-gray-500">
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
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍓</span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 capitalize mb-1">{item.category}</p>
                      <p className="text-lg font-bold text-pink-600">KSH {item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        className="w-8 h-8 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                        onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        className="w-8 h-8 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                        onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gift Section */}
          {state.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center mb-6">
                <Gift className="h-5 w-5 mr-2 text-pink-600" />
                <h2 className="text-xl font-semibold text-gray-900">Add Gifts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {giftOptions.map((gift) => (
                  <div
                    key={gift.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedGifts.includes(gift.id)
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => handleGiftToggle(gift.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{gift.name}</h3>
                      <span className="text-pink-600 font-semibold">KSH {gift.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{gift.description}</p>
                    {selectedGifts.includes(gift.id) && (
                      <div className="mt-2 text-xs text-pink-600 font-medium">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
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
              
              {/* Gift Items */}
              {selectedGifts.map((giftId) => {
                const gift = giftOptions.find(g => g.id === giftId);
                return gift ? (
                  <div key={giftId} className="flex justify-between text-sm">
                    <span className="text-gray-500">{gift.name}</span>
                    <span className="text-gray-600">KSH {gift.price.toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              
              {selectedGifts.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gifts</span>
                  <span className="font-medium">KSH {getGiftTotal().toFixed(2)}</span>
                </div>
              )}
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
