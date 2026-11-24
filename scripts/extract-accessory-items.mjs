/**
 * Break the recovered accessory pages into one record per object.
 *
 * Michael arranged accessories as twenty pages, one per type and decade:
 * "Motors 1950s" is a page and the Unimotor is a paragraph inside it. That
 * was a reasonable way to write a site by hand in 2005, and it is the reason
 * a reader cannot ask this archive what Bolex made in 1954, or search for a
 * Rexofader, or link to one.
 *
 * His markup is better than it had to be, which is what makes this possible
 * without guesswork. Every object is a `<p class="generic">` holding, in
 * order, its photograph, its name in `<b><a name="n">`, and its description.
 * Footnotes live in a `div#footnote` at the end of the page and are
 * referenced inline by `<sup class="foot">`. So each object can be lifted out
 * whole, with its picture and its citations, rather than inferred from where
 * the line breaks fall.
 *
 * This writes data/accessory-items/items.json. Nothing in archive/ is touched and
 * the decade pages stay exactly as they were: this is an index built from his
 * pages, not a replacement for them, and every item records which page it
 * came from so the original is always one click away.
 *
 * Run: node scripts/extract-accessory-items.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const PAGES = path.join(ROOT, "archive", "wayback", "accessories");
const OUT = path.join(ROOT, "data", "accessory-items", "items.json");

/** Decade from the page slug: "motor50" → 1950. */
function decadeOf(slug) {
  const m = /(\d{2})$/.exec(slug);
  if (!m) return null;
  return 1900 + Number(m[1]);
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
  const stem = slug.replace(/\d+$/, "");
  return TYPES[stem] ?? "Other";
}

/**
 * A URL-safe slug from an object's name.
 *
 * Kept readable rather than short: "bolex-unimotor-mc-17" is a better thing
 * to find in a browser history than a hash, and these are permanent URLs.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * A year stated in the prose, where there is one.
 *
 * Only accepts a year a sentence actually asserts about the object —
 * "introduced in 1962", "this case from 1948", "available in 1954" — rather
 * than any four digits in the paragraph, because these descriptions are full
 * of years belonging to other things: the issue of the Reporter that
 * announced a motor, the catalogue a price came from. A wrong year is worse
 * than no year on a page people use to date equipment, so where the sentence
 * is not clearly about the object itself this stays null and the decade is
 * all the page claims.
 */
function statedYear(text) {
  /* Michael sometimes leads with the date: "1953 -- The first model of
     tripod…", or "(1967) The Bellows Extension unit…". Those are the most
     reliable of all, because the year is the sentence's whole subject. */
  const lead = /^\(?(19[0-9]{2})\)?\s*(?:--|—|–|\)|\.)?\s+/.exec(text);
  if (lead) return Number(lead[1]);

  const patterns = [
    /\b(?:introduced|released|launched|announced|produced|manufactured|designed|made|sold|available|offered|appeared)\b[^.]{0,40}?\bin\s+(?:early\s+|late\s+|mid[\s-]+)?(19[0-9]{2})\b/i,
    /\b(?:from|dating from|dated)\s+(19[0-9]{2})\b/i,
    /\bthis\s+\w+\s+from\s+(19[0-9]{2})\b/i,
    /\bin\s+(19[0-9]{2})\s*,?\s+(?:Paillard|Bolex|Kern)\b/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) {
      const year = Number(m[1]);
      if (year >= 1920 && year <= 1990) return year;
    }
  }
  return null;
}

function textOf(node) {
  return (
    node.text
      .replace(/\s+/g, " ")
      /* A footnote marker sat inside a <sup> with no whitespace around it,
         so flattening the markup gives "friction shaft [1]and a lower".
         Put the space back on whichever side has lost one. */
      .replace(/(\S)(\[\d+\])/g, "$1 $2")
      .replace(/(\[\d+\])(\w)/g, "$1 $2")
      .trim()
  );
}

/**
 * Dates checked by hand, which win over anything the patterns above find.
 * See data/accessory-items/year-review.json for why each one is there.
 */
const REVIEW = Object.fromEntries(
  Object.entries(
    JSON.parse(fs.readFileSync(path.join(ROOT, "data", "accessory-items", "year-review.json"), "utf8")),
  ).filter(([key]) => key !== "_"),
);

const items = [];
const seen = new Map();
const report = [];
const reviewedUsed = new Set();

const files = fs
  .readdirSync(PAGES)
  .filter((f) => f.endsWith(".html"))
  .sort();

for (const file of files) {
  const pageSlug = file.replace(/\.html$/, "");
  const html = fs.readFileSync(path.join(PAGES, file), "utf8");
  const root = parse(html);
  const content = root.querySelector("#content");
  if (!content) {
    report.push(`${pageSlug}: no #content`);
    continue;
  }

  const heading = content.querySelector("h3")?.text.trim() ?? null;

  /* Footnotes first, so an item can carry the ones it cites. */
  const footnotes = new Map();
  for (const p of content.querySelectorAll("#footnote p")) {
    const marker = p.querySelector("sup a")?.text.trim();
    if (!marker) continue;
    const body = textOf(p).replace(/^\s*\d+\s*/, "");
    footnotes.set(marker, body);
  }

  let found = 0;
  for (const para of content.querySelectorAll("p.generic")) {
    /* The name is the bold anchor. Without one there is no object here —
       some paragraphs are a standing note about the whole group. */
    const nameNode = para.querySelector("b");
    const name = nameNode ? textOf(nameNode).replace(/:$/, "") : null;
    if (!name) continue;

    const images = para
      .querySelectorAll("img")
      .map((img) => ({
        src: (img.getAttribute("src") ?? "").replace(/^\.\.\//, "/"),
        alt: (img.getAttribute("alt") ?? "").trim(),
      }))
      .filter((i) => i.src && !/addthis|share/i.test(i.src));

    /* The description is the paragraph minus its name. Done on the text
       rather than by removing nodes so the footnote markers survive. */
    const whole = textOf(para);
    let description = whole.startsWith(name) ? whole.slice(name.length) : whole;
    description = description.replace(/^[\s:.–—-]+/, "").trim();

    /* The year is read from the description as it stands, because the most
       reliable form of all is a date leading the sentence. Only then does
       that prefix come off the prose, where it would read oddly. */
    const guessed = statedYear(description);
    description = description.replace(/^\(?19[0-9]{2}\)?\s*(?:--|—|–)?\s*/, "").trim();

    const cites = [...new Set([...description.matchAll(/\[(\d+)\]/g)].map((m) => m[1]))];
    const sources = cites.map((n) => footnotes.get(n)).filter(Boolean);

    let slug = slugify(name);
    if (seen.has(slug)) {
      /* Two objects can share a name across decades — "Standard" appears
         for cases in the 40s and the 50s. Disambiguate by decade rather
         than by a number, which tells the reader something. */
      slug = `${slug}-${decadeOf(pageSlug) ?? seen.get(slug) + 1}`;
    }
    seen.set(slug, (seen.get(slug) ?? 0) + 1);

    const reviewed = REVIEW[slug];
    if (reviewed) reviewedUsed.add(slug);

    items.push({
      slug,
      name,
      type: typeOf(pageSlug),
      decade: decadeOf(pageSlug),
      year: reviewed ? reviewed.year : guessed,
      ...(reviewed?.note ? { yearNote: reviewed.note } : {}),
      description,
      images,
      sources,
      from: { page: pageSlug, heading, originalPath: `/accessories/${pageSlug}.html` },
    });
    found += 1;
  }
  report.push(`${pageSlug}: ${found}`);
}

items.sort(
  (a, b) =>
    (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999) || a.name.localeCompare(b.name),
);

fs.writeFileSync(OUT, `${JSON.stringify({ items }, null, 2)}\n`);

console.log(report.join("\n"));
console.log(`\n${items.length} objects → data/accessory-items/items.json`);
console.log(`  with a stated year: ${items.filter((i) => i.year).length}`);
console.log(`  with a photograph:  ${items.filter((i) => i.images.length).length}`);
console.log(`  with a citation:    ${items.filter((i) => i.sources.length).length}`);

/* A review entry for a slug that no longer exists is a silent lie about
   having checked something, so say so rather than ignore it. */
const stale = Object.keys(REVIEW).filter((slug) => !reviewedUsed.has(slug));
if (stale.length) console.log(`\n  STALE review entries, no such item: ${stale.join(", ")}`);
