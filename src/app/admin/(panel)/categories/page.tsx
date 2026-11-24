'use client';

import { ImageCell, ResourceManager } from '@/components/admin/ResourceManager';

export default function CategoriesPage() {
  return (
    <ResourceManager
      resource="categories"
      title="Categories"
      subtitle="Collections shown as tabs on the shop section."
      singular="Category"
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'প্রিমিয়াম ফুল সেট' },
        { name: 'slug', label: 'Slug', type: 'text', placeholder: 'silk-flower', hint: 'Used in URLs (?category=…)' },
        { name: 'image', label: 'Tab image', type: 'image', placeholder: '/flowers-photo/…jpg' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { header: 'Category', cell: (c) => <ImageCell src={c.image} title={c.name} sub={`/${c.slug}`} /> },
        { header: 'Products', cell: (c) => c._count.products, numeric: true },
      ]}
      deleteBlocker={(c) =>
        c._count.products > 0 ? `${c._count.products} products are in this category. They won't be deleted, only unlinked.` : null
      }
    />
  );
}
