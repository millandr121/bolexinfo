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
