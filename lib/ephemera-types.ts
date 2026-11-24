/**
 * The ephemera shapes, with no file reading in them, so the index's
 * browser can be a client component without pulling node:fs into the
 * bundle.
 */

export interface EphemeraItem {
  slug: string;
  title: string;
  type: string;
  /** From the gallery the piece sits in: 1940, 1950, 1960. */
  decade: number | null;
  /** A year Michael's own description states for the piece. */
  year: number | null;
  /** A month or season where he gave one, as he gave it. */
  month?: string | null;
  yearNote?: string;
  description: string;
  cover: string | null;
  images: number;
}

/** The order the index reads best in. */
export const EPHEMERA_TYPES = [
  "Advertising",
  "Brochures",
  "Catalogs",
  "Bolex Reporter",
  "Other",
] as const;

/** "March 1944", "1952", or the decade where no year is known. */
export function ephemeraDateLabel(item: EphemeraItem): string {
  if (item.year) return item.month ? `${item.month} ${item.year}` : String(item.year);
  return item.decade ? `${item.decade}s` : "Date not known";
}
