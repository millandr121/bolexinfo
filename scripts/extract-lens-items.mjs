/**
 * Break the recovered lens pages into one record per lens.
 *
 * Nine pages, one per maker and decade, written in the same format as the
 * accessories and read by the same code. What is specific to lenses is what
 * can be read out of a name. Michael wrote them as, for example:
 *
 *     Switar 5.5mm f/1.8 (SWINQ)
 *
 * which is four separate facts wearing one coat: the series, the focal
 * length, the maximum aperture, and Paillard's five-letter telegraphic code.
 * That last one is the useful one. It is stamped or engraved on the barrel,
 * so it is what somebody holding a lens actually has to go on, and until now
 * it was buried in a paragraph on a page about a decade. Pulled out, it
 * becomes the thing you can search.
 *
 * The maker essays at the top of each page are not touched and not moved.
 * They are continuous prose about a company, not a list of objects, and they
 * stay where he put them.
 *
 * Writes data/lens-items/items.json.
 * Run: node scripts/extract-lens-items.mjs
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
  sortListings,
} from "./lib/generic-items.mjs";

const ROOT = process.cwd();
const PAGES = path.join(ROOT, "archive", "wayback", "lenses");
const OUT_DIR = path.join(ROOT, "data", "lens-items");
const OUT = path.join(OUT_DIR, "items.json");

/** Decade from the page slug: "50kern" → 1950. Lenses lead with it. */
function decadeOf(slug) {
  const m = /^(\d{2})/.exec(slug);
  return m ? 1900 + Number(m[1]) : null;
}

/** The maker, from the page slug's stem, spelled as the company spelled it. */
const MAKERS = {
  kern: "Kern-Paillard",
  meyer: "Hugo Meyer",
  goerz: "C.P. Goerz",
  wollensak: "Wollensak",
  berthiot: "SOM Berthiot",
  angenieux: "Angénieux",
};

function makerOf(slug) {
  return MAKERS[slug.replace(/^\d+/, "")] ?? "Other";
}

/**
 * Take a lens name apart.
 *
 * "Switar 5.5mm f/1.8 (SWINQ)" → series Switar, 5.5mm, f/1.8, code SWINQ.
 *
 * Every part is optional and a missing one stays null rather than being
 * guessed at: some entries are an accessory or a variant rather than a lens
 * with a full designation, and inventing an aperture for those would be
 * worse than leaving the field empty. The name itself is always kept whole
 * and is what the page shows.
 */
function parseName(name) {
  /* Paillard's codes are always five upper-case letters, and a lens often
     has two: one for the standard mount and one for the reflex, written
     "(st. SWESE, RX DAESE)". So the codes are looked for inside the
     brackets rather than as the whole of them. Exactly five letters keeps
     words out: "(DESIGNED FOR L-8)" yields nothing, which is right. */
  const codes = [
    ...new Set(
      [...name.matchAll(/\(([^)]*)\)/g)].flatMap((group) =>
        [...group[1].matchAll(/\b([A-Z]{5})\b/g)].map((m) => m[1]),
      ),
    ),
  ];

  /* Focal length: "5.5mm", "12.5mm", "150mm", or a zoom's "16-100mm".
     The American makers he covered — Wollensak, and Meyer as sold in the
     States — are listed in inches instead, as 1", 1½" or ½". Both are kept
     in the maker's own units rather than converted, because that is what
     is engraved on the barrel and what a seller will quote. */
  const focal = /(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*mm/i.exec(name);
  const inches = /(\d*\s*[½¼¾]|\d+(?:\.\d+)?)\s*(?:"|''|\u2033|\binch(?:es)?\b)/.exec(name);
  /* A few are written "Switar 12.5 f/1.5", with the unit left off. A bare
     number immediately before the aperture is a focal length in mm; one
     that is not — "Pan Cinor 40", "Angenieux 120 (f/2.2 12-120)" — is a
     model designation, and those keep no focal length rather than a
     wrong one. */
  const bare = /(\d+(?:\.\d+)?)\s+f\/?\s*\d/i.exec(name);

  /* Maximum aperture: "f/1.8", "f1.9", "f/2". Takes the first, which is the
     widest where he listed two. */
  const aperture = /f\/?\s*(\d+(?:\.\d+)?)/i.exec(name);

  /* The series is the leading word or two before any number, which is how
     these were actually spoken about: a Switar, a Yvar, a Kino Hypar. */
  const series = /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*(?:\s+(?:Hypar|Cinor|Plasmat|Anastigmat|Trioplan|Cine|Velostigmat|Raptar))?)/.exec(
    name.replace(/^(the|a)\s+/i, ""),
  );

  return {
    series: series ? series[1].trim() : null,
    focalLength: focal
      ? `${focal[1].replace(/\s+/g, "")}mm`
      : inches
        ? `${inches[1].replace(/\s+/g, "")}"`
        : bare
          ? `${bare[1]}mm`
          : null,
    aperture: aperture ? `f/${aperture[1]}` : null,
    codes,
  };
}

/**
 * The mount and the gauge, from the heading the lens was listed under.
 *
 * Every lens page divides into "D Mount Lenses for 8mm Cameras" and then
 * "C Mount Lenses for H-16 Cameras", or close variants, so his own filing
 * states both facts. They are read from the heading rather than guessed at
 * from the focal length, which would be a guess.
 */
function fitFrom(heading) {
  if (!heading) return { mount: null, gauge: null };
  const mount = /\bC and RX\b/i.test(heading)
    ? "C or RX"
    : /\bRX\b/i.test(heading)
      ? "RX"
      : /\bC Mount\b/i.test(heading)
        ? "C"
        : /\bD Mount\b/i.test(heading)
          ? "D"
          : null;
  const gauge = /\b(16mm|H-16)\b/i.test(heading)
    ? "16mm"
    : /\b(8mm|H-8)\b/i.test(heading)
      ? "8mm"
      : null;
  return { mount, gauge };
}

const REVIEW = readReview(path.join(OUT_DIR, "year-review.json"));

/**
 * Codes and dated prices found in Paillard's own dealer price lists and
 * matched to these lenses by hand. See listings.json for the sources and
 * why the matching is not scripted.
 */
const LISTINGS = readReview(path.join(OUT_DIR, "listings.json"));
const listingsUsed = new Set();

/**
 * Appearances in a dated Paillard or American Bolex catalogue. A
 * different claim from a price list: the catalogue says which camera a
 * lens was sold for, and carries no prices at all.
 */
const CATALOGUES = readReview(path.join(OUT_DIR, "catalogues.json"));
const cataloguesUsed = new Set();
const used = new Set();
const seen = new Map();

const { items: raw, perPage } = readGenericItems(PAGES);

const items = raw.map((entry) => {
  const decade = decadeOf(entry.page);
  const maker = makerOf(entry.page);
  const guessed = statedYear(entry.description);
  const description = stripLeadingYear(entry.description);
  const parsed = parseName(entry.name);
  const fit = fitFrom(entry.heading);

  /* The code makes the best slug there is: unique, permanent, and the thing
     engraved on the object. Names fall back to the name. */
  let slug = parsed.codes.length ? slugify(parsed.codes[0]) : slugify(entry.name);
  if (seen.has(slug)) {
    /* The same designation turns up on more than one page where a lens ran
       across two decades, and some variants share a name outright. */
    slug = `${slug}-${decade ?? seen.get(slug) + 1}`;
    if (seen.has(slug)) slug = `${slug}-${seen.get(slug) + 1}`;
  }
  seen.set(slug, (seen.get(slug) ?? 0) + 1);

  const reviewed = REVIEW[slug];
  if (reviewed) used.add(slug);

  const found = LISTINGS[slug];
  if (found) listingsUsed.add(slug);
  const catalogued = CATALOGUES[slug];
  if (catalogued) cataloguesUsed.add(slug);
  const codes = found?.addCodes ? [...new Set([...parsed.codes, ...found.addCodes])] : parsed.codes;

  return {
    slug,
    name: entry.name,
    maker,
    ...parsed,
    codes,
    ...fit,
    decade,
    year: reviewed ? reviewed.year : guessed,
    ...(reviewed?.note ? { yearNote: reviewed.note } : {}),
    description,
    images: entry.images,
    sources: entry.sources,
    ...(found?.listings ? { listings: sortListings(found.listings) } : {}),
    ...(catalogued ? { catalogue: catalogued } : {}),
    ...(found?.note ? { listingNote: found.note } : {}),
    from: {
      page: entry.page,
      heading: entry.heading,
      originalPath: `/lenses/${entry.page}.html`,
    },
  };
});

/**
 * Lenses the original site never listed, found in Paillard's own
 * documents. Appended rather than extracted, and flagged, because they
 * are the archive's own work and the page says so.
 */
/*
 * Physical specifications from Paillard's lens brochure, keyed by slug.
 * Applied to extracted and added lenses alike, after both exist, so the
 * two paths cannot disagree about which lens a table row belongs to.
 */
const SPECS = readReview(path.join(OUT_DIR, "specs.json"));

const ADDED = readReview(path.join(OUT_DIR, "added.json"));
for (const [slug, entry] of Object.entries(ADDED)) {
  items.push({
    slug,
    sources: [],
    images: [],
    added: true,
    ...entry,
    from: { page: null, heading: null, originalPath: null },
  });
}

const specsUsed = new Set();
for (const item of items) {
  const spec = SPECS[item.slug];
  if (!spec) continue;
  item.specs = spec;
  specsUsed.add(item.slug);
}
const straySpecs = Object.keys(SPECS).filter((slug) => !specsUsed.has(slug));
if (straySpecs.length) console.log(`\n  STRAY specs, no such lens: ${straySpecs.join(", ")}`);

items.sort(
  (a, b) =>
    (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999) || a.name.localeCompare(b.name),
);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify({ items }, null, 2)}\n`);
report(perPage, items, REVIEW, used, "data/lens-items/items.json");
console.log(`  in a dated price list: ${items.filter((i) => i.listings).length}`);
console.log(`  in a dated catalogue:  ${items.filter((i) => i.catalogue).length}`);
const strayListings = Object.keys(LISTINGS).filter((slug) => !listingsUsed.has(slug));
if (strayListings.length) console.log(`\n  STRAY listings, no such lens: ${strayListings.join(", ")}`);
const strayCat = Object.keys(CATALOGUES).filter((slug) => !cataloguesUsed.has(slug));
if (strayCat.length) console.log(`  STRAY catalogue entries, no such lens: ${strayCat.join(", ")}`);
console.log(`  with a product code: ${items.filter((i) => i.codes.length).length}`);
console.log(`  added by this archive: ${items.filter((i) => i.added).length}`);
console.log(`  with measured specifications: ${items.filter((i) => i.specs).length}`);
