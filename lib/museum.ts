import fs from "node:fs";
import path from "node:path";
import { cleanImages, type ModelImage } from "./assets";
import { readContentBlocks, type ContentBlock } from "./recovered";

/**
 * The museum data layer.
 *
 * Reconciles two sources into one presentation model per item:
 *  1. Curated seed metadata (`data/models/*.json`) — hand-verified display
 *     names, formats, introduction years, and one-line summaries.
 *  2. The pipeline's real per-page extractions (`data/cameras/*.json`, …) —
 *     recovered spec text, images, tables, and original-URL provenance.
 *
 * The union is keyed by slug: curated metadata forms the spine, recovered
 * content fills it in. Models the pipeline recovered that were never in the
 * seed list are surfaced too (derived from their extracted title), so the
 * site shows the *complete* recovered catalog — nothing is dropped.
 */

const ROOT = process.cwd();
const dataDir = (...s: string[]) => path.join(ROOT, "data", ...s);

export interface Spec {
  label: string;
  value: string;
}

// Imported for local use and re-exported so existing consumers of the museum
// layer keep working after these helpers moved into ./assets.
export { cleanImages, type ModelImage };

export interface SerialRow {
  from: number | null;
  to: number | null;
  yearFrom: number;
  yearTo: number;
}

interface ExtractedPage {
  slug: string;
  title: string;
  originalUrl?: string;
  originalPath?: string;
  capturedAt?: string;
  description?: string;
  bodyText?: string;
  images?: ModelImage[];
  tables?: string[][][];
  internalLinks?: string[];
}

interface SeedEntry {
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

export interface ModelRecord {
  slug: string;
  name: string;
  format?: string;
  introduced: number | null;
  summary: string | null;
  /** Structured "LABEL: value" specifications recovered from the archived page. */
  specs: Spec[];
  images: ModelImage[];
  serialRows: SerialRow[];
  originalPath?: string;
  originalUrl?: string;
  capturedAt?: string;
  recovered: boolean;
}

// ————————————————————————————————————————————————————————————————
// Parsing primitives
// ————————————————————————————————————————————————————————————————

/** Extract "OVERALL DIMENSIONS: …" style spec lines; skips nav chrome entirely. */
export function parseSpecs(bodyText: string): Spec[] {
  const specs: Spec[] = [];
  const seen = new Set<string>();
  const re = /^[ \t]*([A-Z][A-Z0-9 /&'’.\-]{2,40}):[ \t]*(.+?)[ \t]*$/gm;
  for (const m of bodyText.matchAll(re)) {
    const label = titleCase(m[1]!.trim());
    const value = m[2]!.trim();
    if (value.length < 2 || seen.has(label)) continue;
    seen.add(label);
    specs.push({ label, value });
  }
  return specs;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Of|And|The|With|For|To|In)\b/g, (w) => w.toLowerCase());
}

/** Number like "7,510" / "10000" / "1'250" → 7510; "???" or "—" → null. */
function parseSerialNumber(cell: string): number | null {
  const c = cell.replace(/[,.'\s]/g, "");
  return /^\d{2,}$/.test(c) ? Number(c) : null;
}

/**
 * Parse a *standalone* year cell — anchored, so a serial bound like "192000"
 * (which merely contains "1920") is never mistaken for a year.
 * "1936 / 37" → [1936,1937]; "1938 / 40" → [1938,1940]; "1944" → [1944,1944].
 */
function parseYearCell(cell: string): [number, number] | null {
  const m = cell.match(/^\s*(19[2-9]\d)\s*(?:[/–-]\s*(\d{2,4}))?\s*$/);
  if (!m) return null;
  const from = Number(m[1]);
  let to = from;
  if (m[2]) {
    const tail = Number(m[2]);
    to = m[2].length === 2 ? Math.floor(from / 100) * 100 + tail : tail;
  }
  return [from, Number.isFinite(to) && to >= from ? to : from];
}

/**
 * Parse serial-range tables in the site's `[from, —, to, year]` column layout.
 * Locates the "—" separator per row (robust to leading/trailing empty cells),
 * then reads the year from a standalone year cell *after* the to-bound first —
 * so the to-bound's own digits are never misread as the year. "???" bounds
 * become null (historically real but not lookup-able).
 */
export function parseSerialRows(tables: string[][][]): SerialRow[] {
  const rows: SerialRow[] = [];
  for (const table of tables) {
    for (const r of table) {
      const dashIdx = r.findIndex((c) => /^[—–-]$/.test(c.trim()));
      if (dashIdx <= 0 || dashIdx >= r.length - 1) continue;

      let yr: [number, number] | null = null;
      for (const c of r.slice(dashIdx + 2)) {
        yr = parseYearCell(c);
        if (yr) break;
      }
      if (!yr) {
        for (let i = 0; i < r.length; i++) {
          if (i >= dashIdx - 1 && i <= dashIdx + 1) continue;
          yr = parseYearCell(r[i]!);
          if (yr) break;
        }
      }
      if (!yr) continue;

      const from = parseSerialNumber(r[dashIdx - 1]!);
      const to = parseSerialNumber(r[dashIdx + 1]!);
      if (from === null && to === null) continue;
      rows.push({ from, to, yearFrom: yr[0], yearTo: yr[1] });
    }
  }
  return rows.sort((a, b) => a.yearFrom - b.yearFrom || (a.from ?? 0) - (b.from ?? 0));
}

// ————————————————————————————————————————————————————————————————
// Loaders
// ————————————————————————————————————————————————————————————————

function readJson<T>(file: string): T | null {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : null;
}

function readExtractedDir(dir: string): Map<string, ExtractedPage> {
  const map = new Map<string, ExtractedPage>();
  const full = dataDir(dir);
  if (!fs.existsSync(full)) return map;
  for (const file of fs.readdirSync(full)) {
    if (!file.endsWith(".json")) continue;
    const page = readJson<ExtractedPage>(path.join(full, file));
    if (page?.slug) map.set(page.slug, page);
  }
  return map;
}

/** Derive a display name from a recovered page title ("Cameras | H-9" → "H-9"). */
function nameFromTitle(title: string, slug: string): string {
  const tail = title.split("|").pop()?.trim();
  return tail && tail.length > 0 ? tail : slug.toUpperCase();
}

/** Normalize the original site's own format wording to a canonical label. */
function normalizeFormat(raw: string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "");
  if (s.startsWith("super8")) return "Super 8";
  if (s.startsWith("9.5")) return "9.5mm";
  if (s.startsWith("16")) return "16mm";
  return "8mm"; // covers "8mm" and "Double 8" — both are the 8mm gauge
}

/**
 * Read the model's format and introduction year from the *archived page's own
 * header*, which reads e.g. "H-16 REX-4 / 16mm Camera / 1965".
 *
 * This reads the page's `#content` container rather than the extracted
 * bodyText: bodyText begins with the site-wide navigation listing every model,
 * which is long enough to swamp any fixed-size prefix scan and yields no
 * format at all. Taking the declaration from the original page also means the
 * site reports what Michael Tisdale documented, not what we guessed — where
 * the two disagree, the original wins.
 */
function headerFacts(originalPath?: string): { format?: string; introduced?: number } {
  const texts = readContentBlocks(originalPath)
    .filter((b): b is Extract<ContentBlock, { kind: "heading" | "paragraph" }> => b.kind !== "image")
    .slice(0, 10)
    .map((b) => b.text.trim());

  let format: string | undefined;
  let introduced: number | undefined;
  for (const t of texts) {
    if (!format) {
      const m = /^(super\s?8(?:mm)?|16\s?mm|9\.5\s?mm|double\s?8(?:mm)?|8\s?mm)\s+(camera|projector)\b/i.exec(t);
      if (m) format = normalizeFormat(m[1]!);
    }
    if (introduced === undefined) {
      const y = /^(19[2-9]\d)$/.exec(t);
      if (y) introduced = Number(y[1]);
    }
  }
  return { format, introduced };
}

function reconcile(seedFile: string, extractedDir: string): ModelRecord[] {
  const seedDoc = readJson<{ models?: SeedEntry[] }>(dataDir("models", seedFile));
  const seed = new Map((seedDoc?.models ?? []).map((m) => [m.slug, m]));
  const extracted = readExtractedDir(extractedDir);

  const slugs = new Set<string>([...seed.keys(), ...extracted.keys()]);
  const records: ModelRecord[] = [];

  for (const slug of slugs) {
    const s = seed.get(slug);
    const e = extracted.get(slug);
    // Skip non-model helper pages that slipped into the extraction.
    if (!s && e && /instructions|index/i.test(slug)) continue;
    const specs = e?.bodyText ? parseSpecs(e.bodyText) : [];
    // The archived page's own header is authoritative for format and year;
    // curated seed values only fill gaps where the page didn't state them.
    const facts = headerFacts(e?.originalPath ?? s?.originalPath);
    records.push({
      slug,
      name: s?.name ?? (e ? nameFromTitle(e.title, slug) : slug.toUpperCase()),
      format: facts.format ?? s?.format,
      introduced: facts.introduced ?? s?.introduced ?? null,
      summary: s?.summary ?? e?.description ?? null,
      specs,
      images: cleanImages(e?.images),
      serialRows: e?.tables ? parseSerialRows(e.tables) : [],
      originalPath: e?.originalPath ?? s?.originalPath,
      originalUrl: e?.originalUrl,
      capturedAt: e?.capturedAt,
      recovered: Boolean(e),
    });
  }

  return records.sort((a, b) => Number(b.recovered) - Number(a.recovered) || a.name.localeCompare(b.name));
}

export function getCameraRecords(): ModelRecord[] {
  return reconcile("cameras.json", "cameras");
}

export function getProjectorRecords(): ModelRecord[] {
  return reconcile("projectors.json", "projectors");
}

export function getCameraRecord(slug: string): ModelRecord | undefined {
  return getCameraRecords().find((m) => m.slug === slug);
}
