import fs from "node:fs";
import path from "node:path";

/**
 * Shared image helpers.
 *
 * Kept in their own module so both the model layer (`museum.ts`) and the
 * narrative-page layer (`recovered.ts`) can use them without importing each
 * other.
 */

const ROOT = process.cwd();

/** Tracking pixels, share widgets, and layout spacers — never real content. */
const CHROME_IMAGE = /addthis|facebook|twitter|s7\.addthis|\bshare\b|feedburner|rss|paypal|spacer|blank\.gif|pixel|logo/i;

export interface ModelImage {
  src: string;
  alt: string;
}

/** Keep only real, on-disk content images (drops chrome and never-recovered files). */
export function cleanImages(images: ModelImage[] | undefined): ModelImage[] {
  if (!images) return [];
  const out: ModelImage[] = [];
  const seen = new Set<string>();
  for (const img of images) {
    if (!img.src.startsWith("/images/") || CHROME_IMAGE.test(img.src) || seen.has(img.src)) continue;
    const onDisk = path.join(ROOT, "archive", "wayback", img.src.replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) continue;
    seen.add(img.src);
    out.push({ src: img.src, alt: img.alt || "" });
  }
  return out;
}
