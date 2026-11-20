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
  /**
   * True where only the thumbnail survives.
   *
   * The original page asked for a full-size scan the Wayback Machine
   * never captured, and this is the small version shown in its place.
   * Carried so a page can say so rather than present a 200px scan as
   * though it were the whole record.
   */
  thumbnailOnly?: boolean;
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

    const inArchive = (src: string) =>
      fs.existsSync(path.join(ROOT, "archive", "wayback", src.replace(/^\//, "")));

    let src = img.src;
    let thumbnailOnly = false;
    if (!inArchive(src)) {
      /*
       * Fall back to the thumbnail where the full-size scan is gone.
       *
       * 95 ephemera pages showed nothing at all because the page asks
       * for `40ad007.jpg`, which the Wayback Machine never captured,
       * while `40ad007_t.jpg` sits beside it in the archive and was
       * captured. Checked against Wayback's own index: it holds 220
       * files for that directory, 81 full-size and 139 thumbnails,
       * exactly what is on disk. Nothing was lost in harvesting and no
       * refetch will produce the rest — those scans only ever existed
       * on Michael's server.
       *
       * A small scan of an advertisement is worth much more than an
       * empty page, so the thumbnail is used and marked as one. It is
       * marked rather than quietly substituted because the reader
       * deserves to know they are seeing all that survives.
       */
      const thumb = src.replace(/(\.[a-z]+)$/i, "_t$1");
      if (thumb !== src && inArchive(thumb)) {
        src = thumb;
        thumbnailOnly = true;
      } else {
        continue;
      }
    }

    if (seen.has(src)) continue;
    seen.add(src);
    out.push({ src, alt: img.alt || "", ...(thumbnailOnly ? { thumbnailOnly } : {}) });
  }
  return out;
}
