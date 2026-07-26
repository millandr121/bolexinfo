import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const paths = {
  root: ROOT,
  archive: path.join(ROOT, "archive"),
  archiveWayback: path.join(ROOT, "archive", "wayback"),
  archiveMeta: path.join(ROOT, "archive", "meta"),
  content: path.join(ROOT, "content"),
  data: path.join(ROOT, "data"),
  recovery: path.join(ROOT, "data", "recovery"),
  images: path.join(ROOT, "images"),
  downloads: path.join(ROOT, "downloads"),
  docsReports: path.join(ROOT, "docs", "reports"),
} as const;

/** Hostname variants under which the site was ever archived. */
export const HOSTS = ["bolexcollector.com", "www.bolexcollector.com"] as const;

export const WAYBACK = {
  cdx: "https://web.archive.org/cdx/search/cdx",
  // The availability API lives on archive.org (not the web.archive.org
  // subdomain), so it often remains reachable in sandboxes whose egress
  // policy blocks web.archive.org. It returns only the closest capture per
  // URL — a degraded but genuine discovery source.
  availability: "https://archive.org/wayback/available",
  snapshot: (timestamp: string, url: string, raw: boolean) =>
    // The `id_` flag returns the original bytes without the Wayback toolbar
    // or URL rewriting — essential for faithful preservation.
    `https://web.archive.org/web/${timestamp}${raw ? "id_" : ""}/${url}`,
} as const;

/** Additional discovery sources beyond the Wayback Machine. */
export const EXTRA_SOURCES = {
  commonCrawl: "https://index.commoncrawl.org/collinfo.json",
  archiveToday: "https://archive.ph/newest/",
} as const;

/**
 * Common Crawl serves original page bytes directly (via ranged reads into
 * its public WARC files on `data.commoncrawl.org`), independent of the
 * Wayback Machine. Some sandboxed egress policies allow Common Crawl's hosts
 * while blocking `web.archive.org`, making it a genuine fallback download
 * source rather than just a discovery lead.
 */
export const COMMON_CRAWL = {
  collinfo: "https://index.commoncrawl.org/collinfo.json",
  dataHost: "https://data.commoncrawl.org",
  /** Collections checked per URL, newest first, before giving up. */
  maxCollectionsChecked: 3,
} as const;

/** Politeness: delay between archive requests (ms) and retry policy. */
export const POLITENESS = {
  delayMs: 1500,
  retries: 4,
  backoffBaseMs: 2000,
  /**
   * Some egress proxies neither return an error nor a policy-denial body for
   * a blocked host — they silently stall the connection. Without a hard
   * timeout, that hangs the whole pipeline indefinitely instead of failing
   * over. This applies per attempt, so a truly stalled host still fails fast
   * across all retries.
   */
  requestTimeoutMs: 20_000,
} as const;

/** MIME groups used to route recovered assets to their preservation home. */
export const MIME_ROUTES: Record<string, "pages" | "images" | "downloads" | "assets"> = {
  "text/html": "pages",
  "image/jpeg": "images",
  "image/png": "images",
  "image/gif": "images",
  "image/webp": "images",
  "application/pdf": "downloads",
  "application/zip": "downloads",
  "application/octet-stream": "downloads",
  "text/css": "assets",
  "application/javascript": "assets",
  "text/javascript": "assets",
};
