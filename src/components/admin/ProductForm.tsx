'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useResourceList, useSaveProduct, type ProductPayload } from '@/lib/admin-queries';
import { ApiError, errorMessage } from '@/lib/api';
import { cx, discountPct, takaEn } from '@/lib/format';
import { toast } from '@/lib/ui';
import type { BadgeType, Product } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, PageHeader } from './bits';
import s from './admin.module.css';
import f from './ProductForm.module.css';

type FormState = Omit<ProductPayload, 'price' | 'comparePrice' | 'stock' | 'rating' | 'reviewCount' | 'sortOrder' | 'slug'> & {
  slug: string;
  price: string;
  comparePrice: string;
  stock: string;
  rating: string;
  reviewCount: string;
  sortOrder: string;
};

const BADGES: { value: BadgeType; label: string; preset: string }[] = [
  { value: 'BESTSELLER', label: 'Bestseller', preset: '★ বেস্টসেলার' },
  { value: 'POPULAR', label: 'Popular', preset: '🔥 জনপ্রিয়' },
  { value: 'NEW', label: 'New', preset: '✦ নতুন কালেকশন' },
  { value: 'OFFER', label: 'Offer', preset: '⚡ বিশেষ অফার' },
];

function toForm(p?: Product): FormState {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    typeLabel: p?.typeLabel ?? '',
    description: p?.description ?? '',
    price: p ? String(p.price) : '',
    comparePrice: p?.comparePrice ? String(p.comparePrice) : '',
    stock: p ? String(p.stock) : '10',
    badgeLabel: p?.badgeLabel ?? '',
    badgeType: p?.badgeType ?? null,
    rating: p ? String(p.rating) : '0',
    reviewCount: p ? String(p.reviewCount) : '0',
    images: p?.images.length ? p.images : [''],
    isActive: p?.isActive ?? true,
    isFeatured: p?.isFeatured ?? false,
    sortOrder: p ? String(p.sortOrder) : '0',
    categoryIds: p?.categories.map((c) => c.id) ?? [],
    colors: p?.colors.map(({ name, hex }) => ({ name, hex })) ?? [],
  };
}

function toPayload(v: FormState): ProductPayload {
  const nullable = (x: string | null) => (x && x.trim() ? x.trim() : null);
  return {
    name: v.name.trim(),
    slug: v.slug.trim() || undefined,
    typeLabel: nullable(v.typeLabel),
    description: nullable(v.description),
    price: Number(v.price),
    comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
    stock: Number(v.stock || 0),
    badgeLabel: v.badgeType ? nullable(v.badgeLabel) : null,
    badgeType: v.badgeType,
    rating: Number(v.rating || 0),
    reviewCount: Number(v.reviewCount || 0),
    images: v.images.map((i) => i.trim()).filter(Boolean),
    isActive: v.isActive,
    isFeatured: v.isFeatured,
    sortOrder: Number(v.sortOrder || 0),
    categoryIds: v.categoryIds,
    colors: v.colors.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), hex: c.hex })),
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const save = useSaveProduct();
  const { data: categories = [] } = useResourceList('categories');
  const [v, setV] = useState<FormState>(() => toForm(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!product;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const text = (key: keyof FormState) => (e: { target: { value: string } }) => set(key, e.target.value as never);

  const validate = () => {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e.name = 'Name is required';
    if (!v.price || Number(v.price) < 0) e.price = 'Enter a valid price';
    if (v.comparePrice && Number(v.comparePrice) <= Number(v.price)) e.comparePrice = 'Must be greater than price';
    if (!v.images.some((i) => i.trim())) e.images = 'Add at least one image';
    v.colors.forEach((c, i) => {
      if (!/^#[0-9a-fA-F]{6}$/.test(c.hex)) e[`colors.${i}.hex`] = 'Invalid hex';
    });
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    try {
      const saved = await save.mutateAsync({ id: product?.id, data: toPayload(v) });
      toast.success(isEdit ? 'Product updated' : 'Product created');
      if (!isEdit) router.replace(`/admin/products/${saved.id}`);
      else setV(toForm(saved));
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
      toast.error('Save failed', errorMessage(err));
    }
  };

  const err = (k: string) => errors[k] && <span className="field__error">{errors[k]}</span>;
  const off = discountPct(Number(v.price) || 0, Number(v.comparePrice) || null);

  return (
    <form className={s.page} onSubmit={submit} noValidate>
      <PageHeader
        back={{ href: '/admin/products', label: 'Products' }}
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={isEdit ? product.name : 'Add a new item to the catalogue'}
        actions={
          <>
            {isEdit && (
              <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="btn btn--outline">
                <Icon name="external" /> View
              </a>
            )}
            <button type="submit" className="btn btn--lime" disabled={save.isPending}>
              {save.isPending ? <span className="spinner" /> : <Icon name="check" />}
              {isEdit ? 'Save changes' : 'Create product'}
            </button>
          </>
        }
      />

      <div className={s.grid2}>
        <div className={s.stack}>
          <Card title="Basic information">
            <div className={s.formGrid}>
              <div className={cx('field', s.full)}>
                <label className="field__label">Name *</label>
                <input className="input" value={v.name} onChange={text('name')} aria-invalid={!!errors.name} placeholder="রয়্যাল চেরি ব্লসম ও সিরামিক ভেস" />
                {err('name')}
              </div>
              <div className="field">
                <label className="field__label">URL slug</label>
                <input className="input" value={v.slug} onChange={text('slug')} placeholder="auto-generated if empty" />
                {err('slug')}
              </div>
              <div className="field">
                <label className="field__label">Type label</label>
                <input className="input" value={v.typeLabel ?? ''} onChange={text('typeLabel')} placeholder="🌸 প্রিমিয়াম সিল্ক ফুল সেট" />
              </div>
              <div className={cx('field', s.full)}>
                <label className="field__label">Description</label>
                <textarea className="textarea" rows={5} value={v.description ?? ''} onChange={text('description')} />
              </div>
            </div>
          </Card>

          <Card title="Images" sub="First image is the main photo. Use /flowers-photo/… paths or full https:// URLs.">
            <div className={f.images}>
              {v.images.map((url, i) => (
                <div key={i} className={f.imageRow}>
                  <span className={f.preview}>
                    {url.trim() ? <SmartImage src={url.trim()} alt="" fill sizes="56px" style={{ objectFit: 'cover' }} /> : <Icon name="image" />}
                  </span>
                  <input
                    className="input"
                    value={url}
                    onChange={(e) => set('images', v.images.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder="/flowers-photo/my-photo.jpg"
                  />
                  {i > 0 && (
                    <button type="button" className={s.iconBtn} title="Make primary" onClick={() => set('images', [url, ...v.images.filter((_, j) => j !== i)])}>
                      <Icon name="star" size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={cx(s.iconBtn, s.iconBtnDanger)}
                    onClick={() => set('images', v.images.length > 1 ? v.images.filter((_, j) => j !== i) : [''])}
                    aria-label="Remove image"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
              {err('images')}
              {v.images.length < 12 && (
                <button type="button" className="btn btn--outline btn--sm" onClick={() => set('images', [...v.images, ''])}>
                  <Icon name="plus" /> Add image
                </button>
              )}
            </div>
          </Card>

          <Card title="Colors" sub="Shown as swatches; customers pick one when ordering.">
            <div className={f.colors}>
              {v.colors.map((c, i) => (
                <div key={i} className={f.colorRow}>
                  <input
                    type="color"
                    className={f.colorPicker}
                    value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#000000'}
                    onChange={(e) => set('colors', v.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
                    aria-label="Color"
                  />
                  <input
                    className="input"
                    value={c.hex}
                    onChange={(e) => set('colors', v.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
                    style={{ maxWidth: 120 }}
                    aria-invalid={!!errors[`colors.${i}.hex`]}
                  />
                  <input
                    className="input"
                    value={c.name}
                    onChange={(e) => set('colors', v.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    placeholder="রঙের নাম (যেমন গোলাপি)"
                  />
                  <button type="button" className={cx(s.iconBtn, s.iconBtnDanger)} onClick={() => set('colors', v.colors.filter((_, j) => j !== i))} aria-label="Remove color">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn--outline btn--sm" onClick={() => set('colors', [...v.colors, { name: '', hex: '#f472b6' }])}>
                <Icon name="plus" /> Add color
              </button>
            </div>
          </Card>
        </div>

        <div className={s.stack}>
          <Card title="Visibility">
            <div style={{ display: 'grid', gap: 12 }}>
              <label className={s.check}>
                <input type="checkbox" checked={v.isActive} onChange={(e) => set('isActive', e.target.checked)} />
                Active — visible in the store
              </label>
              <label className={s.check}>
                <input type="checkbox" checked={v.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
                Featured — shown in the homepage hero
              </label>
              <div className="field">
                <label className="field__label">Sort order</label>
                <input className="input" type="number" value={v.sortOrder} onChange={text('sortOrder')} />
                <span className="field__hint">Lower numbers appear first.</span>
              </div>
            </div>
          </Card>

          <Card title="Pricing & stock">
            <div className={s.formGrid}>
              <div className="field">
                <label className="field__label">Price (৳) *</label>
                <input className="input" type="number" min={0} value={v.price} onChange={text('price')} aria-invalid={!!errors.price} />
                {err('price')}
              </div>
              <div className="field">
                <label className="field__label">Compare-at (৳)</label>
                <input className="input" type="number" min={0} value={v.comparePrice} onChange={text('comparePrice')} aria-invalid={!!errors.comparePrice} />
                {err('comparePrice')}
              </div>
              {off > 0 && (
                <p className={cx(s.full, f.hint)}>
                  Customers save {takaEn(Number(v.comparePrice) - Number(v.price))} ({off}% off)
                </p>
              )}
              <div className={cx('field', s.full)}>
                <label className="field__label">Stock quantity</label>
                <input className="input" type="number" min={0} value={v.stock} onChange={text('stock')} />
              </div>
            </div>
          </Card>

          <Card title="Categories">
            {categories.length === 0 ? (
              <p className={s.muted}>No categories yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {categories.map((c) => (
                  <label key={c.id} className={s.check}>
                    <input
                      type="checkbox"
                      checked={v.categoryIds.includes(c.id)}
                      onChange={(e) =>
                        set('categoryIds', e.target.checked ? [...v.categoryIds, c.id] : v.categoryIds.filter((x) => x !== c.id))
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card title="Badge & social proof">
            <div className={s.formGrid}>
              <div className="field">
                <label className="field__label">Badge</label>
                <select
                  className="select"
                  value={v.badgeType ?? ''}
                  onChange={(e) => {
                    const type = (e.target.value || null) as BadgeType | null;
                    const preset = BADGES.find((b) => b.value === type)?.preset ?? '';
                    setV((prev) => ({ ...prev, badgeType: type, badgeLabel: prev.badgeLabel || preset }));
                  }}
                >
                  <option value="">None</option>
                  {BADGES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label">Badge text</label>
                <input className="input" value={v.badgeLabel ?? ''} onChange={text('badgeLabel')} disabled={!v.badgeType} />
              </div>
              <div className="field">
                <label className="field__label">Rating (0–5)</label>
                <input className="input" type="number" min={0} max={5} step={0.1} value={v.rating} onChange={text('rating')} />
              </div>
              <div className="field">
                <label className="field__label">Review count</label>
                <input className="input" type="number" min={0} value={v.reviewCount} onChange={text('reviewCount')} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
