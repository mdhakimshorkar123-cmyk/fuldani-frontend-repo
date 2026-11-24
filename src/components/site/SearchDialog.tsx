'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storefront } from '@/lib/queries';
import { search, useSearchOpen } from '@/lib/ui';
import { taka } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import styles from './SearchDialog.module.css';

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function SearchDialog() {
  const open = useSearchOpen();
  const [term, setTerm] = useState('');
  const q = useDebounced(term.trim(), 250);
  const { data, isFetching } = useQuery({ ...storefront.search(q), enabled: open && q.length >= 2 });

  useEffect(() => {
    if (!open) setTerm('');
  }, [open]);

  return (
    <Modal open={open} onClose={search.close} title="পণ্য খুঁজুন" size="md">
      <div className={styles.inputWrap}>
        <Icon name="search" size={18} />
        <input
          className={styles.input}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="যেমন: লিলি, বনসাই, চেরি ব্লসম…"
          aria-label="Search products"
          autoComplete="off"
        />
        {isFetching && <span className="spinner" />}
      </div>

      <div className={styles.results}>
        {q.length < 2 ? (
          <p className={styles.hint}>অন্তত ২টি অক্ষর লিখুন</p>
        ) : data && data.items.length === 0 ? (
          <p className={styles.hint}>“{q}” এর জন্য কোনো পণ্য পাওয়া যায়নি</p>
        ) : (
          data?.items.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className={styles.item} onClick={search.close}>
              <SmartImage src={p.images[0]} alt="" width={56} height={56} className={styles.thumb} />
              <span className={styles.meta}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.type}>{p.typeLabel}</span>
              </span>
              <span className={styles.price}>{taka(p.price)}</span>
            </Link>
          ))
        )}
      </div>
    </Modal>
  );
}
