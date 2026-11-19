/**
 * Archival pictures for the timeline, drawn from what the archive already
 * holds rather than sourced from elsewhere.
 *
 * Nothing here is fetched or licensed: every image is one already recovered
 * from BolexCollector.com and already published on this site, so illustrating
 * the chronology raises no question the rest of the site has not already
 * answered. Each picture links back to the page it belongs to, so it reads as
 * a citation rather than decoration.
 *
 * The pairing is deliberately plain:
 *
 *  1. A camera or projector *introduced that year* — the strongest possible
 *     illustration of "1954: the H-16 Supreme is announced".
 *  2. Failing that, a piece of period advertising from the same decade.
 *  3. Failing that, nothing.
 *
 * Rule 3 matters as much as the others. Bolex did not exist before 1928 and
 * the advertising begins in the 1940s, so the first eleven entries have no
 * picture and are not given a borrowed one. The page opens as plain text and
 * the images begin when the cameras do, which is the truth of the story
 * rather than a gap to paper over.
 */

import { getCameraRecords, getProjectorRecords, type ModelRecord } from "./museum";
import { getRecoveredSection } from "./recovered";
import { thumbnailFor } from "./thumbnails";
import { getTimeline } from "./timeline";

export interface TimelineMedia {
  src: string;
  alt: string;
  /** Names what the picture is, under it. */
  caption: string;
  href: string;
  kind: "model" | "ephemera";
  /**
   * The photographer, where the picture was not recovered from the archive
   * but given to this project. Shown wherever the picture is, not only on
   * the model's own page: a credit that travels with the image is the whole
   * point of having one.
   */
  credit?: string;
}

/** Advertising begins in this decade; before it, rule 2 has nothing to offer. */
const FIRST_AD_DECADE = 1940;

/**
 * An advertisement has to be *about Bolex* to illustrate a Bolex timeline.
 *
 * The ephemera section keeps whole magazine pages, so some sheets are there
 * for what was printed on the other side of them: one is catalogued, quite
 * correctly, as "1953 Linda Darnell Rheingold Beer Ad". Faithful to the
 * archive, and absurd next to an entry about registration claws.
 *
 * A positive signal is demanded rather than a blocklist of the off-topic
 * ones. It is the conservative direction: it will pass over a genuine Bolex
 * sheet filed under a title like "Pleasure Aplenty!", which costs nothing,
 * because there are seventy sheets competing for four places on the page.
 */
const ABOUT_BOLEX = /bolex|paillard|kern|berthiot|pan ?cinor|switar|yvar/i;

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Period advertising, grouped by decade and kept in a stable order.
 *
 * Only the individual sheets are wanted — `ads50` is the gallery page that
 * collects them and its thumbnail is a contact sheet, which illustrates
 * nothing at this size.
 */
function adsByDecade(): Map<number, { src: string; alt: string; href: string; title: string }[]> {
  const out = new Map<number, { src: string; alt: string; href: string; title: string }[]>();
  for (const page of getRecoveredSection("ephemera")) {
    const m = /^ads(\d\d)-/.exec(page.slug);
    const image = page.images[0];
    if (!m?.[1] || !image) continue;
    if (!ABOUT_BOLEX.test(`${page.title} ${image.alt ?? ""}`)) continue;
    const decade = 1900 + Number(m[1]);
    if (!out.has(decade)) out.set(decade, []);
    out.get(decade)!.push({
      src: image.src,
      alt: image.alt || page.title,
      href: `/ephemera/${page.slug}`,
      title: page.title,
    });
  }
  // Slug order, so the same year gets the same advertisement on every build.
  for (const list of out.values()) list.sort((a, b) => a.href.localeCompare(b.href));
  return out;
}

function modelsByYear(): Map<number, (ModelRecord & { section: "cameras" | "projectors" })[]> {
  const all = [
    ...getCameraRecords().map((m) => ({ ...m, section: "cameras" as const })),
    ...getProjectorRecords().map((m) => ({ ...m, section: "projectors" as const })),
  ];
  const out = new Map<number, (ModelRecord & { section: "cameras" | "projectors" })[]>();
  for (const model of all) {
    if (!model.introduced) continue;
    if (!out.has(model.introduced)) out.set(model.introduced, []);
    out.get(model.introduced)!.push(model);
  }
  /* Cameras before projectors, then by name: the chronology is a camera
     story, and a stable order keeps the static export reproducible. */
  for (const list of out.values()) {
    list.sort((a, b) =>
      a.section === b.section ? a.name.localeCompare(b.name) : a.section === "cameras" ? -1 : 1,
    );
  }
  return out;
}

/**
 * One picture per timeline year, or none.
 *
 * Walks the chronology in order so that advertising is handed out without
 * repeating: a decade's sheets are used one after another, and only reused
 * once the decade has run out of them. Doing this in a single pass is what
 * keeps it deterministic — the same build always produces the same pairing.
 */
export function getTimelineMedia(): Map<string, TimelineMedia> {
  const byYear = modelsByYear();
  const ads = adsByDecade();
  const used = new Map<number, number>();
  const media = new Map<string, TimelineMedia>();
  /*
   * The archive sometimes files one photograph against several models —
   * two early projectors share a single picture — and the same image twice
   * in a chronology reads as a mistake even though the data is honest. A
   * year whose only model picture is already spoken for falls through to
   * advertising instead.
   */
  const shown = new Set<string>();

  for (const era of getTimeline().eras) {
    for (const entry of era.entries) {
      const year = Number(entry.year);
      if (!Number.isFinite(year)) continue;

      const models = byYear.get(year) ?? [];
      const model = models.find((m) => {
        const src = thumbnailFor(m.section, m.slug, m.images);
        return src && !shown.has(src);
      });
      if (model) {
        const src = thumbnailFor(model.section, model.slug, model.images);
        if (src) {
          shown.add(src);
          const credit = model.images.find((i) => i.src === src)?.credit;
          media.set(entry.year, {
            src,
            alt: `Paillard-Bolex ${model.name}`,
            caption: model.name,
            href: `/${model.section}/${model.slug}`,
            kind: "model",
            ...(credit ? { credit } : {}),
          });
          continue;
        }
      }

      const decade = decadeOf(year);
      if (decade < FIRST_AD_DECADE) continue;
      const sheets = ads.get(decade);
      if (!sheets?.length) continue;
      const next = used.get(decade) ?? 0;
      used.set(decade, next + 1);
      const sheet = sheets[next % sheets.length];
      if (!sheet) continue;
      shown.add(sheet.src);
      media.set(entry.year, {
        src: sheet.src,
        alt: sheet.alt,
        caption: `${decade}s advertising`,
        href: sheet.href,
        kind: "ephemera",
      });
    }
  }

  return media;
}
