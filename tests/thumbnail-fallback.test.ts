import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { cleanImages } from "../lib/assets";
import { getRecoveredSection } from "../lib/recovered";

/*
 * 95 ephemera pages showed no picture at all, because each asks for a
 * full-size scan the Wayback Machine never captured while its
 * thumbnail sits beside it in the archive. Verified against Wayback's
 * own index: 220 files for that directory, 81 full-size and 139
 * thumbnails, exactly what is on disk. Nothing was lost in harvesting
 * and no refetch will produce the rest.
 */

const EPHEMERA = path.join("archive", "wayback", "images", "ephemera");

test("a missing full-size scan falls back to its thumbnail", () => {
  const files = new Set(fs.readdirSync(EPHEMERA));
  const orphan = [...files]
    .filter((f) => f.includes("_t."))
    .map((f) => f.replace("_t.", "."))
    .find((f) => !files.has(f));
  assert.ok(orphan, "expected at least one scan that exists only as a thumbnail");

  const [kept] = cleanImages([{ src: `/images/ephemera/${orphan}`, alt: "an advertisement" }]);
  assert.ok(kept, `${orphan} should fall back rather than vanish`);
  assert.equal(kept.src, `/images/ephemera/${orphan.replace(".", "_t.")}`);
  assert.equal(kept.thumbnailOnly, true, "the substitution must be marked");
});

test("an image that is genuinely absent is still dropped", () => {
  const kept = cleanImages([{ src: "/images/ephemera/not-a-real-file.jpg", alt: "" }]);
  assert.deepEqual(kept, [], "no file and no thumbnail means no image");
});

test("a scan that was preserved is used as-is and not marked", () => {
  const files = fs.readdirSync(EPHEMERA);
  const full = files.find((f) => !f.includes("_t.") && /\.jpe?g$/i.test(f));
  assert.ok(full, "expected some full-size scans to exist");

  const [kept] = cleanImages([{ src: `/images/ephemera/${full}`, alt: "" }]);
  assert.ok(kept);
  assert.equal(kept.src, `/images/ephemera/${full}`);
  assert.equal(kept.thumbnailOnly, undefined, "a preserved scan must not claim to be a thumbnail");
});

/*
 * The point of the whole change: no ephemera page is blank now. This
 * asserts the outcome rather than the mechanism, because the mechanism
 * could be replaced and the outcome is what matters.
 */
test("every ephemera page shows something", () => {
  const pages = getRecoveredSection("ephemera");
  assert.ok(pages.length > 100, `expected the ephemera section, found ${pages.length}`);

  const blank = pages.filter((p) => !p.blocks.some((b) => b.kind === "image"));
  assert.deepEqual(
    blank.map((p) => p.slug),
    [],
    "no ephemera page should be without its picture",
  );

  const onlyThumbs = pages.filter((p) =>
    p.blocks.some((b) => b.kind === "image" && b.thumbnailOnly),
  );
  assert.ok(
    onlyThumbs.length > 50,
    `expected many pages to be thumbnail-only, found ${onlyThumbs.length}`,
  );
});

test("the built pages say when only a thumbnail survives", { skip: !fs.existsSync("out/ephemera") }, () => {
  const pages = getRecoveredSection("ephemera");
  const sample = pages.find((p) => p.blocks.some((b) => b.kind === "image" && b.thumbnailOnly));
  assert.ok(sample, "expected a thumbnail-only page to check");

  const built = path.join("out", "ephemera", `${sample.slug}.html`);
  assert.ok(fs.existsSync(built), `${built} should have been built`);
  const html = fs.readFileSync(built, "utf8");
  assert.match(
    html,
    /Thumbnail only/,
    "a page showing only a thumbnail must say so rather than pass it off as the scan",
  );
});
