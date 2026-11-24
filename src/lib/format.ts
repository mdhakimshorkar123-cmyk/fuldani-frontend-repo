import type { OrderStatus } from './types';

const bnNumber = new Intl.NumberFormat('bn-BD');
const enNumber = new Intl.NumberFormat('en-IN');

export const toBn = (n: number) => bnNumber.format(n);

export const taka = (n: number, lang: 'bn' | 'en' = 'bn') =>
  `৳${lang === 'bn' ? bnNumber.format(n) : enNumber.format(n)}`;

/** Admin-facing money: compact ASCII digits are easier to scan in tables. */
export const takaEn = (n: number) => `৳${enNumber.format(n)}`;

export const discountPct = (price: number, compare: number | null) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
    timeZone: 'Asia/Dhaka',
  }).format(new Date(iso));
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const STATUS_META: Record<OrderStatus, { label: string; bn: string; tone: string }> = {
  PENDING: { label: 'Pending', bn: 'অপেক্ষমাণ', tone: 'amber' },
  CONFIRMED: { label: 'Confirmed', bn: 'কনফার্মড', tone: 'blue' },
  PROCESSING: { label: 'Processing', bn: 'প্রসেসিং', tone: 'violet' },
  SHIPPED: { label: 'Shipped', bn: 'পাঠানো হয়েছে', tone: 'cyan' },
  DELIVERED: { label: 'Delivered', bn: 'ডেলিভারড', tone: 'green' },
  CANCELLED: { label: 'Cancelled', bn: 'বাতিল', tone: 'red' },
  RETURNED: { label: 'Returned', bn: 'রিটার্নড', tone: 'gray' },
};

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
