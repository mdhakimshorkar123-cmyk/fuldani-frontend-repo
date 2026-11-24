import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import styles from './Footer.module.css';

const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '01700000000';
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '8801700000000';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo tone="light" />
          <p>
            ফুল যা কখনো মলিন হয় না। হাতে তৈরি প্রিমিয়াম আর্টিফিশিয়াল ফুল, ইনডোর প্ল্যান্ট ও সিরামিক ফুলদানি — সারা দেশে ক্যাশ অন
            ডেলিভারি।
          </p>
          <a className={styles.whatsapp} href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={18} />
            WhatsApp এ অর্ডার করুন
          </a>
        </div>

        <div>
          <h3 className={styles.heading}>শপ</h3>
          <ul className={styles.list}>
            <li><Link href="/#shop">সব কালেকশন</Link></li>
            <li><Link href="/?category=silk-flower#shop">প্রিমিয়াম ফুল সেট</Link></li>
            <li><Link href="/?category=indoor-plant#shop">ইনডোর প্ল্যান্টস</Link></li>
            <li><Link href="/?category=floor-vase#shop">লাক্সারি ফুলদানি</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.heading}>সহায়তা</h3>
          <ul className={styles.list}>
            <li><Link href="/track">অর্ডার ট্র্যাক করুন</Link></li>
            <li><Link href="/cart">শপিং কার্ট</Link></li>
            <li><Link href="/#about">ডেলিভারি ও রিটার্ন</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.heading}>যোগাযোগ</h3>
          <ul className={styles.list}>
            <li>
              <a href={`tel:${PHONE}`} className={styles.contact}>
                <Icon name="phone" size={16} /> {PHONE}
              </a>
            </li>
            <li>
              <span className={styles.contact}>
                <Icon name="clock" size={16} /> সকাল ১০টা – রাত ১০টা
              </span>
            </li>
            <li>
              <span className={styles.contact}>
                <Icon name="pin" size={16} /> ঢাকা, বাংলাদেশ
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} স্বপ্ন ফুলদানি (Shopno Fuldani). সর্বস্বত্ব সংরক্ষিত।</span>
        <span className={styles.pay}>
          <Icon name="card" size={16} /> ক্যাশ অন ডেলিভারি
        </span>
      </div>
    </footer>
  );
}
