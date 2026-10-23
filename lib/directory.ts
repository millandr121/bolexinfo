import fs from "node:fs";
import path from "node:path";
import { parse, type HTMLElement } from "node-html-parser";

const ROOT = process.cwd();

/**
 * Structured readers for the two recovered pages whose value lives in their
 * markup rather than their prose.
 *
 * The generic `readContentBlocks` reader flattens an archived page to headings,
 * paragraphs and images. That is right for narrative pages, but it discards
 * exactly what makes these two worth reading: the link page is a directory, so
 * its `href` attributes *are* the content, and the updates page is a dated log,
 * so its dates are. Both are parsed here from the preserved HTML, never
 * transcribed by hand.
 */

function readArchived(originalPath: string): HTMLElement | null {
  const file = path.join(ROOT, "archive", "wayback", originalPath.replace(/^\//, ""));
  if (!fs.existsSync(file)) return null;
  const root = parse(fs.readFileSync(file, "latin1"));
  const content = root.querySelector("#content");
  if (!content) return null;
  content.querySelectorAll("script, style").forEach((el) => el.remove());
  return content;
}

const tidy = (s: string) => s.replace(/\s+/g, " ").trim();

export interface LinkEntry {
  name: string;
  href: string;
  description: string;
}

export interface LinkCategory {
  title: string;
  entries: LinkEntry[];
}

export interface LinkDirectory {
  intro: string;
  categories: LinkCategory[];
}

/**
 * The recommended-links directory, as published on the original site.
 *
 * Markup is `<h2>Category:</h2>` followed by one `<p>` per link holding an
 * anchor and a description. Paragraphs before the first heading are the page's
 * own introduction. Links are reproduced exactly as recorded — these are
 * someone's recommendations from a specific moment, and silently pruning or
 * rewriting them would edit the record rather than preserve it.
 */
export function getLinkDirectory(originalPath = "/links.html"): LinkDirectory {
  const content = readArchived(originalPath);
  if (!content) return { intro: "", categories: [] };

  const intro: string[] = [];
  const categories: LinkCategory[] = [];

  for (const el of content.querySelectorAll("h1, h2, h3, p")) {
    const tag = el.tagName?.toUpperCase();

    if (tag !== "P") {
      const title = tidy(el.structuredText).replace(/:\s*$/, "");
      if (title) categories.push({ title, entries: [] });
      continue;
    }

    const anchor = el.querySelector("a[href]");
    const href = anchor?.getAttribute("href")?.trim();
    const name = anchor ? tidy(anchor.structuredText) : "";

    // A paragraph with no link is prose: the intro before the first heading,
    // or a note inside a category.
    if (!anchor || !href || !name) {
      const text = tidy(el.structuredText);
      if (text && categories.length === 0) intro.push(text);
      continue;
    }

    // The description is whatever the paragraph says besides the link itself.
    const whole = tidy(el.structuredText);
    const description = tidy(whole.startsWith(name) ? whole.slice(name.length) : whole);

    const category = categories[categories.length - 1];
    if (category) category.entries.push({ name, href, description });
  }

  return {
    intro: intro.join(" "),
    // A heading that introduced nothing is a layout artefact, not a section.
    categories: categories.filter((c) => c.entries.length > 0),
  };
}

export interface UpdateEntry {
  /** Headline, when the update had one; dateless notes often did not. */
  title?: string;
  /** The date line exactly as written, e.g. "September 2, 2011 -- Friday". */
  date: string;
  /** Sortable form of that date, or null when it could not be parsed. */
  sortKey: number | null;
  description: string;
  /** Route to the recovered article this update announced, when we hold it. */
  articleSlug?: string;
}

/**
 * The site's own update log — what changed on BolexCollector.com and when,
 * from 2005 to 2011. It is the only record of the site's working life, which
 * makes it a primary source about the archive itself.
 *
 * Markup per entry is `<p>[<a>Title</a><br>]<span class="italicb">date</span>
 * <br>description</p>`.
 */
export function getUpdates(originalPath = "/archives.html"): UpdateEntry[] {
  const content = readArchived(originalPath);
  if (!content) return [];

  const entries: UpdateEntry[] = [];

  for (const el of content.querySelectorAll("p")) {
    const dateEl = el.querySelector(".italicb");
    const date = dateEl ? tidy(dateEl.structuredText) : "";
    if (!date) continue; // not an update entry

    const anchor = el.querySelector("a[href]");
    const title = anchor ? tidy(anchor.structuredText) : undefined;

    // Strip the title and the date line; what remains is the description.
    let description = tidy(el.structuredText);
    if (title && description.startsWith(title)) description = description.slice(title.length);
    description = tidy(description.replace(date, ""));

    entries.push({
      ...(title ? { title } : {}),
      date,
      sortKey: parseUpdateDate(date),
      description,
      ...(anchor ? articleSlugFor(anchor.getAttribute("href")) : {}),
    });
  }

  return entries;
}

/** "September 2, 2011 -- Friday" → 20110902, for ordering without a Date. */
function parseUpdateDate(date: string): number | null {
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(date);
  if (!m) return null;
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const month = months.indexOf(m[1]!.toLowerCase());
  if (month < 0) return null;
  return Number(m[3]) * 10000 + (month + 1) * 100 + Number(m[2]);
}

/**
 * Map an update's original link to a recovered article, when we hold it.
 *
 * The original wrote these as `articles/11_09_02.html`; the recovered articles
 * are stored as `11-09-02`. Links to anything else (the old news section, the
 * forum) have no local counterpart and are left unlinked rather than pointed
 * at a page that does not exist.
 */
function articleSlugFor(href: string | undefined): { articleSlug?: string } {
  const m = /(?:^|\/)articles\/([0-9_-]+)\.html?$/i.exec(href ?? "");
  if (!m) return {};
  const slug = m[1]!.replace(/_/g, "-");
  const file = path.join(ROOT, "content", "articles", `${slug}.md`);
  return fs.existsSync(file) ? { articleSlug: slug } : {};
}
