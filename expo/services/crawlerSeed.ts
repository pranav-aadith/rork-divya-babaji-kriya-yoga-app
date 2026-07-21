/**
 * Crawler seed service — fetches hosted crawler JSON and transforms it into
 * the app's normalized Post/Page types so it can pre-populate React Query
 * cache for instant first launch.
 *
 * The crawler (expo/scripts/crawler/crawler.py) extracts structured data from
 * divyababajikriyayoga.org using the Claude API and writes a JSON array.
 * Upload that JSON to any static host and set EXPO_PUBLIC_CRAWLER_DATA_URL.
 *
 * If the env var is unset, the seed layer is skipped and the app falls back to
 * live-API-only behavior (same as before this feature was added).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Post, Page } from "@/services/wordpress";
import { CATEGORY_IDS } from "@/services/wordpress";

const SEED_STORAGE_KEY = "crawler-seed-v1";
const FETCH_TIMEOUT_MS = 8000;

/** Hosted crawler JSON URL (client-exposed env var). Empty when unset. */
export const CRAWLER_JSON_URL: string =
  process.env.EXPO_PUBLIC_CRAWLER_DATA_URL ?? "";

/** Whether the crawler seed feature is enabled (URL is configured). */
export const CRAWLER_SEED_ENABLED: boolean = CRAWLER_JSON_URL.length > 0;

/** Crawler entry — one per crawled page. Mirrors crawler.py output schema. */
export interface CrawlerEntry {
  url: string;
  page_type: "program" | "event" | "article" | "page" | "contact" | "other";
  title: string;
  summary: string;
  event_details: {
    dates?: string;
    location?: string;
    mode?: "online" | "in-person" | "hybrid" | "unknown";
    registration_url?: string | null;
    notes?: string | null;
  } | null;
  program_details: {
    name: string;
    audience?: string | null;
    description: string;
    link: string;
  } | null;
  contact_info: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    social_links?: string[];
  } | null;
  media_links: string[];
  internal_links: string[];
  scraped_at: string;
}

/** Map page_type → known WordPress category ID for filtering. */
const PAGE_TYPE_CATEGORY_ID: Record<CrawlerEntry["page_type"], number> = {
  program: 0, // programs are pages, not posts — no single category
  event: CATEGORY_IDS.event,
  article: CATEGORY_IDS.wisdom,
  page: 0,
  contact: 0,
  other: 0,
};

/** Map page_type → readable category name. */
const PAGE_TYPE_CATEGORY_NAME: Record<CrawlerEntry["page_type"], string> = {
  program: "Programs",
  event: "Events",
  article: "Wisdom",
  page: "Pages",
  contact: "Contact",
  other: "Other",
};

/**
 * Deterministic numeric id derived from the URL. Stable across runs so React
 * keys and navigation keep working between seed and live data. Uses a 31-bit
 * hash to stay safely within JS safe-integer range and avoid collisions with
 * real WP post IDs (which are typically < 100k).
 */
function hashUrlToId(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    // Simple DJB2-style hash, masked to 31 bits and offset above the WP range.
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  // Offset to 9_000_000+ range to avoid collisions with real WP post IDs.
  return 9_000_000 + (Math.abs(hash) % 1_000_000);
}

/** Derive a URL slug from a full URL path. */
function slugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : "home";
  } catch {
    return "page";
  }
}

/**
 * Pick the best image URL from media_links. Prefers image extensions,
 * falls back to the first link if none look like images.
 */
function pickImageUrl(mediaLinks: string[]): string | null {
  if (!mediaLinks || mediaLinks.length === 0) return null;
  const imageExt = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i;
  const image = mediaLinks.find((link) => imageExt.test(link));
  return image ?? mediaLinks[0] ?? null;
}

/**
 * Transform crawler entries into the app's normalized Post[] shape so they can
 * be injected into the React Query cache under the list query keys. Detail
 * screens still fetch full HTML content from the live WordPress API, so the
 * seed only needs enough data for list rendering.
 */
export function transformCrawlerToPosts(entries: CrawlerEntry[]): Post[] {
  return entries
    .filter(
      (e) =>
        e.page_type === "article" ||
        e.page_type === "event" ||
        e.page_type === "other"
    )
    .map((entry) => {
      const categoryId = PAGE_TYPE_CATEGORY_ID[entry.page_type];
      const categoryName = PAGE_TYPE_CATEGORY_NAME[entry.page_type];
      return {
        id: hashUrlToId(entry.url),
        title: entry.title || slugFromUrl(entry.url),
        excerpt: entry.summary || "",
        // Seed content is plain text; detail screens fetch full HTML from WP.
        content: entry.summary || "",
        date: entry.scraped_at,
        slug: slugFromUrl(entry.url),
        link: entry.url,
        imageUrl: pickImageUrl(entry.media_links),
        imageMediumUrl: pickImageUrl(entry.media_links),
        categories: [categoryName],
        tags: [],
        author: "Foundation",
        categoryIds: categoryId ? [categoryId] : [],
      } satisfies Post;
    });
}

/**
 * Transform crawler entries into the app's normalized Page[] shape for the
 * Programs tab. Includes program-type and generic page-type entries.
 */
export function transformCrawlerToPages(entries: CrawlerEntry[]): Page[] {
  return entries
    .filter((e) => e.page_type === "program" || e.page_type === "page")
    .map((entry) => ({
      id: hashUrlToId(entry.url),
      title: entry.program_details?.name ?? entry.title,
      excerpt: entry.summary || "",
      content: entry.program_details?.description ?? entry.summary ?? "",
      slug: slugFromUrl(entry.url),
      date: entry.scraped_at,
      modified: entry.scraped_at,
      imageUrl: pickImageUrl(entry.media_links),
    } satisfies Page));
}

/**
 * Transform crawler entries into quote-shaped Posts for the Quotes tab. Quotes
 * are image-based greeting cards; the seed uses image-looking media_links.
 */
export function transformCrawlerToQuotes(entries: CrawlerEntry[]): Post[] {
  return entries
    .filter((e) => e.page_type === "other" && pickImageUrl(e.media_links))
    .map((entry) => {
      const imageUrl = pickImageUrl(entry.media_links);
      return {
        id: hashUrlToId(entry.url),
        title: entry.title || "Quote",
        excerpt: entry.summary || "",
        content: imageUrl ? `<img src="${imageUrl}" />` : entry.summary || "",
        date: entry.scraped_at,
        slug: slugFromUrl(entry.url),
        link: entry.url,
        imageUrl,
        imageMediumUrl: imageUrl,
        categories: ["Quotes"],
        tags: [],
        author: "Foundation",
        categoryIds: [CATEGORY_IDS.quotes],
      } satisfies Post;
    });
}

/**
 * Fetch the crawler JSON from the hosted URL. Throws on network/parse errors
 * so React Query can retry and fall back to the live API.
 */
export async function fetchCrawlerData(): Promise<CrawlerEntry[]> {
  if (!CRAWLER_SEED_ENABLED) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(CRAWLER_JSON_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Crawler seed fetch failed: ${res.status}`);
    }
    const data = (await res.json()) as CrawlerEntry[];
    if (!Array.isArray(data)) {
      throw new Error("Crawler seed: expected JSON array");
    }
    // Persist to AsyncStorage so the next launch can use it without a fetch.
    void saveCrawlerSeed(data);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/** Persist the last successful crawler seed to AsyncStorage. */
export async function saveCrawlerSeed(data: CrawlerEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — non-fatal.
  }
}

/** Load the persisted crawler seed (or null if never saved / corrupt). */
export async function loadCrawlerSeed(): Promise<CrawlerEntry[] | null> {
  try {
    const raw = await AsyncStorage.getItem(SEED_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CrawlerEntry[];
    if (!Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}
