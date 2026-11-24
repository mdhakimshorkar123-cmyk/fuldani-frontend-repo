'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { useCreateOrder, useDeliveryZones } from '@/lib/queries';
import { cx, taka } from '@/lib/format';
import type { PlacedOrder } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import styles from './CheckoutForm.module.css';

export interface CheckoutLine {
  productId: string;
  colorName?: string;
  quantity: number;
  price: number;
}

const FORM_KEY = 'sf_checkout_contact';
type Contact = { customerName: string; phone: string; address: string; note: string };
const emptyContact: Contact = { customerName: '', phone: '', address: '', note: '' };

/** Client-side mirror of the server rules — instant feedback; server stays authoritative. */
function validate(c: Contact) {
  const e: Partial<Record<keyof Contact | 'deliveryZoneId', string>> = {};
  if (c.customerName.trim().length < 2) e.customerName = 'আপনার নাম লিখুন';
  const digits = c.phone.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/\D/g, '').replace(/^88/, '');
  if (!/^01[3-9]\d{8}$/.test(digits)) e.phone = 'সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)';
  if (c.address.trim().length < 10) e.address = 'সম্পূর্ণ ঠিকানা লিখুন (বাসা, রোড, এলাকা, থানা, জেলা)';
  return e;
}

export function CheckoutForm({
  lines,
  onSuccess,
  submitLabel = 'অর্ডার নিশ্চিত করুন',
}: {
  lines: CheckoutLine[];
  onSuccess: (order: PlacedOrder) => void;
  submitLabel?: string;
}) {
  const { data: zones = [], isPending: zonesLoading } = useDeliveryZones();
  const createOrder = useCreateOrder();
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [zoneId, setZoneId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  // Remember returning customers' contact info (on this device only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_KEY);
      if (saved) setContact({ ...emptyContact, ...(JSON.parse(saved) as Partial<Contact>), note: '' });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!zoneId && zones[0]) setZoneId(zones[0].id);
  }, [zones, zoneId]);

  const zone = zones.find((z) => z.id === zoneId);
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryFee = zone?.fee ?? 0;
  const total = subtotal + deliveryFee;

  const update = (key: keyof Contact) => (e: { target: { value: string } }) => {
    const next = { ...contact, [key]: e.target.value };
    setContact(next);
    if (touched) setErrors(validate(next));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const v = validate(contact);
    if (!zoneId) v.deliveryZoneId = 'ডেলিভারি এরিয়া নির্বাচন করুন';
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const order = await createOrder.mutateAsync({
        customerName: contact.customerName.trim(),
        phone: contact.phone.trim(),
        address: contact.address.trim(),
        note: contact.note.trim() || undefined,
        deliveryZoneId: zoneId,
        items: lines.map(({ productId, colorName, quantity }) => ({ productId, colorName, quantity })),
      });
      try {
        const { note: _note, ...persist } = contact;
        localStorage.setItem(FORM_KEY, JSON.stringify(persist));
      } catch {
        /* ignore */
      }
      onSuccess(order);
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
    }
  };

  const err = (k: string) =>
    errors[k] ? (
      <span className="field__error" id={`err-${k}`}>
        {errors[k]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor="co-name">
          আপনার নাম *
        </label>
        <input
          id="co-name"
          className="input"
          value={contact.customerName}
          onChange={update('customerName')}
          placeholder="যেমন: মো: আরিফুল ইসলাম"
          autoComplete="name"
          aria-invalid={!!errors.customerName}
          aria-describedby={errors.customerName ? 'err-customerName' : undefined}
        />
        {err('customerName')}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="co-phone">
          মোবাইল নম্বর *
        </label>
        <input
          id="co-phone"
          className="input"
          type="tel"
          inputMode="tel"
          value={contact.phone}
          onChange={update('phone')}
          placeholder="01712345678"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'err-phone' : undefined}
        />
        {err('phone')}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="co-address">
          সম্পূর্ণ ডেলিভারি ঠিকানা *
        </label>
        <textarea
          id="co-address"
          className="textarea"
          rows={2}
          value={contact.address}
          onChange={update('address')}
          placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা ও জেলা"
          autoComplete="street-address"
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? 'err-address' : undefined}
        />
        {err('address')}
      </div>

      <fieldset className={styles.zones}>
        <legend className="field__label">ডেলিভারি এরিয়া *</legend>
        <div className={styles.zoneGrid}>
          {zonesLoading
            ? [0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 52 }} />)
            : zones.map((z) => (
                <label key={z.id} className={cx(styles.zone, z.id === zoneId && styles.zoneActive)}>
                  <input type="radio" name="zone" value={z.id} checked={z.id === zoneId} onChange={() => setZoneId(z.id)} />
                  <span>{z.name}</span>
                  <strong>{taka(z.fee)}</strong>
                </label>
              ))}
        </div>
        {err('deliveryZoneId')}
      </fieldset>

      <div className="field">
        <label className="field__label" htmlFor="co-note">
          বিশেষ নির্দেশনা <span className="field__hint">(ঐচ্ছিক)</span>
        </label>
        <input
          id="co-note"
          className="input"
          value={contact.note}
          onChange={update('note')}
          placeholder="যেমন: বিকেল ৫টার পর ডেলিভারি দিন"
        />
      </div>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span>পণ্যের দাম</span>
          <span>{taka(subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>ডেলিভারি চার্জ</span>
          <span>{taka(deliveryFee)}</span>
        </div>
        <div className={cx(styles.row, styles.total)}>
          <span>সর্বমোট</span>
          <span>{taka(total)}</span>
        </div>
      </div>

      <div className={styles.cod}>
        <Icon name="shield" size={20} />
        <span>
          <strong>ক্যাশ অন ডেলিভারি:</strong> পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করবেন। কোনো অগ্রিম পেমেন্ট লাগবে না।
        </span>
      </div>

      {createOrder.isError && !(createOrder.error instanceof ApiError && createOrder.error.details) && (
        <div className={styles.alert} role="alert">
          <Icon name="alert" size={18} />
          {createOrder.error.message}
        </div>
      )}

      <button type="submit" className="btn btn--lime btn--lg btn--block" disabled={createOrder.isPending || lines.length === 0}>
        {createOrder.isPending ? <span className="spinner" /> : <Icon name="check" />}
        {submitLabel} ({taka(total)})
      </button>
    </form>
  );
}
