import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

export interface SerialRange {
  year: number;
  from: number;
  to: number;
  series?: string;
  note?: string;
}

export interface SerialDataset {
  source: string;
  status?: string;
  note?: string;
  ranges: SerialRange[];
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

function readMarkdownDir(dir: string): Article[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return {
        slug: path.basename(f, ".md"),
        title: (data.title as string) ?? path.basename(f, ".md"),
        date: data.date as string | undefined,
        description: data.description as string | undefined,
        originalUrl: data.originalUrl as string | undefined,
        originalPath: data.originalPath as string | undefined,
        capturedAt: data.capturedAt as string | undefined,
        kind: data.kind as string | undefined,
        body: content,
      };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function getRecoveredArticles(): Article[] {
  return readMarkdownDir(path.join(ROOT, "content", "articles"));
}

export function getEditorial(slug: string): Article | null {
  const all = readMarkdownDir(path.join(ROOT, "content", "editorial"));
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

/** Count of preserved assets, if the archive manifest exists yet. */
export function getArchiveStats(): { assets: number; pages: number } {
  const manifest = readJson<{ assets: Record<string, { mimetype: string }> }>(
    path.join(ROOT, "archive", "meta", "manifest.json"),
  );
  const assets = manifest ? Object.values(manifest.assets) : [];
  return {
    assets: assets.length,
    pages: assets.filter((a) => a.mimetype.includes("html")).length,
  };
}
