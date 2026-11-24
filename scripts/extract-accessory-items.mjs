/**
 * Break the recovered accessory pages into one record per object.
 *
 * Michael arranged accessories as twenty pages, one per type and decade:
 * "Motors 1950s" is a page and the Unimotor is a paragraph inside it. That
 * was a reasonable way to write a site by hand in 2005, and it is the reason
 * a reader cannot ask this archive what Bolex made in 1954, or search for a
 * Rexofader, or link to one.
 *
 * The reading of his markup lives in scripts/lib/generic-items.mjs, because
 * the lens pages are written the same way and are extracted by the same
 * code. What is here is the part that is specific to accessories: what a
 * type is, and how two objects that share a name are told apart.
 *
 * Writes data/accessory-items/items.json. Nothing in archive/ is touched and
 * the decade pages stay exactly as they were: this is an index built from his
 * pages, not a replacement for them, and every item records which page it
 * came from so the original is always one click away.
 *
 * Run: node scripts/extract-accessory-items.mjs
 */

import fs from "node:fs";
import path from "node:path";
import {
  readGenericItems,
  readReview,
  report,
  slugify,
  statedYear,
  stripLeadingYear,
} from "./lib/generic-items.mjs";

const ROOT = process.cwd();
const PAGES = path.join(ROOT, "archive", "wayback", "accessories");
const OUT_DIR = path.join(ROOT, "data", "accessory-items");
const OUT = path.join(OUT_DIR, "items.json");

/** Decade from the page slug: "motor50" → 1950. */
function decadeOf(slug) {
  const m = /(\d{2})$/.exec(slug);
  return m ? 1900 + Number(m[1]) : null;
}

/** The type a page belongs to, from its slug stem. */
const TYPES = {
  motor: "Motors",
  view: "Viewfinders",
  filter: "Filters & Lens Accessories",
  support: "Tripods & Grips",
  case: "Cases",
  edit: "Editing Equipment",
  misc: "Miscellaneous",
};

function typeOf(slug) {
  return TYPES[slug.replace(/\d+$/, "")] ?? "Other";
}

const REVIEW = readReview(path.join(OUT_DIR, "year-review.json"));

/**
 * Codes and dated prices from Paillard's own dealer price lists, matched
 * to these objects by hand. See listings.json, and the lens file beside
 * it, for the sources and why the matching is not scripted.
 */
const LISTINGS = readReview(path.join(OUT_DIR, "listings.json"));
const listingsUsed = new Set();
const used = new Set();
const seen = new Map();

const { items: raw, perPage } = readGenericItems(PAGES);

const items = raw.map((entry) => {
  const decade = decadeOf(entry.page);

  /* The year is read from the description as it stands, because the most
     reliable form of all is a date leading the sentence. Only then does
     that prefix come off the prose, where it would read oddly. */
  const guessed = statedYear(entry.description);
  const description = stripLeadingYear(entry.description);

  let slug = slugify(entry.name);
  if (seen.has(slug)) {
    /* Two objects can share a name across decades — "Standard" appears for
       cases in the 40s and the 50s. Disambiguate by decade rather than by a
       number, which tells the reader something. */
    slug = `${slug}-${decade ?? seen.get(slug) + 1}`;
  }
  seen.set(slug, (seen.get(slug) ?? 0) + 1);

  const reviewed = REVIEW[slug];
  if (reviewed) used.add(slug);

  const found = LISTINGS[slug];
  if (found) listingsUsed.add(slug);

  return {
    slug,
    name: entry.name,
    type: typeOf(entry.page),
    decade,
    year: reviewed ? reviewed.year : guessed,
    ...(reviewed?.note ? { yearNote: reviewed.note } : {}),
    description,
    ...(found?.addCodes ? { codes: found.addCodes } : {}),
    images: entry.images,
    sources: entry.sources,
    ...(found?.listings ? { listings: found.listings } : {}),
    ...(found?.note ? { listingNote: found.note } : {}),
    from: {
      page: entry.page,
      heading: entry.heading,
      originalPath: `/accessories/${entry.page}.html`,
    },
  };
});

items.sort(
  (a, b) =>
    (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999) || a.name.localeCompare(b.name),
);

fs.writeFileSync(OUT, `${JSON.stringify({ items }, null, 2)}\n`);
report(perPage, items, REVIEW, used, "data/accessory-items/items.json");
console.log(`  in a dated price list: ${items.filter((i) => i.listings).length}`);
const stray = Object.keys(LISTINGS).filter((slug) => !listingsUsed.has(slug));
if (stray.length) console.log(`\n  STRAY listings, no such item: ${stray.join(", ")}`);
