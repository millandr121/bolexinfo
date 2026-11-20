import fs from "node:fs";
import path from "node:path";
import { parse, type HTMLElement } from "node-html-parser";
import { readArchiveHtml } from "./archive-text";

/**
 * "Notes and Comments" — the writing on a model page.
 *
 * Every camera and projector page on the original site ended its
 * specifications and then said what the specifications do not: which
 * design changes arrived with the model and why, what the camera is
 * called by collectors versus what Paillard called it, how to tell one
 * variant from another by looking at it, which accessories it was built
 * to take. 71 of the 72 pages have one, several run longer than the
 * specification table, and they are cited to the Bolex Reporter and to
 * period advertising.
 *
 * This is the most knowledgeable part of the archive and it was not
 * being shown. The modern object page was built from the pipeline's
 * `bodyText` extraction, which reduces a page to "LABEL: value" spec
 * lines, so the prose was present in the preserved original and
 * nowhere else. Someone reading /cameras/h16rex got the shutter angle
 * and not the paragraph explaining what the shutter does.
 *
 * Read from the archived HTML rather than from any extraction, for the
 * same reason the rest of the recovered content is: the original wraps
 * its real writing in `#content`, and taking that container gives the
 * author's words in document order with the site chrome excluded.
 *
 * Nothing here is rewritten. Links are repointed at the modern route
 * when one exists, because a cross-reference that 404s is worse than
 * no link, and otherwise at the preserved original.
 */

const ROOT = process.cwd();

export interface NotePart {
  text: string;
  href?: string;
  italic?: boolean;
  bold?: boolean;
  /** A footnote marker, which renders raised and small. */
  footnote?: boolean;
}

export type NoteBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; parts: NotePart[] }
  | { kind: "list"; items: NotePart[][] };

export interface Footnote {
  /** The marker as the page wrote it: "1", "2", … */
  marker: string;
  parts: NotePart[];
}

export interface Notes {
  blocks: NoteBlock[];
  footnotes: Footnote[];
}

const EMPTY: Notes = { blocks: [], footnotes: [] };

/**
 * The elements the notes are made of.
 *
 * The region between the "Notes and Comments" heading and the next one
 * also holds rules, eBay listing scripts and affiliate `div`s, so this
 * takes the four tags that carry writing and ignores everything else
 * rather than trying to recognise the chrome.
 */
const CARRIES_TEXT = new Set(["P", "H5", "H6", "UL", "OL"]);

export function getNotes(originalPath: string | undefined): Notes {
  if (!originalPath) return EMPTY;
  const file = path.join(ROOT, "archive", "wayback", originalPath.replace(/^\//, ""));
  if (!fs.existsSync(file)) return EMPTY;

  const root = parse(readArchiveHtml(file));
  const content = root.querySelector("#content");
  if (!content) return EMPTY;

  const blocks: NoteBlock[] = [];
  let inside = false;

  for (const node of content.childNodes) {
    const el = node as HTMLElement;
    const tag = el.tagName?.toUpperCase();
    if (!tag) continue;

    /* The section is bounded by its own heading level: it opens at the
       h4 that names it and closes at the next h4, which on most pages
       is "Serial Numbers and Dates of Manufacture". */
    if (tag === "H4") {
      if (!inside && /^notes\s+and\s+comments/i.test(text(el))) {
        inside = true;
        continue;
      }
      if (inside) break;
      continue;
    }
    if (!inside || !CARRIES_TEXT.has(tag)) continue;

    if (tag === "UL" || tag === "OL") {
      const items = el
        .querySelectorAll("li")
        .map((li) => inlineParts(li, originalPath))
        .filter((parts) => parts.length > 0);
      if (items.length > 0) blocks.push({ kind: "list", items });
      continue;
    }

    if (tag === "H5" || tag === "H6") {
      const heading = text(el);
      /* Michael's sub-headings end in a colon as often as not, which
         reads as a label rather than a heading once set as one. */
      if (heading) blocks.push({ kind: "heading", text: heading.replace(/:$/, "") });
      continue;
    }

    const parts = inlineParts(el, originalPath);
    if (parts.length > 0) blocks.push({ kind: "paragraph", parts });
  }

  return blocks.length > 0
    ? { blocks, footnotes: readFootnotes(content, originalPath) }
    : EMPTY;
}

/**
 * The citations, which live in their own `div#footnote` at the foot of
 * the page rather than inside the notes.
 *
 * They are only worth carrying over when the notes are shown, since
 * that is the only thing on the page that refers to them.
 */
function readFootnotes(content: HTMLElement, originalPath: string): Footnote[] {
  const box = content.querySelector("#footnote");
  if (!box) return [];

  const footnotes: Footnote[] = [];
  for (const p of box.querySelectorAll("p")) {
    const parts = inlineParts(p, originalPath);
    if (parts.length === 0) continue;
    /* The marker is the leading superscript. Dropping it from the text
       and holding it separately lets the list number itself. */
    const marker = p.querySelector("sup")?.structuredText.trim().replace(/[^\d]/g, "");
    const body = parts.filter((part) => !part.footnote);
    if (body.length === 0) continue;
    footnotes.push({ marker: marker || String(footnotes.length + 1), parts: body });
  }
  return footnotes;
}

/**
 * Inline markup to parts.
 *
 * `a`, `b`, `strong`, `em`, `i` and `sup` are what these paragraphs
 * use, and they nest only one deep (a link inside a superscript, for a
 * footnote marker), so this walks the child nodes rather than building
 * a tree.
 */
function inlineParts(el: HTMLElement, originalPath: string): NotePart[] {
  const parts: NotePart[] = [];

  const walk = (node: HTMLElement, style: { italic?: boolean; bold?: boolean; footnote?: boolean }) => {
    for (const child of node.childNodes) {
      const tag = (child as HTMLElement).tagName?.toUpperCase();

      if (!tag) {
        push(parts, { text: (child as HTMLElement).rawText, ...style });
        continue;
      }

      const kid = child as HTMLElement;
      if (tag === "A") {
        const href = resolveHref(kid.getAttribute("href") ?? "", originalPath);
        push(parts, { text: kid.structuredText, ...style, ...(href ? { href } : {}) });
        continue;
      }
      if (tag === "BR") {
        push(parts, { text: " " });
        continue;
      }
      walk(kid, {
        ...style,
        italic: style.italic || tag === "EM" || tag === "I",
        bold: style.bold || tag === "B" || tag === "STRONG",
        footnote: style.footnote || tag === "SUP",
      });
    }
  };

  walk(el, {});
  return parts;
}

/** Append, merging into the previous part when the styling matches. */
function push(parts: NotePart[], part: NotePart) {
  const text = decode(part.text);
  if (!text.trim() && parts.length === 0) return;

  const last = parts[parts.length - 1];
  if (
    last &&
    !last.href &&
    !part.href &&
    !!last.italic === !!part.italic &&
    !!last.bold === !!part.bold &&
    !!last.footnote === !!part.footnote
  ) {
    last.text += text;
    return;
  }
  if (!text) return;
  parts.push({ ...part, text });
}

/** Collapse the archive's hard-wrapped source into running text. */
function decode(raw: string): string {
  return raw
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&deg;/g, "°")
    .replace(/&frac12;/g, "½")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

function text(el: HTMLElement): string {
  return el.structuredText.replace(/\s+/g, " ").trim();
}

/**
 * Where a cross-reference should point now.
 *
 * The hrefs are relative to the archived page's own directory, so they
 * are resolved against it first. A target the modern edition has a page
 * for gets the modern route; everything else gets the preserved
 * original, which is byte-for-byte the page the link was written
 * against. A link that can be resolved to neither is dropped and its
 * text kept, because the words still read correctly without it.
 */
export function resolveHref(raw: string, originalPath: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  if (/^(mailto:|https?:)/i.test(href)) return href;
  /* An on-page anchor pointed at the original page's own markup, which
     this one does not reproduce. */
  if (href.startsWith("#")) return null;

  let url: URL;
  try {
    url = new URL(href, `http://bolexcollector.com${originalPath}`);
  } catch {
    return null;
  }
  if (!/(^|\.)bolexcollector\.com$/i.test(url.hostname)) return null;

  const modern = modernRoute(url.pathname);
  if (modern) return modern;
  return fs.existsSync(path.join(ROOT, "archive", "wayback", url.pathname.replace(/^\//, "")))
    ? `/original${url.pathname}${url.hash}`
    : null;
}

/**
 * The modern route for an archived path, when there is one.
 *
 * Checked against the extraction on disk rather than assumed from the
 * path's shape: the sections do not all have a page per archived file,
 * and a link invented from a pattern is exactly the kind of quiet
 * 404 the internal-links test exists to catch.
 */
function modernRoute(pathname: string): string | null {
  const clean = pathname.replace(/^\//, "").replace(/\.html?$/i, "");
  const [section, ...rest] = clean.split("/");
  if (!section) return null;
  if (rest.length === 0) return INDEXES.has(section) ? `/${section}` : null;

  const slug = rest.join("/");
  if (section === "articles") {
    const dated = slug.replace(/_/g, "-");
    return exists("articles", slug) ? `/articles/${dated}` : null;
  }
  return exists(section, slug) ? `/${section}/${slug}` : null;
}

const INDEXES = new Set([
  "cameras",
  "projectors",
  "lenses",
  "accessories",
  "articles",
  "ephemera",
]);

const extractionCache = new Map<string, boolean>();

function exists(section: string, slug: string): boolean {
  const key = `${section}/${slug}`;
  const hit = extractionCache.get(key);
  if (hit !== undefined) return hit;
  const found = fs.existsSync(path.join(ROOT, "data", section, `${slug}.json`));
  extractionCache.set(key, found);
  return found;
}
