'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cart, useCart, useWishlist, wishlist } from '@/lib/cart';
import { api, qs } from '@/lib/api';
import { taka, toBn } from '@/lib/format';
import type { Paginated, PlacedOrder, Product } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { CheckoutForm } from './CheckoutForm';
import { OrderSuccess } from './OrderSuccess';
import { ProductCard } from './ProductCard';
import styles from './CartView.module.css';

export function CartView() {
  const { items, count, subtotal } = useCart();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  if (placed) {
    return (
      <div className={styles.page} id="main-content">
        <div className={`container ${styles.narrow}`}>
          <div className={styles.card}>
            <OrderSuccess order={placed} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} id="main-content">
      <div className="container">
        <h1 className={styles.heading}>
          শপিং কার্ট {count > 0 && <span>({toBn(count)}টি পণ্য)</span>}
        </h1>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Icon name="bag" size={34} />
            </span>
            <h2>আপনার কার্ট খালি</h2>
            <p>পছন্দের ফুল ও ফুলদানি কার্টে যোগ করুন।</p>
            <Link href="/#shop" className="btn btn--lime btn--lg">
              কেনাকাটা শুরু করুন <Icon name="arrowRight" />
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.key} className={styles.item}>
                  <Link href={`/products/${item.slug}`} className={styles.thumb}>
                    <SmartImage src={item.image} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.slug}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    {item.colorName && <span className={styles.itemMeta}>রং: {item.colorName}</span>}
                    <span className={styles.itemPrice}>{taka(item.price)}</span>
                  </div>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="কমান"
                    >
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{toBn(item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQty}
                      aria-label="বাড়ান"
                    >
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                  <strong className={styles.lineTotal}>{taka(item.price * item.quantity)}</strong>
                  <button type="button" className={styles.remove} onClick={() => cart.remove(item.key)} aria-label="মুছে ফেলুন">
                    <Icon name="trash" size={17} />
                  </button>
                </li>
              ))}
              <li className={styles.subtotalRow}>
                <span>সাবটোটাল</span>
                <strong>{taka(subtotal)}</strong>
              </li>
            </ul>

            <aside className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Icon name="receipt" /> চেকআউট — ক্যাশ অন ডেলিভারি
              </h2>
              <CheckoutForm
                lines={items.map((i) => ({ productId: i.productId, colorName: i.colorName, quantity: i.quantity, price: i.price }))}
                onSuccess={(order) => {
                  cart.clear();
                  setPlaced(order);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </aside>
          </div>
        )}

        <WishlistSection />
      </div>
    </div>
  );
}

function WishlistSection() {
  const ids = useWishlist();
  const { data = [], isPending } = useQuery({
    queryKey: ['products', 'wishlist', [...ids].sort()],
    queryFn: () => api<Paginated<Product>>(`/products${qs({ ids: ids.join(','), limit: 48 })}`).then((r) => r.items),
    enabled: ids.length > 0,
    staleTime: 60_000,
  });

  if (ids.length === 0) return null;

  return (
    <section id="wishlist" className={styles.wishlist}>
      <h2>
        <Icon name="heart" /> পছন্দের তালিকা ({toBn(ids.length)})
      </h2>
      {isPending ? (
        <p className={styles.muted}>লোড হচ্ছে…</p>
      ) : data.length === 0 ? (
        <p className={styles.muted}>
          পছন্দের পণ্যগুলো আর পাওয়া যাচ্ছে না।{' '}
          <button type="button" className={styles.link} onClick={() => ids.forEach((id) => wishlist.toggle(id))}>
            তালিকা পরিষ্কার করুন
          </button>
        </p>
      ) : (
        <div className={styles.wishGrid}>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
