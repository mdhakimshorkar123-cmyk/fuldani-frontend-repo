'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, qs } from './api';
import type {
  AdminCategory,
  AdminDeliveryZone,
  AdminOrderDetail,
  AdminOrderList,
  AdminProduct,
  AdminShowcase,
  AdminUser,
  DashboardStats,
  OrderStatus,
  Paginated,
  Product,
} from './types';

export const adminKeys = {
  all: ['admin'] as const,
  me: ['admin', 'me'] as const,
  stats: (days: number) => ['admin', 'stats', days] as const,
  products: (p: object) => ['admin', 'products', 'list', p] as const,
  product: (id: string) => ['admin', 'products', 'detail', id] as const,
  orders: (p: object) => ['admin', 'orders', 'list', p] as const,
  order: (id: string) => ['admin', 'orders', 'detail', id] as const,
  categories: ['admin', 'categories'] as const,
  zones: ['admin', 'zones'] as const,
  showcases: ['admin', 'showcases'] as const,
};

// ── Auth ────────────────────────────────────────────────────
export const useAdminMe = () =>
  useQuery({
    queryKey: adminKeys.me,
    queryFn: () => api<{ user: AdminUser }>('/admin/auth/me').then((r) => r.user),
    staleTime: 5 * 60_000,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api<{ user: AdminUser }>('/admin/auth/login', { method: 'POST', json: body }),
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/admin/auth/logout', { method: 'POST' }),
    onSettled: () => qc.removeQueries({ queryKey: adminKeys.all }),
  });
};

// ── Dashboard ───────────────────────────────────────────────
export const useDashboardStats = (days: number) =>
  useQuery({
    queryKey: adminKeys.stats(days),
    queryFn: () => api<DashboardStats>(`/admin/dashboard/stats${qs({ days })}`),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

// ── Products ────────────────────────────────────────────────
export interface AdminProductFilters {
  q?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | 'low_stock';
  sort?: string;
  page: number;
}

export const useAdminProducts = (f: AdminProductFilters) =>
  useQuery({
    queryKey: adminKeys.products(f),
    queryFn: () => api<Paginated<AdminProduct>>(`/admin/products${qs(f)}`),
    placeholderData: keepPreviousData,
  });

export const useAdminProduct = (id: string | undefined) =>
  useQuery({
    queryKey: adminKeys.product(id ?? ''),
    queryFn: () => api<{ product: Product }>(`/admin/products/${id}`).then((r) => r.product),
    enabled: !!id,
  });

export type ProductPayload = {
  name: string;
  slug?: string;
  typeLabel: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  badgeLabel: string | null;
  badgeType: Product['badgeType'];
  rating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryIds: string[];
  colors: { name: string; hex: string }[];
};

export const useSaveProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Partial<ProductPayload> }) =>
      api<{ product: Product }>(id ? `/admin/products/${id}` : '/admin/products', {
        method: id ? 'PATCH' : 'POST',
        json: data,
      }).then((r) => r.product),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.setQueryData(adminKeys.product(product.id), product);
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
};

// ── Orders ──────────────────────────────────────────────────
export interface AdminOrderFilters {
  status: OrderStatus | 'ALL';
  q?: string;
  page: number;
}

export const useAdminOrders = (f: AdminOrderFilters) =>
  useQuery({
    queryKey: adminKeys.orders(f),
    queryFn: () => api<AdminOrderList>(`/admin/orders${qs(f)}`),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });

export const useAdminOrder = (id: string) =>
  useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => api<AdminOrderDetail>(`/admin/orders/${id}`),
  });

export const useUpdateOrderStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: OrderStatus; note?: string }) =>
      api<AdminOrderDetail>(`/admin/orders/${id}/status`, { method: 'PATCH', json: body }),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.order(id), data);
      qc.invalidateQueries({ queryKey: ['admin', 'orders', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useUpdateOrder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { customerName?: string; phone?: string; address?: string; adminNote?: string | null }) =>
      api<AdminOrderDetail>(`/admin/orders/${id}`, { method: 'PATCH', json: body }),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.order(id), data);
      qc.invalidateQueries({ queryKey: ['admin', 'orders', 'list'] });
    },
  });
};

// ── Simple resources (categories / zones / showcases) ──────
type Resource = 'categories' | 'delivery-zones' | 'showcases';
const resourceKey: Record<Resource, readonly string[]> = {
  categories: adminKeys.categories,
  'delivery-zones': adminKeys.zones,
  showcases: adminKeys.showcases,
};

export interface ResourceTypes {
  categories: AdminCategory;
  'delivery-zones': AdminDeliveryZone;
  showcases: AdminShowcase;
}

export const useResourceList = <R extends Resource>(resource: R) =>
  useQuery({
    queryKey: resourceKey[resource],
    queryFn: () => api<{ items: ResourceTypes[R][] }>(`/admin/${resource}`).then((r) => r.items),
  });

export const useSaveResource = (resource: Resource) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Record<string, unknown> }) =>
      api<unknown>(id ? `/admin/${resource}/${id}` : `/admin/${resource}`, { method: id ? 'PATCH' : 'POST', json: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resourceKey[resource] });
      qc.invalidateQueries({ queryKey: [resource === 'delivery-zones' ? 'delivery-zones' : resource] });
    },
  });
};

export const useDeleteResource = (resource: Resource) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/admin/${resource}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: resourceKey[resource] }),
  });
};
