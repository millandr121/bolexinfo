import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { readArchiveHtml } from "./archive-text";

/**
 * Named controls and parts, recovered from the original site.
 *
 * BolexCollector.com published one of these: a page of figures for the H-16
 * Reflex, each a photograph with its controls numbered and a matching list of
 * what every number is called. On the original site it hung off a 100×100
 * icon on the model page, which this restoration had been showing as if it
 * were a third photograph of the camera — a thumbnail of a thumbnail,
 * linking nowhere, while the reference behind it sat unreachable.
 *
 * It is the single most useful page in the archive for someone holding a
 * camera and wondering what the lever by their thumb is called, so it gets a
 * route of its own.
 *
 * Only the H-16 Reflex has one. Nothing here invents the others: a model
 * without a recovered figure set simply has no controls page, and the model
 * page says nothing about it.
 */

const ROOT = process.cwd();

export interface ControlFigure {
  /** "Figure 1. H16 Reflex Principal Controls" */
  caption: string;
  image?: string;
  /** The line under the image, where the original had one. */
  imageCaption?: string;
  /** Prose that followed the figure — loading notes and the like. */
  notes: string[];
  /** Part names, in the order the figure numbers them. */
  parts: string[];
}

export interface ControlsPage {
  slug: string;
  title: string;
  figures: ControlFigure[];
  originalPath: string;
}

/** Which models published a controls page. Only one did. */
export const CONTROLS_PAGES: Record<string, string> = {
  h16reflex: "cameras/h16reflex_instructions.html",
};

export function hasControls(slug: string): boolean {
  if (!(slug in CONTROLS_PAGES)) return false;
  return fs.existsSync(path.join(ROOT, "archive", "wayback", CONTROLS_PAGES[slug]!));
}

export function getControls(slug: string): ControlsPage | null {
  const rel = CONTROLS_PAGES[slug];
  if (!rel) return null;
  const file = path.join(ROOT, "archive", "wayback", rel);
  if (!fs.existsSync(file)) return null;

  const content = parse(readArchiveHtml(file)).querySelector("#content");
  if (!content) return null;

  content.querySelectorAll("script, style, .addthis_button, #backnext").forEach((el) => el.remove());

  const figures: ControlFigure[] = [];
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();

  /*
   * The page is a flat sequence — a heading, then an image, then the list of
   * what its numbers mean — so it is read in document order rather than by
   * querying for structure that isn't nested.
   */
  for (const el of content.querySelectorAll("h1, h2, h3, h4, h5, h6, div, ol, p")) {
    const tag = el.tagName?.toLowerCase() ?? "";
    const current = figures[figures.length - 1];

    if (/^h[1-6]$/.test(tag)) {
      const caption = clean(el.textContent);
      if (caption) figures.push({ caption, notes: [], parts: [] });
      continue;
    }
    if (!current) continue;

    if (tag === "div") {
      const img = el.querySelector("img");
      const src = img?.getAttribute("src");
      if (src && !current.image) {
        // Archived hrefs are relative to the page; the site serves /images/**.
        current.image = src.replace(/^(\.\.\/)+/, "/");
      }
      const cap = clean(el.querySelector(".imagecap")?.textContent ?? "");
      if (cap && !current.imageCaption) current.imageCaption = cap;
      continue;
    }

    if (tag === "ol") {
      for (const li of el.querySelectorAll("li")) {
        const text = clean(li.textContent);
        if (text) current.parts.push(text);
      }
      continue;
    }

    if (tag === "p") {
      // Paragraphs inside a list item are the part names, already taken.
      if (el.closest("li")) continue;
      const text = clean(el.textContent);
      if (text) current.notes.push(text);
    }
  }

  const title = clean(content.querySelector("h1")?.textContent ?? "") || "Controls";

  return {
    slug,
    title,
    figures: figures.filter((f) => f.parts.length > 0 || f.image),
    originalPath: `/${rel}`,
  };
}
