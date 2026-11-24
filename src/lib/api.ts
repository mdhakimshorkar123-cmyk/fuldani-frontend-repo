export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const isServer = typeof window === 'undefined';

/** Server: talk to Express directly. Browser: same-origin /api (rewritten by Next). */
const BASE = isServer ? (process.env.API_URL ?? 'http://localhost:4000') : '';

type ApiInit = Omit<RequestInit, 'body'> & {
  json?: unknown;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;

  const res = await fetch(`${BASE}/api${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string; details?: Record<string, string> } })
    | null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message ?? `Request failed (${res.status})`, data?.error?.details);
  }
  return data as T;
}

/** Build a query string, skipping empty values. */
export function qs(params: object): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function errorMessage(err: unknown, fallback = 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
