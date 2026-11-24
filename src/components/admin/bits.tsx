'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { cx, STATUS_META } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import s from './admin.module.css';

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className={s.header}>
      <div>
        {back && (
          <Link href={back.href} className={s.back}>
            <Icon name="arrowLeft" size={15} /> {back.label}
          </Link>
        )}
        <h1 className={s.title}>{title}</h1>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={cx(s.headerActions, s.noPrint)}>{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return <span className={cx(s.badge, s[`tone-${meta.tone}`])}>{meta.label}</span>;
}

export function Card({
  title,
  sub,
  action,
  children,
  flush,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={s.card}>
      {(title || action) && (
        <div className={s.cardHead}>
          <div>
            {title && <h2 className={s.cardTitle}>{title}</h2>}
            {sub && <div className={s.cardSub}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {flush ? <div style={{ marginTop: title ? 12 : 0 }}>{children}</div> : <div className={s.cardBody}>{children}</div>}
    </section>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className={s.pagination}>
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className={s.pageBtns}>
        <button className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <Icon name="arrowLeft" /> Prev
        </button>
        <button className="btn btn--outline btn--sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (local === value) return;
    const id = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(id);
  }, [local, value, onChange]);

  return (
    <div className={s.search}>
      <Icon name="search" size={16} />
      <input className="input" value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={s.switch}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner" />} {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-soft)' }}>{message}</p>
    </Modal>
  );
}

export function EmptyState({ icon = 'box', children }: { icon?: Parameters<typeof Icon>[0]['name']; children: ReactNode }) {
  return (
    <div className={s.empty}>
      <Icon name={icon} size={40} />
      <div>{children}</div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ padding: 14, display: 'grid', gap: 10 }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="skeleton" style={{ height: 18 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
