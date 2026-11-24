import type { Metadata } from 'next';
import { TrackOrder } from '@/components/site/TrackOrder';

export const metadata: Metadata = { title: 'অর্ডার ট্র্যাক করুন' };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = '' } = await searchParams;
  return <TrackOrder initialCode={code} />;
}
