# Sushumna Kriya Yoga Site Crawler

Crawls `divyababajikriyayoga.org`, extracts structured data (events, programs,
articles, contact info, etc.) using the Claude API, and saves it as JSON.

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Usage

```bash
# Basic crawl using the built-in seed page list
python crawler.py

# Try sitemap.xml first (catches more pages automatically, e.g. blog posts)
python crawler.py --sitemap

# Limit how many pages to crawl (useful for testing / cost control)
python crawler.py --max-pages 10

# Custom output file
python crawler.py --output my_data.json
```

## Output

A JSON array, one object per page, e.g.:

```json
[
  {
    "url": "https://divyababajikriyayoga.org/learn-kriya/",
    "page_type": "program",
    "title": "Sushumna Kriya Meditation",
    "summary": "...",
    "event_details": null,
    "program_details": {
      "name": "Sushumna Kriya Meditation",
      "audience": null,
      "description": "...",
      "link": "https://divyababajikriyayoga.org/learn-kriya/"
    },
    "contact_info": null,
    "media_links": [],
    "internal_links": ["..."],
    "scraped_at": "2026-07-21T12:00:00Z"
  }
]
```

## Feeding the app

The Expo app fetches this JSON on launch as a fast-launch seed (so tabs render
instantly while the live WordPress API refreshes in the background). To wire it
up:

1. Run the crawler and produce `crawler_output.json`:
   ```bash
   python crawler.py --sitemap --output crawler_output.json
   ```
2. Upload `crawler_output.json` to any static host (GitHub Pages, S3, Cloudflare
   R2, Netlify, Vercel, etc.). Make the URL publicly readable with permissive
   CORS (the app fetches it from the device).
3. Set `EXPO_PUBLIC_CRAWLER_DATA_URL` in the app's environment to the hosted URL.
   If unset, the app falls back to live-API-only behavior (no seed).

## Keeping data current

This script does a one-time crawl. To keep your app's data fresh:

- **Schedule it.** Run via cron (e.g. daily) or a scheduled job in your app's
  infra. Each run overwrites `scraped_at` so you always know how fresh the
  data is.
- **Merge, don't just overwrite,** if you want history — load the previous
  JSON, update entries by `url`, and keep a `first_seen_at` field.
- **Off-site content.** Live meditation timings/events point to `dbsky.me`
  and YouTube; this script only reads pages on `divyababajikriyayoga.org`.
  Add those URLs to `SEED_PAGES` (or a separate crawl step) if you need them.
- **JS-rendered content.** This crawler uses a plain HTTP fetch (no
  JavaScript execution). If a section turns out to be client-side rendered
  (e.g. a dynamic calendar widget), swap `fetch_page()` for a headless
  browser call (Playwright/Puppeteer) for that page.

## Notes

- Respects a polite 1.5s delay between requests — adjust
  `DELAY_BETWEEN_REQUESTS` in `crawler.py` if needed.
- Check `https://divyababajikriyayoga.org/robots.txt` before scraping at scale.
- The `--sitemap` flag falls back to the hardcoded `SEED_PAGES` list if no
  sitemap is found.
- Uses `claude-sonnet-4-5-20250929` by default — change `CLAUDE_MODEL` in
  `crawler.py` to use a different model.
