import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ARCHIVAL_PHOTOGRAPHS, archivalFor, creditLine } from "../lib/archival";
import { plateForYear, openingPlate, closingPlate, interludes } from "../lib/scenes";
import { getTimeline } from "../lib/timeline";

/*
 * These photographs are other people's work, used under licences that
 * ask for specific things in return. Every one of those obligations is
 * asserted here rather than trusted to a reviewer noticing, because the
 * failure mode is silent: a credit dropped in a refactor looks like
 * nothing at all on the page, and is the one mistake this project
 * cannot afford to make.
 */

test("every photograph carries a complete credit", () => {
  assert.ok(ARCHIVAL_PHOTOGRAPHS.length > 0, "there should be photographs");
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    for (const field of ["photographer", "collection", "reference", "source", "title", "alt"] as const) {
      assert.ok(p[field]?.trim(), `${p.slug} is missing ${field}`);
    }
    assert.ok(p.licence.name.trim(), `${p.slug} has no licence name`);
    assert.match(p.licence.href, /^https:\/\//, `${p.slug}'s licence must link to its terms`);
    assert.match(p.source, /^https:\/\//, `${p.slug} must link to the record it came from`);
  }
});

test("a credit line names the photographer, the collection and the reference", () => {
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    const line = creditLine(p);
    assert.ok(line.includes(p.photographer), `${p.slug}: photographer missing from credit`);
    assert.ok(line.includes(p.collection), `${p.slug}: collection missing from credit`);
    assert.ok(line.includes(p.reference), `${p.slug}: reference missing from credit`);
  }
});

test("slugs are unique, since they are anchors", () => {
  const slugs = ARCHIVAL_PHOTOGRAPHS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "two photographs share a slug");
});

/*
 * Checked against the committed file, not the staged copy.
 *
 * public/archival/ is produced by scripts/stage-archive.ts at build time
 * and is gitignored, so looking there passes locally after a build and
 * fails on a fresh checkout — which is exactly what happened: the first
 * version of this put the photographs under public/images/, where the
 * ignore rule for staged assets swallowed all six, and CI was the only
 * thing that noticed they had never been committed at all.
 */
test("every photograph file is actually committed", () => {
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    assert.match(p.src, /^\/archival\//, `${p.slug}: should be served from /archival/`);
    const file = path.join("media", p.src.replace(/^\//, ""));
    assert.ok(fs.existsSync(file), `${p.slug}: ${file} is missing`);
  }
});

/*
 * And that staging actually carries them across, since the page asks for
 * the staged path. Skipped before the first build, like the other tests
 * that read build output.
 */
test(
  "staging puts them where the page looks for them",
  { skip: !fs.existsSync("public/archival") },
  () => {
    for (const p of ARCHIVAL_PHOTOGRAPHS) {
      const staged = path.join("public", p.src.replace(/^\//, ""));
      assert.ok(fs.existsSync(staged), `${p.slug}: ${staged} was not staged`);
    }
  },
);

/*
 * A photograph whose licence forbids derivative works is never cropped.
 *
 * Two of the collections publish under CC BY-NC-ND, and a full-screen
 * `object-fit: cover` crop is a derivative as surely as a tonal
 * adjustment is. Those photographs may appear on the timeline, but
 * only in a composition that shows them whole. This caught the K2 in
 * Trafalgar Square, which had been placed behind a year's text.
 */
test("a no-derivatives photograph is never cropped to fit", () => {
  const byHref = new Map(
    ARCHIVAL_PHOTOGRAPHS.map((p) => [`/photographs#${p.slug}`, p]),
  );
  const cropping = new Set(["cover", "band"]);
  let found = 0;

  for (const entry of getTimeline().eras.flatMap((e) => e.entries)) {
    const placed = plateForYear(entry.year);
    const source = placed && byHref.get(placed.plate.href);
    if (!source) continue;
    found++;
    assert.ok(
      placed.plate.when,
      `${source.slug} must carry its own date onto the timeline`,
    );
    if (source.licence.noDerivatives) {
      assert.equal(
        placed.mode,
        "beside",
        `${source.slug} forbids derivative works, so it cannot be cropped behind ${entry.year}`,
      );
    }
  }

  for (const plate of [openingPlate(), closingPlate(), ...interludes()]) {
    const source = plate && byHref.get(plate.href);
    if (!source) continue;
    found++;
    if (source.licence.noDerivatives) {
      assert.ok(
        !cropping.has(plate.kind),
        `${source.slug} forbids derivative works, so it cannot be shown as a ${plate.kind}`,
      );
    }
  }

  assert.ok(found > 0, "expected some outside photographs on the timeline");
});

/*
 * The year on each photograph is a claim about the chronology, and a
 * photograph filed under a year the timeline does not have simply never
 * appears — a silent no-op that looks like a bug in the matcher.
 */
test("a photograph placed on the timeline uses a year the timeline has", () => {
  const years = new Set(
    getTimeline().eras.flatMap((era) => era.entries.map((entry) => entry.year)),
  );
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    if (p.year === undefined) continue;
    assert.ok(
      years.has(p.year),
      `${p.slug} is filed under ${p.year}, which the chronology does not have`,
    );
    assert.ok(
      archivalFor(p.year).some((x) => x.slug === p.slug),
      `${p.slug} claims ${p.year} but is not returned for it`,
    );
  }
});

/*
 * A photograph placed on a year it does not belong to says so.
 *
 * The old rule was that a photograph with no `year` never reached the
 * chronology at all, which kept a picture from standing in for a
 * connection it did not have. The placements are made by hand now and
 * a few are deliberately out of period — the Sainte-Croix works on
 * the 1875 entry is the same works photographed in 1996 — so the rule
 * that replaces it is that every one of them carries its real date on
 * to the slide, where the reader can see it beside the year.
 */
test("every outside photograph carries its own date onto the timeline", () => {
  const byHref = new Map(
    ARCHIVAL_PHOTOGRAPHS.map((p) => [`/photographs#${p.slug}`, p]),
  );
  for (const entry of getTimeline().eras.flatMap((e) => e.entries)) {
    const placed = plateForYear(entry.year);
    const source = placed && byHref.get(placed.plate.href);
    if (!source) continue;
    assert.equal(
      placed.plate.when,
      source.when,
      `${source.slug} should show "${source.when}" on the ${entry.year} slide`,
    );
  }
});

/*
 * Where a photograph does claim a year, the entry for that year has to
 * name what it shows. Both current placements are models named outright
 * in their entry: the 150 Super in 1967, the K2 in 1964.
 */
test("a timeline placement is backed by the entry's own words", () => {
  const entries = new Map(
    getTimeline().eras.flatMap((era) => era.entries.map((e) => [e.year, e.event] as const)),
  );
  const EXPECTED: Record<string, RegExp> = {
    "bolex-150-super-1967": /150 Super/i,
    "k2-trafalgar-square": /\bK2\b/i,
  };
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    if (p.year === undefined) continue;
    const pattern = EXPECTED[p.slug];
    assert.ok(pattern, `${p.slug} is on the timeline with no stated justification`);
    const text = entries.get(p.year) ?? "";
    assert.match(text, pattern, `${p.year} no longer names what ${p.slug} shows`);
  }
});

test("the 150 Super photograph lands on the year that announces it", () => {
  const entry = getTimeline()
    .eras.flatMap((era) => era.entries)
    .find((e) => e.year === "1967");
  assert.ok(entry, "the chronology should still have 1967");
  assert.match(entry.event, /150 Super/i, "1967 should still name the 150 Super");

  const placed = plateForYear("1967");
  assert.equal(
    placed?.plate.href,
    "/photographs#bolex-150-super-1967",
    "the 1967 photograph should carry the 1967 entry",
  );
});

/*
 * Nothing from bolex.com, whose terms forbid reproduction, and nothing
 * from a notrehistoire record marked "all rights reserved". Asserting on
 * the stated source is the only check that would catch a future
 * well-meaning addition from the wrong place.
 */
test("nothing is used from a source that forbids it", () => {
  for (const p of ARCHIVAL_PHOTOGRAPHS) {
    assert.doesNotMatch(
      p.source,
      /bolex\.com/i,
      `${p.slug}: bolex.com reserves its photographs`,
    );
    assert.ok(
      /public domain|CC BY/i.test(p.licence.name),
      `${p.slug}: "${p.licence.name}" is not a licence that permits reuse`,
    );
  }
});
