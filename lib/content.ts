import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SerialRow } from "./museum";

/**
 * All content access flows through this module. Pages never read files
 * directly — the structured data in /data and /content is the single source
 * of truth, and this is the seam future maintainers extend.
 */

const ROOT = process.cwd();
const dataPath = (...segments: string[]) => path.join(ROOT, "data", ...segments);

export interface ModelEntry {
  slug: string;
  name: string;
  format?: string;
  country?: string;
  introduced?: number | null;
  originalPath?: string;
  pages?: string[];
  summary: string | null;
  recovery: "full" | "summary-only" | "pending";
}

interface ModelFile {
  provenance: string;
  models?: ModelEntry[];
  manufacturers?: ModelEntry[];
  categories?: ModelEntry[];
}

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function getCameras(): { provenance: string; models: ModelEntry[] } {
  const file = readJson<ModelFile>(dataPath("models", "cameras.json"));
  return { provenance: file?.provenance ?? "", models: file?.models ?? [] };
}

export function getProjectors(): { provenance: string; models: ModelEntry[] } {
  const file = readJson<ModelFile>(dataPath("models", "projectors.json"));
  return { provenance: file?.provenance ?? "", models: file?.models ?? [] };
}

export function getLensMakers(): { provenance: string; makers: ModelEntry[] } {
  const file = readJson<ModelFile>(dataPath("models", "lenses.json"));
  return { provenance: file?.provenance ?? "", makers: file?.manufacturers ?? [] };
}

export function getAccessoryCategories(): { provenance: string; categories: ModelEntry[] } {
  const file = readJson<ModelFile>(dataPath("models", "accessories.json"));
  return { provenance: file?.provenance ?? "", categories: file?.categories ?? [] };
}

export interface SerialDataset {
  source: string;
  status?: string;
  note?: string;
  capturedAt?: string;
  ranges: SerialRow[];
}

export function getSerialDataset(): SerialDataset {
  return (
    readJson<SerialDataset>(dataPath("serials", "ranges.json")) ?? {
      source: "unavailable",
      status: "pending-recovery",
      ranges: [],
    }
  );
}

export interface Article {
  slug: string;
  title: string;
  date?: string;
  description?: string;
  originalUrl?: string;
  originalPath?: string;
  capturedAt?: string;
  kind?: string;
  body: string;
}

/** Strip "Bolex Collector | Articles | " prefixes from a recovered title. */
function cleanTitle(title: string): string {
  return title.replace(/^(Bolex Collector\s*\|\s*)?(Articles?\s*\|\s*)?/i, "").trim();
}

/**
 * Recovered article Markdown was produced by running Turndown over the whole
 * archived HTML page, so it carries the site's nav, social links, ad scripts
 * and footer. Real content sits between the article's own `## ` heading and
 * the footer nav ("Return to Index" / "Copyright"). This isolates it.
 */
function cleanArticleBody(md: string): string {
  let s = md;
  // Drop everything up to and including the article's first H2 title line
  // (the page renders the title separately), removing the leading chrome.
  const h2 = s.match(/^##\s+.+$/m);
  if (h2) s = s.slice(s.indexOf(h2[0]) + h2[0].length);
  // Cut the footer: the nav block beginning at "[Return to Index]".
  const footer = s.search(/\*\s*\[Return to Index\]/);
  if (footer !== -1) s = s.slice(0, footer);
  // Remove stray tracking/ad/social lines anywhere in the body.
  s = s
    .split("\n")
    .filter((l) => !/document\.write|urchinTracker|_uacct|addthis\.com|lg-share-en\.gif|s7\.addthis/.test(l))
    .join("\n");
  // Tidy a dangling horizontal rule left where the footer was removed.
  return s.replace(/\n\s*\*\s*\*\s*\*\s*$/, "").trim();
}

function readMarkdownDir(dir: string, clean: boolean): Article[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const rawTitle = (data.title as string) ?? path.basename(f, ".md");
      return {
        slug: path.basename(f, ".md"),
        title: clean ? cleanTitle(rawTitle) : rawTitle,
        date: data.date as string | undefined,
        description: data.description as string | undefined,
        originalUrl: data.originalUrl as string | undefined,
        originalPath: data.originalPath as string | undefined,
        capturedAt: data.capturedAt as string | undefined,
        kind: data.kind as string | undefined,
        body: clean ? cleanArticleBody(content) : content,
      };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function getRecoveredArticles(): Article[] {
  return readMarkdownDir(path.join(ROOT, "content", "articles"), true);
}

export function getEditorial(slug: string): Article | null {
  const all = readMarkdownDir(path.join(ROOT, "content", "editorial"), false);
  return all.find((a) => a.slug === slug) ?? null;
}

export interface InventoryEntry {
  path: string;
  title: string;
  section: string;
}

export function getUrlInventory(): { entries: InventoryEntry[]; note: string } {
  const file = readJson<{ verifiedUrls: InventoryEntry[]; provenance: { note: string } }>(
    dataPath("recovery", "url-inventory.json"),
  );
  return { entries: file?.verifiedUrls ?? [], note: file?.provenance.note ?? "" };
}

export interface ArchivedAsset {
  urlPath: string;
  mimetype: string;
  bytes: number;
  timestamp: string;
  source?: string;
}

/** Every asset the preservation pipeline stored, read from the archive manifest. */
export function getArchivedAssets(): ArchivedAsset[] {
  const manifest = readJson<{ assets: Record<string, ArchivedAsset> }>(
    path.join(ROOT, "archive", "meta", "manifest.json"),
  );
  return manifest ? Object.values(manifest.assets) : [];
}

/** Headline counts for the archive ledger. */
export function getArchiveStats(): {
  assets: number;
  pages: number;
  images: number;
  downloads: number;
  bytes: number;
} {
  const assets = getArchivedAssets();
  return {
    assets: assets.length,
    pages: assets.filter((a) => a.mimetype.includes("html")).length,
    images: assets.filter((a) => a.mimetype.startsWith("image/")).length,
    downloads: assets.filter((a) => /pdf|zip|octet/.test(a.mimetype)).length,
    bytes: assets.reduce((n, a) => n + (a.bytes ?? 0), 0),
  };
}
