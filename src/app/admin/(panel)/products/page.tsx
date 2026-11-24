import type { Metadata } from 'next';
import { ProductsView } from '@/components/admin/ProductsView';

export const metadata: Metadata = { title: 'Products' };

type Status = 'all' | 'active' | 'inactive' | 'low_stock';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const valid: Status[] = ['all', 'active', 'inactive', 'low_stock'];
  return <ProductsView initialStatus={valid.includes(status as Status) ? (status as Status) : 'all'} />;
}
