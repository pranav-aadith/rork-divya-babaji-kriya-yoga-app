/**
 * Convert WordPress HTML content into clean plain text paragraphs
 * suitable for display in React Native Text components.
 */

/** A structured block extracted from HTML content */
export interface ContentBlock {
  type: "heading" | "paragraph";
  text: string;
  /** heading level: 2, 3, 4 etc. (1 for h1, 0 for paragraph) */
  level: number;
}

/** Strip all HTML tags and decode entities */
function stripTags(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\t/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Decode entities in a rendered title */
function decodeEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Remove social media blocks, "Follow us" sections, and connect/register
 * sections from raw HTML before parsing.
 */
function removeNoiseHtml(html: string): string {
  let cleaned = html;
  // Remove social links blocks
  cleaned = cleaned.replace(
    /<ul[^>]*class="[^"]*wp-block-social-links[^"]*"[^>]*>[\s\S]*?<\/ul>/gi,
    ""
  );
  // Remove "Follow us" paragraphs
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<strong>\s*<em>\s*Follow us:?[\s\S]*?<\/p>/gi,
    ""
  );
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<strong>\s*Follow us:?[\s\S]*?<\/p>/gi,
    ""
  );
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<em>\s*Follow us:?[\s\S]*?<\/p>/gi,
    ""
  );
  // Remove "Register here" link paragraphs
  cleaned = cleaned.replace(
    /<p[^>]*>\s*<a[^>]*>\s*Register here\s*<\/a>\s*<\/p>/gi,
    ""
  );
  // Remove YouTube embeds
  cleaned = cleaned.replace(
    /<figure[^>]*class="[^"]*wp-block-embed[^"]*"[^>]*>[\s\S]*?<\/figure>/gi,
    ""
  );
  // Remove iframe embeds
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  return cleaned;
}

/**
 * Extract clean text paragraphs from WordPress HTML content.
 * Returns an array of paragraph strings (empty paragraphs are filtered out).
 */
export function htmlToParagraphs(html: string): string[] {
  if (!html) return [];
  const cleaned = stripTags(html);
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
  return paragraphs;
}

/**
 * Extract structured content blocks (headings + paragraphs) from HTML.
 * Headings (h1–h6) are returned as "heading" blocks with their level.
 * All other block-level content becomes "paragraph" blocks.
 * Social media, "Follow us", and embed noise is removed.
 */
export function htmlToBlocks(html: string): ContentBlock[] {
  if (!html) return [];
  const denoised = removeNoiseHtml(html);
  const blocks: ContentBlock[] = [];

  // Match headings and paragraphs in order
  const blockRegex =
    /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>|<p[^>]*>([\s\S]*?)<\/p>|<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(denoised)) !== null) {
    const headingTag = match[1];
    const headingContent = match[2];
    const paragraphContent = match[3];
    const blockquoteContent = match[4];

    if (headingTag && headingContent !== undefined) {
      const level = parseInt(headingTag.charAt(1), 10);
      const text = stripTags(headingContent);
      if (text.length > 0) {
        blocks.push({ type: "heading", text, level });
      }
    } else if (paragraphContent !== undefined) {
      const text = stripTags(paragraphContent);
      if (text.length > 0) {
        blocks.push({ type: "paragraph", text, level: 0 });
      }
    } else if (blockquoteContent !== undefined) {
      const text = stripTags(blockquoteContent);
      if (text.length > 0) {
        blocks.push({ type: "paragraph", text, level: 0 });
      }
    }
  }

  return blocks;
}

/**
 * Get a plain text excerpt from HTML content.
 * Returns the first meaningful paragraph or a truncated version.
 */
export function htmlToExcerpt(html: string, maxLength = 150): string {
  const paragraphs = htmlToParagraphs(html);
  if (paragraphs.length === 0) return "";
  const text = paragraphs[0];
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
}

/**
 * Extract image URLs from <img> tags in HTML content.
 * Returns src URLs in document order, prioritising larger sizes
 * when srcset is present.
 * @param html - raw HTML content from WordPress
 * @param minSize - minimum width to consider (filters out tiny icons)
 */
export function extractContentImages(html: string, minSize = 200): string[] {
  if (!html) return [];
  const images: string[] = [];

  // Match <img ...> tags (self-closing or with content)
  const imgRegex = /<img[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];

    // Try srcset first — pick the largest descriptor
    const srcsetMatch = tag.match(/srcset=["']([^"']+)["']/i);
    if (srcsetMatch) {
      const srcset = srcsetMatch[1];
      const candidates = srcset
        .split(",")
        .map((s) => s.trim())
        .map((s) => {
          const [url, descriptor] = s.split(/\s+/);
          const width = descriptor ? parseInt(descriptor.replace("w", ""), 10) : 0;
          return { url, width };
        })
        .filter((c) => c.url && c.width >= minSize)
        .sort((a, b) => b.width - a.width);
      if (candidates.length > 0 && candidates[0].url) {
        images.push(candidates[0].url);
        continue;
      }
    }

    // Fall back to src attribute
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      images.push(srcMatch[1]);
    }
  }

  return images;
}

/** A YouTube video extracted from an iframe embed in HTML content */
export interface YouTubeVideo {
  videoId: string;
  title: string;
  watchUrl: string;
  embedUrl: string;
}

/**
 * Extract YouTube videos from <iframe> embeds in HTML content.
 * Returns title, video ID, and both watch and embed URLs for each iframe.
 */
export function extractYouTubeVideos(html: string): YouTubeVideo[] {
  if (!html) return [];
  const videos: YouTubeVideo[] = [];
  const iframeRegex = /<iframe[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = iframeRegex.exec(html)) !== null) {
    const tag = match[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch || !srcMatch[1]) continue;
    const src = srcMatch[1];
    const idMatch = src.match(
      /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    );
    if (!idMatch || !idMatch[1]) continue;
    const videoId = idMatch[1];
    const titleMatch = tag.match(/title=["']([^"']*)["']/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    videos.push({
      videoId,
      title,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: src,
    });
  }

  return videos;
}

/**
 * Estimate reading time from HTML content.
 * @returns string like "5 min read"
 */
export function estimateReadTime(html: string): string {
  const text = stripTags(html);
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
