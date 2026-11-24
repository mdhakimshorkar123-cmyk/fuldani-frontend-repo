'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDashboardStats } from '@/lib/admin-queries';
import { cx, formatDate, STATUS_META, takaEn, timeAgo } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, EmptyState, PageHeader, StatusBadge } from '@/components/admin/bits';
import { SalesChart } from '@/components/admin/SalesChart';
import s from '@/components/admin/admin.module.css';
import d from './dashboard.module.css';

const RANGES = [7, 14, 30, 90] as const;

function Kpi({
  label,
  value,
  change,
  icon,
  hint,
  href,
}: {
  label: string;
  value: string;
  change?: number | null;
  icon: IconName;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className={d.kpiTop}>
        <span className={d.kpiLabel}>{label}</span>
        <span className={d.kpiIcon}>
          <Icon name={icon} size={17} />
        </span>
      </div>
      <strong className={d.kpiValue}>{value}</strong>
      <span className={d.kpiFoot}>
        {change !== undefined && change !== null && (
          <span className={cx(d.delta, change >= 0 ? d.up : d.down)}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
          </span>
        )}
        {hint}
      </span>
    </>
  );
  return href ? (
    <Link href={href} className={cx(d.kpi, d.kpiLink)}>
      {body}
    </Link>
  ) : (
    <div className={d.kpi}>{body}</div>
  );
}

export default function DashboardPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(14);
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const { data, isPending, isError, refetch, isFetching } = useDashboardStats(days);

  const statusTotal = data?.statusBreakdown.reduce((n, x) => n + x.count, 0) ?? 0;
  const topMax = Math.max(1, ...(data?.topProducts.map((p) => p.revenue) ?? [1]));

  return (
    <div className={s.page}>
      <PageHeader
        title="Dashboard"
        subtitle={data ? `Updated ${timeAgo(data.generatedAt)} · Asia/Dhaka` : 'Store performance at a glance'}
        actions={
          <>
            <div className={s.segmented} role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r} aria-pressed={days === r} onClick={() => setDays(r)}>
                  {r}d
                </button>
              ))}
            </div>
            <button className="btn btn--outline btn--sm" onClick={() => refetch()} disabled={isFetching}>
              <Icon name="refresh" /> Refresh
            </button>
          </>
        }
      />

      {isError && !data ? (
        <Card>
          <EmptyState icon="alert">
            Could not load stats.{' '}
            <button className="btn btn--sm btn--outline" onClick={() => refetch()}>
              Retry
            </button>
          </EmptyState>
        </Card>
      ) : isPending || !data ? (
        <div className={d.kpis}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={cx(d.kpi, 'skeleton')} style={{ height: 118 }} />
          ))}
        </div>
      ) : (
        <>
          <div className={d.kpis}>
            <Kpi label={`Revenue · ${days}d`} value={takaEn(data.kpis.revenue)} change={data.kpis.revenueChange} icon="trend" hint="vs previous period" />
            <Kpi label={`Orders · ${days}d`} value={String(data.kpis.orders)} change={data.kpis.ordersChange} icon="receipt" hint="vs previous period" />
            <Kpi
              label="Pending orders"
              value={String(data.kpis.pendingOrders)}
              icon="clock"
              hint={data.kpis.pendingOrders ? 'Need confirmation →' : 'All caught up'}
              href="/admin/orders?status=PENDING"
            />
            <Kpi
              label="Today"
              value={takaEn(data.kpis.todayRevenue)}
              icon="sparkle"
              hint={`${data.kpis.todayOrders} orders · AOV ${takaEn(data.kpis.avgOrderValue)}`}
            />
          </div>

          <div className={s.grid2}>
            <Card
              title={metric === 'revenue' ? 'Revenue per day' : 'Orders per day'}
              sub="Excludes cancelled & returned orders from revenue"
              action={
                <div className={s.segmented} role="group" aria-label="Metric">
                  <button aria-pressed={metric === 'revenue'} onClick={() => setMetric('revenue')}>
                    Revenue
                  </button>
                  <button aria-pressed={metric === 'orders'} onClick={() => setMetric('orders')}>
                    Orders
                  </button>
                </div>
              }
            >
              <SalesChart data={data.series} metric={metric} />
            </Card>

            <Card title="Order status" sub={`${statusTotal} orders in the last ${days} days`}>
              {statusTotal === 0 ? (
                <EmptyState icon="receipt">No orders in this period</EmptyState>
              ) : (
                <ul className={d.statusList}>
                  {data.statusBreakdown
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((row) => (
                      <li key={row.status}>
                        <Link href={`/admin/orders?status=${row.status}`} className={d.statusRow}>
                          <StatusBadge status={row.status} />
                          <span className={d.statusTrack}>
                            <span
                              className={cx(d.statusFill, d[`fill-${STATUS_META[row.status].tone}`])}
                              style={{ width: `${(row.count / statusTotal) * 100}%` }}
                            />
                          </span>
                          <strong>{row.count}</strong>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </Card>
          </div>

          <div className={s.grid2}>
            <Card
              title="Recent orders"
              action={
                <Link href="/admin/orders" className="btn btn--ghost btn--sm">
                  View all <Icon name="arrowRight" />
                </Link>
              }
              flush
            >
              {data.recentOrders.length === 0 ? (
                <EmptyState icon="receipt">No orders yet</EmptyState>
              ) : (
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th className={s.num}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <Link href={`/admin/orders/${o.id}`} className={s.mono}>
                              {o.code}
                            </Link>
                            <div className={s.muted}>{formatDate(o.createdAt, true)}</div>
                          </td>
                          <td>{o.customerName}</td>
                          <td>
                            <StatusBadge status={o.status} />
                          </td>
                          <td className={cx(s.num, s.strong)}>{takaEn(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div className={s.stack}>
              <Card title="Top products" sub={`By revenue · ${days}d`}>
                {data.topProducts.length === 0 ? (
                  <EmptyState icon="box">No sales yet</EmptyState>
                ) : (
                  <ol className={d.topList}>
                    {data.topProducts.map((p, i) => (
                      <li key={p.name}>
                        <span className={d.rank}>{i + 1}</span>
                        <span className={d.topInfo}>
                          <span className={d.topName}>{p.name}</span>
                          <span className={d.topTrack}>
                            <span style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                          </span>
                        </span>
                        <span className={d.topVal}>
                          <strong>{takaEn(p.revenue)}</strong>
                          <small>{p.quantity} sold</small>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>

              <Card
                title="Low stock"
                sub="5 units or fewer"
                action={
                  <Link href="/admin/products?status=low_stock" className="btn btn--ghost btn--sm">
                    Manage
                  </Link>
                }
              >
                {data.lowStock.length === 0 ? (
                  <EmptyState icon="check">Stock levels look healthy</EmptyState>
                ) : (
                  <ul className={d.lowList}>
                    {data.lowStock.map((p) => (
                      <li key={p.id}>
                        <SmartImage src={p.image} alt="" width={36} height={36} className={s.thumb} style={{ width: 36, height: 36 }} />
                        <Link href={`/admin/products/${p.id}`} className={d.lowName}>
                          {p.name}
                        </Link>
                        <span className={cx(s.badge, p.stock === 0 ? s['tone-red'] : s['tone-amber'])}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
