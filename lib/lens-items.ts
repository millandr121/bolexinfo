import fs from "node:fs";
import path from "node:path";

/**
 * The lenses, one at a time.
 *
 * Michael wrote them up as nine pages, one per maker and decade, each
 * opening with an essay about the company and then listing its lenses as
 * paragraphs. The essays are untouched and still at /lenses/<page>. This is
 * the list of 116 lenses extracted from them, so that a lens can be dated,
 * sorted and — the point of the exercise — found by the code engraved on it.
 *
 * Those codes are the reason this matters more for lenses than it did for
 * accessories. Paillard gave each lens a five-letter telegraphic code,
 * SWINQ, PIZUI, DAESE, and it is stamped on the barrel. It is what someone
 * holding a lens has to go on, and until now it sat inside a paragraph on a
 * page about a decade.
 */

import { type LensItem, LENS_MAKERS } from "./lens-types";

export * from "./lens-types";

const ROOT = process.cwd();

let cache: LensItem[] | null = null;

export function getLensItems(): LensItem[] {
  if (cache) return cache;
  const file = path.join(ROOT, "data", "lens-items", "items.json");
  if (!fs.existsSync(file)) return (cache = []);
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { items?: LensItem[] };
  return (cache = parsed.items ?? []);
}

export function getLensItem(slug: string): LensItem | undefined {
  return getLensItems().find((i) => i.slug === slug);
}

/** Grouped by maker, in the order above, skipping makers with nothing. */
export function lensesByMaker(items: readonly LensItem[] = getLensItems()) {
  return LENS_MAKERS.map((maker) => ({
    maker,
    items: items.filter((i) => i.maker === maker),
  })).filter((g) => g.items.length > 0);
}
