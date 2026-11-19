/**
 * Pictures for the timeline, matched to what each entry actually says.
 *
 * The first version of this paired a year with whatever model was introduced
 * in it, which produced entries like "1963: Paillard merges with Thorens"
 * illustrated by an H-16 REX-2, and "1928: Bell & Howell introduces the
 * Model 75" illustrated by a Bolex. Both true about the year, neither about
 * the sentence — and a picture that is merely contemporary with the text
 * reads as filler.
 *
 * So the rule is now: show the equipment the entry *names*, and nothing
 * otherwise. Roughly half the chronology is company history — mergers,
 * magazines, a competitor's product, a film format — and those entries get
 * no picture, which is correct. An entry about a merger does not have a
 * photograph.
 *
 * Everything here is already in this archive and links to the page it
 * belongs to, so each picture is a citation rather than decoration.
 */

import { getCameraRecords, getProjectorRecords, type ModelRecord } from "./museum";
import { thumbnailFor } from "./thumbnails";
import { getTimeline } from "./timeline";

export interface TimelineMedia {
  src: string;
  alt: string;
  /** Names what the picture is, under it. */
  caption: string;
  href: string;
  /**
   * The photographer, where the picture was given to this project rather
   * than recovered from the archive. Shown wherever the picture appears,
   * not only on the model's own page: a credit that does not travel with
   * the image is not much of a credit.
   */
  credit?: string;
}

/** At most this many pictures for one year, so a panel stays readable. */
const MAX_PER_ENTRY = 3;

/**
 * A model's name as a pattern that survives the archive's own spelling.
 *
 * The chronology writes "H-16 De luxe" where the catalogue says "H-16
 * Deluxe", "H 8" for "H-8", and so on, so every run of spaces, hyphens and
 * dots between the parts of a name is treated as interchangeable.
 *
 * The boundaries are the point. Without them "C-8" matches inside "C-8SL"
 * and every mention of the later camera drags in the earlier one; `\B` on
 * either side of a bare alphanumeric run would be wrong too, so the guard
 * is an explicit "not followed by more name".
 */
function namePattern(name: string): RegExp {
  const body = name
    .trim()
    .split(/[\s\-.]+/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s\\-.]*");
  return new RegExp(`(?<![A-Za-z0-9])${body}(?![A-Za-z0-9])`, "i");
}

/**
 * Makers whose products this chronology also records.
 *
 * Paillard named models the way everyone did, so a competitor's product can
 * carry a name the Bolex catalogue also uses. The 1927 entry is entirely
 * about Bell & Howell's *Filmo Model C* and Victor's Cine Model 3 — and a
 * bare search for "Model C" pulls in a Bolex projector to illustrate it,
 * which is worse than no picture: it is a wrong attribution on a page whose
 * whole value is being right about what is what.
 *
 * So a name immediately preceded by another maker belongs to that maker.
 */
const OTHER_MAKERS =
  /(bell\s*&?\s*howell|filmo|victor(\s+(animatograph|cine))?|eastman|kodak|cine-?kodak|path[ée]|zeiss|siemens|agfa|keystone|revere)\s+(\w+\s+){0,2}$/i;

interface Candidate {
  model: ModelRecord;
  section: "cameras" | "projectors";
  pattern: RegExp;
}

function candidates(): Candidate[] {
  const all: Candidate[] = [
    ...getCameraRecords().map((m) => ({ model: m, section: "cameras" as const, pattern: namePattern(m.name) })),
    ...getProjectorRecords().map((m) => ({ model: m, section: "projectors" as const, pattern: namePattern(m.name) })),
  ];
  /*
   * Longest name first. "H-16 REX-5" must be tried before "H-16", or the
   * shorter name claims the sentence and the specific camera is never
   * reached.
   */
  return all.sort((a, b) => b.model.name.length - a.model.name.length);
}

/** Which models an entry's own words name, in the order they are named. */
export function modelsNamedIn(text: string, pool = candidates()): Candidate[] {
  const found: { at: number; candidate: Candidate }[] = [];
  /* Matched spans are blanked out so a longer name consumes its own text
     and a shorter one cannot match the remains of it. */
  let remaining = text;
  for (const candidate of pool) {
    /*
     * Every occurrence is considered, not just the first: where a name is
     * claimed by another maker in one sentence it may still be Paillard's
     * own in the next, and taking only the first match would lose that.
     */
    const all = new RegExp(candidate.pattern.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = all.exec(remaining)) !== null) {
      if (OTHER_MAKERS.test(remaining.slice(Math.max(0, m.index - 40), m.index))) continue;
      found.push({ at: m.index, candidate });
      remaining =
        remaining.slice(0, m.index) +
        " ".repeat(m[0].length) +
        remaining.slice(m.index + m[0].length);
      break;
    }
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.candidate);
}

/**
 * Pictures per timeline year, keyed by year, in the order the entry names
 * them. A year whose entry names no equipment is absent from the map.
 */
export function getTimelineMedia(): Map<string, TimelineMedia[]> {
  const pool = candidates();
  const media = new Map<string, TimelineMedia[]>();

  for (const era of getTimeline().eras) {
    for (const entry of era.entries) {
      const picked: TimelineMedia[] = [];
      const seen = new Set<string>();

      for (const { model, section } of modelsNamedIn(entry.event, pool)) {
        if (picked.length >= MAX_PER_ENTRY) break;
        const src = thumbnailFor(section, model.slug, model.images);
        if (!src || seen.has(src)) continue;
        seen.add(src);
        const credit = model.images.find((i) => i.src === src)?.credit;
        picked.push({
          src,
          alt: `Paillard-Bolex ${model.name}`,
          caption: model.name,
          href: `/${section}/${model.slug}`,
          ...(credit ? { credit } : {}),
        });
      }

      if (picked.length) media.set(entry.year, picked);
    }
  }

  return media;
}
