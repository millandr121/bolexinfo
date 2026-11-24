import fs from "node:fs";
import path from "node:path";

/**
 * The accessories, one object at a time.
 *
 * Michael wrote them up as twenty pages, one per type and decade: "Motors
 * 1950s" is a page and the Unimotor is a paragraph inside it. Those pages are
 * still here and still his. This is an index built from them, extracted by
 * scripts/extract-accessory-items.mjs, so that the 98 objects he documented
 * can be dated, sorted, searched and linked to the way a camera can.
 *
 * Every item records the page it was lifted from, and nothing is rewritten:
 * the description is his prose and the citations are his footnotes.
 *
 * Dates are deliberately two fields. `year` is a date the prose actually
 * states about the object, and is null far more often than not; `decade` is
 * which of his pages it sat on, which is always known. Showing a decade as
 * though it were a year would invent precision on a page people use to date
 * what they own, so the two never collapse into one.
 */

import {
  type AccessoryItem,
  ACCESSORY_TYPES,
} from "./accessory-types";

export * from "./accessory-types";

const ROOT = process.cwd();


let cache: AccessoryItem[] | null = null;

export function getAccessoryItems(): AccessoryItem[] {
  if (cache) return cache;
  const file = path.join(ROOT, "data", "accessory-items", "items.json");
  if (!fs.existsSync(file)) return (cache = []);
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { items?: AccessoryItem[] };
  return (cache = parsed.items ?? []);
}

export function getAccessoryItem(slug: string): AccessoryItem | undefined {
  return getAccessoryItems().find((i) => i.slug === slug);
}

/** Grouped by type, in the order above, skipping types with nothing in them. */
export function byType(items: readonly AccessoryItem[] = getAccessoryItems()) {
  return ACCESSORY_TYPES.map((type) => ({
    type,
    items: items.filter((i) => i.type === type),
  })).filter((g) => g.items.length > 0);
}

/**
 * Grouped by decade, newest page last.
 *
 * Items with a stated year sort by it within the decade, and the rest follow
 * in alphabetical order: a reader scanning the 1950s should meet 1952 before
 * 1958, and the undated ones should not be scattered through them pretending
 * to a position they have not earned.
 */
export function byDecade(items: readonly AccessoryItem[] = getAccessoryItems()) {
  const decades = [...new Set(items.map((i) => i.decade).filter((d): d is number => d !== null))];
  return decades
    .sort((a, b) => a - b)
    .map((decade) => ({
      decade,
      items: items
        .filter((i) => i.decade === decade)
        .sort(
          (a, b) =>
            (a.year ?? 9999) - (b.year ?? 9999) || a.name.localeCompare(b.name),
        ),
    }));
}

