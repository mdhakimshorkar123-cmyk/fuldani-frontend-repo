'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { storefront, type ProductSort } from '@/lib/queries';
import { useLang } from '@/lib/i18n';
import { cx, toBn } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { FloralShape } from './FloralShape';
import styles from './ShopSection.module.css';

const SORTS: { value: ProductSort; bn: string; en: string }[] = [
  { value: 'featured', bn: 'ফিচার্ড', en: 'Featured' },
  { value: 'popular', bn: 'জনপ্রিয়', en: 'Popular' },
  { value: 'newest', bn: 'নতুন', en: 'Newest' },
  { value: 'price_asc', bn: 'দাম: কম → বেশি', en: 'Price: low → high' },
  { value: 'price_desc', bn: 'দাম: বেশি → কম', en: 'Price: high → low' },
];

export function ShopSection({ initialCategory = 'all' }: { initialCategory?: string }) {
  const { lang } = useLang();
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<ProductSort>('featured');

  useEffect(() => setCategory(initialCategory), [initialCategory]);

  const { data: categories = [] } = useQuery(storefront.categories());
  const query = useInfiniteQuery({ ...storefront.products({ category, sort }), placeholderData: keepPreviousData });

  const products = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const selectCategory = (slug: string) => {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', slug);
    window.history.replaceState(window.history.state, '', url);
  };

  const n = (v: number) => (lang === 'bn' ? toBn(v) : String(v));
  const allThumb = categories[0]?.image;

  return (
    <section id="shop" className={styles.section}>
      <FloralShape className={styles.floralLeft} />
      <FloralShape className={styles.floralRight} />

      <div className="container">
        <header className={styles.header}>
          <span className={styles.kicker}>{lang === 'bn' ? 'আমাদের কালেকশন' : 'Our collection'}</span>
          <h2 className={styles.title}>
            {lang === 'bn' ? (
              <>
                আমাদের সেরা <span>ফুল ও ফুলদানি</span>
              </>
            ) : (
              <>
                Our finest <span>flowers &amp; vases</span>
              </>
            )}
          </h2>
          <p className={styles.desc}>
            {lang === 'bn'
              ? 'প্রতিটি ফুল নিখুঁত কারুকার্যে তৈরি, যা বছরের পর বছর নতুনের মতো সতেজ থাকবে। আপনার ঘরের সৌন্দর্যকে নিয়ে যান এক অনন্য উচ্চতায়।'
              : 'Every stem is crafted to stay fresh for years. Elevate your space with timeless beauty.'}
          </p>
        </header>

        <div className={styles.tabsWrap}>
          <div className={styles.tabs} role="tablist" aria-label="Categories">
            <button
              type="button"
              role="tab"
              aria-selected={category === 'all'}
              className={cx(styles.tab, category === 'all' && styles.tabActive)}
              onClick={() => selectCategory('all')}
            >
              {allThumb && <SmartImage src={allThumb} alt="" width={36} height={36} className={styles.tabThumb} />}
              {lang === 'bn' ? 'সব কালেকশন' : 'All'}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.slug}
                className={cx(styles.tab, category === c.slug && styles.tabActive)}
                onClick={() => selectCategory(c.slug)}
              >
                {c.image && <SmartImage src={c.image} alt="" width={36} height={36} className={styles.tabThumb} />}
                {c.name}
                <span className={styles.tabCount}>{n(c._count.products)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolbar}>
          <span className={styles.count}>
            {lang === 'bn' ? 'প্রদর্শিত পণ্য:' : 'Showing'} <strong>{n(products.length)}</strong>
            {total > products.length && <> / {n(total)}</>}
            {lang === 'bn' ? 'টি' : ' items'}
          </span>
          <ul className={styles.features}>
            <li>
              <Icon name="check" size={15} /> {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on delivery'}
            </li>
            <li>
              <Icon name="check" size={15} /> {lang === 'bn' ? 'সারা দেশে হোম ডেলিভারি' : 'Nationwide delivery'}
            </li>
            <li>
              <Icon name="check" size={15} /> {lang === 'bn' ? '১০০% কোয়ালিটি গ্যারান্টি' : '100% quality guarantee'}
            </li>
          </ul>
          <label className={styles.sort}>
            <span className="sr-only">Sort</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as ProductSort)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s[lang]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {query.isError && !products.length ? (
          <div className={styles.empty}>
            <Icon name="alert" size={28} />
            <p>{lang === 'bn' ? 'পণ্য লোড করা যায়নি।' : 'Could not load products.'}</p>
            <button className="btn btn--outline btn--sm" onClick={() => query.refetch()}>
              <Icon name="refresh" /> {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
            </button>
          </div>
        ) : query.isPending ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>{lang === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।' : 'No products in this category yet.'}</p>
          </div>
        ) : (
          <div className={cx(styles.grid, query.isPlaceholderData && styles.gridLoading)} aria-busy={query.isFetching}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}

        {query.hasNextPage && (
          <div className={styles.more}>
            <button
              type="button"
              className="btn btn--outline btn--lg"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage ? <span className="spinner" /> : <Icon name="plus" />}
              {lang === 'bn' ? 'আরও পণ্য দেখুন' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
