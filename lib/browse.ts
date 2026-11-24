/**
 * The browse index behind the equipment carousel.
 *
 * One flat description of everything there is to walk between — every
 * section, the groups each is divided into, and every item with the
 * thumbnail already resolved. Built once on the server and handed to the
 * client as data, because the alternative is shipping the archive readers
 * and the thumbnail table to the browser to recompute what the build
 * already knows.
 *
 * The groupings deliberately mirror the index pages: gauge for cameras and
 * projectors, maker for lenses, type for accessories. Someone who has
 * browsed `/cameras` and then opens the carousel should find the same
 * shelves in the same order, not a second taxonomy to learn.
 */

import { getCameraRecords, getProjectorRecords, type ModelRecord } from "./museum";
import { accessoryTypeOf, getRecoveredSection, type RecoveredPage } from "./recovered";
import { getAccessoryItems, ACCESSORY_TYPES } from "./accessory-items";
import { getLensItems, LENS_MAKERS } from "./lens-items";
import { thumbnailFor } from "./thumbnails";

/**
 * The sections that have object pages worth walking between. Narrow on
 * purpose: it has to satisfy `thumbnailFor`, which only knows these four,
 * and a widened `string` here would turn a typo into a silently missing
 * thumbnail rather than a build error.
 */
export type BrowseSectionId = "cameras" | "projectors" | "lenses" | "accessories";

export interface BrowseItem {
  slug: string;
  label: string;
  href: string;
  /** Resolved thumbnail, or undefined where no usable image was found. */
  thumb?: string;
  /** A year, a maker — whatever distinguishes this one at a glance. */
  note?: string;
}

export interface BrowseGroup {
  id: string;
  label: string;
  items: BrowseItem[];
}

export interface BrowseSection {
  id: BrowseSectionId;
  label: string;
  href: string;
  groups: BrowseGroup[];
}

/** Gauges in the order the collection reads best, as on the index pages. */
const FORMAT_ORDER = ["16mm", "8mm", "Super 8", "9.5mm"] as const;
const UNKNOWN_FORMAT = "Gauge unrecorded";

const MAKER_LABEL: Array<[RegExp, string]> = [
  [/kern/, "Kern-Paillard"],
  [/meyer/, "Hugo Meyer"],
  [/goerz/, "C.P. Goerz"],
  [/wollensak/, "Wollensak"],
  [/berthiot/, "SOM Berthiot"],
  [/angenieux/, "Angénieux"],
];

export function makerOf(slug: string): string {
  for (const [re, label] of MAKER_LABEL) if (re.test(slug)) return label;
  return "Other";
}

/** A stable id for a group label, for use in markup and state. */
export function groupId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function byYearThenName(a: ModelRecord, b: ModelRecord): number {
  if (a.introduced && b.introduced) return a.introduced - b.introduced || a.name.localeCompare(b.name);
  if (a.introduced) return -1;
  if (b.introduced) return 1;
  return a.name.localeCompare(b.name);
}

function modelSection(
  id: BrowseSectionId,
  label: string,
  records: ModelRecord[],
): BrowseSection {
  const formatOf = (m: ModelRecord) =>
    m.format && (FORMAT_ORDER as readonly string[]).includes(m.format) ? m.format : UNKNOWN_FORMAT;

  const groups = [...FORMAT_ORDER, UNKNOWN_FORMAT]
    .map((format) => ({
      id: groupId(format),
      label: format,
      items: records
        .filter((m) => formatOf(m) === format)
        .sort(byYearThenName)
        .map((m) => ({
          slug: m.slug,
          label: m.name,
          href: `/${id}/${m.slug}`,
          thumb: thumbnailFor(id, m.slug, m.images),
          note: m.introduced ? String(m.introduced) : undefined,
        })),
    }))
    .filter((g) => g.items.length > 0);

  return { id, label, href: `/${id}`, groups };
}

function recoveredSection(
  id: BrowseSectionId,
  label: string,
  groupOf: (page: RecoveredPage) => string,
): BrowseSection {
  const pages = getRecoveredSection(id);
  const order: string[] = [];
  const byGroup = new Map<string, RecoveredPage[]>();
  for (const page of pages) {
    const key = groupOf(page);
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      order.push(key);
    }
    byGroup.get(key)!.push(page);
  }

  const groups = order.map((key) => ({
    id: groupId(key),
    label: key,
    items: (byGroup.get(key) ?? []).map((page) => ({
      slug: page.slug,
      label: page.title,
      href: `/${id}/${page.slug}`,
      thumb: thumbnailFor(id, page.slug, page.images),
    })),
  }));

  return { id, label, href: `/${id}`, groups: groups.filter((g) => g.items.length > 0) };
}

/**
 * Accessories, one object per card.
 *
 * Until the decade pages were broken apart this walked "Motors 1950s" and
 * "Cases 1940s", which made the carousel the only place on the site where
 * the shelf held pages rather than things. Now it holds the 98 objects,
 * grouped by type like the index, with the date under each.
 */
function accessorySection(): BrowseSection {
  const items = getAccessoryItems();
  const groups = ACCESSORY_TYPES.map((type) => ({
    id: type,
    label: type,
    items: items
      .filter((i) => i.type === type)
      .sort((a, b) => (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999) || a.name.localeCompare(b.name))
      .map((i) => ({
        slug: i.slug,
        label: i.name,
        href: `/accessories/${i.slug}`,
        thumb: i.images[0]?.src,
        note: i.year ? String(i.year) : i.decade ? `${i.decade}s` : undefined,
      })),
  })).filter((g) => g.items.length > 0);

  return { id: "accessories", label: "Accessories", href: "/accessories", groups };
}

/**
 * Lenses, one per card, grouped by maker like the index. The note under
 * each is its code where it has one, because that is the identifying mark;
 * otherwise its date.
 */
function lensSection(): BrowseSection {
  const items = getLensItems();
  const groups = LENS_MAKERS.map((maker) => ({
    id: maker,
    label: maker,
    items: items
      .filter((i) => i.maker === maker)
      .sort((a, b) => (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999) || a.name.localeCompare(b.name))
      .map((i) => ({
        slug: i.slug,
        label: i.name,
        href: `/lenses/${i.slug}`,
        thumb: i.images[0]?.src,
        note: i.codes[0] ?? (i.year ? String(i.year) : i.decade ? `${i.decade}s` : undefined),
      })),
  })).filter((g) => g.items.length > 0);

  return { id: "lenses", label: "Lenses", href: "/lenses", groups };
}

/** Everything, in nav order. */
export function getBrowseIndex(): BrowseSection[] {
  return [
    modelSection("cameras", "Cameras", getCameraRecords()),
    modelSection("projectors", "Projectors", getProjectorRecords()),
    lensSection(),
    accessorySection(),
  ].filter((s) => s.groups.length > 0);
}

/**
 * Where an item sits in the index, so the carousel can open on it.
 *
 * Returns the section and group ids rather than the objects: the caller
 * already has the index, and ids survive being handed through props and
 * state where object identity would not.
 */
export function locateInBrowseIndex(
  index: BrowseSection[],
  sectionId: string,
  slug: string,
): { sectionId: string; groupId: string } | undefined {
  const section = index.find((s) => s.id === sectionId);
  if (!section) return undefined;
  const group = section.groups.find((g) => g.items.some((i) => i.slug === slug));
  return group ? { sectionId: section.id, groupId: group.id } : undefined;
}
