import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: 24,
        background: 'var(--forest-950)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 96, fontWeight: 800, color: 'var(--lime)', lineHeight: 1 }}>
          ৪০৪
        </span>
        <h1 style={{ fontSize: 28 }}>পাতাটি খুঁজে পাওয়া যায়নি</h1>
        <p style={{ opacity: 0.7, maxWidth: '40ch' }}>আপনি যে পাতাটি খুঁজছেন সেটি সরিয়ে ফেলা হয়েছে অথবা কখনো ছিল না।</p>
        <Link href="/" className="btn btn--lime btn--lg" style={{ marginTop: 8 }}>
          হোমে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
