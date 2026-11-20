/**
 * The update log, carried on.
 *
 * Michael kept a record of what he added to BolexCollector.com and
 * when, from 2005 to 2011. It is the only account of the archive's
 * working life, and stopping it at 2011 would have made this edition a
 * museum of a museum.
 *
 * So the log continues. These are the entries for work done since, in
 * the same shape as his, and the page shows both — his, then ours,
 * one list running from 2005 to now. Each is marked so it is never
 * unclear who did what: the whole project depends on that line staying
 * visible.
 *
 * Dates are the dates the work actually landed, taken from the
 * repository's own history rather than remembered. An update log that
 * guesses at its own dates is worth nothing.
 */

export interface EditionUpdate {
  /** ISO, so it sorts; the page formats it. */
  date: string;
  title: string;
  description: string;
  /** Where to go and see it. */
  href?: string;
}

export const EDITION_UPDATES: readonly EditionUpdate[] = [
  {
    date: "2026-07-26",
    title: "bolexcollector.org opens",
    description:
      "BolexCollector.com had gone offline. This edition brings it back: every page Michael " +
      "wrote, readable again, with the original site preserved alongside it exactly as it was.",
  },
  {
    date: "2026-11-18",
    title: "The Bolex 16 Pro",
    description:
      "A camera the original site never covered, researched and added from a 1970 Paillard " +
      "sales brochure. Entries added since are marked as such on their own pages.",
    href: "/cameras/16pro",
  },
  {
    date: "2026-11-18",
    title: "Suggestions, and a way to send them",
    description:
      "A form for corrections, missing models, photographs and anything you know that is not " +
      "here. It goes straight to us.",
    href: "/suggest",
  },
  {
    date: "2026-11-19",
    title: "The timeline becomes a film",
    description:
      "The chronology now plays itself, a year at a time, with the cameras each entry names. " +
      "Scrolling at any point takes it over.",
    href: "/timeline",
  },
  {
    date: "2026-11-19",
    title: "Archive photographs",
    description:
      "Photographs of Paillard as a company rather than as a shelf of cameras: the works at " +
      "Sainte-Croix in the 1950s, a projector photographed in 1937, a Bolex rigged to film an " +
      "eclipse in 1951. From public collections, each one credited and licensed.",
    href: "/photographs",
  },
  {
    date: "2026-11-20",
    title: "The glossary, all 105 terms",
    description:
      "Michael's glossary had been showing its introduction and nothing else. Every definition " +
      "is back, with the anchors he gave them, so links written against the old page still land.",
    href: "/glossary",
  },
  {
    date: "2026-11-20",
    title: "Every ephemera page has its picture",
    description:
      "95 advertisement and brochure pages were blank, because the full-size scans were never " +
      "captured before the site went down. They now show the surviving thumbnail, marked as one. " +
      "If you have any of the originals, we would like to hear from you.",
    href: "/ephemera",
  },
  {
    date: "2026-11-20",
    title: "Repair and service",
    description:
      "A directory of technicians who work on these cameras, each read from their own site.",
    href: "/technicians",
  },
];

/** Newest first, which is how the page reads. */
export function editionUpdates(): EditionUpdate[] {
  return [...EDITION_UPDATES].sort((a, b) => b.date.localeCompare(a.date));
}
