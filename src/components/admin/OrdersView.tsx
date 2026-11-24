'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminOrders } from '@/lib/admin-queries';
import { cx, formatDate, STATUS_META, takaEn } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';
import { Card, EmptyState, PageHeader, Pagination, SearchInput, StatusBadge, TableSkeleton } from './bits';
import s from './admin.module.css';

const TABS: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export function OrdersView({ initialStatus, initialQuery }: { initialStatus: OrderStatus | 'ALL'; initialQuery: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | 'ALL'>(TABS.includes(initialStatus) ? initialStatus : 'ALL');
  const [q, setQ] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData, refetch } = useAdminOrders({ status, q: q || undefined, page });

  // Keep the URL shareable without triggering a server round-trip.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (status !== 'ALL') sp.set('status', status);
    if (q) sp.set('q', q);
    const qs = sp.toString();
    window.history.replaceState(window.history.state, '', qs ? `?${qs}` : window.location.pathname);
  }, [status, q]);

  return (
    <div className={s.page}>
      <PageHeader title="Orders" subtitle="Cash-on-delivery orders — confirm by phone, then move through fulfilment." />

      <Card flush>
        <div className={s.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={status === t}
              className={cx(s.tab, status === t && s.tabActive)}
              onClick={() => {
                setStatus(t);
                setPage(1);
              }}
            >
              {t === 'ALL' ? 'All' : STATUS_META[t].label}
              <span className={s.tabCount}>{data?.counts[t] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className={s.toolbar}>
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="Search code, name or phone…"
          />
        </div>

        {isPending ? (
          <TableSkeleton cols={6} />
        ) : isError ? (
          <EmptyState icon="alert">
            Failed to load orders.{' '}
            <button className="btn btn--sm btn--outline" onClick={() => refetch()}>
              Retry
            </button>
          </EmptyState>
        ) : data.items.length === 0 ? (
          <EmptyState icon="receipt">No orders found</EmptyState>
        ) : (
          <>
            <div className={s.tableWrap} style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Zone</th>
                    <th className={s.num}>Items</th>
                    <th className={s.num}>Total</th>
                    <th>Status</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr
                      key={o.id}
                      className={s.rowLink}
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && router.push(`/admin/orders/${o.id}`)}
                      tabIndex={0}
                    >
                      <td className={s.mono}>{o.code}</td>
                      <td>
                        <div className={s.strong}>{o.customerName}</div>
                        <div className={s.muted}>{o.phone}</div>
                      </td>
                      <td className={s.nowrap}>{o.deliveryZoneName}</td>
                      <td className={s.num}>{o._count.items}</td>
                      <td className={cx(s.num, s.strong)}>{takaEn(o.total)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className={cx(s.nowrap, s.muted)}>{formatDate(o.createdAt, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
