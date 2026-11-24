import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import type { Paginated, Product } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/track`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const { items } = await api<Paginated<Product>>('/products?limit=48&sort=newest');
    return [
      ...staticPages,
      ...items.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticPages; // API unavailable at build time
  }
}
