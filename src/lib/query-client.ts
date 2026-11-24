import { isServer, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

/** Expired admin session → bounce to login (browser only). */
function onAuthError(err: unknown) {
  if (isServer || !(err instanceof ApiError) || err.status !== 401) return;
  const path = window.location.pathname;
  if (path.startsWith('/admin') && path !== '/admin/login') {
    window.location.href = `/admin/login?next=${encodeURIComponent(path)}`;
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: onAuthError }),
    mutationCache: new MutationCache({ onError: onAuthError }),
    defaultOptions: {
      queries: {
        // With SSR we prefetch on the server; avoid an immediate client refetch.
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** New client per server request; a singleton in the browser. */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}
