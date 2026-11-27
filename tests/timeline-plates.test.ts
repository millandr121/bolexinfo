import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { SCENES, openingPlate, closingPlate, interludes, plateForYear } from "../lib/scenes";
import { getTimeline } from "../lib/timeline";
import type { Plate } from "../lib/scenes";

function entries() {
  return getTimeline().eras.flatMap((e) => e.entries);
}

function deck(): Plate[] {
  const out: Plate[] = [openingPlate(), ...interludes()];
  for (const e of entries()) {
    const placed = plateForYear(e.year);
    if (placed) out.push(placed.plate);
  }
  const closing = closingPlate();
  if (closing) out.push(closing);
  return out;
}

/**
 * Every slide points at a file that exists.
 *
 * The placements are made by file name in lib/scenes.ts, so a renamed
 * or deleted photograph is a broken full-screen image on the busiest
 * page on the site, and nothing else would notice.
 */
test("every scene's file is on disk", () => {
  for (const s of SCENES) {
    const onDisk = path.join(process.cwd(), "media", s.src.replace(/^\//, ""));
    assert.ok(fs.existsSync(onDisk), `${s.src} has no file at media/${s.src.replace(/^\//, "")}`);
  }
});

/**
 * No photograph appears twice, and none is shipped unused.
 *
 * The closing band is the one deliberate repeat: the Sainte-Croix
 * works carries the 1875 entry and then closes the page, which is the
 * joke — the same building at either end of the century.
 */
test("the deck uses each scene once, and uses all of them", () => {
  const srcs = deck()
    .map((p) => p.src)
    /* The works is the one deliberate repeat; see above. */
    .filter((src) => src !== closingPlate()?.src);
  assert.equal(new Set(srcs).size, srcs.length, `a photograph is shown twice: ${srcs.join(", ")}`);

  const shown = new Set(deck().map((p) => p.src));
  for (const s of SCENES) {
    assert.ok(shown.has(s.src), `${s.src} is in the data and on no slide`);
  }
});

/**
 * The chapter that ends in 1927 is almost entirely bare, and should be.
 *
 * Nothing in this archive is older than the 1930s, so an illustrated
 * entry up there would have to be a photograph standing in for a
 * connection it does not have. The one exception is deliberate and
 * captioned: the Sainte-Croix works the 1875 entry opens, photographed
 * in 1996.
 */
test("the earliest chapter is not illustrated out of nothing", () => {
  const first = getTimeline().eras[0];
  assert.ok(first, "the chronology should have a first era");
  const placed = first.entries.filter((e) => plateForYear(e.year));
  assert.deepEqual(
    placed.map((e) => e.year),
    ["1875"],
    "only the Sainte-Croix works belongs in the chapter that ends in 1927",
  );
});

/** Enough of the chronology carries a picture to be worth the machinery. */
test("a good share of the dated entries are illustrated", () => {
  const all = entries();
  const withPicture = all.filter((e) => plateForYear(e.year)).length;
  assert.ok(
    withPicture >= 18,
    `only ${withPicture} of ${all.length} entries have a photograph`,
  );
});

/** Every slide says what it is, who to credit and where the original is. */
test("every plate carries a title, a credit and a link", () => {
  const all = deck();
  assert.ok(all.length >= 25, `${all.length} plates is fewer than expected`);
  for (const p of all) {
    assert.ok(p.title.trim(), `${p.src} has no title`);
    assert.ok(p.credit.trim(), `${p.src} has no credit`);
    assert.ok(p.href.trim(), `${p.src} has nowhere to go`);
    assert.ok(p.alt.trim().length > 20, `${p.src} needs a real alt text`);
  }
});
