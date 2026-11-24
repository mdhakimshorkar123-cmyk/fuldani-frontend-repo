import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './AboutSection.module.css';

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'sparkle', title: 'চিরসতেজ সৌন্দর্য', text: 'পানি, রোদ বা যত্ন ছাড়াই বছরের পর বছর নতুনের মতো থাকে।' },
  { icon: 'heart', title: 'হাতে তৈরি', text: 'দক্ষ কারিগরদের হাতে প্রতিটি অ্যারেঞ্জমেন্ট আলাদা যত্নে সাজানো।' },
  { icon: 'truck', title: 'সারা দেশে ডেলিভারি', text: 'ঢাকায় ১–২ দিন, ঢাকার বাইরে ২–৪ দিনে নিরাপদ প্যাকেজিংয়ে।' },
  { icon: 'rotate', title: '৭ দিনের রিটার্ন', text: 'পণ্যে সমস্যা থাকলে ৭ দিনের মধ্যে সহজ রিটার্ন বা এক্সচেঞ্জ।' },
];

export function AboutSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.story}>
          <span className={styles.kicker}>আমাদের গল্প</span>
          <h2 className={styles.title}>
            প্রতিটি ফুলদানি, <em>একটি গল্প</em>
          </h2>
          <p>
            স্বপ্ন ফুলদানি শুরু হয়েছিল একটি সহজ ভাবনা থেকে — ঘরের সৌন্দর্য যেন কখনো মলিন না হয়। আমরা বেছে নিই সেরা মানের সিল্ক ও
            রিয়েল-টাচ উপকরণ, আর হাতে সাজাই প্রতিটি অ্যারেঞ্জমেন্ট।
          </p>
          <p>ড্রয়িংরুম, অফিস রিসেপশন, ওয়েডিং স্টেজ কিংবা প্রিয়জনকে উপহার — সব জায়গার জন্যই আছে মানানসই কালেকশন।</p>
        </div>

        <ul className={styles.features}>
          {FEATURES.map((f) => (
            <li key={f.title} className={styles.feature}>
              <span className={styles.icon}>
                <Icon name={f.icon} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
