'use client';

import { ResourceManager } from '@/components/admin/ResourceManager';
import { takaEn } from '@/lib/format';

export default function DeliveryZonesPage() {
  return (
    <ResourceManager
      resource="delivery-zones"
      title="Delivery zones"
      subtitle="Shipping options and fees customers choose at checkout."
      singular="Zone"
      fields={[
        { name: 'name', label: 'Zone name', type: 'text', required: true, placeholder: 'ঢাকার ভিতরে' },
        { name: 'fee', label: 'Delivery fee (৳)', type: 'number', required: true, placeholder: '80' },
      ]}
      columns={[
        { header: 'Zone', cell: (z) => <strong>{z.name}</strong> },
        { header: 'Fee', cell: (z) => takaEn(z.fee), numeric: true },
        { header: 'Orders', cell: (z) => z._count.orders, numeric: true },
      ]}
      deleteBlocker={(z) =>
        z._count.orders > 0 ? `${z._count.orders} orders used this zone. Consider deactivating it instead — past orders keep the zone name.` : null
      }
    />
  );
}
