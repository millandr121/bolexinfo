/**
 * Lifting individual objects out of Michael's grouped pages.
 *
 * He wrote both accessories and lenses the same way: a page per type and
 * decade, or per maker and decade, with each object a `<p class="generic">`
 * inside it holding its photograph, its name in `<b>`, and its description.
 * Footnotes sit in a `div#footnote` and are referenced inline. The comment
 * he left in the markup says as much — "GENERIC multiple use small item
 * descriptions Lenses Accessories and Ephemera" — so the two extractors are
 * reading one format, and this is it, in one place.
 *
 * Nothing here writes anything or knows about either section. It walks a
 * directory of archived pages and hands back objects; what a maker or a type
 * is, and what else can be read out of a name, belongs to the caller.
 */

import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

/** Flatten a node to text, keeping footnote markers readable. */
export function textOf(node) {
  return (
    node.text
      .replace(/\s+/g, " ")
      /* A marker sat inside a <sup> with no whitespace around it, so
         flattening gives "friction shaft [1]and a lower". Put the space
         back on whichever side has lost one. */
      .replace(/(\S)(\[\d+\])/g, "$1 $2")
      .replace(/(\[\d+\])(\w)/g, "$1 $2")
      .trim()
  );
}

/**
 * A URL-safe slug from an object's name.
 *
 * Kept readable rather than short: "bolex-unimotor-mc-17" is a better thing
 * to find in a browser history than a hash, and these are permanent URLs.
 */
export function slugify(name) {
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
 * A year the prose actually states about this object, where there is one.
 *
 * Deliberately narrow. These descriptions are full of years belonging to
 * other things: the issue of the Reporter that announced a motor, the
 * catalogue a price came from, the camera an accessory was made to fit. A
 * wrong date is worse than no date on pages people use to identify what they
 * own, so anything short of a sentence asserting a date about the object
 * itself returns null, and the decade is then all the page claims.
 *
 * Even this is not trusted on its own. Both callers lay a hand-checked
 * review file over the result; this only proposes.
 */
export function statedYear(text) {
  /* Sometimes he leads with the date: "1953 -- The first model of tripod…",
     or "(1967) The Bellows Extension unit…". Those are the most reliable of
     all, because the year is the sentence's whole subject. */
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

/** Strip a leading "1953 -- " once its year has been read off it. */
export function stripLeadingYear(text) {
  return text.replace(/^\(?19[0-9]{2}\)?\s*(?:--|—|–)?\s*/, "").trim();
}

/** The hand-checked dates for a section, minus the "_" explanation block. */
export function readReview(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    Object.entries(JSON.parse(fs.readFileSync(file, "utf8"))).filter(([key]) => key !== "_"),
  );
}

/**
 * Walk a directory of archived pages and yield every object on them.
 *
 * Each object comes back raw: name, prose, pictures, the footnotes it cites,
 * and which page it was on. Dating, typing and slugging are the caller's,
 * because those differ between sections and are where the judgement is.
 */
export function readGenericItems(pagesDir) {
  const out = [];
  const perPage = [];

  const files = fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith(".html"))
    .sort();

  for (const file of files) {
    const page = file.replace(/\.html$/, "");
    const root = parse(fs.readFileSync(path.join(pagesDir, file), "utf8"));
    const content = root.querySelector("#content");
    if (!content) {
      perPage.push({ page, found: 0, note: "no #content" });
      continue;
    }

    /* Pages can carry several headings, and on the lens pages each one is
       a real division: "D Mount Lenses for 8mm Cameras", then "C Mount
       Lenses for H-16 Cameras". So an object takes the heading above it,
       not the first on the page, and the walk has to be in document order
       rather than by selector. */
    const pageHeading = content.querySelector("h3")?.text.trim() ?? null;

    /* Footnotes first, so an object can carry the ones it cites. */
    const footnotes = new Map();
    for (const p of content.querySelectorAll("#footnote p")) {
      const marker = p.querySelector("sup a")?.text.trim();
      if (!marker) continue;
      footnotes.set(marker, textOf(p).replace(/^\s*\d+\s*/, ""));
    }

    let found = 0;
    let heading = pageHeading;
    for (const node of content.querySelectorAll("h3, p.generic")) {
      if (node.rawTagName?.toLowerCase() === "h3") {
        heading = textOf(node) || heading;
        continue;
      }
      const para = node;
      /* The name is the bold run at the head of the paragraph. Without
         one there is no object here — some of these paragraphs are a
         standing note about the group.

         A few entries carry two bold runs because one write-up covers two
         variants: "Pan Cinor 40" and "Pan Cinor 40 R" share a paragraph, a
         photograph and a date. Both are kept and joined, because dropping
         one would lose a lens and splitting them would invent a
         description for each.

         Only the runs *before the prose starts* count. He also bolds a
         sub-heading part-way through a description — "Post war model" in
         the middle of the Gearmaster — and that is a division of the text,
         not another object's name. So this walks the paragraph in order
         and stops at the first real sentence.      */
      const names = [];
      for (const child of para.childNodes) {
        const tag = child.rawTagName?.toLowerCase();
        if (tag === "b") {
          const text = textOf(child).replace(/:$/, "");
          if (text) names.push(text);
          continue;
        }
        /* Images, <br>, <a name> anchors and whitespace sit between the
           names and do not end the run; anything with words does. */
        if (tag === "img" || tag === "br" || tag === "a" || tag === "sup") continue;
        if (textOf(child).length > 0) break;
      }
      if (names.length === 0) continue;
      const name = names.join(" / ");

      const images = para
        .querySelectorAll("img")
        .map((img) => ({
          src: (img.getAttribute("src") ?? "").replace(/^\.\.\//, "/"),
          alt: (img.getAttribute("alt") ?? "").trim(),
        }))
        .filter((i) => i.src && !/addthis|share/i.test(i.src));

      /* The description is the paragraph minus its name, taken from the
         text rather than by removing nodes so the markers survive. */
      let description = textOf(para);
      /* Peel the names off the front one at a time, in the order they were
         written, so a two-variant entry does not leave the second name
         stranded at the head of its own description. */
      for (const part of names) {
        if (description.startsWith(part)) {
          description = description.slice(part.length).replace(/^[\s:.–—-]+/, "");
        }
      }
      description = description.replace(/^[\s:.–—-]+/, "").trim();

      const cites = [...new Set([...description.matchAll(/\[(\d+)\]/g)].map((m) => m[1]))];

      out.push({
        page,
        heading,
        name,
        description,
        images,
        sources: cites.map((n) => footnotes.get(n)).filter(Boolean),
      });
      found += 1;
    }
    perPage.push({ page, found });
  }

  return { items: out, perPage };
}

/** Report what came off each page, and flag any review entry gone stale. */
export function report(perPage, items, review, used, outPath) {
  for (const { page, found, note } of perPage) {
    console.log(`${page}: ${note ?? found}`);
  }
  console.log(`\n${items.length} objects → ${outPath}`);
  console.log(`  with a stated year: ${items.filter((i) => i.year).length}`);
  console.log(`  with a photograph:  ${items.filter((i) => i.images.length).length}`);
  console.log(`  with a citation:    ${items.filter((i) => i.sources.length).length}`);

  /* A review entry for a slug that no longer exists is a silent lie about
     having checked something, so say so rather than ignore it. */
  const stale = Object.keys(review).filter((slug) => !used.has(slug));
  if (stale.length) console.log(`\n  STALE review entries, no such item: ${stale.join(", ")}`);
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * Put price-list rows in date order, oldest first.
 *
 * listings.json is grouped by item rather than by document, and new
 * documents get appended to whichever item they touch, so the file's own
 * order is the order the lists were mined and not the order they were
 * printed. A page showing 1965, 1967, 1979, 1976 reads as a mistake even
 * though every figure in it is right.
 *
 * A row whose date cannot be parsed keeps its place at the end rather
 * than being dropped or guessed at.
 */
export function sortListings(listings) {
  const key = (row) => {
    const m = /^\s*(?:([A-Za-z]+)\s+)?(\d{4})\s*$/.exec(row?.date ?? "");
    if (!m) return Number.MAX_SAFE_INTEGER;
    const month = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
    return Number(m[2]) * 12 + (month < 0 ? 0 : month);
  };
  return [...listings].sort((a, b) => key(a) - key(b));
}
