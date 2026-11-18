import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { readArchiveHtml } from "./archive-text";

/**
 * Michael's own walk through the collection.
 *
 * Every page of the original site ended with a pair of links — "Previous:
 * H-16 M-5", "Next: 155 Macrozoom" — and 290 of the 378 archived pages still
 * carry them. That chain is not alphabetical and not by year: it is the order
 * one collector chose to lead people through his collection, which makes it
 * worth restoring rather than replacing with a sort.
 *
 * So this reads the sequence out of the archive instead of deriving one. A
 * link whose target was never recovered is dropped, because a next button
 * that 404s is worse than no next button.
 */

const ROOT = process.cwd();

export interface Step {
  slug: string;
  label: string;
  href: string;
}

export interface Neighbours {
  previous?: Step;
  next?: Step;
}

/** "Previous: H-16 M-5" → "H-16 M-5" */
function stripDirection(label: string): string {
  return label.replace(/^\s*(previous|next|back)\s*:\s*/i, "").trim();
}

/**
 * Resolve an archived href to a slug in the same section.
 *
 * The originals link sideways within a directory ("h16m5.html"), so anything
 * that climbs out of it or points at another host is not a step in this
 * sequence.
 */
function slugOf(href: string): string | null {
  const clean = href.trim();
  if (!clean || /^[a-z]+:/i.test(clean) || clean.startsWith("#") || clean.includes("/")) return null;
  const m = /^([A-Za-z0-9._-]+)\.html?$/.exec(clean);
  return m ? m[1]! : null;
}

/**
 * Previous and next for one object, as the original site ordered them.
 *
 * `exists` decides whether a neighbour is reachable here — a page the
 * recovery never captured has no route, so it is skipped rather than linked.
 */
export function getNeighbours(
  section: string,
  slug: string,
  exists: (slug: string) => boolean,
): Neighbours {
  const file = path.join(ROOT, "archive", "wayback", section, `${slug}.html`);
  if (!fs.existsSync(file)) return {};

  const nav = parse(readArchiveHtml(file)).querySelector("#backnext");
  if (!nav) return {};

  const out: Neighbours = {};
  for (const a of nav.querySelectorAll("a")) {
    const raw = a.getAttribute("href") ?? "";
    const target = slugOf(raw);
    const text = a.textContent.replace(/\s+/g, " ").trim();
    if (!target || !text) continue;
    if (target === slug) continue; // "Return to …" points at itself
    if (!exists(target)) continue;

    const step: Step = {
      slug: target,
      label: stripDirection(text),
      href: `/${section}/${target}`,
    };

    if (/^\s*previous|^\s*back/i.test(text)) out.previous ??= step;
    else if (/^\s*next/i.test(text)) out.next ??= step;
  }

  return out;
}

/**
 * Previous and next for a page, preferring the original's order.
 *
 * Cameras and projectors keep Michael's chain almost completely — 52 of 54
 * and 15 of 17 have both links. The lens pages never had one, and ephemera
 * mostly lost theirs, so those fall back to the order their index already
 * lists them in. Falling back rather than leaving the buttons off matters:
 * the point of them is not having to go back to the index between every
 * item, and that is as true of a section the original never chained.
 *
 * Mixing the two is deliberate and safe — both are orders a reader can
 * follow, and the fallback only ever fills a side the archive left empty.
 */
export function resolveNeighbours(
  section: string,
  slug: string,
  ordered: Array<{ slug: string; label: string }>,
): Neighbours {
  const index = ordered.findIndex((o) => o.slug === slug);
  const has = new Set(ordered.map((o) => o.slug));
  const found = getNeighbours(section, slug, (s) => has.has(s));

  const at = (i: number): Step | undefined => {
    const item = ordered[i];
    return item ? { slug: item.slug, label: item.label, href: `/${section}/${item.slug}` } : undefined;
  };

  if (index === -1) return found;
  return {
    previous: found.previous ?? at(index - 1),
    next: found.next ?? at(index + 1),
  };
}
