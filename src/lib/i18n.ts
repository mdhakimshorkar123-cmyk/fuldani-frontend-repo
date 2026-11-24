'use client';

import { useCallback, useEffect } from 'react';
import { createStore, useStore } from './store';

export type Lang = 'bn' | 'en';

const dict = {
  navHome: { bn: 'হোম', en: 'Home' },
  navShop: { bn: 'শপ', en: 'Shop' },
  navCollection: { bn: 'কালেকশন', en: 'Collection' },
  navAbout: { bn: 'আমাদের সম্পর্কে', en: 'About' },
  navContact: { bn: 'যোগাযোগ', en: 'Contact' },
  navTrack: { bn: 'অর্ডার ট্র্যাক', en: 'Track order' },
  menu: { bn: 'মেনু', en: 'Menu' },
  search: { bn: 'সার্চ করুন', en: 'Search' },
  wishlist: { bn: 'পছন্দের তালিকা', en: 'Wishlist' },
  cart: { bn: 'শপিং কার্ট', en: 'Shopping cart' },
  subtitle: {
    bn: 'হাতে তৈরি প্রিমিয়াম আর্টিফিশিয়াল ফুল ও ফুলদানি। সারা দেশে ক্যাশ অন ডেলিভারি।',
    en: 'Handcrafted premium artificial flowers & vases. Cash on delivery nationwide.',
  },
  btnPrimary: { bn: 'এখনই কিনুন', en: 'Shop now' },
  btnGhost: { bn: 'কালেকশন দেখুন', en: 'View collection' },
  inStock: { bn: 'স্টকে আছে', en: 'In stock' },
  outOfStock: { bn: 'স্টক শেষ', en: 'Out of stock' },
  from: { bn: 'থেকে', en: 'onwards' },
  trustCod: { bn: 'ক্যাশ অন ডেলিভারি', en: 'Cash on delivery' },
  trustDelivery: { bn: 'সারা দেশে ডেলিভারি', en: 'Nationwide delivery' },
  trustReturn: { bn: '৭ দিনের রিটার্ন', en: '7-day returns' },
  pause: { bn: 'থামান', en: 'Pause' },
  play: { bn: 'চালান', en: 'Play' },
  addToCart: { bn: 'কার্টে যোগ করুন', en: 'Add to cart' },
  buyNow: { bn: 'এখনই কিনুন', en: 'Buy now' },
  addedToCart: { bn: 'কার্টে যুক্ত হয়েছে!', en: 'Added to cart!' },
  viewCart: { bn: 'কার্ট দেখুন', en: 'View cart' },
} as const;

export type DictKey = keyof typeof dict;

const langStore = createStore<Lang>('bn', 'sf_lang');

export function useLang() {
  const lang = useStore(langStore, 'bn');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: DictKey) => dict[key][lang], [lang]);
  return { lang, setLang: (l: Lang) => langStore.set(l), t };
}
