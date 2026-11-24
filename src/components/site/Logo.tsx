'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Logo.module.css';

/** Uses /logo.png when present, otherwise a typographic wordmark. */
export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The image may fail before hydration, when onError isn't attached yet.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img ref={imgRef} src="/logo.png" alt="স্বপ্ন ফুলদানি" className={styles.img} onError={() => setFailed(true)} />
    );
  }

  return (
    <span className={`${styles.wordmark} ${styles[tone]}`}>
      <svg viewBox="0 0 32 32" className={styles.mark} aria-hidden="true">
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="16" cy="8" rx="4.5" ry="7" fill="currentColor" opacity="0.45" transform={`rotate(${r} 16 16)`} />
        ))}
      </svg>
      <span>
        স্বপ্ন <em>ফুলদানি</em>
      </span>
    </span>
  );
}
