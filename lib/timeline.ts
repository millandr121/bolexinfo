import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

/**
 * The Paillard timeline.
 *
 * The archived page expresses its chronology as definition lists — `<dt>` for
 * the year, `<dd>` for what happened — grouped under `<h3>` era headings.
 * That structure survives intact in the archive, so the timeline is read from
 * it directly rather than flattened into prose.
 */

const ROOT = process.cwd();

export interface TimelineEntry {
  year: string;
  event: string;
}

export interface TimelineEra {
  era: string;
  entries: TimelineEntry[];
}

export interface Timeline {
  intro: string[];
  eras: TimelineEra[];
  originalUrl?: string;
  capturedAt?: string;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function getTimeline(): Timeline {
  const file = path.join(ROOT, "archive", "wayback", "timeline.html");
  const meta = (() => {
    const p = path.join(ROOT, "data", "reference", "timeline.json");
    if (!fs.existsSync(p)) return {} as { originalUrl?: string; capturedAt?: string };
    return JSON.parse(fs.readFileSync(p, "utf8")) as { originalUrl?: string; capturedAt?: string };
  })();

  if (!fs.existsSync(file)) return { intro: [], eras: [], ...meta };

  const root = parse(fs.readFileSync(file, "latin1"));
  const content = root.querySelector("#content");
  if (!content) return { intro: [], eras: [], ...meta };
  content.querySelectorAll("script, style").forEach((el) => el.remove());

  const intro: string[] = [];
  const eras: TimelineEra[] = [];
  let current: TimelineEra | null = null;

  for (const el of content.querySelectorAll("p, h1, h2, h3, h4, dl")) {
    const tag = el.tagName?.toUpperCase();

    if (tag === "P") {
      // Introductory prose only — once eras begin, stray paragraphs are
      // asides that belong to the era rather than the page introduction.
      if (!current) {
        const text = clean(el.structuredText);
        if (text.length > 1) intro.push(text);
      }
      continue;
    }

    if (tag === "DL") {
      if (!current) {
        current = { era: "Chronology", entries: [] };
        eras.push(current);
      }
      const children = el.querySelectorAll("dt, dd");
      let pendingYear: string | null = null;
      for (const child of children) {
        const text = clean(child.structuredText);
        if (!text) continue;
        if (child.tagName?.toUpperCase() === "DT") {
          pendingYear = text;
        } else if (pendingYear !== null) {
          current.entries.push({ year: pendingYear, event: text });
          pendingYear = null;
        } else {
          // A description with no preceding term: append to the last entry so
          // no recovered sentence is silently dropped.
          const last = current.entries[current.entries.length - 1];
          if (last) last.event = `${last.event} ${text}`;
        }
      }
      continue;
    }

    // Heading: starts a new era.
    const era = clean(el.structuredText);
    if (era.length > 0) {
      current = { era, entries: [] };
      eras.push(current);
    }
  }

  return { intro, eras: eras.filter((e) => e.entries.length > 0), ...meta };
}
