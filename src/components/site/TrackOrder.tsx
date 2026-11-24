'use client';

import { useState, type FormEvent } from 'react';
import { useTrackOrder } from '@/lib/queries';
import { cx, formatDate, STATUS_META, taka, toBn } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import styles from './TrackOrder.module.css';

const FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export function TrackOrder({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState('');
  const track = useTrackOrder();
  const order = track.data;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) return;
    track.mutate({ code: code.trim(), phone: phone.trim() });
  };

  const terminal = order && (order.status === 'CANCELLED' || order.status === 'RETURNED');
  const currentIdx = order ? FLOW.indexOf(order.status) : -1;
  const reachedAt = (s: OrderStatus) => order?.statusLogs.find((l) => l.status === s)?.createdAt;

  return (
    <div className={styles.page} id="main-content">
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <span className={styles.icon}>
            <Icon name="truck" size={26} />
          </span>
          <h1>অর্ডার ট্র্যাক করুন</h1>
          <p>অর্ডার নম্বর ও যে মোবাইল নম্বর দিয়ে অর্ডার করেছেন তা দিন।</p>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <input
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="অর্ডার নং (যেমন SF-7K3QX9)"
            aria-label="Order code"
            required
          />
          <input
            className="input"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="মোবাইল নম্বর"
            aria-label="Phone"
            required
          />
          <button className="btn btn--lime" disabled={track.isPending}>
            {track.isPending ? <span className="spinner" /> : <Icon name="search" />}
            খুঁজুন
          </button>
        </form>

        {track.isError && (
          <div className={styles.error} role="alert">
            <Icon name="alert" size={18} /> {track.error.message}
          </div>
        )}

        {order && (
          <div className={styles.result}>
            <div className={styles.resultHead}>
              <div>
                <span className={styles.muted}>অর্ডার নং</span>
                <strong className={styles.code}>{order.code}</strong>
              </div>
              <div>
                <span className={styles.muted}>অর্ডারের তারিখ</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <span className={cx(styles.status, styles[`tone-${STATUS_META[order.status].tone}`])}>
                {STATUS_META[order.status].bn}
              </span>
            </div>

            {terminal ? (
              <p className={styles.terminal}>
                এই অর্ডারটি <strong>{STATUS_META[order.status].bn}</strong> করা হয়েছে। কোনো প্রশ্ন থাকলে আমাদের কল করুন।
              </p>
            ) : (
              <ol className={styles.steps}>
                {FLOW.map((s, i) => {
                  const at = reachedAt(s);
                  return (
                    <li key={s} className={cx(styles.step, i <= currentIdx && styles.stepDone, i === currentIdx && styles.stepCurrent)}>
                      <span className={styles.dot}>{i <= currentIdx ? <Icon name="check" size={14} strokeWidth={3} /> : toBn(i + 1)}</span>
                      <span className={styles.stepLabel}>{STATUS_META[s].bn}</span>
                      {at && <span className={styles.stepDate}>{formatDate(at)}</span>}
                    </li>
                  );
                })}
              </ol>
            )}

            <ul className={styles.items}>
              {order.items.map((it, i) => (
                <li key={i}>
                  <SmartImage src={it.productImage} alt="" width={56} height={56} className={styles.itemImg} />
                  <span className={styles.itemName}>
                    {it.productName}
                    <small>
                      {it.colorName && `${it.colorName} · `}
                      {toBn(it.quantity)}টি
                    </small>
                  </span>
                  <strong>{taka(it.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <div className={styles.totals}>
              <span>ডেলিভারি ({order.deliveryZoneName})</span>
              <span>{taka(order.deliveryFee)}</span>
              <strong>সর্বমোট (ক্যাশ অন ডেলিভারি)</strong>
              <strong>{taka(order.total)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
