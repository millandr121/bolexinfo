import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

/*
 * Every internal link on the modern site points at a page that exists.
 *
 * This is the check the whole project rests on. A restoration whose
 * own links 404 is not a restoration, and the failure is invisible
 * from the inside: the build succeeds, the page renders, and the link
 * only breaks for the reader who clicks it. Michael's cross-references
 * between a glossary term and an article, or a camera and the lens
 * that fits it, are a large part of what made the original site worth
 * saving, so they have to keep working.
 *
 * /original/ is excluded. Those pages are reproduced byte for byte and
 * their links point into the 2000s site as it was; rewriting them
 * would damage the record, and they are served under a noindex header
 * precisely because they are a second copy.
 */

const OUT = "out";

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test("no internal link points at a page that does not exist", { skip: !fs.existsSync(OUT) }, () => {
  const all = walk(OUT);
  const htmlFiles = all.filter((f) => f.endsWith(".html"));
  assert.ok(htmlFiles.length > 100, `expected a built site, found ${htmlFiles.length} pages`);

  /* Every address the site actually serves, in both the forms a link
     might use. */
  const served = new Set<string>();
  for (const file of all) {
    const rel = file.slice(OUT.length);
    served.add(rel);
    if (rel.endsWith("/index.html")) served.add(rel.slice(0, -"index.html".length).replace(/\/$/, "") || "/");
    if (rel.endsWith(".html")) served.add(rel.slice(0, -".html".length));
  }

  /* Assets are checked by their own path, not as routes. */
  const ASSET = /\.(xml|json|txt|ico|svg|png|jpe?g|webp|gif|pdf|css|js|woff2?)$/i;

  const broken = new Map<string, string>();
  let checked = 0;

  for (const file of htmlFiles) {
    if (file.slice(OUT.length + 1).startsWith("original/")) continue;
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const raw = match[1];
      if (!raw || ASSET.test(raw)) continue;
      checked++;
      const trimmed = raw.replace(/\/$/, "") || "/";
      if (served.has(raw) || served.has(trimmed) || served.has(`${trimmed}.html`)) continue;
      if (!broken.has(trimmed)) broken.set(trimmed, file.slice(OUT.length + 1));
    }
  }

  assert.ok(checked > 1000, `expected plenty of internal links, checked ${checked}`);
  assert.deepEqual(
    [...broken].map(([target, from]) => `${target} (linked from ${from})`),
    [],
    "these links go nowhere",
  );
});
