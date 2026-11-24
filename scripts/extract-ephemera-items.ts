/**
 * Date the ephemera, so 171 pieces of paper can be read by year.
 *
 * Unlike the accessories and the lenses, ephemera needed no breaking
 * apart: Michael already gave every advertisement, brochure and issue of
 * the Bolex Reporter its own page. What it never had was a date anyone
 * could sort or filter by. The year is sitting in his own description of
 * each piece — "a 1945 magazine advertisement", "March 1944 magazine ad"
 * — and nowhere a reader can use it.
 *
 * So this reads it out. The description is trusted first, because it is
 * his summary of the piece itself. The body is only consulted when the
 * description gives nothing, and then only in forms that are about the
 * piece rather than about its subject: the text of an advertisement is
 * full of years belonging to other things.
 *
 * Writes data/ephemera-items/items.json.
 * Run: npx tsx scripts/extract-ephemera-items.ts
 */

import fs from "node:fs";
import path from "node:path";
import { decadeOf, ephemeraTypeOf, getRecoveredSection } from "../lib/recovered";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "ephemera-items");
const OUT = path.join(OUT_DIR, "items.json");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/* He dates some pieces by season or by Christmas, which the Bolex
   Reporter itself did. Kept as given rather than forced into a month. */
const SEASONS = ["Spring", "Summer", "Fall", "Autumn", "Winter", "Christmas"];

function monthOf(text: string): string | null {
  const m = new RegExp(`\\b(${[...MONTHS, ...SEASONS].join("|")})\\b`, "i").exec(text);
  if (!m) return null;
  const found = m[1]!.toLowerCase();
  return (
    [...MONTHS, ...SEASONS].find((w) => w.toLowerCase() === found) ?? null
  );
}

/** A year the description states about the piece. */
function yearFromDescription(description: string): number | null {
  const m = /\b(19[2-9]\d)\b/.exec(description);
  return m ? Number(m[1]) : null;
}

/**
 * A year from the body, for the pieces whose description gives none.
 *
 * Only the forms that are plainly about the piece: "In 1948, the American
 * Bolex Company ran a series of ads…", "this 1952 brochure". The ad copy
 * itself mentions years for every other reason — when a company was
 * founded, when a film was shot — and those are not the date of the
 * paper.
 */
function yearFromBody(text: string): number | null {
  const patterns = [
    /\bIn\s+(19[2-9]\d)\s*,\s+(?:the\s+)?(?:American\s+)?(?:Bolex|Paillard)\b/i,
    /\bthis\s+(19[2-9]\d)\s+(?:advertisement|ad|brochure|catalog|catalogue|issue|leaflet)\b/i,
    /\b(?:advertisement|ad|brochure|catalog|catalogue|issue|leaflet)\s+(?:from|of|dated)\s+(?:\w+\s+)?(19[2-9]\d)\b/i,
    /\bran\s+(?:in|during)\s+(19[2-9]\d)\b/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return Number(m[1]);
  }
  return null;
}

interface Review {
  year: number | null;
  note?: string;
}

const reviewFile = path.join(OUT_DIR, "year-review.json");
const REVIEW: Record<string, Review> = fs.existsSync(reviewFile)
  ? Object.fromEntries(
      Object.entries(
        JSON.parse(fs.readFileSync(reviewFile, "utf8")) as Record<string, unknown>,
      ).filter(([key]) => key !== "_"),
    ) as Record<string, Review>
  : {};

const used = new Set<string>();

const items = getRecoveredSection("ephemera")
  /* The decade galleries are indexes of the pieces, not pieces. They stay
     where they are and are linked from the foot of the page. */
  .filter((page) => !/^(ads|bro|cat|rep)\d+$/.test(page.slug))
  .map((page) => {
    const description = page.description ?? "";
    const body = page.blocks
      .filter((b): b is Extract<typeof b, { kind: "heading" | "paragraph" }> => b.kind !== "image")
      .map((b) => b.text)
      .join(" ");

    const guessed = yearFromDescription(description) ?? yearFromBody(body);
    const reviewed = REVIEW[page.slug];
    if (reviewed) used.add(page.slug);
    const year = reviewed ? reviewed.year : guessed;

    return {
      slug: page.slug,
      title: page.title,
      type: ephemeraTypeOf(page.slug),
      decade: decadeOf(page.slug) ?? null,
      year,
      ...(year ? { month: monthOf(description) } : {}),
      ...(reviewed?.note ? { yearNote: reviewed.note } : {}),
      description,
      cover: page.images[0]?.src ?? null,
      images: page.images.length,
    };
  });

items.sort(
  (a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title),
);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify({ items }, null, 2)}\n`);

console.log(`${items.length} pieces → data/ephemera-items/items.json`);
console.log(`  with a year:  ${items.filter((i) => i.year).length}`);
console.log(`  with a month: ${items.filter((i) => i.month).length}`);
console.log(`  with a cover: ${items.filter((i) => i.cover).length}`);
const stale = Object.keys(REVIEW).filter((slug) => !used.has(slug));
if (stale.length) console.log(`\n  STALE review entries: ${stale.join(", ")}`);
