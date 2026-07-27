import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { paths } from "./config";

// Characters illegal in Windows filenames (Linux/macOS tolerate all of
// these) — query-string URLs like `/forums/index.php?c=1&sid=...` crash
// fs.mkdirSync outright on Windows if used verbatim. Percent-encode them so
// the mapping stays deterministic and collision-resistant rather than
// collapsing distinct URLs onto one path.
const WINDOWS_ILLEGAL_CHARS = /[<>:"|?*\x00-\x1f]/g;
const WINDOWS_RESERVED_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
// Windows' historical MAX_PATH is 260 chars; keep individual segments well
// under that even though this session's original bytes may run longer.
const MAX_SEGMENT_LENGTH = 150;

function sanitizeSegment(segment: string): string {
  let safe = segment.replace(WINDOWS_ILLEGAL_CHARS, (ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, "0")}`);
  safe = safe.replace(/[. ]+$/, ""); // Windows silently strips trailing dots/spaces from segments
  if (WINDOWS_RESERVED_NAMES.test(safe)) safe = `_${safe}`;
  if (safe.length > MAX_SEGMENT_LENGTH) {
    const hash = crypto.createHash("sha1").update(segment).digest("hex").slice(0, 8);
    safe = `${safe.slice(0, MAX_SEGMENT_LENGTH - 9)}~${hash}`;
  }
  return safe || "_";
}

/**
 * Archive layout: original URL structure is preserved exactly.
 *
 *   archive/wayback/<path>                  best-preserved original bytes
 *   archive/wayback/<path>.revisions/<ts>   earlier distinct revisions
 *   archive/meta/<path>.json                capture metadata (timestamps, digests)
 *
 * A root manifest (archive/meta/manifest.json) records every stored asset so
 * verification and reporting never need to re-crawl the tree.
 */

export interface StoredAsset {
  /** Site-relative URL path, e.g. "/cameras/h16.html". */
  urlPath: string;
  originalUrl: string;
  mimetype: string;
  bytes: number;
  sha1: string;
  /** Wayback capture timestamp (YYYYMMDDhhmmss) of the stored best version. */
  timestamp: string;
  /** Timestamps of additional preserved revisions. */
  revisions: string[];
  storedAt: string;
  /** Which archive served the stored bytes. Defaults to "wayback" for older records. */
  source?: "wayback" | "common-crawl";
}

export interface Manifest {
  site: string;
  updated: string;
  assets: Record<string, StoredAsset>;
}

const manifestPath = () => path.join(paths.archiveMeta, "manifest.json");

export function loadManifest(): Manifest {
  if (fs.existsSync(manifestPath())) {
    return JSON.parse(fs.readFileSync(manifestPath(), "utf8")) as Manifest;
  }
  return { site: "bolexcollector.com", updated: new Date().toISOString(), assets: {} };
}

export function saveManifest(manifest: Manifest): void {
  manifest.updated = new Date().toISOString();
  fs.mkdirSync(paths.archiveMeta, { recursive: true });
  fs.writeFileSync(manifestPath(), JSON.stringify(manifest, null, 2));
}

/** Map a site-relative URL path to its on-disk preservation location. */
export function archiveLocation(urlPath: string): string {
  const clean = urlPath.replace(/^\/+/, "").replace(/\/+$/, "") || "index.html";
  const withFile = clean.endsWith(".html") || /\.[a-z0-9]{2,4}$/i.test(clean) ? clean : `${clean}/index.html`;
  const safeSegments = withFile.split("/").map(sanitizeSegment);
  return path.join(paths.archiveWayback, ...safeSegments);
}

export function writeAsset(urlPath: string, body: Buffer): string {
  const location = archiveLocation(urlPath);
  fs.mkdirSync(path.dirname(location), { recursive: true });
  fs.writeFileSync(location, body);
  return location;
}

export function writeRevision(urlPath: string, timestamp: string, body: Buffer): string {
  const location = `${archiveLocation(urlPath)}.revisions`;
  fs.mkdirSync(location, { recursive: true });
  const file = path.join(location, timestamp);
  fs.writeFileSync(file, body);
  return file;
}

export function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

export function readJson<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}
