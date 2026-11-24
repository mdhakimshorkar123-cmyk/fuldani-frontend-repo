'use client';

import { use } from 'react';
import { useAdminProduct } from '@/lib/admin-queries';
import { ProductForm } from '@/components/admin/ProductForm';
import { Card, EmptyState } from '@/components/admin/bits';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isPending, isError } = useAdminProduct(id);

  if (isPending) return <div className="skeleton" style={{ height: 480 }} />;
  if (isError || !data)
    return (
      <Card>
        <EmptyState icon="alert">Product not found.</EmptyState>
      </Card>
    );
  return <ProductForm key={data.id} product={data} />;
}
