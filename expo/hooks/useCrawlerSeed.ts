/**
 * React Query hook for the crawler seed.
 *
 * The seed is a hosted JSON file produced by expo/scripts/crawler/crawler.py.
 * It is fetched once on launch and cached for 24 hours so list screens can
 * render instantly while the live WordPress API refreshes in the background.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchCrawlerData, CRAWLER_SEED_ENABLED } from "@/services/crawlerSeed";
import type { CrawlerEntry } from "@/services/crawlerSeed";

const ONE_DAY = 1000 * 60 * 60 * 24;

/** Query key for the crawler seed (also used by _layout.tsx prefetch). */
export const CRAWLER_SEED_QUERY_KEY = ["crawler", "seed"] as const;

/**
 * Fetch the crawler seed. Disabled when EXPO_PUBLIC_CRAWLER_DATA_URL is unset,
 * so the hook returns undefined and the app falls back to live-API-only.
 */
export function useCrawlerSeed() {
  return useQuery<CrawlerEntry[]>({
    queryKey: CRAWLER_SEED_QUERY_KEY,
    queryFn: fetchCrawlerData,
    enabled: CRAWLER_SEED_ENABLED,
    staleTime: ONE_DAY,
    gcTime: Infinity,
    retry: 1,
  });
}
