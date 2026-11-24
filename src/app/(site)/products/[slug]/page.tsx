import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { getQueryClient } from '@/lib/query-client';
import { storefront } from '@/lib/queries';
import type { Product } from '@/lib/types';
import { ProductDetail } from '@/components/site/ProductDetail';

type Params = { params: Promise<{ slug: string }> };

/** Deduped between generateMetadata and the page within one request. */
const getProduct = cache(async (slug: string) => {
  try {
    return await api<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(decodeURIComponent(slug));
  if (!data) return { title: 'পণ্য পাওয়া যায়নি' };
  const { product } = data;
  return {
    title: product.name,
    description: product.description ?? `${product.name} — স্বপ্ন ফুলদানি`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const data = await getProduct(slug);
  if (!data) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(storefront.product(slug).queryKey, data);

  const { product } = data;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Shopno Fuldani' },
    ...(product.reviewCount > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductDetail key={slug} slug={slug} />
    </HydrationBoundary>
  );
}
