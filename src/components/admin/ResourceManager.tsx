'use client';

import { useState, type ReactNode } from 'react';
import { useDeleteResource, useResourceList, useSaveResource, type ResourceTypes } from '@/lib/admin-queries';
import { ApiError, errorMessage } from '@/lib/api';
import { cx } from '@/lib/format';
import { toast } from '@/lib/ui';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SmartImage } from '@/components/ui/SmartImage';
import { Card, ConfirmModal, EmptyState, PageHeader, Switch, TableSkeleton } from './bits';
import s from './admin.module.css';

type Resource = keyof ResourceTypes;

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'image';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  full?: boolean;
}

export interface ColumnDef<T> {
  header: string;
  cell: (row: T) => ReactNode;
  numeric?: boolean;
}

interface Props<R extends Resource> {
  resource: R;
  title: string;
  subtitle: string;
  singular: string;
  fields: FieldDef[];
  columns: ColumnDef<ResourceTypes[R]>[];
  /** Explain why something can't be deleted, or null if deletable. */
  deleteBlocker?: (row: ResourceTypes[R]) => string | null;
}

type Row = { id: string; isActive: boolean; sortOrder: number } & Record<string, unknown>;

export function ResourceManager<R extends Resource>({ resource, title, subtitle, singular, fields, columns, deleteBlocker }: Props<R>) {
  const { data, isPending, isError, refetch } = useResourceList(resource);
  const save = useSaveResource(resource);
  const del = useDeleteResource(resource);

  const [editing, setEditing] = useState<{ id?: string; values: Record<string, string> } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<ResourceTypes[R] | null>(null);

  const openForm = (row?: ResourceTypes[R]) => {
    const r = row as unknown as Row | undefined;
    const values: Record<string, string> = { sortOrder: String(r?.sortOrder ?? (data?.length ?? 0)) };
    for (const f of fields) values[f.name] = r?.[f.name] == null ? '' : String(r[f.name]);
    setErrors({});
    setEditing({ id: r?.id, values });
  };

  const submit = async () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    for (const f of fields) if (f.required && !editing.values[f.name]?.trim()) e[f.name] = `${f.label} is required`;
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload: Record<string, unknown> = { sortOrder: Number(editing.values.sortOrder || 0) };
    for (const f of fields) {
      const raw = editing.values[f.name]?.trim() ?? '';
      payload[f.name] = f.type === 'number' ? Number(raw || 0) : raw === '' && !f.required ? null : raw;
    }
    try {
      await save.mutateAsync({ id: editing.id, data: payload });
      toast.success(`${singular} ${editing.id ? 'updated' : 'created'}`);
      setEditing(null);
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
      toast.error('Save failed', errorMessage(err));
    }
  };

  const toggleActive = async (row: ResourceTypes[R]) => {
    const r = row as unknown as Row;
    try {
      await save.mutateAsync({ id: r.id, data: { isActive: !r.isActive } });
    } catch (err) {
      toast.error('Update failed', errorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync((toDelete as unknown as Row).id);
      toast.success(`${singular} deleted`);
      setToDelete(null);
    } catch (err) {
      toast.error('Delete failed', errorMessage(err));
    }
  };

  const blocker = toDelete && deleteBlocker ? deleteBlocker(toDelete) : null;

  return (
    <div className={s.page}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button className="btn btn--lime" onClick={() => openForm()}>
            <Icon name="plus" /> New {singular.toLowerCase()}
          </button>
        }
      />

      <Card flush>
        {isPending ? (
          <TableSkeleton cols={columns.length + 2} />
        ) : isError ? (
          <EmptyState icon="alert">
            Failed to load.{' '}
            <button className="btn btn--sm btn--outline" onClick={() => refetch()}>
              Retry
            </button>
          </EmptyState>
        ) : data.length === 0 ? (
          <EmptyState>No {title.toLowerCase()} yet</EmptyState>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.header} className={c.numeric ? s.num : undefined}>
                      {c.header}
                    </th>
                  ))}
                  <th className={s.num}>Order</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const r = row as unknown as Row;
                  return (
                    <tr key={r.id}>
                      {columns.map((c) => (
                        <td key={c.header} className={c.numeric ? s.num : undefined}>
                          {c.cell(row)}
                        </td>
                      ))}
                      <td className={s.num}>{r.sortOrder}</td>
                      <td>
                        <Switch checked={r.isActive} onChange={() => toggleActive(row)} label="Active" disabled={save.isPending} />
                      </td>
                      <td>
                        <div className={s.rowActions}>
                          <button className={s.iconBtn} onClick={() => openForm(row)} aria-label="Edit">
                            <Icon name="edit" size={16} />
                          </button>
                          <button className={cx(s.iconBtn, s.iconBtnDanger)} onClick={() => setToDelete(row)} aria-label="Delete">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`${editing?.id ? 'Edit' : 'New'} ${singular.toLowerCase()}`}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn" onClick={submit} disabled={save.isPending}>
              {save.isPending && <span className="spinner" />} Save
            </button>
          </>
        }
      >
        {editing && (
          <form
            className={s.formGrid}
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {fields.map((f) => {
              const value = editing.values[f.name] ?? '';
              const onChange = (e: { target: { value: string } }) =>
                setEditing({ ...editing, values: { ...editing.values, [f.name]: e.target.value } });
              return (
                <div key={f.name} className={cx('field', (f.full || f.type === 'textarea' || f.type === 'image') && s.full)}>
                  <label className="field__label" htmlFor={`f-${f.name}`}>
                    {f.label}
                    {f.required && ' *'}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea id={`f-${f.name}`} className="textarea" value={value} onChange={onChange} placeholder={f.placeholder} />
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {f.type === 'image' && (
                        <span style={{ position: 'relative', width: 46, height: 46, flex: 'none', borderRadius: 8, overflow: 'hidden', background: 'var(--sand)' }}>
                          {value && <SmartImage src={value} alt="" fill sizes="46px" style={{ objectFit: 'cover' }} />}
                        </span>
                      )}
                      <input
                        id={`f-${f.name}`}
                        className="input"
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={onChange}
                        placeholder={f.placeholder}
                        aria-invalid={!!errors[f.name]}
                      />
                    </div>
                  )}
                  {f.hint && <span className="field__hint">{f.hint}</span>}
                  {errors[f.name] && <span className="field__error">{errors[f.name]}</span>}
                </div>
              );
            })}
            <div className="field">
              <label className="field__label" htmlFor="f-sortOrder">
                Sort order
              </label>
              <input
                id="f-sortOrder"
                className="input"
                type="number"
                value={editing.values.sortOrder ?? '0'}
                onChange={(e) => setEditing({ ...editing, values: { ...editing.values, sortOrder: e.target.value } })}
              />
            </div>
            <button type="submit" hidden />
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title={`Delete ${singular.toLowerCase()}?`}
        message={blocker ?? 'This cannot be undone.'}
        confirmLabel={blocker ? 'Delete anyway' : 'Delete'}
        loading={del.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

export function ImageCell({ src, title, sub }: { src: string | null; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className={s.cellMedia}>
      <SmartImage src={src} alt="" width={44} height={44} className={s.thumb} />
      <div className={s.cellText}>
        <span>{title}</span>
        {sub && <span className={s.muted}>{sub}</span>}
      </div>
    </div>
  );
}
