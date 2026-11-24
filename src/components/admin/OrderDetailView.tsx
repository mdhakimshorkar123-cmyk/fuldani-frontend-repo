'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminOrder, useUpdateOrder, useUpdateOrderStatus } from '@/lib/admin-queries';
import { errorMessage } from '@/lib/api';
import { cx, formatDate, STATUS_META, takaEn } from '@/lib/format';
import { toast } from '@/lib/ui';
import type { OrderStatus } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, EmptyState, PageHeader, StatusBadge } from './bits';
import s from './admin.module.css';
import o from './OrderDetail.module.css';

const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Mark pending',
  CONFIRMED: 'Confirm order',
  PROCESSING: 'Start processing',
  SHIPPED: 'Mark shipped',
  DELIVERED: 'Mark delivered',
  CANCELLED: 'Cancel order',
  RETURNED: 'Mark returned',
};

export function OrderDetailView({ id }: { id: string }) {
  const { data, isPending, isError } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus(id);
  const updateOrder = useUpdateOrder(id);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState({ customerName: '', phone: '', address: '' });

  useEffect(() => {
    if (data) setAdminNote(data.order.adminNote ?? '');
  }, [data?.order.adminNote]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending) return <div className="skeleton" style={{ height: 400 }} />;
  if (isError || !data)
    return (
      <Card>
        <EmptyState icon="alert">Order not found.</EmptyState>
      </Card>
    );

  const { order, allowedTransitions } = data;
  const waNumber = `88${order.phone}`;
  const destructive = (st: OrderStatus) => st === 'CANCELLED' || st === 'RETURNED';

  const applyStatus = async () => {
    if (!pendingStatus) return;
    try {
      await updateStatus.mutateAsync({ status: pendingStatus, note: statusNote || undefined });
      toast.success(`Order ${STATUS_META[pendingStatus].label.toLowerCase()}`);
      setPendingStatus(null);
      setStatusNote('');
    } catch (err) {
      toast.error('Could not update status', errorMessage(err));
    }
  };

  const saveNote = async () => {
    try {
      await updateOrder.mutateAsync({ adminNote: adminNote.trim() || null });
      toast.success('Note saved');
    } catch (err) {
      toast.error('Could not save note', errorMessage(err));
    }
  };

  const saveContact = async () => {
    try {
      await updateOrder.mutateAsync(contact);
      toast.success('Customer details updated');
      setEditing(false);
    } catch (err) {
      toast.error('Could not update', errorMessage(err));
    }
  };

  return (
    <div className={s.page}>
      <PageHeader
        back={{ href: '/admin/orders', label: 'Orders' }}
        title={
          <span className={o.titleRow}>
            <span className={s.mono} style={{ fontSize: 22 }}>
              {order.code}
            </span>
            <StatusBadge status={order.status} />
          </span>
        }
        subtitle={`Placed ${formatDate(order.createdAt, true)} · ${order.paymentMethod === 'COD' ? 'Cash on delivery' : order.paymentMethod}`}
        actions={
          <>
            <a href={`tel:${order.phone}`} className="btn btn--outline btn--sm">
              <Icon name="phone" /> Call
            </a>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
              <Icon name="whatsapp" /> WhatsApp
            </a>
            <button className="btn btn--outline btn--sm" onClick={() => window.print()}>
              <Icon name="printer" /> Invoice
            </button>
          </>
        }
      />

      {allowedTransitions.length > 0 && (
        <div className={cx(o.actionBar, s.noPrint)}>
          <span className={o.actionLabel}>Next step</span>
          {allowedTransitions.map((st) => (
            <button
              key={st}
              className={cx('btn btn--sm', destructive(st) ? 'btn--outline' : st === allowedTransitions[0] ? 'btn--lime' : '')}
              onClick={() => setPendingStatus(st)}
            >
              {ACTION_LABEL[st]}
            </button>
          ))}
        </div>
      )}

      <div className={s.grid2}>
        <div className={s.stack}>
          <Card title={`Items (${order.items.length})`} flush>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className={s.num}>Price</th>
                    <th className={s.num}>Qty</th>
                    <th className={s.num}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className={s.cellMedia}>
                          <SmartImage src={it.productImage} alt="" width={44} height={44} className={s.thumb} />
                          <div className={s.cellText}>
                            {it.product ? (
                              <Link href={`/admin/products/${it.product.id}`}>{it.productName}</Link>
                            ) : (
                              <span>{it.productName}</span>
                            )}
                            <span className={s.muted}>
                              {it.colorName ? `Color: ${it.colorName}` : '—'}
                              {it.product && ` · ${it.product.stock} in stock`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={s.num}>{takaEn(it.unitPrice)}</td>
                      <td className={s.num}>× {it.quantity}</td>
                      <td className={cx(s.num, s.strong)}>{takaEn(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className={o.totals}>
              <dt>Subtotal</dt>
              <dd>{takaEn(order.subtotal)}</dd>
              <dt>Delivery · {order.deliveryZoneName}</dt>
              <dd>{takaEn(order.deliveryFee)}</dd>
              <dt className={o.grand}>Total to collect</dt>
              <dd className={o.grand}>{takaEn(order.total)}</dd>
            </dl>
          </Card>

          <Card title="Timeline">
            <ol className={o.timeline}>
              {order.statusLogs
                .slice()
                .reverse()
                .map((log) => (
                  <li key={log.id}>
                    <span className={cx(o.tlDot, o[`tl-${STATUS_META[log.status].tone}`])} />
                    <div>
                      <div className={o.tlHead}>
                        <strong>{STATUS_META[log.status].label}</strong>
                        <span className={s.muted}>{formatDate(log.createdAt, true)}</span>
                      </div>
                      <div className={s.muted}>
                        {log.changedBy ? `by ${log.changedBy.name}` : 'by customer'}
                        {log.note && ` — “${log.note}”`}
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          </Card>
        </div>

        <div className={s.stack}>
          <Card
            title="Customer"
            action={
              <button
                className={cx('btn btn--ghost btn--sm', s.noPrint)}
                onClick={() => {
                  setContact({ customerName: order.customerName, phone: order.phone, address: order.address });
                  setEditing(true);
                }}
              >
                <Icon name="edit" /> Edit
              </button>
            }
          >
            <dl className={o.info}>
              <dt>Name</dt>
              <dd>{order.customerName}</dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${order.phone}`}>{order.phone}</a>
              </dd>
              <dt>Address</dt>
              <dd>{order.address}</dd>
              <dt>Zone</dt>
              <dd>{order.deliveryZoneName}</dd>
              {order.note && (
                <>
                  <dt>Customer note</dt>
                  <dd className={o.note}>{order.note}</dd>
                </>
              )}
            </dl>
          </Card>

          <Card title="Internal note" sub="Visible to admins only" >
            <textarea
              className="textarea"
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Customer asked for delivery after 5pm"
            />
            <button
              className={cx('btn btn--sm', s.noPrint)}
              style={{ marginTop: 10 }}
              onClick={saveNote}
              disabled={updateOrder.isPending || adminNote === (order.adminNote ?? '')}
            >
              Save note
            </button>
          </Card>
        </div>
      </div>

      <Modal
        open={!!pendingStatus}
        onClose={() => setPendingStatus(null)}
        title={pendingStatus ? ACTION_LABEL[pendingStatus] : ''}
        size="sm"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setPendingStatus(null)}>
              Cancel
            </button>
            <button
              className={cx('btn', pendingStatus && destructive(pendingStatus) && 'btn--danger')}
              onClick={applyStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <span className="spinner" />} Confirm
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <p style={{ color: 'var(--text-soft)' }}>
            Move <strong>{order.code}</strong> from <StatusBadge status={order.status} /> to{' '}
            {pendingStatus && <StatusBadge status={pendingStatus} />}?
            {pendingStatus && destructive(pendingStatus) && ' Item stock will be returned to inventory.'}
          </p>
          <div className="field">
            <label className="field__label" htmlFor="status-note">
              Note (optional)
            </label>
            <input id="status-note" className="input" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="e.g. Confirmed by phone" />
          </div>
        </div>
      </Modal>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit customer details"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn" onClick={saveContact} disabled={updateOrder.isPending}>
              {updateOrder.isPending && <span className="spinner" />} Save
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="field">
            <label className="field__label">Name</label>
            <input className="input" value={contact.customerName} onChange={(e) => setContact({ ...contact, customerName: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Phone</label>
            <input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Address</label>
            <textarea className="textarea" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
