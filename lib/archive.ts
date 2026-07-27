import fs from "node:fs";
import path from "node:path";

/**
 * "View Original Archive" links.
 *
 * The preservation pipeline stored the original page bytes under
 * archive/wayback/<path>. A prebuild step (scripts/stage-archive.ts) copies
 * those HTML files to public/original/<path> so the unmodified historical page
 * is served alongside the modern edition. This helper returns the public href
 * only when the preserved original actually exists on disk — no dead links.
 */
const ROOT = process.cwd();

export function originalArchiveHref(originalPath?: string): string | null {
  if (!originalPath || !originalPath.endsWith(".html")) return null;
  const onDisk = path.join(ROOT, "archive", "wayback", originalPath.replace(/^\//, ""));
  if (!fs.existsSync(onDisk)) return null;
  return `/original${originalPath}`;
}
