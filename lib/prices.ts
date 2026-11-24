import fs from "node:fs";
import path from "node:path";
import { getLensItems } from "./lens-items";
import { getAccessoryItems } from "./accessory-items";

/**
 * Every price this archive can cite, in one place.
 *
 * Assembled rather than stored: the figures live on the lenses, the
 * accessories and the models, each beside the document it came from, and
 * this pulls them together so they can be charted. Nothing is invented
 * here and nothing is averaged — every point is one line of one dated
 * Paillard price list, read by eye.
 *
 * The adjusted figures are CPI-U, which is the standard way to do it and
 * is still blunt for a single camera. See data/prices/cpi.json.
 */

const ROOT = process.cwd();

export interface PricePoint {
  /** The thing, as this archive names it. */
  name: string;
  slug: string;
  section: "lenses" | "accessories" | "cameras" | "projectors";
  year: number;
  /** "February 1952" — as precise as the document is. */
  date: string;
  /** Dollars of the day. */
  nominal: number;
  /** Roughly today's money, CPI-adjusted. */
  adjusted: number;
  /** The document's own wording for what was priced. */
  asPrinted: string;
  /** Pacific Rim's id for the scan. */
  doc: string;
}

export interface PriceSeries {
  name: string;
  slug: string;
  section: PricePoint["section"];
  points: PricePoint[];
  /** How many years it spans, for picking what to chart. */
  span: number;
}

interface Cpi {
  base: { year: number; cpi: number; note: string };
  years: Record<string, number>;
  source: { title: string; publisher: string; url: string };
}

function readJson<T>(...segments: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ...segments), "utf8")) as T;
}

let cpiCache: Cpi | null = null;
export function getCpi(): Cpi {
  return (cpiCache ??= readJson<Cpi>("data", "prices", "cpi.json"));
}

/** "$1,407.50" → 1407.5 */
function toNumber(price: string): number | null {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "February 1952" → 1952 */
function yearOf(date: string): number | null {
  const m = /(19[0-9]{2})/.exec(date);
  return m ? Number(m[1]) : null;
}

export function adjust(nominal: number, year: number): number {
  const cpi = getCpi();
  const then = cpi.years[String(year)];
  if (!then) return nominal;
  return (nominal * cpi.base.cpi) / then;
}

let pointsCache: PricePoint[] | null = null;

export function getPricePoints(): PricePoint[] {
  if (pointsCache) return pointsCache;
  const out: PricePoint[] = [];

  const push = (
    name: string,
    slug: string,
    section: PricePoint["section"],
    date: string,
    price: string,
    asPrinted: string,
    doc: string,
  ) => {
    const nominal = toNumber(price);
    const year = yearOf(date);
    if (nominal === null || year === null) return;
    out.push({
      name,
      slug,
      section,
      year,
      date,
      nominal,
      adjusted: adjust(nominal, year),
      asPrinted,
      doc,
    });
  };

  for (const lens of getLensItems()) {
    for (const l of lens.listings ?? []) {
      push(lens.name, lens.slug, "lenses", l.date, l.price, l.asPrinted, l.doc);
    }
    const c = lens.catalogue;
    if (c?.price) {
      push(
        lens.name,
        lens.slug,
        "lenses",
        `${c.month ?? ""} ${c.year}`.trim(),
        c.price,
        c.asPrinted,
        c.doc,
      );
    }
  }

  for (const item of getAccessoryItems()) {
    for (const l of item.listings ?? []) {
      push(item.name, item.slug, "accessories", l.date, l.price, l.asPrinted, l.doc);
    }
    const c = item.catalogue;
    if (c?.price) {
      push(
        item.name,
        item.slug,
        "accessories",
        c.date ?? `${c.month ?? ""} ${c.year}`.trim(),
        c.price,
        c.asPrinted,
        c.doc,
      );
    }
  }

  /*
   * Cameras and projectors were sold as outfits, so each variant is its
   * own point and the model's name carries which one.
   */
  const models = readJson<Record<string, unknown>>("data", "models", "catalogue-prices.json");
  const sectionFor = (slug: string): PricePoint["section"] =>
    /^(m8|m8r|model-|18|s[0-9]|sm8|sp)/.test(slug) ? "projectors" : "cameras";
  for (const [slug, raw] of Object.entries(models)) {
    if (slug === "_") continue;
    const entry = raw as {
      year: number;
      month?: string;
      doc: string;
      variants: Array<{ asPrinted: string; price: string }>;
    };
    for (const v of entry.variants) {
      push(
        v.asPrinted,
        slug,
        sectionFor(slug),
        `${entry.month ?? ""} ${entry.year}`.trim(),
        v.price,
        v.asPrinted,
        entry.doc,
      );
    }
  }

  out.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
  return (pointsCache = out);
}

/**
 * The things we can follow across more than one year.
 *
 * These are what the chart draws. Everything else is a single dot and
 * belongs in the table, because a line between one point and nothing is
 * not a trend.
 */
export function getPriceSeries(): PriceSeries[] {
  const byItem = new Map<string, PricePoint[]>();
  for (const p of getPricePoints()) {
    /* Keyed by slug, not name, so a lens sold in two mounts stays one
       thing. Where a year has several variants the cheapest is taken, so
       the line follows the plain version rather than jumping to a
       multicoated preset when one appears. */
    const list = byItem.get(p.slug) ?? [];
    list.push(p);
    byItem.set(p.slug, list);
  }

  const series: PriceSeries[] = [];
  for (const [slug, points] of byItem) {
    const years = [...new Set(points.map((p) => p.year))].sort((a, b) => a - b);
    if (years.length < 2) continue;
    const cheapestPerYear = years.map(
      (y) => points.filter((p) => p.year === y).sort((a, b) => a.nominal - b.nominal)[0]!,
    );
    series.push({
      name: points[0]!.name,
      slug,
      section: points[0]!.section,
      points: cheapestPerYear,
      span: years[years.length - 1]! - years[0]!,
    });
  }

  return series.sort((a, b) => b.span - a.span || b.points.length - a.points.length);
}

export interface PricedItem {
  name: string;
  slug: string;
  section: PricePoint["section"];
  /** Where the item's own page is, for the link. */
  href: string;
  /** Every price, oldest first. */
  prices: PricePoint[];
  /** The earliest and latest, for the one-line summary. */
  first: PricePoint;
  last: PricePoint;
}

/**
 * Everything with a price, grouped, for someone looking up one thing.
 *
 * The chart answers "how did prices move"; this answers "what did mine
 * cost", which is the question people actually arrive with. Camera and
 * projector outfits collapse into one entry per model, with each
 * combination listed inside it, because a reader looking up an H-16 De
 * luxe wants the model and then the variants, not nine separate rows
 * competing in a search.
 */
export function getPricedItems(): PricedItem[] {
  const bySlug = new Map<string, PricePoint[]>();
  for (const p of getPricePoints()) {
    const list = bySlug.get(p.slug) ?? [];
    list.push(p);
    bySlug.set(p.slug, list);
  }

  const items: PricedItem[] = [];
  for (const [slug, prices] of bySlug) {
    prices.sort((a, b) => a.year - b.year || a.nominal - b.nominal);
    const first = prices[0]!;
    /*
     * Model entries take the model's name rather than the first
     * variant's printed line, which would read "H-16 De luxe with
     * Switar 25mm F:1.4, Yvar 16mm..." as the heading.
     */
    const isModel = first.section === "cameras" || first.section === "projectors";
    items.push({
      name: isModel ? modelName(slug) : first.name,
      slug,
      section: first.section,
      href: `/${first.section}/${slug}`,
      prices,
      first,
      last: prices[prices.length - 1]!,
    });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

/** "h16deluxe" → "H-16 De luxe". Only the eight models that carry prices. */
function modelName(slug: string): string {
  return (
    {
      h16deluxe: "H-16 De luxe",
      h16leader: "H-16 Leader",
      h8deluxe: "H-8 De luxe",
      h8leader: "H-8 Leader",
      l8lm: "L-8 (late model)",
      m8: "M-8 projector",
      m8r: "M-8R projector",
      "model-g": "Model G projector (the G8-16)",
    }[slug] ?? slug
  );
}
