import type { SerialRange } from "./content";

export interface SerialLookupResult {
  matches: Array<SerialRange & { position: number }>;
  nearest?: { range: SerialRange; distance: number };
}

/**
 * Serial → year lookup against the recovered range tables.
 *
 * Kept dependency-free and pure so it runs identically on the server, in the
 * client bundle, and in tests. `position` is how far into the year's range
 * the serial falls (0–1), which lets the UI suggest early/late in the year.
 */
export function lookupSerial(serial: number, ranges: SerialRange[]): SerialLookupResult {
  if (!Number.isFinite(serial) || serial <= 0 || ranges.length === 0) return { matches: [] };

  const matches = ranges
    .filter((r) => serial >= r.from && serial <= r.to)
    .map((r) => ({
      ...r,
      position: r.to === r.from ? 0 : (serial - r.from) / (r.to - r.from),
    }));

  if (matches.length > 0) return { matches };

  // No exact range: report the nearest documented range so a collector with a
  // transitional or out-of-bulletin serial still gets an anchor point.
  let nearest: SerialLookupResult["nearest"];
  for (const range of ranges) {
    const distance = serial < range.from ? range.from - serial : serial - range.to;
    if (!nearest || distance < nearest.distance) nearest = { range, distance };
  }
  return { matches: [], nearest };
}

export function formatSerial(value: string): number {
  return Number(value.replace(/[^\d]/g, ""));
}
