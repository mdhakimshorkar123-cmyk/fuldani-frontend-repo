import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import type { AdminUser } from '@/lib/types';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const AUTH_COOKIE = 'sf_admin';

/** Server-side guard: every /admin page (except /admin/login) requires a valid session. */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) redirect('/admin/login');

  let user: AdminUser | null = null;
  const res = await fetch(`${API_URL}/api/admin/auth/me`, {
    headers: { cookie: `${AUTH_COOKIE}=${token}` },
    cache: 'no-store',
  }).catch(() => null);

  if (res?.status === 401) redirect('/admin/login');
  if (res?.ok) user = ((await res.json()) as { user: AdminUser }).user;

  return <AdminShell user={user}>{children}</AdminShell>;
}
