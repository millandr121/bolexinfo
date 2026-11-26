/**
 * The accessory shapes, with no file reading in them.
 *
 * Split from accessory-items.ts because the browser on the index page is a
 * client component and needs the type and the ordering. Importing those from
 * a module that opens a file pulls node:fs into the bundle, and the build
 * stops. Keeping the pure half separate is the fix, and the same split the
 * technician directory needed for the same reason.
 */

export interface AccessoryImage {
  src: string;
  alt: string;
  /**
   * Who the picture belongs to, when it was not recovered from
   * Michael's page. Its presence is what tells the two apart.
   */
  credit?: string;
}

export interface AccessoryItem {
  slug: string;
  name: string;
  type: string;
  /** 1940, 1950, 1960 — which of his pages this came from. */
  decade: number | null;
  /** A year the prose states about this object, or null. */
  year: number | null;
  /** Why the year is what it is, where it was decided by hand. */
  yearNote?: string;
  description: string;
  images: AccessoryImage[];
  /** His own footnotes, for the ones this object cites. */
  sources: string[];
  /** Paillard's five-letter code, where a dealer price list gives one. */
  codes?: string[];
  /** Appearances in Paillard's own dated dealer price lists. */
  listings?: Array<{ price: string; date: string; doc: string; asPrinted: string }>;
  listingNote?: string;
  /** Priced in a dated catalogue. Reaches back further than the price lists. */
  catalogue?: {
    year: number;
    month?: string;
    doc: string;
    date?: string;
    asPrinted: string;
    price?: string;
    note?: string;
  };
  from: { page: string; heading: string | null; originalPath: string };
}

/** The order the types read best in, matching the old index page. */
export const ACCESSORY_TYPES = [
  "Motors",
  "Viewfinders",
  "Filters & Lens Accessories",
  "Tripods & Grips",
  "Cases",
  "Editing Equipment",
  "Miscellaneous",
  "Other",
] as const;

/** "1952", or "1950s" where the prose never gave a year. */
export function dateLabel(item: AccessoryItem): string {
  if (item.year) return String(item.year);
  return item.decade ? `${item.decade}s` : "Date not known";
}
