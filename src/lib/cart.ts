'use client';

import { useMemo } from 'react';
import { createStore, useStore } from './store';
import type { Product } from './types';

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  colorName?: string;
  quantity: number;
  maxQty: number;
}

const EMPTY: CartItem[] = [];
const MAX_PER_LINE = 20;

const cartStore = createStore<CartItem[]>(EMPTY, 'sf_cart_v1');

export const cart = {
  add(product: Product, colorName?: string, quantity = 1) {
    const key = `${product.id}::${colorName ?? ''}`;
    const maxQty = Math.min(MAX_PER_LINE, product.stock);
    cartStore.set((items) => {
      const existing = items.find((i) => i.key === key);
      if (existing) {
        return items.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty), price: product.price, maxQty } : i,
        );
      }
      return [
        ...items,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? null,
          price: product.price,
          colorName,
          quantity: Math.min(quantity, maxQty),
          maxQty,
        },
      ];
    });
  },
  setQty(key: string, quantity: number) {
    cartStore.set((items) =>
      items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQty)) } : i)),
    );
  },
  remove(key: string) {
    cartStore.set((items) => items.filter((i) => i.key !== key));
  },
  clear() {
    cartStore.set(EMPTY);
  },
};

export function useCart() {
  const items = useStore(cartStore, EMPTY);
  return useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    [items],
  );
}

// ── Wishlist ────────────────────────────────────────────────
const NO_IDS: string[] = [];
const wishlistStore = createStore<string[]>(NO_IDS, 'sf_wishlist_v1');

export const wishlist = {
  toggle(id: string) {
    wishlistStore.set((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  },
};

export const useWishlist = () => useStore(wishlistStore, NO_IDS);
