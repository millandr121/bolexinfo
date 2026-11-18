import fs from "node:fs";
import path from "node:path";
import type { ModelImage } from "./assets";

/**
 * Which recovered photograph stands for a model in an index list.
 *
 * The choice is made by scripts/pick-thumbnails.ts, which measures the real
 * pixels of every candidate — the page's first image is often a period
 * snapshot, a specification plate or a diagram of the controls, none of which
 * identify anything at 64px. The result is committed as data/thumbnails.json
 * so the site build is a plain read and does not need a browser.
 *
 * The fallback is the first image, so a model recovered after the last run of
 * that script still gets a thumbnail — just not necessarily the best one.
 */
const PICKS: Record<string, string> = (() => {
  const file = path.join(process.cwd(), "data", "thumbnails.json");
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
})();

export function thumbnailFor(
  section: "cameras" | "projectors" | "lenses" | "accessories",
  slug: string,
  images: ModelImage[],
): string | undefined {
  const chosen = PICKS[`${section}/${slug}`];
  // Only trust the stored pick if that image is still one of the model's own.
  if (chosen && images.some((i) => i.src === chosen)) return chosen;
  return images[0]?.src;
}
