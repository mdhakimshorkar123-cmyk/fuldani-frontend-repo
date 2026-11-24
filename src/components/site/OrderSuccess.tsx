'use client';

import Link from 'next/link';
import { useState } from 'react';
import { taka } from '@/lib/format';
import type { PlacedOrder } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import styles from './OrderSuccess.module.css';

export function OrderSuccess({ order, onDone }: { order: PlacedOrder; onDone?: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <Icon name="check" size={34} strokeWidth={3} />
      </div>
      <h3 className={styles.title}>আপনার অর্ডার সফল হয়েছে! 🎉</h3>
      <p className={styles.desc}>
        ধন্যবাদ! আপনার অর্ডারটি আমরা গ্রহণ করেছি। খুব শীঘ্রই আমাদের প্রতিনিধি কল করে অর্ডারটি কনফার্ম করবেন।
      </p>

      <button type="button" className={styles.code} onClick={copy} title="কপি করুন">
        <span>অর্ডার নং</span>
        <strong>{order.code}</strong>
        <span className={styles.copy}>{copied ? 'কপি হয়েছে ✓' : 'কপি'}</span>
      </button>

      <p className={styles.total}>
        সর্বমোট প্রদেয়: <strong>{taka(order.total)}</strong> (ক্যাশ অন ডেলিভারি)
      </p>

      <div className={styles.actions}>
        <Link href={`/track?code=${order.code}`} className="btn btn--outline" onClick={onDone}>
          <Icon name="truck" /> অর্ডার ট্র্যাক করুন
        </Link>
        <Link href="/#shop" className="btn" onClick={onDone}>
          আরও কেনাকাটা করুন
        </Link>
      </div>
    </div>
  );
}
