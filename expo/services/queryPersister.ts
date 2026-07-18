/**
 * Lightweight React Query cache persistence to AsyncStorage.
 *
 * The WordPress REST API at divyababajikriyayoga.org is slow (1–3.5s per
 * request), so persisting the query cache means the app can render cached
 * data instantly on launch while React Query refetches in the background.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "rq-cache-v1";
const PERSIST_TIMEOUT_MS = 500;

/**
 * Persisted cache entry. Only serializable query data is stored; we exclude
 * queries whose data is large or unlikely to be useful on a cold start (the
 * detail-screen fetches).
 */
interface PersistedCache {
  version: number;
  timestamp: number;
  queries: Array<{
    queryKey: readonly unknown[];
    data: unknown;
    dataUpdatedAt: number;
  }>;
}

/** Query keys whose data we should persist across app restarts. */
function shouldPersist(queryKey: readonly unknown[]): boolean {
  if (!Array.isArray(queryKey) || queryKey[0] !== "wp") return false;
  // Skip per-post / per-page detail fetches; list fetches are what make tabs
  // feel instant and they get reused across screens.
  const kind = queryKey[1];
  return (
    kind === "categories" ||
    kind === "programs" ||
    kind === "events" ||
    kind === "quotes" ||
    kind === "posts"
  );
}

/** Restore the persisted cache into the QueryClient. */
export async function restoreCache(
  queryClient: QueryClient
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistedCache;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.queries)) {
      return;
    }

    for (const entry of parsed.queries) {
      if (!shouldPersist(entry.queryKey)) continue;
      queryClient.setQueryData(entry.queryKey, entry.data, {
        updatedAt: entry.dataUpdatedAt,
      });
    }
  } catch {
    // Corrupt cache — ignore; React Query will refetch normally.
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Persist the current cache (debounced). Safe to call repeatedly. */
export function persistCache(queryClient: QueryClient): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const queries = queryClient
      .getQueryCache()
      .getAll()
      .filter((q) => shouldPersist(q.queryKey) && q.state.data !== undefined)
      .map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
        dataUpdatedAt: q.state.dataUpdatedAt,
      }));

    const payload: PersistedCache = {
      version: 1,
      timestamp: Date.now(),
      queries,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Storage full or unavailable — non-fatal.
    });
  }, PERSIST_TIMEOUT_MS);
}
