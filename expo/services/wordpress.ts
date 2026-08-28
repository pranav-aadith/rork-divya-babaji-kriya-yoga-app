/**
 * WordPress REST API service for divyababajikriyayoga.org
 * Fetches posts, pages, categories, tags, and media from the live site.
 */

const API_BASE = "https://divyababajikriyayoga.org/wp-json/wp/v2";

/** Regex to test whether a string contains only Latin-script characters */
const LATIN_RE = /^[\x00-\x7F\u2018\u2019\u201C\u201D\u2013\u2014]+$/;

/** Detect Latin-only text (excludes Indic/other scripts) */
function isLatin(text: string): boolean {
  if (!text) return false;
  return LATIN_RE.test(text.trim());
}

/** Rendered HTML field (title, content, excerpt) */
interface RenderedField {
  rendered: string;
  protected?: boolean;
}

/** WordPress media size detail */
interface MediaSize {
  source_url: string;
  width: number;
  height: number;
  mime_type: string;
}

/** WordPress media details */
interface MediaDetails {
  width: number;
  height: number;
  sizes: Record<string, MediaSize>;
}

/** Embedded featured media item */
interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: MediaDetails;
}

/** Embedded author item */
interface WPAuthor {
  id: number;
  name: string;
  link?: string;
}

/** Embedded term (category or tag) */
interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  parent?: number;
  count?: number;
  description?: string;
}

/** Raw WordPress post object */
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  slug: string;
  link: string;
  title: RenderedField;
  content: RenderedField;
  excerpt: RenderedField;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  sticky: boolean;
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: WPTerm[][];
  };
}

/** Raw WordPress page object */
export interface WPPage {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title: RenderedField;
  content: RenderedField;
  excerpt: RenderedField;
  author: number;
  featured_media: number;
  parent: number;
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
  };
}

/** Raw WordPress category object */
export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  link: string;
}

/** Raw WordPress tag object */
export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
  link: string;
}

/* ── Normalized app types ────────────────────────────────────────── */

/** Normalized post for app display */
export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  slug: string;
  link: string;
  imageUrl: string | null;
  imageMediumUrl: string | null;
  categories: string[];
  tags: string[];
  author: string;
  categoryIds: number[];
}

/** Normalized page for app display */
export interface Page {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  date: string;
  modified: string;
  imageUrl: string | null;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Error thrown when the WordPress site is unreachable or in maintenance mode */
export class SiteUnavailableError extends Error {}

/**
 * Map a query error to a user-facing message, showing the maintenance
 * notice when the site is in maintenance mode (503).
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof SiteUnavailableError ? error.message : fallback;
}

/**
 * Validate an API response, throwing a descriptive error on failure.
 * A 503 means the site is in maintenance mode — surfaced as a distinct
 * error so screens can show an accurate message.
 */
async function ensureOk(res: Response, what: string): Promise<void> {
  if (res.ok) return;
  if (res.status === 503) {
    throw new SiteUnavailableError(
      "The website is temporarily unavailable for maintenance. Please try again later."
    );
  }
  throw new Error(`Failed to fetch ${what}: ${res.status}`);
}

/** Strip HTML tags from a rendered string */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Decode HTML entities in a rendered title */
function decodeHtml(html: string): string {
  if (!html) return "";
  return stripHtml(html);
}

/** Extract best available image URL from embedded media */
function extractImage(post: WPPost): {
  full: string | null;
  medium: string | null;
} {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return { full: null, medium: null };
  const sizes = media.media_details?.sizes;
  const mediumLarge = sizes?.["medium_large"]?.source_url;
  const large = sizes?.large?.source_url;
  const medium = sizes?.medium?.source_url;
  return {
    full: large ?? media.source_url ?? null,
    medium: mediumLarge ?? medium ?? null,
  };
}

/** Extract image from page embedded media */
function extractPageImage(page: WPPage): string | null {
  const media = page._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes;
  return (
    sizes?.large?.source_url ??
    sizes?.["medium_large"]?.source_url ??
    media?.source_url ??
    null
  );
}

/** Extract category names from embedded terms */
function extractCategories(post: WPPost): { names: string[]; ids: number[] } {
  const terms = post._embedded?.["wp:term"];
  if (!terms) return { names: [], ids: post.categories ?? [] };
  const names: string[] = [];
  for (const group of terms) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      if (term.taxonomy === "category") {
        names.push(term.name);
      }
    }
  }
  return { names, ids: post.categories ?? [] };
}

/** Extract tag names from embedded terms */
function extractTags(post: WPPost): string[] {
  const terms = post._embedded?.["wp:term"];
  if (!terms) return [];
  const tags: string[] = [];
  for (const group of terms) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      if (term.taxonomy === "post_tag") {
        tags.push(term.name);
      }
    }
  }
  return tags;
}

/** Extract the first <img src> from post content HTML */
function extractContentImage(content: string): string | null {
  return content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

/** Normalize a WP post for app display */
function normalizePost(post: WPPost): Post {
  const images = extractImage(post);
  const cats = extractCategories(post);
  // Some quote posts have no featured media — the greeting-card image
  // only exists inside the content HTML, so use it as a fallback.
  const contentImage =
    images.full ?? extractContentImage(post.content?.rendered ?? "");
  const authorName = post._embedded?.author?.[0]?.name ?? "Foundation";
  return {
    id: post.id,
    title: decodeHtml(post.title?.rendered ?? ""),
    excerpt: stripHtml(post.excerpt?.rendered ?? ""),
    content: post.content?.rendered ?? "",
    date: post.date,
    slug: post.slug,
    link: post.link,
    imageUrl: contentImage,
    imageMediumUrl: images.medium ?? contentImage,
    categories: cats.names,
    tags: extractTags(post),
    author: authorName,
    categoryIds: cats.ids,
  };
}

/** Normalize a WP page for app display */
function normalizePage(page: WPPage): Page {
  return {
    id: page.id,
    title: decodeHtml(page.title?.rendered ?? ""),
    excerpt: stripHtml(page.excerpt?.rendered ?? ""),
    content: page.content?.rendered ?? "",
    slug: page.slug,
    date: page.date,
    modified: page.modified,
    imageUrl: extractPageImage(page),
  };
}

/* ── API fetch functions ─────────────────────────────────────────── */

/**
 * Fetch posts with embedded data.
 * @param params - query parameters (per_page, categories, etc.)
 * @param includeContent - when false (default), the heavy `content` field is
 *   omitted from the response, dramatically reducing payload size for list
 *   screens. Detail screens fetch the full post by id separately.
 */
export async function fetchPosts(
  params?: {
    per_page?: number;
    categories?: number;
    search?: string;
    page?: number;
  },
  includeContent = false
): Promise<Post[]> {
  const search = new URLSearchParams();
  search.set("_embed", "true");
  search.set("orderby", "date");
  search.set("order", "desc");
  search.set("per_page", String(params?.per_page ?? 100));
  if (params?.categories) search.set("categories", String(params.categories));
  if (params?.search) search.set("search", params.search);
  if (params?.page) search.set("page", String(params.page));
  if (!includeContent) {
    // Omit `content` from list responses — it's the bulk of the payload and
    // only needed on detail screens (which fetch by id).
    search.set(
      "_fields",
      "id,date,modified,slug,link,title,excerpt,featured_media,categories,tags,sticky,author,_links,_embedded"
    );
  }

  const res = await fetch(`${API_BASE}/posts?${search.toString()}`);
  await ensureOk(res, "posts");
  const data: WPPost[] = await res.json();
  return data.map(normalizePost);
}

/** Fetch a single post by ID with embedded data */
export async function fetchPostById(id: number): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts/${id}?_embed=true`);
  await ensureOk(res, `post ${id}`);
  const data: WPPost = await res.json();
  return normalizePost(data);
}

/** Fetch a single post by slug */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(
    `${API_BASE}/posts?_embed=true&slug=${encodeURIComponent(slug)}`
  );
  await ensureOk(res, "post by slug");
  const data: WPPost[] = await res.json();
  return data.length > 0 ? normalizePost(data[0]) : null;
}

/**
 * Fetch pages with optional filtering.
 * @param params - query parameters
 */
export async function fetchPages(params?: {
  per_page?: number;
  search?: string;
}): Promise<Page[]> {
  const search = new URLSearchParams();
  search.set("_embed", "true");
  search.set("orderby", "date");
  search.set("order", "desc");
  search.set("per_page", String(params?.per_page ?? 100));
  if (params?.search) search.set("search", params.search);

  const res = await fetch(`${API_BASE}/pages?${search.toString()}`);
  await ensureOk(res, "pages");
  const data: WPPage[] = await res.json();
  return data.map(normalizePage);
}

/** Fetch a single page by ID with embedded data */
export async function fetchPageById(id: number): Promise<Page> {
  const res = await fetch(`${API_BASE}/pages/${id}?_embed=true`);
  await ensureOk(res, `page ${id}`);
  const data: WPPage = await res.json();
  return normalizePage(data);
}

/** Fetch a single page by slug */
export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  const res = await fetch(
    `${API_BASE}/pages?_embed=true&slug=${encodeURIComponent(slug)}`
  );
  await ensureOk(res, "page by slug");
  const data: WPPage[] = await res.json();
  return data.length > 0 ? normalizePage(data[0]) : null;
}

/** Fetch all categories */
export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${API_BASE}/categories?per_page=100`);
  await ensureOk(res, "categories");
  return res.json();
}

/** Fetch all tags */
export async function fetchTags(): Promise<WPTag[]> {
  const res = await fetch(`${API_BASE}/tags?per_page=100`);
  await ensureOk(res, "tags");
  return res.json();
}

/* ── Specific program pages (by slug) ────────────────────────────── */

/** Slugs for the main program pages on the website */
export const PROGRAM_SLUGS = [
  "sushumna-vani",
  "sushumna-sikshana-2-2",
  "gharbha-sanskar",
] as const;

/** Fetch a single page by slug (lightweight, no embedded media needed for cards) */
export async function fetchPageBySlugLight(slug: string): Promise<Page | null> {
  const search = new URLSearchParams();
  search.set("slug", slug);
  search.set(
    "_fields",
    "id,title,slug,excerpt,date,modified,featured_media"
  );
  search.set("per_page", "1");
  const res = await fetch(`${API_BASE}/pages?${search.toString()}`);
  await ensureOk(res, `page ${slug}`);
  const data: WPPage[] = await res.json();
  return data.length > 0 ? normalizePage(data[0]) : null;
}

/** Fetch all program pages by their slugs in parallel */
export async function fetchProgramPages(): Promise<Page[]> {
  const pages = await Promise.all(
    (PROGRAM_SLUGS as readonly string[]).map((slug) =>
      fetchPageBySlugLight(slug)
    )
  );
  return pages.filter((p): p is Page => p !== null);
}

/* ── Category IDs for specific content types ─────────────────────── */

export const CATEGORY_IDS = {
  event: 37,
  upcomingEvents: 43,
  college: 62,
  school: 64,
  corporate: 76,
  govtOrg: 75,
  quotes: 3,
  quoteEnglish: 34,
  quoteTelugu: 31,
  quoteHindi: 32,
  quoteTamil: 33,
  wisdom: 50,
  meditation: 6,
  experiences: 7,
  videos: 14,
  navaratri: 51,
  spiritualDetox: 36,
  yogicCleanse: 40,
  himalayanam: 39,
  tiruchendur: 42,
  ammaGaru: 35,
  sadhakSpeaks: 60,
  audio: 8,
} as const;

/* ── Quotes from the "Quotes" category ───────────────────────────── */

/**
 * Fetch wisdom quote posts from the language-specific quote categories.
 *
 * Content is pulled from the English, Telugu, Hindi, and Tamil quote
 * sub-categories and merged together. The app then filters by language
 * so users can browse quotes in their preferred language.
 */
export async function fetchQuotes(perPage = 30): Promise<Post[]> {
  // Quotes are image-based greeting cards; we need `content` to extract the
  // greeting image when no featured media is set.
  const categoryPerPage = Math.max(5, Math.ceil(perPage / 4));
  const [english, telugu, hindi, tamil] = await Promise.all([
    fetchPosts(
      {
        per_page: categoryPerPage,
        categories: CATEGORY_IDS.quoteEnglish,
      },
      true
    ),
    fetchPosts(
      {
        per_page: categoryPerPage,
        categories: CATEGORY_IDS.quoteTelugu,
      },
      true
    ),
    fetchPosts(
      {
        per_page: categoryPerPage,
        categories: CATEGORY_IDS.quoteHindi,
      },
      true
    ),
    fetchPosts(
      {
        per_page: categoryPerPage,
        categories: CATEGORY_IDS.quoteTamil,
      },
      true
    ),
  ]);

  const byId = new Map<number, Post>();
  for (const post of [...english, ...telugu, ...hindi, ...tamil]) {
    byId.set(post.id, post);
  }

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, perPage);
}

/* ── Events from the "Event" category ────────────────────────────── */

/**
 * Fetch event posts from both the main Event category (37) and the Upcoming
 * Events category (43), then merge and deduplicate by ID. Events are sorted
 * newest first by date.
 */
export async function fetchEventPosts(perPage = 50): Promise<Post[]> {
  const [events, upcoming] = await Promise.all([
    fetchPosts({ per_page: perPage, categories: CATEGORY_IDS.event }),
    fetchPosts({ per_page: perPage, categories: CATEGORY_IDS.upcomingEvents }),
  ]);

  const byId = new Map<number, Post>();
  for (const post of [...events, ...upcoming]) {
    byId.set(post.id, post);
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Fetch wisdom posts: all posts excluding Event and Upcoming Events categories.
 * This is the content shown in the Wisdom tab (formerly Knowledge Hub).
 * Defaults to a smaller page size to keep the initial request fast.
 */
export async function fetchWisdomPosts(perPage = 50): Promise<Post[]> {
  const posts = await fetchPosts({ per_page: perPage });
  return posts.filter(
    (p) =>
      !p.categoryIds.includes(CATEGORY_IDS.event) &&
      !p.categoryIds.includes(CATEGORY_IDS.upcomingEvents)
  );
}

/** Split events into upcoming (today or later) and past (before today) by date */
export function splitEventsByDate(events: Post[]): {
  upcoming: Post[];
  past: Post[];
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming: Post[] = [];
  const past: Post[] = [];

  for (const event of events) {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate.getTime() >= now.getTime()) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  return { upcoming, past };
}
