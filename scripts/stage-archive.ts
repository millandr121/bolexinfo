/**
 * Stages recovered archive assets into /public for the static site:
 *
 *   archive/wayback/images/**      → public/images/**      (live model imagery)
 *   archive/wayback/**\/*.html     → public/original/**    ("View Original Archive")
 *   archive/wayback/*.css          → public/original/*.css  (so it renders as published)
 *   archive/wayback/images/**      → public/original/images/** (same)
 *
 * These are derived copies of the committed archive — regenerated on every
 * build and git-ignored, so the canonical bytes live only in archive/wayback.
 *
 * Runs automatically in prebuild. Standalone: npm run stage:archive
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const WAYBACK = path.join(ROOT, "archive", "wayback");
const PUBLIC = path.join(ROOT, "public");

function copyTree(src: string, dest: string, filter: (file: string) => boolean): number {
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyTree(from, to, filter);
    } else if (filter(from)) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

function main() {
  if (!fs.existsSync(WAYBACK)) {
    console.log("No archive/wayback present yet — skipping asset staging.");
    return;
  }
  const images = copyTree(path.join(WAYBACK, "images"), path.join(PUBLIC, "images"), () => true);
  const pages = copyTree(WAYBACK, path.join(PUBLIC, "original"), (f) => f.endsWith(".html"));

  /*
   * The preserved pages need their own stylesheets and photographs, or they
   * render as bare markup with broken images — which is what "View Original
   * Archive" showed for months.
   *
   * They must sit *inside* public/original because that is where the archived
   * markup points: a root page asks for `stylebw.css` and `images/…`, a nested
   * one for `../style40.css` and `../images/…`, and both resolve within
   * /original. The duplication against public/images is deliberate; the two
   * serve different purposes and the modern site is free to optimise its copy
   * without touching the preserved one.
   */
  const styles = copyTree(WAYBACK, path.join(PUBLIC, "original"), (f) => f.endsWith(".css"));
  const originalImages = copyTree(
    path.join(WAYBACK, "images"),
    path.join(PUBLIC, "original", "images"),
    () => true,
  );

  console.log(
    `Staged ${images} images → public/images, ` +
      `${pages} pages + ${styles} stylesheets + ${originalImages} images → public/original`,
  );
}

main();
