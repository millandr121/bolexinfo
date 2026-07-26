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

/** Politeness: delay between archive requests (ms) and retry policy. */
export const POLITENESS = {
  delayMs: 1500,
  retries: 4,
  backoffBaseMs: 2000,
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
