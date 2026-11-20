/**
 * The glossary, recovered.
 *
 * The page has been live since the restoration began showing one
 * paragraph: "Listed below are commonly used terms and acronyms used
 * throughout this website." Below it, nothing. All 105 definitions were
 * being dropped on the way in.
 *
 * The reason is that the generic recovered-content reader understands
 * headings, paragraphs, images and tables, and the glossary is none of
 * those — it is 105 `<dl>` elements, each holding one `<dt>` term and
 * one `<dd>` definition, grouped under `<h1>` letter headings. Blocks
 * it does not recognise are skipped, so the page came through as its
 * own introduction and a promise of a list that was not there.
 *
 * This reads that structure directly rather than teaching the general
 * reader about definition lists, because a glossary is not prose with
 * extra tags: the terms are addressable, cross-referenced, and worth
 * presenting as a reference rather than a wall of paragraphs. 36 of the
 * definitions point at other terms and 6 point at pages elsewhere on
 * the site, and all of those links are rewritten to where the material
 * now lives.
 */

import path from "node:path";
import fs from "node:fs";
import { readArchiveHtml } from "./archive-text";

/**
 * A run of definition text. `href` makes it a link; the flags carry the
 * emphasis the original used, which is rare but meaningful — it marks
 * the term being defined where it recurs inside its own definition.
 */
export interface GlossaryPart {
  text: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface GlossaryTerm {
  /** The original's own anchor, kept so old deep links still land. */
  slug: string;
  term: string;
  definition: GlossaryPart[];
}

export interface GlossaryLetter {
  letter: string;
  terms: GlossaryTerm[];
}

const SOURCE = path.join(process.cwd(), "archive", "wayback", "glossary.html");

/** Entities the archive actually uses. */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&(?:mdash|#8212);/g, "—")
    .replace(/&(?:ndash|#8211);/g, "–")
    .replace(/&(?:deg|#176);/g, "°");
}

/** The archive wraps its source at 80 columns; the text does not. */
function tidy(text: string): string {
  return decodeEntities(text).replace(/\s+/g, " ");
}

/**
 * Where a link in the original points now.
 *
 * Within the glossary the original used `#anchor`, and those still work
 * because each term keeps its original anchor name. Everything else is
 * a path into the old site, and the restoration's routes drop the
 * `.html` and spell article dates with hyphens rather than underscores.
 */
export function rewriteHref(href: string): string {
  const raw = href.trim();
  if (raw.startsWith("#")) return raw;
  if (/^(https?:|mailto:)/i.test(raw)) return raw;

  const clean = raw.replace(/^\.?\//, "").replace(/\.html?$/i, "");
  const [section, ...rest] = clean.split("/");
  if (!section || rest.length === 0) return `/${clean}`;

  const slug = rest.join("/");
  /* Articles are filed by date, written with underscores in the archive
     and hyphens in content/articles. */
  if (section === "articles") return `/articles/${slug.replace(/_/g, "-")}`;
  return `/${section}/${slug}`;
}

/**
 * Inline markup to parts.
 *
 * Only `a`, `b`, `strong` and `em` occur inside these definitions, and
 * they never nest, so this walks the tags in order rather than building
 * a tree. Anything else is taken as text.
 */
function parseInline(html: string): GlossaryPart[] {
  const parts: GlossaryPart[] = [];
  const pattern = /<(a|b|strong|em|i)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let at = 0;
  let match: RegExpExecArray | null;

  const pushText = (raw: string) => {
    const text = tidy(raw.replace(/<[^>]+>/g, ""));
    if (text.trim()) parts.push({ text });
  };

  while ((match = pattern.exec(html)) !== null) {
    pushText(html.slice(at, match.index));
    at = match.index + match[0].length;

    const [, tag = "", attrs = "", inner = ""] = match;
    const text = tidy(inner.replace(/<[^>]+>/g, ""));
    if (!text.trim()) continue;

    const lower = tag.toLowerCase();
    if (lower === "a") {
      const href = /href\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
      /* `<a name="...">` with no href is an anchor, not a link. */
      parts.push(href ? { text, href: rewriteHref(href) } : { text });
    } else if (lower === "em" || lower === "i") {
      parts.push({ text, italic: true });
    } else {
      parts.push({ text, bold: true });
    }
  }
  pushText(html.slice(at));
  return parts;
}

/** A term's anchor, from the original's own `<a name>` where it has one. */
function slugFor(dt: string, term: string): string {
  const named = /<a\s+name\s*=\s*["']([^"']+)["']/i.exec(dt)?.[1];
  if (named) return named;
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

let cache: GlossaryLetter[] | null = null;

/**
 * The glossary, grouped by letter, in the archive's own order.
 *
 * Letters with no terms are dropped: the original printed all 26
 * headings including X, Y and Q, which have nothing under them, and an
 * A–Z rail that offers empty sections is worse than one that does not.
 */
export function getGlossary(): GlossaryLetter[] {
  if (cache) return cache;
  if (!fs.existsSync(SOURCE)) return (cache = []);

  const html = readArchiveHtml(SOURCE);
  const body = html.slice(html.indexOf('<div id="glossary"'));

  const letters: GlossaryLetter[] = [];
  let current: GlossaryLetter | null = null;
  const seen = new Set<string>();

  /* One pass over both the letter headings and the definition pairs, so
     each term lands under the heading it followed. */
  const pattern =
    /<h1>\s*([A-Z])\s*<\/h1>|<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    const [, letter, dt, dd] = match;

    if (letter) {
      current = { letter: letter.toUpperCase(), terms: [] };
      letters.push(current);
      continue;
    }
    if (dt === undefined || dd === undefined) continue;

    const term = tidy(dt.replace(/<[^>]+>/g, "")).trim();
    if (!term) continue;

    const definition = parseInline(dd);
    if (definition.length === 0) continue;

    let slug = slugFor(dt, term);
    /* Anchors have to be unique to be useful as links. */
    while (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);

    if (!current) {
      current = { letter: term[0]?.toUpperCase() ?? "#", terms: [] };
      letters.push(current);
    }
    current.terms.push({ slug, term, definition });
  }

  return (cache = letters.filter((l) => l.terms.length > 0));
}

/** How many terms the glossary holds, for the page to state plainly. */
export function glossaryCount(): number {
  return getGlossary().reduce((n, letter) => n + letter.terms.length, 0);
}
