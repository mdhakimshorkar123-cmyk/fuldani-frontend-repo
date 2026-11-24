'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useLogin } from '@/lib/admin-queries';
import { Icon } from '@/components/ui/Icon';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      const next = new URLSearchParams(window.location.search).get('next');
      // Only allow internal admin paths (prevents open redirects).
      router.replace(next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin');
      router.refresh();
    } catch {
      /* error shown below */
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.art} aria-hidden="true">
        <div className={styles.artInner}>
          <span className={styles.mark}>স্ব</span>
          <h2>
            ফুল যা কখনো <em>মলিন</em> হয় না
          </h2>
          <p>Manage orders, products and your storefront — all in one place.</p>
        </div>
      </div>

      <div className={styles.panel}>
        <form className={styles.form} onSubmit={submit}>
          <div>
            <h1>Welcome back</h1>
            <p className={styles.sub}>Sign in to the Shopno Fuldani admin console.</p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <div className={styles.pw}>
              <input
                id="password"
                className="input"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow((v) => !v)} className={styles.toggle}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {login.isError && (
            <div className={styles.error} role="alert">
              <Icon name="alert" size={17} /> {login.error.message}
            </div>
          )}

          <button className="btn btn--lg btn--block" disabled={login.isPending}>
            {login.isPending ? <span className="spinner" /> : <Icon name="arrowRight" />}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
