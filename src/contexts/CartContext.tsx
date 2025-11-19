'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity?: number;
  // Gift metadata
  isGift?: boolean;
  recipientName?: string;
  giftNote?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const STORAGE_KEY = 'strawberry_dips_cart_v1';
const VAT_RATE = 0.16; // 16% VAT
const DELIVERY_FEE = 5.99;

function loadCartFromStorage(): CartState {
  try {
    if (typeof window === 'undefined') return initialState;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!parsed || !Array.isArray(parsed.items)) return initialState;
    // Sanitize items
    const sanitizedItems = parsed.items.map((item: any) => ({
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price) || 0,
      image: String(item.image || ''),
      category: String(item.category || ''),
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      isGift: Boolean(item.isGift),
      recipientName: item.recipientName ? String(item.recipientName) : undefined,
      giftNote: item.giftNote ? String(item.giftNote) : undefined,
    }));
    return {
      items: sanitizedItems,
      isOpen: Boolean(parsed.isOpen),
    };
  } catch {
    return initialState;
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity && item.quantity > 0),
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getVatAmount: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => loadCartFromStorage());

  // Persist cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g., quota exceeded)
    }
  }, [state]);

  // Sync cart across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = loadCartFromStorage();
      // Replace current items if they differ
      if (JSON.stringify(next.items) !== JSON.stringify(state.items) || next.isOpen !== state.isOpen) {
        // Rehydrate by clearing then re-adding to avoid adding a new reducer action type
        // Clear
        dispatch({ type: 'CLEAR_CART' });
        // Re-add items
        next.items.forEach(item => dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: item.quantity } }));
        // Ensure cart open state matches (best-effort)
        if (next.isOpen) {
          dispatch({ type: 'OPEN_CART' });
        } else {
          dispatch({ type: 'CLOSE_CART' });
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [state.items, state.isOpen]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const getVatAmount = () => {
    const subtotal = getTotalPrice();
    return parseFloat((subtotal * VAT_RATE).toFixed(2));
  };

  const getDeliveryFee = () => DELIVERY_FEE;

  const getGrandTotal = () => {
    const subtotal = getTotalPrice();
    const vat = getVatAmount();
    return parseFloat((subtotal + vat + DELIVERY_FEE).toFixed(2));
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalPrice,
        getTotalItems,
        getVatAmount,
        getDeliveryFee,
        getGrandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}



