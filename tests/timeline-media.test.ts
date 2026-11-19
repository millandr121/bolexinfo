import assert from "node:assert/strict";
import { test } from "node:test";
import { getTimelineMedia } from "../lib/timeline-media";
import { getTimeline } from "../lib/timeline";
import { getRecoveredSection } from "../lib/recovered";

const media = getTimelineMedia();
const timeline = getTimeline();
const years = timeline.eras.flatMap((e) => e.entries.map((x) => x.year));

test("every picture belongs to a year the timeline actually has", () => {
  for (const year of media.keys()) {
    assert.ok(years.includes(year), `${year} is not a timeline year`);
  }
});

/*
 * Bolex did not exist before 1928 and the advertising starts in the 1940s,
 * so the opening era has nothing truthful to illustrate it with. Borrowing a
 * later photograph to fill the gap would misdate the archive's own material,
 * which is the one thing this site must not do.
 */
test("the pre-Bolex era is left without pictures", () => {
  const early = timeline.eras[0];
  assert.ok(early, "there should be an opening era");
  for (const entry of early.entries) {
    assert.equal(media.get(entry.year), undefined, `${entry.year} should have no picture`);
  }
});

test("later eras are substantially illustrated", () => {
  for (const era of timeline.eras.slice(1)) {
    const withPicture = era.entries.filter((e) => media.has(e.year)).length;
    assert.ok(
      withPicture >= Math.ceil(era.entries.length * 0.8),
      `${era.era}: only ${withPicture} of ${era.entries.length} entries illustrated`,
    );
  }
});

/*
 * The archive files one photograph against several early projectors. Showing
 * it twice reads as a bug even though the data is honest, so the pairing
 * skips a picture it has already used.
 */
test("no picture is used twice", () => {
  const srcs = [...media.values()].map((m) => m.src);
  assert.equal(new Set(srcs).size, srcs.length, "a picture is repeated");
});

/*
 * The ephemera section holds whole magazine pages, so some sheets are there
 * for what was printed on the back of them — one is catalogued as "1953
 * Linda Darnell Rheingold Beer Ad". A beer advertisement on the Bolex
 * chronology looks like a fault, and this is how it got there once.
 */
test("advertising chosen for the timeline is about Bolex", () => {
  const byHref = new Map<string, { title: string }>(
    getRecoveredSection("ephemera").map((p) => [`/ephemera/${p.slug}`, p]),
  );
  const pattern = /bolex|paillard|kern|berthiot|pan ?cinor|switar|yvar/i;
  for (const [year, picture] of media) {
    if (picture.kind !== "ephemera") continue;
    const page = byHref.get(picture.href);
    assert.ok(page, `${picture.href} should be a real ephemera page`);
    assert.match(
      `${page.title} ${picture.alt}`,
      pattern,
      `the sheet used for ${year} does not look like Bolex material`,
    );
  }
});

test("the beer advertisement specifically is not used", () => {
  const hrefs = [...media.values()].map((m) => m.href);
  assert.ok(!hrefs.includes("/ephemera/ads50-ad004"), "the Rheingold sheet is back on the timeline");
});

test("every picture links somewhere real and names itself", () => {
  for (const [year, m] of media) {
    /* `/images/` is recovered material, `/sourced/` is material given to
       the project since — both are served by this site. */
    assert.match(m.src, /^\/(images|sourced)\//, `${year}: picture should be a local image`);
    assert.match(m.href, /^\/(cameras|projectors|ephemera)\//, `${year}: bad link ${m.href}`);
    assert.ok(m.caption.trim().length > 0, `${year}: picture needs a caption`);
    assert.ok(m.alt.trim().length > 0, `${year}: picture needs alt text`);
  }
});

/*
 * A photograph the project was given, rather than recovered, carries its
 * photographer's name wherever it appears — not only on the model's page.
 */
test("a sourced photograph keeps its credit on the timeline", () => {
  const sourced = [...media.values()].filter((m) => m.src.startsWith("/sourced/"));
  assert.ok(sourced.length > 0, "expected at least one sourced photograph");
  for (const m of sourced) {
    assert.ok(m.credit && m.credit.trim().length > 0, `${m.caption} is sourced but uncredited`);
  }
});

/* A static export must produce the same page on every build. */
test("the pairing is deterministic", () => {
  const again = getTimelineMedia();
  assert.deepEqual([...again.entries()], [...media.entries()]);
});
