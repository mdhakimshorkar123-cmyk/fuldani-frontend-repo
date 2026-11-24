'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useDashboardStats, useLogout } from '@/lib/admin-queries';
import { cx } from '@/lib/format';
import type { AdminUser } from '@/lib/types';
import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './AdminShell.module.css';

const NAV: { section: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    section: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: 'grid' }],
  },
  {
    section: 'Sales',
    items: [{ href: '/admin/orders', label: 'Orders', icon: 'receipt' }],
  },
  {
    section: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: 'box' },
      { href: '/admin/categories', label: 'Categories', icon: 'tag' },
    ],
  },
  {
    section: 'Storefront',
    items: [
      { href: '/admin/showcases', label: 'Showcases', icon: 'image' },
      { href: '/admin/delivery-zones', label: 'Delivery zones', icon: 'truck' },
    ],
  },
];

export function AdminShell({ user, children }: { user: AdminUser | null; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const { data: stats } = useDashboardStats(14);
  const pending = stats?.kpis.pendingOrders ?? 0;

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  const signOut = async () => {
    await logout.mutateAsync().catch(() => undefined);
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      <aside className={cx(styles.sidebar, open && styles.sidebarOpen)}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark}>স্ব</span>
          <span>
            <strong>স্বপ্ন ফুলদানি</strong>
            <small>Admin console</small>
          </span>
        </Link>

        <nav className={styles.nav}>
          {NAV.map((group) => (
            <div key={group.section} className={styles.group}>
              <span className={styles.groupLabel}>{group.section}</span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(styles.navItem, isActive(item.href) && styles.navActive)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {item.href === '/admin/orders' && pending > 0 && <span className={styles.navBadge}>{pending}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <Link href="/" target="_blank" className={styles.navItem}>
            <Icon name="external" size={18} />
            <span>View store</span>
          </Link>
          {user && (
            <div className={styles.user}>
              <span className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</span>
              <span className={styles.userInfo}>
                <strong>{user.name}</strong>
                <small>{user.role.replace('_', ' ').toLowerCase()}</small>
              </span>
              <button className={styles.logout} onClick={signOut} aria-label="Sign out" title="Sign out" disabled={logout.isPending}>
                <Icon name="logout" size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {open && <div className={styles.scrim} onClick={() => setOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <span className={styles.topTitle}>স্বপ্ন ফুলদানি · Admin</span>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
