"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image_url: string | null;
  size: string | null;
  quantity: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string, size: string | null) => void;
  updateQuantity: (product_id: string, size: string | null, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "threadly_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage once, on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  // Persist on every change, after initial load
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.size === item.size
      );
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id && i.size === item.size
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((product_id: string, size: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === product_id && i.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (product_id: string, size: string | null, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === product_id && i.size === size
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
