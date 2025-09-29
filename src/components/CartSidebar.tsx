'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose(); // Close the sidebar first
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 transition-opacity duration-300 cart-overlay"
          onClick={onClose}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out cart-sidebar ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <ShoppingBag className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Cart
                </h2>
                <p className="text-gray-600 text-sm">
                  {state.items.length} {state.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="p-4 bg-gray-100 rounded-full mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs">
                  Add some delicious chocolate-covered strawberries to get started!
                </p>
                <button 
                  onClick={onClose} 
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-lg">🍓</span>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize mb-1">
                          {item.category}
                        </p>
                        <p className="text-sm font-bold text-pink-600">
                          KSH {item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="w-6 h-6 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-gray-900">
                          {item.quantity || 0}
                        </span>
                        <button
                          className="w-6 h-6 bg-white border border-gray-200 rounded text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        
                        {/* Remove Button */}
                        <button
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all duration-200 ml-1"
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-pink-50 p-3 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-gray-900 text-lg">
                  Total:
                </span>
                <span className="text-xl font-bold text-pink-600">
                  KSH {getTotalPrice().toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/checkout" onClick={handleCheckout}>
                  <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-base font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Proceed to Checkout
                  </button>
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
