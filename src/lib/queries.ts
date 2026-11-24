import { infiniteQueryOptions, queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { api, qs } from './api';
import type {
  Category,
  CreateOrderPayload,
  DeliveryZone,
  Paginated,
  PlacedOrder,
  Product,
  Showcase,
  TrackedOrder,
} from './types';

export type ProductSort = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'popular';
export interface ProductFilters {
  category?: string;
  q?: string;
  sort?: ProductSort;
}

export const PAGE_SIZE = 8;

/**
 * Query option factories — the single source of truth for keys + fetchers.
 * Used by server components (prefetch) and client hooks alike.
 */
export const storefront = {
  products: (f: ProductFilters) =>
    infiniteQueryOptions({
      queryKey: ['products', 'list', { category: f.category ?? 'all', q: f.q ?? '', sort: f.sort ?? 'featured' }],
      queryFn: ({ pageParam }) =>
        api<Paginated<Product>>(`/products${qs({ ...f, page: pageParam, limit: PAGE_SIZE })}`),
      initialPageParam: 1,
      getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    }),

  search: (q: string) =>
    queryOptions({
      queryKey: ['products', 'search', q],
      queryFn: () => api<Paginated<Product>>(`/products${qs({ q, limit: 6 })}`),
      enabled: q.trim().length >= 2,
      staleTime: 30_000,
    }),

  product: (slug: string) =>
    queryOptions({
      queryKey: ['products', 'detail', slug],
      queryFn: () => api<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`),
    }),

  featured: () =>
    queryOptions({
      queryKey: ['products', 'featured'],
      queryFn: () => api<{ product: Product | null }>('/products/featured').then((r) => r.product),
    }),

  categories: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => api<{ items: Category[] }>('/categories').then((r) => r.items),
      staleTime: 5 * 60_000,
    }),

  showcases: () =>
    queryOptions({
      queryKey: ['showcases'],
      queryFn: () => api<{ items: Showcase[] }>('/showcases').then((r) => r.items),
      staleTime: 5 * 60_000,
    }),

  zones: () =>
    queryOptions({
      queryKey: ['delivery-zones'],
      queryFn: () => api<{ items: DeliveryZone[] }>('/delivery-zones').then((r) => r.items),
      staleTime: 5 * 60_000,
    }),
};

export const useDeliveryZones = () => useQuery(storefront.zones());

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api<{ order: PlacedOrder }>('/orders', { method: 'POST', json: payload }).then((r) => r.order),
  });

export const useTrackOrder = () =>
  useMutation({
    mutationFn: ({ code, phone }: { code: string; phone: string }) =>
      api<{ order: TrackedOrder }>(`/orders/track${qs({ code, phone })}`).then((r) => r.order),
  });
