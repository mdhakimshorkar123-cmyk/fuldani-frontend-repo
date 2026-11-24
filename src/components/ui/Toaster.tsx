'use client';

import Link from 'next/link';
import { toast, useToasts } from '@/lib/ui';
import { Icon } from './Icon';
import styles from './Toaster.module.css';

export function Toaster() {
  const toasts = useToasts();
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.tone]}`}>
          <span className={styles.icon}>
            <Icon name={t.tone === 'error' ? 'alert' : 'check'} size={16} />
          </span>
          <div className={styles.content}>
            <strong className={styles.title}>{t.title}</strong>
            {t.description && <span className={styles.desc}>{t.description}</span>}
          </div>
          {t.action && (
            <Link href={t.action.href} className={styles.action} onClick={() => toast.dismiss(t.id)}>
              {t.action.label}
            </Link>
          )}
          <button className={styles.close} onClick={() => toast.dismiss(t.id)} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
