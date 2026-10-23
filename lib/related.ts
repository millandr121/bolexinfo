import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { getCameraRecords, getProjectorRecords, type ModelRecord } from "./museum";
import { accessoryTypeOf, decadeOf, getRecoveredSection } from "./recovered";

const ROOT = process.cwd();

export type Section = "cameras" | "projectors";

export interface IndexEntry {
  slug: string;
  /** The model as the index named it, e.g. "H16 REX4". */
  label: string;
  year?: number;
  /** The gauge as the index stated it — "Double 8mm" where our records say "8mm". */
  gauge?: string;
}

export interface IndexGroup {
  /** The original heading, e.g. "1960s Cameras". */
  era: string;
  entries: IndexEntry[];
}

/**
 * The section index exactly as the original site arranged it.
 *
 * The site grouped its cameras and projectors by era under its own headings,
 * and wrote each entry as "1965 H16 REX4 16mm". That is a taxonomy the people
 * who built the archive chose, so it is read back out of the preserved page
 * rather than re-invented here — and its gauges are finer than the ones our
 * per-model records carry ("Double 8mm" against a flat "8mm").
 */
export function getIndexGroups(section: Section): IndexGroup[] {
  const file = path.join(ROOT, "archive", "wayback", `${section}.html`);
  if (!fs.existsSync(file)) return [];
  const content = parse(fs.readFileSync(file, "latin1")).querySelector("#content");
  if (!content) return [];

  const groups: IndexGroup[] = [];

  for (const el of content.querySelectorAll("h1, h2, h3, h4, a")) {
    const text = (el.structuredText ?? "").replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (el.tagName?.toUpperCase() !== "A") {
      groups.push({ era: text, entries: [] });
      continue;
    }

    const href = el.getAttribute("href") ?? "";
    const m = new RegExp(`^${section}/([^/]+)\\.html?$`, "i").exec(href);
    const group = groups[groups.length - 1];
    if (!m || !group) continue;

    group.entries.push({ slug: m[1]!, ...parseIndexLabel(text) });
  }

  return groups.filter((g) => g.entries.length > 0);
}

/** "1965 H16 REX4 16mm" → { year: 1965, label: "H16 REX4", gauge: "16mm" } */
function parseIndexLabel(text: string): { label: string; year?: number; gauge?: string } {
  let rest = text;

  const year = /^(\d{4})\s+/.exec(rest);
  if (year) rest = rest.slice(year[0].length);

  // Longest gauge spellings first, so "Double 8mm" is not read as "8mm".
  const gauge = /\s+(Double 8mm|Super 8mm|Super 8|9\.5mm|16mm|8mm)$/i.exec(rest);
  if (gauge) rest = rest.slice(0, rest.length - gauge[0].length);

  return {
    label: rest.trim(),
    ...(year ? { year: Number(year[1]) } : {}),
    ...(gauge ? { gauge: gauge[1]!.trim() } : {}),
  };
}

/**
 * The model series a camera or projector belongs to — the H-16 line, the
 * B-8 line, the Zoom Reflex cameras — derived from the recovered model names.
 *
 * Two rules, in order, and a series only exists when at least two models share
 * it. The original site never published this grouping, so it is derived rather
 * than preserved, and it is kept deliberately conservative: a model that does
 * not clearly belong to a line gets no series at all and relies on the era
 * grouping instead, which is better than asserting a relationship that was
 * never documented.
 *
 *   1. A leading letter-and-gauge code: "H-16 REX-4" and "B-8L" are the H-16
 *      and B-8 lines. This covers the bulk of the catalogue.
 *   2. Otherwise the descriptive words, with the model code removed: "P2 Zoom
 *      Reflex" and "Auto Cine B" become the Zoom Reflex and Auto Cine lines.
 */
function seriesCandidates(name: string): string[] {
  const candidates: string[] = [];

  const code = /^([A-Za-z]+)\s*-?\s*(\d+(?:\.\d+)?)/.exec(name);
  if (code) candidates.push(`${code[1]!.toUpperCase()}-${code[2]}`);

  // Projectors are numbered without a letter — the 18-5, 18-5 Auto, 18-5
  // Super and 18-5L are one line. Among cameras every such code is unique, so
  // this rule only ever fires where a line genuinely exists.
  const numeric = /^(\d+(?:[-.]\d+)?)/.exec(name);
  if (numeric) candidates.push(numeric[1]!);

  const descriptive = name
    .replace(/\([^)]*\)/g, " ") // "(early model)" is a variant, not a line
    .split(/\s+/)
    .filter((token) => token && !/\d/.test(token) && token.replace(/[^A-Za-z]/g, "").length > 1)
    .join(" ")
    .trim();
  if (descriptive) candidates.push(descriptive);

  return candidates;
}

export interface RelatedModel {
  slug: string;
  name: string;
  href: string;
  introduced?: number;
  /** The index's gauge where it has one, else the record's own format. */
  gauge?: string;
}

export interface RelatedContext {
  /**
   * Models in the same line, e.g. the other H-16 cameras.
   *
   * `heading` overrides the band's wording where the default phrasing does not
   * fit the section — "the H-16 line" reads correctly for a camera series but
   * not for a group of accessory cases.
   */
  series?: { name: string; heading?: string; models: RelatedModel[] };
  /** Models the original index listed in the same era and gauge. */
  era?: { label: string; gauge?: string; heading?: string; models: RelatedModel[] };
}

function records(section: Section): ModelRecord[] {
  return section === "cameras" ? getCameraRecords() : getProjectorRecords();
}

/** Assign each model of a section to a series, where one can be derived. */
function seriesIndex(section: Section): Map<string, string> {
  const all = records(section);

  // Count how many models each candidate key would collect, preferring the
  // first (letter-and-gauge) rule wherever it already forms a line.
  const counts = new Map<string, number>();
  for (const model of all) {
    for (const key of new Set(seriesCandidates(model.name))) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const assigned = new Map<string, string>();
  for (const model of all) {
    const key = seriesCandidates(model.name).find((c) => (counts.get(c) ?? 0) >= 2);
    if (key) assigned.set(model.slug, key);
  }
  return assigned;
}

/**
 * What else a visitor should see from this model's page.
 *
 * Someone who has just identified a camera from its serial number wants the
 * rest of its line and its contemporaries; without this every object page is a
 * dead end. Both relationships are bounded so the band stays a signpost rather
 * than a second index.
 */
export function getRelated(section: Section, slug: string, limit = 8): RelatedContext {
  const all = records(section);
  const self = all.find((m) => m.slug === slug);
  if (!self) return {};

  const groups = getIndexGroups(section);
  const indexEntry = new Map<string, { entry: IndexEntry; era: string }>();
  for (const group of groups) {
    for (const entry of group.entries) indexEntry.set(entry.slug, { entry, era: group.era });
  }

  const toRelated = (m: ModelRecord): RelatedModel => {
    const gauge = indexEntry.get(m.slug)?.entry.gauge ?? m.format;
    return {
      slug: m.slug,
      name: m.name,
      href: `/${section}/${m.slug}`,
      ...(m.introduced ? { introduced: m.introduced } : {}),
      ...(gauge ? { gauge } : {}),
    };
  };

  // Nearest by year, so a long line shows the neighbouring variants rather
  // than whichever happen to sort first.
  const byNearestYear = (a: ModelRecord, b: ModelRecord) => {
    const anchor = self.introduced ?? 0;
    const da = Math.abs((a.introduced ?? 0) - anchor);
    const db = Math.abs((b.introduced ?? 0) - anchor);
    return da - db || (a.introduced ?? 0) - (b.introduced ?? 0);
  };

  const context: RelatedContext = {};

  const series = seriesIndex(section);
  const key = series.get(slug);
  if (key) {
    const siblings = all
      .filter((m) => m.slug !== slug && series.get(m.slug) === key)
      .sort(byNearestYear)
      .slice(0, limit);
    if (siblings.length > 0) {
      context.series = { name: key, models: siblings.map(toRelated) };
    }
  }

  const own = indexEntry.get(slug);
  if (own) {
    /*
     * The era band exists to show something the line does not. On a 16mm
     * camera of the 1960s every contemporary is another H-16, so without this
     * the page reads "the H-16 line", then a second heading offering more
     * H-16s — true, but no new relation. Excluding the whole line leaves the
     * band empty there, and an empty band is simply not rendered.
     */
    const inSameEra = (m: ModelRecord) =>
      m.slug !== slug &&
      (!key || series.get(m.slug) !== key) &&
      indexEntry.get(m.slug)?.era === own.era;

    const sameGauge = all
      .filter((m) => inSameEra(m) && indexEntry.get(m.slug)!.entry.gauge === own.entry.gauge)
      .sort(byNearestYear);

    /*
     * Widening to the whole era when nothing shares the gauge is what keeps
     * the H-9 from being a dead end: it is the only 9.5mm camera the site
     * documented, so a same-gauge rule alone leaves it with no neighbours at
     * all. The band then says "cameras of the same period" rather than naming
     * a gauge it does not share.
     */
    const peers = sameGauge.length > 0 ? sameGauge : all.filter(inSameEra).sort(byNearestYear);

    if (peers.length > 0) {
      context.era = {
        label: own.era,
        ...(sameGauge.length > 0 && own.entry.gauge ? { gauge: own.entry.gauge } : {}),
        models: peers.slice(0, limit).map(toRelated),
      };
    }
  }

  return context;
}

export type RecoveredSection = "lenses" | "accessories";

/**
 * Onward links for the narrative sections.
 *
 * Lenses and accessories carry no specifications or serial numbers, so the
 * relations that connect cameras do not apply. What they do have is a grid the
 * original site arranged them on: every lens page is a maker in a decade
 * (Kern Paillard in the 1940s, 1950s and 1960s), and every accessory page is a
 * category in a decade (cases in the 1950s). Both axes are read from the
 * recovered slugs and titles, so the groupings are the site's own.
 */
export function getRecoveredRelated(
  section: RecoveredSection,
  slug: string,
  limit = 8,
): RelatedContext {
  const pages = getRecoveredSection(section);
  const self = pages.find((p) => p.slug === slug);
  if (!self) return {};

  const noun = section === "lenses" ? "lenses" : "accessories";
  const groupOf = (s: string) =>
    section === "lenses" ? s.replace(/^\d+/, "") : accessoryTypeOf(s);

  const toRelated = (p: { slug: string; title: string }): RelatedModel => ({
    slug: p.slug,
    name: p.title,
    href: `/${section}/${p.slug}`,
    ...(decadeOf(p.slug) ? { gauge: decadeOf(p.slug)! } : {}),
  });

  const context: RelatedContext = {};

  // The same maker or category, through the other decades it was made in.
  const group = groupOf(slug);
  const sameGroup = pages.filter((p) => p.slug !== slug && groupOf(p.slug) === group);
  if (sameGroup.length > 0) {
    /*
     * The display name comes from the page's own title with its decade
     * stripped — "Kern Paillard 1940s" is the Kern Paillard lenses — so the
     * heading uses the archive's spelling rather than the slug's.
     */
    const name =
      section === "lenses"
        ? self.title.replace(/\s*\b(19)?\d0s\b\s*$/, "").trim() || group
        : accessoryTypeOf(slug);
    context.series = {
      name,
      heading: `${name} through the decades`,
      models: sameGroup.slice(0, limit).map(toRelated),
    };
  }

  // Everything else of the same decade.
  const decade = decadeOf(slug);
  if (decade) {
    const seen = new Set(context.series?.models.map((m) => m.slug) ?? []);
    const sameDecade = pages.filter(
      (p) => p.slug !== slug && !seen.has(p.slug) && decadeOf(p.slug) === decade,
    );
    if (sameDecade.length > 0) {
      context.era = {
        label: decade,
        heading: `Other ${decade} ${noun}`,
        models: sameDecade.slice(0, limit).map(toRelated),
      };
    }
  }

  return context;
}
