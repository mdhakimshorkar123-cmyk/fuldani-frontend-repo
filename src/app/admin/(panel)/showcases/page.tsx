'use client';

import { ImageCell, ResourceManager } from '@/components/admin/ResourceManager';

export default function ShowcasesPage() {
  return (
    <ResourceManager
      resource="showcases"
      title="Showcases"
      subtitle="“Where to use” event cards in the homepage hero marquee."
      singular="Showcase"
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'বিয়ে ও ওয়েডিং স্টেজ' },
        { name: 'tag', label: 'Tag', type: 'text', required: true, placeholder: 'ওয়েডিং ডেকোরেশন' },
        { name: 'image', label: 'Image URL', type: 'image', required: true, placeholder: 'https://images.unsplash.com/…' },
      ]}
      columns={[{ header: 'Showcase', cell: (x) => <ImageCell src={x.image} title={x.title} sub={x.tag} /> }]}
    />
  );
}
