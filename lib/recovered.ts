import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import { cleanImages, type ModelImage } from "./assets";

/**
 * Generic renderer source for recovered pages whose value is narrative rather
 * than tabulated specifications — lenses, accessories, ephemera, glossary and
 * timeline.
 *
 * Prose is read from the *archived HTML* rather than the extracted `bodyText`
 * blob, because every original page wraps its real content in `#content`,
 * separate from `#sidebar`, `#headerone/two` and `#footer`. Reading that one
 * container yields the author's writing with the site chrome excluded, in
 * document order, without heuristic guessing.
 */

const ROOT = process.cwd();

export type ContentBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "image"; src: string; alt: string };

export interface RecoveredPage {
  slug: string;
  title: string;
  originalPath?: string;
  originalUrl?: string;
  capturedAt?: string;
  description?: string;
  blocks: ContentBlock[];
  images: ModelImage[];
  tables: string[][][];
}

interface ExtractedJson {
  slug: string;
  title: string;
  originalUrl?: string;
  originalPath?: string;
  capturedAt?: string;
  description?: string;
  images?: ModelImage[];
  tables?: string[][][];
}

/** Resolve an archived page's relative asset href to a site-absolute path. */
function toSitePath(raw: string, basePath: string): string | null {
  const href = raw.trim();
  if (!href || href.startsWith("#") || href.startsWith("data:")) return null;
  const wayback = /^https?:\/\/web\.archive\.org\/web\/\d+(?:[a-z_]+)?\/(https?:\/\/.*)$/i.exec(href);
  const target = wayback?.[1] ?? href;
  try {
    const url = new URL(target, `http://bolexcollector.com${basePath}`);
    if (!/(^|\.)bolexcollector\.com$/i.test(url.hostname)) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

/** Strip the section prefix from a recovered title ("Lenses | Kern 1950s" → "Kern 1950s"). */
export function cleanTitle(title: string): string {
  return title.replace(/^(Bolex Collector\s*\|\s*)?/i, "").split("|").slice(-1)[0]!.trim();
}

/**
 * Read the ordered content blocks of an archived page. Returns [] when the
 * page was never recovered, so callers degrade to their JSON summary instead
 * of rendering an empty shell.
 */
export function readContentBlocks(originalPath: string | undefined): ContentBlock[] {
  if (!originalPath) return [];
  const file = path.join(ROOT, "archive", "wayback", originalPath.replace(/^\//, ""));
  if (!fs.existsSync(file)) return [];

  const root = parse(fs.readFileSync(file, "latin1"));
  const content = root.querySelector("#content");
  if (!content) return [];
  content.querySelectorAll("script, style").forEach((el) => el.remove());

  const blocks: ContentBlock[] = [];
  const seenImages = new Set<string>();

  for (const el of content.querySelectorAll("h1, h2, h3, h4, p, img")) {
    const tag = el.tagName?.toUpperCase();
    if (tag === "IMG") {
      const src = toSitePath(el.getAttribute("src") ?? "", originalPath);
      if (!src || seenImages.has(src)) continue;
      const [kept] = cleanImages([{ src, alt: el.getAttribute("alt") ?? "" }]);
      if (!kept) continue;
      seenImages.add(src);
      blocks.push({ kind: "image", src: kept.src, alt: kept.alt });
      continue;
    }
    const text = el.structuredText.replace(/\s+/g, " ").trim();
    if (text.length < 2) continue;
    if (tag === "P") blocks.push({ kind: "paragraph", text });
    else blocks.push({ kind: "heading", text });
  }
  return blocks;
}

function readJson(section: string, slug: string): ExtractedJson | null {
  const file = path.join(ROOT, "data", section, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as ExtractedJson;
}

export function getRecoveredPage(section: string, slug: string): RecoveredPage | null {
  const json = readJson(section, slug);
  if (!json) return null;
  return {
    slug: json.slug ?? slug,
    title: cleanTitle(json.title ?? slug),
    originalPath: json.originalPath,
    originalUrl: json.originalUrl,
    capturedAt: json.capturedAt,
    description: json.description,
    blocks: readContentBlocks(json.originalPath),
    images: cleanImages(json.images),
    tables: json.tables ?? [],
  };
}

export function getRecoveredSection(section: string): RecoveredPage[] {
  const dir = path.join(ROOT, "data", section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => getRecoveredPage(section, path.basename(f, ".json")))
    .filter((p): p is RecoveredPage => p !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// ————————————————————————————————————————————————————————————————
// Slug taxonomy — the original site encoded decade and type into filenames
// ————————————————————————————————————————————————————————————————

export const DECADE_LABEL: Record<string, string> = {
  "30": "1930s",
  "40": "1940s",
  "50": "1950s",
  "60": "1960s",
  "70": "1970s",
};

/** "50kern" → 1950s; "motor50" → 1950s; "ads40-ad001" → 1940s. */
export function decadeOf(slug: string): string | undefined {
  const m = /(?:^|[a-z-])(3\d|4\d|5\d|6\d|7\d)(?:$|[a-z-])/.exec(slug) ?? /^(\d{2})/.exec(slug);
  const key = m?.[1]?.slice(0, 1);
  return key ? DECADE_LABEL[`${key}0`] : undefined;
}

const ACCESSORY_TYPES: Record<string, string> = {
  case: "Cases",
  edit: "Editing Equipment",
  filter: "Filters & Lens Accessories",
  misc: "Miscellaneous",
  motor: "Motors",
  support: "Tripods & Grips",
  view: "Viewfinders",
};

/** "motor50" → "Motors". */
export function accessoryTypeOf(slug: string): string {
  const key = slug.replace(/\d+$/, "");
  return ACCESSORY_TYPES[key] ?? "Other";
}

/** "ads40-ad001" → "Advertising"; "catalog50" → "Catalogs"; "volume4" → "Bolex Reporter". */
export function ephemeraTypeOf(slug: string): string {
  if (/^volume/.test(slug)) return "Bolex Reporter";
  if (/catalog/.test(slug)) return "Catalogs";
  if (/bro\d/.test(slug)) return "Brochures";
  if (/ads?\d/.test(slug)) return "Advertising";
  return "Other";
}
