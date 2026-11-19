import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ARCHIVAL_PHOTOGRAPHS, archivalFor, creditLine } from "../lib/archival";
import { getTimelineMedia } from "../lib/timeline-media";
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
 * The licences on these range from public domain to share-alike, and
 * two of the collections publish photographs we are explicitly not
 * allowed to alter. Blending a picture into the page background is an
 * alteration. None of these may be blended, whatever the plate audit
 * says about their backgrounds.
 */
test("no outside photograph is blended into the page", () => {
  const media = getTimelineMedia();
  const byHref = new Map(ARCHIVAL_PHOTOGRAPHS.map((p) => [`/photographs#${p.slug}`, p]));
  let found = 0;
  for (const pictures of media.values()) {
    for (const picture of pictures) {
      if (!byHref.has(picture.href)) continue;
      found++;
      assert.equal(picture.blend, false, `${picture.href} must not be blended`);
      assert.ok(picture.credit, `${picture.href} must carry its credit onto the timeline`);
    }
  }
  assert.ok(found > 0, "at least one archival photograph should reach the timeline");
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
    if (!years.has(p.year)) continue;
    assert.ok(
      archivalFor(p.year).some((x) => x.slug === p.slug),
      `${p.slug} claims ${p.year} but is not returned for it`,
    );
  }
});

/*
 * The 1967 entry introduces the 150 Super by name and the photograph is
 * of a 150 Super. That pairing is the reason this photograph is on the
 * timeline at all rather than only on its own page.
 */
test("the 150 Super photograph lands on the year that announces it", () => {
  const entry = getTimeline()
    .eras.flatMap((era) => era.entries)
    .find((e) => e.year === "1967");
  assert.ok(entry, "the chronology should still have 1967");
  assert.match(entry.event, /150 Super/i, "1967 should still name the 150 Super");

  const pictures = getTimelineMedia().get("1967") ?? [];
  assert.ok(
    pictures.some((p) => p.href === "/photographs#bolex-150-super-1967"),
    "the 1967 photograph should appear on the 1967 panel",
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
