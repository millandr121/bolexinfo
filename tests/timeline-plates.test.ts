import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { SCENES, openingPlate, closingPlate, interludes, plateForEra } from "../lib/scenes";
import { getTimeline } from "../lib/timeline";

/**
 * Every slide points at a file that exists.
 *
 * The plates are chosen by file name in lib/scenes.ts, so a renamed or
 * deleted photograph is a broken full-screen image on the busiest page
 * on the site, and nothing else would notice.
 */
test("every scene's file is on disk", () => {
  for (const s of SCENES) {
    const onDisk = path.join(process.cwd(), "media", s.src.replace(/^\//, ""));
    assert.ok(fs.existsSync(onDisk), `${s.src} has no file at media/${s.src.replace(/^\//, "")}`);
  }
});

/** Every scene is used, and none is used twice. */
test("the deck uses each scene exactly once", () => {
  const eras = getTimeline().eras.map((e) => e.era);
  const used = [
    openingPlate(),
    ...eras.map(plateForEra).filter((p) => p !== undefined),
    ...interludes(),
    closingPlate(),
  ].filter((p) => p !== undefined);

  const srcs = used.map((p) => p.src);
  assert.equal(new Set(srcs).size, srcs.length, `a photograph is shown twice: ${srcs.join(", ")}`);

  for (const s of SCENES) {
    assert.ok(srcs.includes(s.src), `${s.src} is in the data and on no slide`);
  }
});

/**
 * A plate never claims a year it cannot support.
 *
 * The whole argument for showing these is that they carry a chapter or
 * stand alone, captioned, rather than illustrating a dated entry. If a
 * scene ever grew an `era` naming a chapter that ends before the
 * photograph could have been taken, that argument would quietly stop
 * being true.
 */
test("no scene carries the chapter that ends in 1927", () => {
  const earliest = getTimeline().eras[0]?.era;
  assert.ok(earliest, "the chronology should have a first era");
  assert.equal(
    plateForEra(earliest),
    undefined,
    `${earliest} ends before any photograph in this archive was taken`,
  );
});

/** Every slide says who to credit and where the original is. */
test("every plate carries a credit and a link", () => {
  const eras = getTimeline().eras.map((e) => e.era);
  const all = [
    openingPlate(),
    ...eras.map(plateForEra).filter((p) => p !== undefined),
    ...interludes(),
    closingPlate(),
  ].filter((p) => p !== undefined);
  assert.ok(all.length >= 8, `${all.length} plates is fewer than expected`);
  for (const p of all) {
    assert.ok(p.credit.trim(), `${p.src} has no credit`);
    assert.ok(p.href.trim(), `${p.src} has nowhere to go`);
    assert.ok(p.alt.trim().length > 20, `${p.src} needs a real alt text`);
  }
});
