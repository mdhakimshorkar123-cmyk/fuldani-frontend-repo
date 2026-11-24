'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storefront } from '@/lib/queries';
import { cart, useWishlist, wishlist } from '@/lib/cart';
import { quickCheckout, toast } from '@/lib/ui';
import { useLang } from '@/lib/i18n';
import { cx, discountPct, taka, toBn } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { ProductCard, Stars } from './ProductCard';
import styles from './ProductDetail.module.css';

export function ProductDetail({ slug }: { slug: string }) {
  const { data } = useQuery(storefront.product(slug));
  const { lang, t } = useLang();
  const [active, setActive] = useState(0);
  const [color, setColor] = useState<string | undefined>(data?.product.colors[0]?.name);
  const [qty, setQty] = useState(1);
  const liked = useWishlist().includes(data?.product.id ?? '');

  if (!data) return null;
  const { product, related } = data;
  const images = product.images.length ? product.images : [null];
  const off = discountPct(product.price, product.comparePrice);
  const soldOut = product.stock <= 0;
  const maxQty = Math.min(20, product.stock);

  return (
    <div className={styles.page} id="main-content">
      <div className="container">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">{t('navHome')}</Link>
          <Icon name="chevronRight" size={14} />
          <Link href="/#shop">{t('navShop')}</Link>
          {product.categories[0] && (
            <>
              <Icon name="chevronRight" size={14} />
              <Link href={`/?category=${product.categories[0].slug}#shop`}>{product.categories[0].name}</Link>
            </>
          )}
        </nav>

        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <SmartImage
                src={images[active]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
              {off > 0 && <span className={styles.off}>-{toBn(off)}% ছাড়</span>}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cx(styles.thumb, i === active && styles.thumbActive)}
                    onClick={() => setActive(i)}
                    aria-label={`Image ${i + 1}`}
                  >
                    <SmartImage src={src} alt="" fill sizes="80px" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.tags}>
              {product.badgeLabel && <span className={styles.badge}>{product.badgeLabel}</span>}
              {product.typeLabel && <span className={styles.type}>{product.typeLabel}</span>}
            </div>

            <h1 className={styles.title}>{product.name}</h1>

            {product.reviewCount > 0 && (
              <div className={styles.rating}>
                <Stars rating={product.rating} />
                <strong>{toBn(product.rating)}</strong>
                <span>({toBn(product.reviewCount)} রিভিউ)</span>
              </div>
            )}

            <div className={styles.pricing}>
              <span className={styles.price}>{taka(product.price, lang)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <s className={styles.compare}>{taka(product.comparePrice, lang)}</s>
                  <span className={styles.save}>{taka(product.comparePrice - product.price, lang)} সাশ্রয়</span>
                </>
              )}
            </div>

            {product.description && <p className={styles.desc}>{product.description}</p>}

            {product.colors.length > 0 && (
              <div className={styles.block}>
                <span className={styles.label}>
                  রং নির্বাচন: <strong>{color}</strong>
                </span>
                <div className={styles.swatches} role="radiogroup" aria-label="রং">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={c.name === color}
                      className={cx(styles.swatch, c.name === color && styles.swatchActive)}
                      onClick={() => setColor(c.name)}
                    >
                      <span style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.block}>
              <span className={styles.label}>
                পরিমাণ{' '}
                <span className={cx(styles.stock, soldOut && styles.stockOut)}>
                  {soldOut ? t('outOfStock') : product.stock <= 5 ? `মাত্র ${toBn(product.stock)}টি বাকি!` : t('inStock')}
                </span>
              </span>
              <div className={styles.buyRow}>
                <div className={styles.qty}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="কমান">
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{toBn(qty)}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="বাড়ান">
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--lg"
                  disabled={soldOut}
                  onClick={() => {
                    cart.add(product, color, qty);
                    toast.success(t('addedToCart'), product.name, { label: t('viewCart'), href: '/cart' });
                  }}
                >
                  <Icon name="bag" /> {t('addToCart')}
                </button>
                <button
                  type="button"
                  className={cx(styles.wish, liked && styles.wishOn)}
                  onClick={() => wishlist.toggle(product.id)}
                  aria-pressed={liked}
                  aria-label={t('wishlist')}
                >
                  <Icon name="heart" fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button
                type="button"
                className="btn btn--lime btn--lg btn--block"
                disabled={soldOut}
                onClick={() => quickCheckout.open(product, color)}
              >
                <Icon name="bolt" /> {t('buyNow')} — ক্যাশ অন ডেলিভারি
              </button>
            </div>

            <ul className={styles.trust}>
              <li>
                <Icon name="card" size={18} /> ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ
              </li>
              <li>
                <Icon name="truck" size={18} /> ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৪ দিনে ডেলিভারি
              </li>
              <li>
                <Icon name="rotate" size={18} /> ৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ
              </li>
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2>আপনার পছন্দ হতে পারে</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
