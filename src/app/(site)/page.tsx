import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { storefront } from '@/lib/queries';
import { Hero } from '@/components/site/Hero';
import { ShopSection } from '@/components/site/ShopSection';
import { AboutSection } from '@/components/site/AboutSection';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = 'all' } = await searchParams;
  const queryClient = getQueryClient();

  // Prefetch in parallel on the server; the client hydrates without refetching.
  // prefetch* never throws — if the API is down the client simply retries.
  await Promise.all([
    queryClient.prefetchQuery(storefront.featured()),
    queryClient.prefetchQuery(storefront.showcases()),
    queryClient.prefetchQuery(storefront.categories()),
    queryClient.prefetchInfiniteQuery(storefront.products({ category, sort: 'featured' })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <ShopSection initialCategory={category} />
      <AboutSection />
    </HydrationBoundary>
  );
}
