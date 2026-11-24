'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storefront } from '@/lib/queries';
import { useLang } from '@/lib/i18n';
import { cx, taka } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import styles from './Hero.module.css';

type Line = (string | { accent: string })[];
const SLIDES: Record<'bn' | 'en', [Line, Line][]> = {
  bn: [
    [['ফুল', 'যা', 'কখনো'], [{ accent: 'মলিন' }, 'হয়', 'না']],
    [['হাতে', 'তৈরি'], [{ accent: 'প্রিমিয়াম' }, 'শিল্প']],
    [['সৌন্দর্য', 'যা'], [{ accent: 'চিরন্তন' }, 'থাকে']],
    [['প্রতিটি', 'ফুলদানি'], ['একটি', { accent: 'গল্প' }]],
  ],
  en: [
    [['Flowers', 'that', 'never'], [{ accent: 'fade' }, 'away']],
    [['Handcrafted'], [{ accent: 'premium' }, 'art']],
    [['Beauty', 'that'], ['lasts', { accent: 'forever' }]],
    [['Every', 'vase'], ['tells', 'a', { accent: 'story' }]],
  ],
};

const ROTATE_MS = 4200;

export function Hero() {
  const { lang, t } = useLang();
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: featured } = useQuery(storefront.featured());
  const { data: showcases = [] } = useQuery(storefront.showcases());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.bn.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Respect reduced-motion & save-data: don't autoplay the background video.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || conn?.saveData) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, []);

  const toggleVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.media} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.webp"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className={styles.tint} />
        <div className={styles.gradient} />
        <div className={styles.noise} />
      </div>

      <div className={cx('container', styles.grid)} id="main-content">
        <div className={styles.left}>
          <span className={styles.eyebrow}>
            <Icon name="sparkle" size={14} /> {lang === 'bn' ? 'হ্যান্ডক্রাফটেড কালেকশন ২০২৬' : 'Handcrafted collection 2026'}
          </span>

          <h1 className={styles.title} aria-live="polite">
            {SLIDES[lang].map((lines, i) => (
              <span key={`${lang}-${i}`} className={cx(styles.slide, i === slide && styles.slideActive)} aria-hidden={i !== slide}>
                {lines.map((line, li) => (
                  <span key={li} className={styles.line}>
                    {line.map((w, wi) => (
                      <span key={wi} className={styles.wordWrap}>
                        <span className={styles.word} style={{ transitionDelay: `${(li * 3 + wi) * 70}ms` }}>
                          {typeof w === 'string' ? w : <em className={styles.accent}>{w.accent}</em>}
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className={styles.paragraph}>{t('subtitle')}</p>

          <div className={styles.ctas}>
            <Link href="#shop" className="btn btn--lime btn--lg">
              {t('btnPrimary')}
              <Icon name="arrowRight" />
            </Link>
            <Link href="#collection" className={cx('btn btn--lg', styles.ghost)}>
              {t('btnGhost')}
            </Link>
          </div>
        </div>

        <div className={styles.right}>
          {featured && (
            <Link href={`/products/${featured.slug}`} className={styles.card}>
              <span className={styles.cardThumb}>
                <SmartImage src={featured.images[0]} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} priority />
              </span>
              <span className={styles.cardInfo}>
                <span className={styles.stock}>
                  <span className={styles.dot} /> {featured.stock > 0 ? t('inStock') : t('outOfStock')}
                </span>
                <span className={styles.cardTitle}>{featured.name}</span>
                <span className={styles.cardPrice}>
                  {taka(featured.price, lang)} {t('from')}
                </span>
              </span>
              <span className={styles.cardArrow}>
                <Icon name="arrowRight" size={18} />
              </span>
            </Link>
          )}

          <ul className={styles.chips}>
            <li>
              <Icon name="card" size={16} /> {t('trustCod')}
            </li>
            <li>
              <Icon name="truck" size={16} /> {t('trustDelivery')}
            </li>
            <li>
              <Icon name="rotate" size={16} /> {t('trustReturn')}
            </li>
          </ul>
        </div>
      </div>

      <button type="button" className={styles.videoToggle} onClick={toggleVideo} aria-label={playing ? t('pause') : t('play')}>
        <Icon name={playing ? 'pause' : 'play'} size={14} />
        <span>{playing ? t('pause') : t('play')}</span>
      </button>

      {showcases.length > 0 && (
        <div className={styles.marquee} id="collection" aria-label="যেখানে ব্যবহার করবেন">
          <div className={styles.track}>
            {[...showcases, ...showcases].map((s, i) => (
              <div key={`${s.id}-${i}`} className={styles.event} aria-hidden={i >= showcases.length}>
                <SmartImage src={s.image} alt={s.title} width={52} height={52} className={styles.eventThumb} />
                <span className={styles.eventText}>
                  <span className={styles.eventTitle}>{s.title}</span>
                  <span className={styles.eventTag}>{s.tag}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
