'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminProducts, useDeleteProduct, useResourceList, useSaveProduct, type AdminProductFilters } from '@/lib/admin-queries';
import { errorMessage } from '@/lib/api';
import { cx, takaEn } from '@/lib/format';
import { toast } from '@/lib/ui';
import type { AdminProduct } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, ConfirmModal, EmptyState, PageHeader, Pagination, SearchInput, Switch, TableSkeleton } from './bits';
import s from './admin.module.css';

export function ProductsView({ initialStatus }: { initialStatus: NonNullable<AdminProductFilters['status']> }) {
  const [filters, setFilters] = useState<AdminProductFilters>({ page: 1, status: initialStatus, sort: 'newest', category: 'all' });
  const { data, isPending, isError, isPlaceholderData, refetch } = useAdminProducts(filters);
  const { data: categories = [] } = useResourceList('categories');
  const save = useSaveProduct();
  const del = useDeleteProduct();
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);

  const set = (patch: Partial<AdminProductFilters>) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  const toggle = async (p: AdminProduct, field: 'isActive' | 'isFeatured') => {
    try {
      await save.mutateAsync({ id: p.id, data: { [field]: !p[field] } });
    } catch (err) {
      toast.error('Update failed', errorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success('Product deleted');
      setToDelete(null);
    } catch (err) {
      toast.error('Delete failed', errorMessage(err));
    }
  };

  return (
    <div className={s.page}>
      <PageHeader
        title="Products"
        subtitle={data ? `${data.total} products` : 'Manage your catalogue'}
        actions={
          <Link href="/admin/products/new" className="btn btn--lime">
            <Icon name="plus" /> New product
          </Link>
        }
      />

      <Card flush>
        <div className={s.toolbar}>
          <SearchInput value={filters.q ?? ''} onChange={(q) => set({ q })} placeholder="Search products…" />
          <select className="select" value={filters.status} onChange={(e) => set({ status: e.target.value as AdminProductFilters['status'] })}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Hidden</option>
            <option value="low_stock">Low stock (≤5)</option>
          </select>
          <select className="select" value={filters.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="featured">Store order</option>
            <option value="price_desc">Price ↓</option>
            <option value="price_asc">Price ↑</option>
            <option value="stock_asc">Stock ↑</option>
            <option value="popular">Most reviewed</option>
          </select>
        </div>

        {isPending ? (
          <TableSkeleton cols={6} />
        ) : isError ? (
          <EmptyState icon="alert">
            Failed to load.{' '}
            <button className="btn btn--sm btn--outline" onClick={() => refetch()}>
              Retry
            </button>
          </EmptyState>
        ) : data.items.length === 0 ? (
          <EmptyState icon="box">
            No products match.{' '}
            <Link href="/admin/products/new" style={{ textDecoration: 'underline' }}>
              Create one
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className={s.tableWrap} style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Categories</th>
                    <th className={s.num}>Price</th>
                    <th className={s.num}>Stock</th>
                    <th className={s.num}>Sold</th>
                    <th>Featured</th>
                    <th>Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className={s.cellMedia}>
                          <SmartImage src={p.images[0]} alt="" width={44} height={44} className={s.thumb} />
                          <div className={s.cellText}>
                            <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                            <span className={s.muted}>/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.categories.length ? p.categories.map((c) => <span key={c.id} className={s.chip}>{c.name}</span>) : <span className={s.muted}>—</span>}
                      </td>
                      <td className={s.num}>
                        <div className={s.strong}>{takaEn(p.price)}</div>
                        {p.comparePrice && <s className={s.muted}>{takaEn(p.comparePrice)}</s>}
                      </td>
                      <td className={s.num}>
                        <span className={cx(s.badge, p.stock === 0 ? s['tone-red'] : p.stock <= 5 ? s['tone-amber'] : s['tone-green'])}>{p.stock}</span>
                      </td>
                      <td className={s.num}>{p._count.orderItems}</td>
                      <td>
                        <button
                          className={s.iconBtn}
                          onClick={() => toggle(p, 'isFeatured')}
                          aria-pressed={p.isFeatured}
                          aria-label="Featured"
                          title={p.isFeatured ? 'Featured on homepage' : 'Not featured'}
                          style={{ color: p.isFeatured ? '#f5a524' : undefined }}
                        >
                          <Icon name="star" size={18} style={{ opacity: p.isFeatured ? 1 : 0.25 }} />
                        </button>
                      </td>
                      <td>
                        <Switch checked={p.isActive} onChange={() => toggle(p, 'isActive')} label="Active" disabled={save.isPending} />
                      </td>
                      <td>
                        <div className={s.rowActions}>
                          <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className={s.iconBtn} aria-label="View on store">
                            <Icon name="external" size={16} />
                          </a>
                          <Link href={`/admin/products/${p.id}`} className={s.iconBtn} aria-label="Edit">
                            <Icon name="edit" size={16} />
                          </Link>
                          <button className={cx(s.iconBtn, s.iconBtnDanger)} onClick={() => setToDelete(p)} aria-label="Delete">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
          </>
        )}
      </Card>

      <ConfirmModal
        open={!!toDelete}
        title="Delete product?"
        message={
          <>
            <strong>{toDelete?.name}</strong> will be permanently removed. Past orders keep their item snapshot. To hide it
            temporarily, switch it to inactive instead.
          </>
        }
        loading={del.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
