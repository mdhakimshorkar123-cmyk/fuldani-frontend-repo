'use client';

import { createStore, useStore } from './store';
import type { Product } from './types';

// ── Toasts ──────────────────────────────────────────────────
export interface Toast {
  id: number;
  tone: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

const NO_TOASTS: Toast[] = [];
const toastStore = createStore<Toast[]>(NO_TOASTS);
let toastId = 0;

function push(t: Omit<Toast, 'id'>, ttl = 3500) {
  const id = ++toastId;
  toastStore.set((list) => [...list.slice(-3), { ...t, id }]);
  setTimeout(() => toast.dismiss(id), ttl);
}

export const toast = {
  success: (title: string, description?: string, action?: Toast['action']) =>
    push({ tone: 'success', title, description, action }),
  error: (title: string, description?: string) => push({ tone: 'error', title, description }, 5000),
  info: (title: string, description?: string) => push({ tone: 'info', title, description }),
  dismiss: (id: number) => toastStore.set((list) => list.filter((t) => t.id !== id)),
};

export const useToasts = () => useStore(toastStore, NO_TOASTS);

// ── Quick checkout ("Buy now") ──────────────────────────────
export interface QuickCheckoutState {
  product: Product;
  colorName?: string;
}

const quickCheckoutStore = createStore<QuickCheckoutState | null>(null);

export const quickCheckout = {
  open: (product: Product, colorName?: string) => quickCheckoutStore.set({ product, colorName }),
  close: () => quickCheckoutStore.set(null),
};

export const useQuickCheckout = () => useStore(quickCheckoutStore, null);

// ── Search overlay ──────────────────────────────────────────
const searchStore = createStore(false);
export const search = { open: () => searchStore.set(true), close: () => searchStore.set(false) };
export const useSearchOpen = () => useStore(searchStore, false);
