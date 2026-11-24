'use client';

import { useEffect, useState } from 'react';
import { quickCheckout, useQuickCheckout } from '@/lib/ui';
import { taka, toBn } from '@/lib/format';
import type { PlacedOrder } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { CheckoutForm } from './CheckoutForm';
import { OrderSuccess } from './OrderSuccess';
import styles from './QuickCheckoutModal.module.css';

/** "Buy now" — one-product Cash-on-Delivery checkout. */
export function QuickCheckoutModal() {
  const state = useQuickCheckout();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | undefined>();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    if (state) {
      setQty(1);
      setColor(state.colorName ?? state.product.colors[0]?.name);
      setPlaced(null);
    }
  }, [state]);

  if (!state) return null;
  const { product } = state;
  const maxQty = Math.min(20, product.stock);

  return (
    <Modal
      open
      onClose={quickCheckout.close}
      title={placed ? 'অর্ডার সম্পন্ন' : <>🛍️ দ্রুত অর্ডার (ক্যাশ অন ডেলিভারি)</>}
      size="md"
    >
      {placed ? (
        <OrderSuccess order={placed} onDone={quickCheckout.close} />
      ) : (
        <>
          <div className={styles.item}>
            <SmartImage src={product.images[0]} alt="" width={84} height={84} className={styles.thumb} />
            <div className={styles.info}>
              <h3 className={styles.name}>{product.name}</h3>
              <div className={styles.price}>{taka(product.price)}</div>

              {product.colors.length > 0 && (
                <div className={styles.swatches} role="radiogroup" aria-label="রং">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={c.name === color}
                      aria-label={c.name}
                      title={c.name}
                      className={styles.swatch}
                      data-active={c.name === color}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setColor(c.name)}
                    />
                  ))}
                  <span className={styles.colorName}>{color}</span>
                </div>
              )}

              <div className={styles.qty}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="কমান">
                  <Icon name="minus" size={16} />
                </button>
                <span aria-live="polite">{toBn(qty)}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="বাড়ান">
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </div>
          </div>

          <CheckoutForm
            lines={[{ productId: product.id, colorName: color, quantity: qty, price: product.price }]}
            onSuccess={setPlaced}
          />
        </>
      )}
    </Modal>
  );
}
