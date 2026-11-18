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

/**
 * Tracking pixels, share widgets, layout spacers — never real content.
 *
 * `_instruction` is in here for a different reason: on the H-16 Reflex page
 * it is a 100×100 icon that linked to the controls figures, not a photograph
 * of the camera. Left in, it showed up in the gallery as a third picture
 * that was really a thumbnail of a thumbnail, pointing nowhere. The page it
 * led to is now a route of its own — see lib/controls.ts.
 */
const CHROME_IMAGE =
  /addthis|facebook|twitter|s7\.addthis|\bshare\b|feedburner|rss|paypal|spacer|blank\.gif|pixel|logo|_instruction\./i;

export interface ModelImage {
  src: string;
  alt: string;
  /**
   * Who took it, when the photograph was not recovered from the archive.
   *
   * Its presence is what marks an image as sourced rather than preserved.
   * The site's claim is that everything on it is either recovered from
   * BolexCollector.com or sourced and attributed, and that claim is only
   * worth anything if the two are told apart on the page as well as in the
   * data.
   */
  credit?: string;
  /** Where it came from, if not the photographer directly. */
  source?: string;
}

/**
 * Images contributed for a model the archive never covered.
 *
 * Served from /sourced/ rather than /images/, staged out of the committed
 * media/sourced/ tree. Anything without a credit is dropped: an unattributed
 * photograph is exactly what this project must not publish.
 */
export function sourcedImages(images: ModelImage[] | undefined): ModelImage[] {
  if (!images) return [];
  const out: ModelImage[] = [];
  for (const img of images) {
    if (!img.src.startsWith("/sourced/")) continue;
    if (!img.credit?.trim()) continue;
    const onDisk = path.join(ROOT, "media", img.src.replace(/^\/sourced\//, "sourced/"));
    if (!fs.existsSync(onDisk)) continue;
    out.push(img);
  }
  return out;
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
