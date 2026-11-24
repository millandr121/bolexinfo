/**
 * The lens shapes, with no file reading in them.
 *
 * Split from lens-items.ts for the same reason accessory-types.ts is split
 * from accessory-items.ts: the browser on the index page is a client
 * component, and importing a type from a module that opens a file pulls
 * node:fs into the bundle and stops the build.
 */

export interface LensImage {
  src: string;
  alt: string;
}

export interface LensItem {
  slug: string;
  name: string;
  maker: string;
  /** "Switar", "Yvar", "Kino Hypar" — how these were actually spoken about. */
  series: string | null;
  /** "25mm", "16-100mm", or an American maker's '1"'. Null where the name gives none. */
  focalLength: string | null;
  /** "f/1.8". The widest, where two were listed. */
  aperture: string | null;
  /**
   * Paillard's five-letter telegraphic codes, engraved on the barrel.
   * Often two: one for the standard mount and one for the reflex.
   */
  codes: string[];
  /** "C", "D", "C or RX" — read from the heading he listed it under. */
  mount: string | null;
  /** "16mm" or "8mm", from the same heading. */
  gauge: string | null;
  decade: number | null;
  year: number | null;
  yearNote?: string;
  description: string;
  images: LensImage[];
  sources: string[];
  from: { page: string; heading: string | null; originalPath: string };
}

/** Makers in the order the collection reads best. */
export const LENS_MAKERS = [
  "Kern-Paillard",
  "SOM Berthiot",
  "Angénieux",
  "Hugo Meyer",
  "C.P. Goerz",
  "Wollensak",
  "Other",
] as const;

/** "1954", or "1950s" where the prose never gave a year. */
export function lensDateLabel(item: LensItem): string {
  if (item.year) return String(item.year);
  return item.decade ? `${item.decade}s` : "Date not known";
}

/** The line under a lens's name: what it is, in the terms people use. */
export function lensSubtitle(item: LensItem): string {
  return [item.focalLength, item.aperture].filter(Boolean).join(" ");
}
