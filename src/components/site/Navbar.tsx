'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart, useWishlist } from '@/lib/cart';
import { useLang, type DictKey } from '@/lib/i18n';
import { search } from '@/lib/ui';
import { cx, toBn } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import styles from './Navbar.module.css';

const LINKS: { href: string; key: DictKey }[] = [
  { href: '/', key: 'navHome' },
  { href: '/#shop', key: 'navShop' },
  { href: '/#collection', key: 'navCollection' },
  { href: '/#about', key: 'navAbout' },
  { href: '/track', key: 'navTrack' },
  { href: '/#contact', key: 'navContact' },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { count } = useCart();
  const wishCount = useWishlist().length;
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setDrawerOpen(false), [pathname]);

  // Close the mobile drawer if the viewport grows to desktop width.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const solid = !isHome || scrolled || drawerOpen;
  const fmt = (n: number) => (lang === 'bn' ? toBn(n) : String(n));

  const langSwitch = (
    <div className={styles.lang} role="group" aria-label="ভাষা / Language">
      {(['bn', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          className={cx(styles.langBtn, lang === l && styles.langActive)}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
        >
          {l === 'bn' ? 'বাং' : 'EN'}
        </button>
      ))}
    </div>
  );

  return (
    <header className={cx(styles.nav, solid ? styles.solid : styles.transparent)}>
      <div className={cx('container', styles.inner)}>
        <Link href="/" className={styles.logo} aria-label="স্বপ্ন ফুলদানি — হোম">
          <Logo tone={solid ? 'dark' : 'light'} />
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(styles.link, pathname === l.href && styles.linkActive)}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} onClick={search.open} aria-label={t('search')}>
            <Icon name="search" />
          </button>
          <Link href="/cart#wishlist" className={cx(styles.iconBtn, styles.hideSm)} aria-label={t('wishlist')}>
            <Icon name="heart" />
            {wishCount > 0 && <span className={styles.badge}>{fmt(wishCount)}</span>}
          </Link>
          <Link href="/cart" className={styles.iconBtn} aria-label={`${t('cart')} (${count})`}>
            <Icon name="bag" />
            {count > 0 && <span className={styles.badge}>{fmt(count)}</span>}
          </Link>
          <div className={styles.hideSm}>{langSwitch}</div>
          <button
            type="button"
            className={cx(styles.hamburger, drawerOpen && styles.hamburgerOpen)}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={t('menu')}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-drawer" className={cx(styles.drawer, drawerOpen && styles.drawerOpen)} hidden={!drawerOpen}>
        <nav className={styles.drawerNav}>
          {LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className={styles.drawerLink} style={{ animationDelay: `${i * 40}ms` }}>
              {t(l.key)}
              <Icon name="chevronRight" size={18} />
            </Link>
          ))}
        </nav>
        <div className={styles.drawerFoot}>{langSwitch}</div>
      </div>
    </header>
  );
}
