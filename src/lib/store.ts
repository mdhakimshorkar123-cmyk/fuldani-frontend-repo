'use client';

import { useSyncExternalStore } from 'react';

export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

/**
 * Minimal external store. When `persistKey` is given, state is mirrored to
 * localStorage and synced across tabs. Server render always sees `initial`,
 * so hydration never mismatches.
 */
export function createStore<T>(initial: T, persistKey?: string): Store<T> {
  let state = initial;
  let hydrated = !persistKey;
  const listeners = new Set<() => void>();

  const hydrate = () => {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(persistKey!);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* corrupted storage — ignore */
    }
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => {
      hydrate();
      return state;
    },
    set: (next) => {
      hydrate();
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      if (persistKey) {
        try {
          window.localStorage.setItem(persistKey, JSON.stringify(state));
        } catch {
          /* quota / private mode */
        }
      }
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (persistKey && e.key === persistKey) {
          hydrated = false;
          hydrate();
          emit();
        }
      };
      if (persistKey) window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        if (persistKey) window.removeEventListener('storage', onStorage);
      };
    },
  };
}

export function useStore<T>(store: Store<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue);
}
