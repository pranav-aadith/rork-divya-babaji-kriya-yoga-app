#!/usr/bin/env python3
"""
Sushumna Kriya Yoga Site Crawler
================================

Crawls https://divyababajikriyayoga.org, extracts structured data (events,
programs, articles, contact info, etc.) using the Claude API, and saves it
as JSON.

Usage
-----
    # Basic crawl using the built-in seed page list
    python crawler.py

    # Try sitemap.xml first (catches more pages automatically)
    python crawler.py --sitemap

    # Limit how many pages to crawl (useful for testing / cost control)
    python crawler.py --max-pages 10

    # Custom output file
    python crawler.py --output my_data.json

Setup
-----
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="sk-ant-..."
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    sys.exit("Missing dependency 'requests'. Run: pip install -r requirements.txt")

try:
    from anthropic import Anthropic
except ImportError:
    sys.exit(
        "Missing dependency 'anthropic'. Run: pip install -r requirements.txt"
    )


SITE_ORIGIN = "https://divyababajikriyayoga.org"
SITEMAP_URL = f"{SITE_ORIGIN}/sitemap.xml"
DELAY_BETWEEN_REQUESTS = 1.5  # seconds — polite delay
REQUEST_TIMEOUT = 30  # seconds
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"
MAX_HTML_CHARS = 50_000  # truncate huge pages before sending to Claude

# Built-in seed list — used when --sitemap is not passed or sitemap fetch fails.
# These are the key pages the app cares about (programs, events, wisdom, etc.).
SEED_PAGES: list[str] = [
    f"{SITE_ORIGIN}/",
    f"{SITE_ORIGIN}/learn-kriya/",
    f"{SITE_ORIGIN}/sushumna-vani/",
    f"{SITE_ORIGIN}/sushumna-sikshana-2-2/",
    f"{SITE_ORIGIN}/gharbha-sanskar/",
    f"{SITE_ORIGIN}/events/",
    f"{SITE_ORIGIN}/category/events/",
    f"{SITE_ORIGIN}/category/upcoming-events/",
    f"{SITE_ORIGIN}/category/wisdom/",
    f"{SITE_ORIGIN}/category/sadhak-speaks/",
    f"{SITE_ORIGIN}/category/videos/",
    f"{SITE_ORIGIN}/category/himalayanam/",
    f"{SITE_ORIGIN}/category/tiruchendur/",
    f"{SITE_ORIGIN}/category/quotes/",
    f"{SITE_ORIGIN}/category/quotes/english-quotes/",
    f"{SITE_ORIGIN}/category/quotes/telugu-quotes/",
    f"{SITE_ORIGIN}/category/quotes/hindi-quotes/",
    f"{SITE_ORIGIN}/category/quotes/tamil-quotes/",
    f"{SITE_ORIGIN}/books/",
    f"{SITE_ORIGIN}/travel-diaries/",
    f"{SITE_ORIGIN}/kashi-yanam/",
    f"{SITE_ORIGIN}/about-us/",
    f"{SITE_ORIGIN}/contact-us/",
    f"{SITE_ORIGIN}/donate/",
    f"{SITE_ORIGIN}/blog/",
]

# Structured-extraction prompt. Claude is asked to return a single JSON object
# matching the PageData schema. We use tool-use so the SDK enforces the shape.
EXTRACTION_TOOL = {
    "name": "record_page",
    "description": (
        "Record structured data extracted from a single web page of the "
        "Sushumna Kriya Yoga foundation site."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "page_type": {
                "type": "string",
                "enum": ["program", "event", "article", "page", "contact", "other"],
                "description": (
                    "Best classification of the page. 'program' = a teaching/"
                    "course/meditation offering; 'event' = a scheduled event or "
                    "calendar listing; 'article' = a blog post or wisdom article; "
                    "'contact' = a contact/donate/about page; 'page' = a generic "
                    "evergreen page (e.g. books, travel diaries hub); 'other' = "
                    "anything that does not fit."
                ),
            },
            "title": {
                "type": "string",
                "description": "The page's headline or H1, as displayed to humans.",
            },
            "summary": {
                "type": "string",
                "description": (
                    "A 1-3 sentence plain-text summary of the page's purpose "
                    "and key content. No HTML, no markdown."
                ),
            },
            "event_details": {
                "type": ["object", "null"],
                "description": "Populated only when page_type is 'event'.",
                "properties": {
                    "dates": {"type": "string"},
                    "location": {"type": "string"},
                    "mode": {
                        "type": "string",
                        "enum": ["online", "in-person", "hybrid", "unknown"],
                    },
                    "registration_url": {"type": ["string", "null"]},
                    "notes": {"type": ["string", "null"]},
                },
            },
            "program_details": {
                "type": ["object", "null"],
                "description": "Populated only when page_type is 'program'.",
                "properties": {
                    "name": {"type": "string"},
                    "audience": {
                        "type": ["string", "null"],
                        "description": "e.g. 'children', 'adults', 'all'.",
                    },
                    "description": {"type": "string"},
                    "link": {"type": "string"},
                },
            },
            "contact_info": {
                "type": ["object", "null"],
                "description": "Populated only when page_type is 'contact'.",
                "properties": {
                    "email": {"type": ["string", "null"]},
                    "phone": {"type": ["string", "null"]},
                    "address": {"type": ["string", "null"]},
                    "social_links": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
            },
            "media_links": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "URLs to audio/video/image resources referenced on the "
                    "page (YouTube, SoundCloud, Spotify, image URLs)."
                ),
            },
            "internal_links": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "Internal links on the same domain that a reader might "
                    "want to follow. Absolute URLs only."
                ),
            },
        },
        "required": [
            "page_type",
            "title",
            "summary",
            "event_details",
            "program_details",
            "contact_info",
            "media_links",
            "internal_links",
        ],
    },
}

EXTRACTION_PROMPT = (
    "You are extracting structured data from a web page of the Sushumna Kriya "
    "Yoga foundation website (divyababajikriyayoga.org). The page HTML is "
    "provided below.\n\n"
    "Read the HTML and call the `record_page` tool exactly once with the "
    "structured data you extract. Rules:\n"
    "- Use the text visible to a human reader (ignore nav menus, footers, "
    "scripts, styles, and boilerplate that are not the page's main content).\n"
    "- `summary` must be plain English, 1-3 sentences, no HTML tags.\n"
    "- Only populate `event_details`, `program_details`, or `contact_info` "
    "when the page_type matches; set the others to null.\n"
    "- `media_links`: include YouTube, SoundCloud, Spotify, Vimeo, and any "
    "image URLs that appear to be content (not UI icons).\n"
    "- `internal_links`: absolute URLs on the same domain (https://"
    "divyababajikriyayoga.org/...) that a reader would actually want to "
    "follow from this page. Skip nav-menu and footer boilerplate links.\n"
    "- If the page is mostly empty, a 404, or a redirect, set page_type to "
    "'other', title to the URL path, and summary to 'Page unavailable.'\n\n"
    "PAGE URL: {url}\n\n"
    "PAGE HTML (may be truncated):\n\n{html}\n"
)


def fetch_page(url: str) -> str:
    """Plain HTTP GET — returns HTML text (no JS execution)."""
    resp = requests.get(
        url,
        timeout=REQUEST_TIMEOUT,
        headers={
            "User-Agent": (
                "SushumnaKriyaCrawler/1.0 (+https://divyababajikriyayoga.org)"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    resp.raise_for_status()
    return resp.text


def parse_sitemap() -> list[str]:
    """Fetch sitemap.xml and return all same-domain URLs. Empty list on failure."""
    try:
        resp = requests.get(SITEMAP_URL, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"  [sitemap] fetch failed: {exc}", file=sys.stderr)
        return []

    text = resp.text
    urls: list[str] = []
    # Lightweight regex parse — no lxml dependency required for simple sitemaps.
    import re

    for match in re.finditer(r"<loc>(.*?)</loc>", text, re.IGNORECASE | re.DOTALL):
        loc = match.group(1).strip()
        if loc.startswith(SITE_ORIGIN):
            urls.append(loc)

    # Some sitemaps are nested index files pointing to sub-sitemaps.
    # If we found no <loc> URLs that look like pages, fall back to SEED_PAGES.
    if not urls:
        print("  [sitemap] no <loc> entries found", file=sys.stderr)
    return urls


def extract_with_claude(client: Anthropic, html: str, url: str) -> dict[str, Any]:
    """Send HTML to Claude and return the structured page data dict."""
    truncated = html[:MAX_HTML_CHARS]
    if len(html) > MAX_HTML_CHARS:
        truncated += "\n\n[... HTML truncated ...]"

    prompt = EXTRACTION_PROMPT.format(url=url, html=truncated)

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=2048,
        tools=[EXTRACTION_TOOL],
        tool_choice={"type": "tool", "name": "record_page"},
        messages=[{"role": "user", "content": prompt}],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "record_page":
            return block.input  # type: ignore[return-value]

    # Fallback: if Claude didn't call the tool, return an 'other' record.
    return {
        "page_type": "other",
        "title": urlparse(url).path or url,
        "summary": "Extraction failed — no structured data returned.",
        "event_details": None,
        "program_details": None,
        "contact_info": None,
        "media_links": [],
        "internal_links": [],
    }


def crawl(pages: list[str], max_pages: int | None, output_path: Path) -> None:
    """Crawl each page, extract with Claude, and write the JSON array."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit(
            "ANTHROPIC_API_KEY is not set. Export it first:\n"
            '  export ANTHROPIC_API_KEY="sk-ant-..."'
        )

    client = Anthropic(api_key=api_key)
    to_crawl = pages[:max_pages] if max_pages else pages
    total = len(to_crawl)
    results: list[dict[str, Any]] = []

    print(f"Crawling {total} page(s) -> {output_path}")

    for i, url in enumerate(to_crawl, start=1):
        print(f"  [{i}/{total}] {url}")
        try:
            html = fetch_page(url)
        except requests.RequestException as exc:
            print(f"    fetch failed: {exc}", file=sys.stderr)
            results.append(
                {
                    "url": url,
                    "page_type": "other",
                    "title": urlparse(url).path or url,
                    "summary": f"Fetch failed: {exc}",
                    "event_details": None,
                    "program_details": None,
                    "contact_info": None,
                    "media_links": [],
                    "internal_links": [],
                    "scraped_at": dt.datetime.now(dt.timezone.utc)
                    .isoformat(timespec="seconds")
                    .replace("+00:00", "Z"),
                }
            )
            time.sleep(DELAY_BETWEEN_REQUESTS)
            continue

        try:
            entry = extract_with_claude(client, html, url)
        except Exception as exc:  # noqa: BLE001 — surface any Claude error
            print(f"    extraction failed: {exc}", file=sys.stderr)
            entry = {
                "page_type": "other",
                "title": urlparse(url).path or url,
                "summary": f"Extraction failed: {exc}",
                "event_details": None,
                "program_details": None,
                "contact_info": None,
                "media_links": [],
                "internal_links": [],
            }

        entry["url"] = url
        entry["scraped_at"] = (
            dt.datetime.now(dt.timezone.utc)
            .isoformat(timespec="seconds")
            .replace("+00:00", "Z")
        )
        results.append(entry)

        if i < total:
            time.sleep(DELAY_BETWEEN_REQUESTS)

    output_path.write_text(
        json.dumps(results, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nDone. {len(results)} entries written to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Crawl divyababajikriyayoga.org and extract structured data "
        "with the Claude API."
    )
    parser.add_argument(
        "--sitemap",
        action="store_true",
        help="Discover pages from sitemap.xml instead of the built-in seed list.",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Limit how many pages to crawl (useful for testing / cost control).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("crawler_output.json"),
        help="Output JSON file (default: crawler_output.json).",
    )
    args = parser.parse_args()

    if args.sitemap:
        pages = parse_sitemap()
        if not pages:
            print("Sitemap unavailable — falling back to SEED_PAGES.", file=sys.stderr)
            pages = SEED_PAGES
    else:
        pages = SEED_PAGES

    crawl(pages, args.max_pages, args.output)


if __name__ == "__main__":
    main()
