import assert from "node:assert/strict";
import { test } from "node:test";
import { getTimelineMedia, modelsNamedIn } from "../lib/timeline-media";
import { getTimeline } from "../lib/timeline";

const media = getTimelineMedia();
const timeline = getTimeline();
const entries = timeline.eras.flatMap((e) => e.entries);
const byYear = new Map(entries.map((e) => [e.year, e.event]));

test("every picture belongs to a year the timeline actually has", () => {
  for (const year of media.keys()) {
    assert.ok(byYear.has(year), `${year} is not a timeline year`);
  }
});

/*
 * The rule the whole module turns on. An earlier version paired a year with
 * whatever was introduced in it, which illustrated "Paillard merges with
 * Thorens" with an H-16 REX-2 — true about the year, nothing to do with the
 * sentence. Every picture must be named by its own entry.
 */
/*
 * Two kinds of picture reach the timeline and only one of them is matched
 * by this rule.
 *
 * A catalogue plate is chosen automatically from the entry's own words, so
 * it has to be checked: a matcher left to itself will cheerfully illustrate
 * a merger with a camera. A photograph from another collection is placed by
 * hand, one at a time, and links to /photographs rather than to a model, so
 * it is excluded here and held to its own rules in tests/archival.test.ts.
 */
const isCataloguePlate = (href: string) => !href.startsWith("/photographs");

test("every picture is named in its entry's own text", () => {
  for (const [year, pictures] of media) {
    const text = byYear.get(year) ?? "";
    for (const picture of pictures.filter((p) => isCataloguePlate(p.href))) {
      const named = modelsNamedIn(text).some((c) => c.model.name === picture.caption);
      assert.ok(named, `${year}: "${picture.caption}" is not named in the entry`);
    }
  }
});

/*
 * Company history has no photograph. Roughly a third of the chronology is
 * mergers, magazines, factories and competitors' products, and giving those
 * a contemporary Bolex to look at is the filler this rule exists to stop.
 */
test("entries that name no equipment get no picture", () => {
  const prose = entries.filter((e) => modelsNamedIn(e.event).length === 0);
  assert.ok(prose.length > 10, "expected a good number of prose-only entries");
  for (const entry of prose) {
    const plates = (media.get(entry.year) ?? []).filter((p) => isCataloguePlate(p.href));
    assert.deepEqual(plates, [], `${entry.year} should have no catalogue plate`);
  }
});

/*
 * Paillard named models the way everyone did, so a competitor's product can
 * carry a name the Bolex catalogue also uses. The 1927 entry is entirely
 * about Bell & Howell's Filmo Model C and Victor's Cine Model 3; matching
 * "Model C" there attached a Bolex projector to another firm's camera,
 * which is a wrong attribution rather than merely a weak picture.
 */
test("a name belonging to another maker is not claimed", () => {
  const text = byYear.get("1927") ?? "";
  assert.match(text, /Filmo Model C/i, "the 1927 entry should still mention the Filmo");
  assert.equal(media.get("1927"), undefined, "1927 is about Bell & Howell, not Bolex");
});

test("a name is still matched when the same entry uses it properly", () => {
  // 1932 is mostly about Kodak, and ends "Bolex Model P 9.5mm projector".
  const picks = media.get("1932");
  assert.ok(picks?.some((p) => p.caption === "Model P"), "the Bolex Model P should be found");
});

/* "H-16 REX-5" must beat "H-16", or the specific camera is never reached. */
test("the longest matching name wins", () => {
  const named = modelsNamedIn("H-16 REX-5 16mm camera").map((c) => c.model.name);
  assert.ok(named.includes("H-16 REX-5"), `expected the REX-5, got ${named.join(", ")}`);
});

/* "C-8" must not match inside "C-8SL". */
test("a short name does not match inside a longer one", () => {
  const named = modelsNamedIn("C-8SL 8mm camera").map((c) => c.model.name);
  assert.ok(named.includes("C-8SL"), "the C-8SL should be found");
  assert.ok(!named.includes("C-8"), "the C-8 should not be dragged in by its own prefix");
});

/* The chronology writes "H-16 De luxe" where the catalogue says "Deluxe". */
test("spacing and hyphens in the archive's spelling are tolerated", () => {
  assert.ok(modelsNamedIn("H-16 De luxe 16mm camera").length > 0, "should match across a space");
});

test("no year shows the same picture twice, and none shows too many", () => {
  for (const [year, pictures] of media) {
    const srcs = pictures.map((p) => p.src);
    assert.equal(new Set(srcs).size, srcs.length, `${year} repeats a picture`);
    assert.ok(pictures.length <= 3, `${year} has ${pictures.length} pictures`);
  }
});

/*
 * A photograph given to the project, rather than recovered, carries its
 * photographer's name wherever it appears — not only on the model's page.
 */
/*
 * Conditional, deliberately. Nothing sourced reaches the timeline today —
 * the archived chronology only names models the original site covered, and
 * the 16 Pro, whose photographs were given to this project, is precisely
 * one it never did. The guarantee still has to hold the moment that
 * changes, so it is asserted over whatever is there rather than requiring
 * that something is.
 */
test("a sourced photograph keeps its credit", () => {
  const sourced = [...media.values()].flat().filter((m) => m.src.startsWith("/sourced/"));
  for (const m of sourced) {
    assert.ok(m.credit && m.credit.trim().length > 0, `${m.caption} is sourced but uncredited`);
  }
});

test("every picture links somewhere real and names itself", () => {
  for (const [year, pictures] of media) {
    for (const m of pictures) {
      assert.match(m.src, /^\/(images|sourced|archival)\//, `${year}: should be a local image`);
      assert.match(
        m.href,
        /^\/(cameras|projectors)\/|^\/photographs#/,
        `${year}: bad link ${m.href}`,
      );
      assert.ok(m.caption.trim().length > 0, `${year}: needs a caption`);
      assert.ok(m.alt.trim().length > 0, `${year}: needs alt text`);
    }
  }
});

/* A static export must produce the same page on every build. */
test("the pairing is deterministic", () => {
  const again = getTimelineMedia();
  assert.deepEqual(
    [...again.entries()].map(([y, v]) => [y, v.map((p) => p.src)]),
    [...media.entries()].map(([y, v]) => [y, v.map((p) => p.src)]),
  );
});
