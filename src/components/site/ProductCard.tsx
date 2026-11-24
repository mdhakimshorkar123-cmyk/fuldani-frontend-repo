'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cart, useWishlist, wishlist } from '@/lib/cart';
import { quickCheckout, toast } from '@/lib/ui';
import { useLang } from '@/lib/i18n';
import { cx, discountPct, taka, toBn } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import styles from './ProductCard.module.css';

export function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={13} className={i <= Math.round(rating) ? styles.starOn : styles.starOff} />
      ))}
    </span>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { lang, t } = useLang();
  const [color, setColor] = useState(product.colors[0]?.name);
  const liked = useWishlist().includes(product.id);
  const off = discountPct(product.price, product.comparePrice);
  const soldOut = product.stock <= 0;
  const n = (v: number) => (lang === 'bn' ? toBn(v) : String(v));

  const addToCart = () => {
    cart.add(product, color);
    toast.success(t('addedToCart'), product.name, { label: t('viewCart'), href: '/cart' });
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link href={`/products/${product.slug}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
          <SmartImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 560px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.img}
            priority={priority}
          />
          {product.images[1] && (
            <SmartImage src={product.images[1]} alt="" fill sizes="25vw" className={cx(styles.img, styles.imgAlt)} />
          )}
        </Link>

        <div className={styles.badges}>
          {product.badgeLabel && (
            <span className={cx(styles.badge, styles[`badge${product.badgeType ?? 'NEW'}`])}>{product.badgeLabel}</span>
          )}
          {off > 0 && <span className={cx(styles.badge, styles.badgeDiscount)}>-{n(off)}%</span>}
        </div>

        <button
          type="button"
          className={cx(styles.wish, liked && styles.wishOn)}
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={liked}
          aria-label={t('wishlist')}
        >
          <Icon name="heart" size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {soldOut && <span className={styles.soldOut}>{t('outOfStock')}</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {product.typeLabel && <span className={styles.type}>{product.typeLabel}</span>}
          <span className={cx(styles.stock, soldOut && styles.stockOut)}>
            <span className={styles.stockDot} />
            {soldOut ? t('outOfStock') : t('inStock')}
          </span>
        </div>

        <h3 className={styles.title}>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {product.reviewCount > 0 && (
          <div className={styles.rating}>
            <Stars rating={product.rating} />
            <strong>{lang === 'bn' ? toBn(product.rating) : product.rating.toFixed(1)}</strong>
            <span>
              ({n(product.reviewCount)} {lang === 'bn' ? 'রিভিউ' : 'reviews'})
            </span>
          </div>
        )}

        {product.colors.length > 0 && (
          <div className={styles.colors}>
            <span className={styles.colorLabel}>
              {lang === 'bn' ? 'রং:' : 'Color:'} <strong>{color}</strong>
            </span>
            <div className={styles.swatches} role="radiogroup" aria-label="Color">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={c.name === color}
                  title={c.name}
                  aria-label={c.name}
                  className={cx(styles.swatch, c.name === color && styles.swatchOn)}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.name)}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.pricing}>
          <span className={styles.price}>{taka(product.price, lang)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <>
              <s className={styles.compare}>{taka(product.comparePrice, lang)}</s>
              <span className={styles.save}>
                {taka(product.comparePrice - product.price, lang)} {lang === 'bn' ? 'সাশ্রয়' : 'off'}
              </span>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cartBtn} onClick={addToCart} disabled={soldOut} aria-label={t('addToCart')} title={t('addToCart')}>
            <Icon name="bag" size={19} />
          </button>
          <button type="button" className={styles.buyBtn} onClick={() => quickCheckout.open(product, color)} disabled={soldOut}>
            <Icon name="bolt" size={17} />
            {t('buyNow')}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={cx(styles.media, 'skeleton')} />
      <div className={styles.body}>
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
        <div className="skeleton" style={{ height: 20, width: '90%', marginTop: 10 }} />
        <div className="skeleton" style={{ height: 20, width: '50%', marginTop: 8 }} />
        <div className="skeleton" style={{ height: 44, marginTop: 18, borderRadius: 999 }} />
      </div>
    </div>
  );
}
