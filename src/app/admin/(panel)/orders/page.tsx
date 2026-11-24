import type { Metadata } from 'next';
import { OrdersView } from '@/components/admin/OrdersView';
import type { OrderStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Orders' };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  return <OrdersView initialStatus={(status as OrderStatus | undefined) ?? 'ALL'} initialQuery={q ?? ''} />;
}
