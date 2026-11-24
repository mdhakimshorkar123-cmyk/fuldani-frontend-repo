import type { Metadata, Viewport } from 'next';
import { Anek_Bangla, Hind_Siliguri, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const hind = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

const anek = Anek_Bangla({
  subsets: ['bengali', 'latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-anek',
  display: 'swap',
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'স্বপ্ন ফুলদানি — প্রিমিয়াম আর্টিফিশিয়াল ফুল ও ফুলদানি | Shopno Fuldani',
    template: '%s | স্বপ্ন ফুলদানি',
  },
  description:
    'ফুল যা কখনো মলিন হয় না। হাতে তৈরি প্রিমিয়াম আর্টিফিশিয়াল ফুল ও সিরামিক ফুলদানি কালেকশন। সারা দেশে ক্যাশ অন ডেলিভারি।',
  keywords: ['স্বপ্ন ফুলদানি', 'আর্টিফিশিয়াল ফুল', 'ফুলদানি', 'artificial flowers bangladesh', 'home decor', 'flower vase'],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: 'স্বপ্ন ফুলদানি',
    title: 'স্বপ্ন ফুলদানি — ফুল যা কখনো মলিন হয় না',
    description: 'হাতে তৈরি প্রিমিয়াম আর্টিফিশিয়াল ফুল ও ফুলদানি। সারা দেশে ক্যাশ অন ডেলিভারি।',
    images: ['/images/hero-poster.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0f2418',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hind.variable} ${anek.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
