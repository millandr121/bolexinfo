import assert from "node:assert/strict";
import { test } from "node:test";
import { getIndexGroups, getRelated, type Section } from "../lib/related";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";

const SECTIONS: Section[] = ["cameras", "projectors"];
const recordsOf = (s: Section) => (s === "cameras" ? getCameraRecords() : getProjectorRecords());

test("the original index groups are read back as published", () => {
  const cameras = getIndexGroups("cameras");
  assert.deepEqual(
    cameras.map((g) => g.era),
    ["1928 - 1940s Cameras", "1950s Cameras", "1960s Cameras"],
  );
  assert.deepEqual(cameras.map((g) => g.entries.length), [11, 16, 26]);

  const projectors = getIndexGroups("projectors");
  assert.deepEqual(projectors.map((g) => g.entries.length), [5, 2, 10]);
});

test("an index label splits into year, model and gauge", () => {
  const entries = getIndexGroups("cameras").flatMap((g) => g.entries);

  const rex4 = entries.find((e) => e.slug === "h16rex4");
  assert.deepEqual(rex4, { slug: "h16rex4", label: "H16 REX4", year: 1965, gauge: "16mm" });

  // The index's gauges are finer than the records' — "Double 8mm", not "8mm" —
  // and the longest spelling must win or every one of these reads as "8mm".
  const b8 = entries.find((e) => e.slug === "b8");
  assert.equal(b8?.gauge, "Double 8mm");
  assert.equal(entries.find((e) => e.slug === "h9")?.gauge, "9.5mm");
});

test("model series are derived only where a line genuinely exists", () => {
  const series = new Map<string, string[]>();
  for (const model of getCameraRecords()) {
    const name = getRelated("cameras", model.slug).series?.name;
    if (name) series.set(name, [...(series.get(name) ?? []), model.slug]);
  }

  // Every model is filed under its own series, so each list is the whole line.
  assert.equal(series.get("H-16")?.length, 18);
  assert.equal(series.get("H-8")?.length, 9);
  assert.equal(series.get("B-8")?.length, 5);
  assert.equal(series.get("Zoom Reflex")?.length, 3);
  assert.equal(series.get("Macrozoom")?.length, 3);

  // H8S is written without the hyphen the rest of its line uses; it still
  // belongs to the H-8 cameras.
  assert.equal(getRelated("cameras", "h8s").series?.name, "H-8");

  // Projectors are numbered without a leading letter.
  assert.equal(getRelated("projectors", "185l").series?.name, "18-5");
});

test("a model is never related to itself, nor listed twice", () => {
  for (const section of SECTIONS) {
    for (const model of recordsOf(section)) {
      const related = getRelated(section, model.slug);
      const shown = [...(related.series?.models ?? []), ...(related.era?.models ?? [])];
      const slugs = shown.map((m) => m.slug);

      assert.ok(!slugs.includes(model.slug), `${model.slug} links to itself`);
      assert.equal(new Set(slugs).size, slugs.length, `${model.slug} repeats a relation`);
      for (const m of shown) assert.equal(m.href, `/${section}/${m.slug}`);
    }
  }
});

test("every object page gets at least one onward link", () => {
  for (const section of SECTIONS) {
    for (const model of recordsOf(section)) {
      const related = getRelated(section, model.slug);
      const count = (related.series?.models.length ?? 0) + (related.era?.models.length ?? 0);
      assert.ok(count > 0, `${section}/${model.slug} is a dead end`);
    }
  }
});

test("the era band shows something the line does not", () => {
  /*
   * Every 16mm camera of the 1960s is an H-16, so once the line is excluded
   * nothing shares the gauge — and the band widens to the period instead of
   * repeating the line. That is the more useful answer anyway: it shows what
   * else Bolex was building at the time, in the gauges this camera is not.
   */
  const rex4 = getRelated("cameras", "h16rex4");
  assert.equal(rex4.series?.name, "H-16");
  assert.equal(rex4.era?.label, "1960s Cameras");
  assert.equal(rex4.era?.gauge, undefined, "widened, so it must not claim a shared gauge");
  assert.ok(
    rex4.era!.models.every((m) => !m.name.startsWith("H-16")),
    "the line should not reappear under the era heading",
  );

  // Where contemporaries do come from other lines, they are shown.
  const b8l = getRelated("cameras", "b8l");
  assert.equal(b8l.series?.name, "B-8");
  assert.equal(b8l.era?.gauge, "Double 8mm");
  const eraSeries = new Set(b8l.era!.models.map((m) => m.name.slice(0, 3)));
  assert.ok(!eraSeries.has("B-8"), "the line should not reappear under the era heading");
  assert.ok(b8l.era!.models.length > 0);
});

test("the lone 9.5mm camera widens to its era rather than standing alone", () => {
  const related = getRelated("cameras", "h9");
  assert.equal(related.series, undefined, "the H-9 has no line of its own");
  assert.equal(related.era?.label, "1928 - 1940s Cameras");
  // Widened past the gauge, so the band must not claim one.
  assert.equal(related.era?.gauge, undefined);
  assert.ok((related.era?.models.length ?? 0) > 0);
});

test("relations are bounded so the band stays a signpost", () => {
  for (const section of SECTIONS) {
    for (const model of recordsOf(section)) {
      const related = getRelated(section, model.slug, 6);
      assert.ok((related.series?.models.length ?? 0) <= 6);
      assert.ok((related.era?.models.length ?? 0) <= 6);
    }
  }
});

test("a long line shows the nearest variants by year", () => {
  // The REX-4 is a 1965 camera, so its H-16 siblings should be mid-sixties
  // rather than whichever models happen to sort first alphabetically.
  const series = getRelated("cameras", "h16rex4").series;
  assert.equal(series?.name, "H-16");
  const years = series!.models.map((m) => m.introduced!);
  assert.ok(Math.max(...years) <= 1967 && Math.min(...years) >= 1963, `got ${years.join(",")}`);
});

/*
 * A documented gap rather than a bug: the archived index page lists 53 of the
 * 54 cameras recovered. The H-16 S-4 has its own recovered page but was never
 * added to the index. It still reaches its line through the series relation,
 * which is why that relation is derived rather than taken from the index.
 */
test("the H-16 S-4 is missing from the archived index but still connected", () => {
  const indexed = new Set(getIndexGroups("cameras").flatMap((g) => g.entries.map((e) => e.slug)));
  const records = getCameraRecords();

  const missing = records.filter((m) => !indexed.has(m.slug)).map((m) => m.slug);
  assert.deepEqual(missing, ["h16s4"]);

  assert.equal(getRelated("cameras", "h16s4").series?.name, "H-16");
});

test("every index entry corresponds to a recovered model", () => {
  for (const section of SECTIONS) {
    const slugs = new Set(recordsOf(section).map((m) => m.slug));
    for (const group of getIndexGroups(section)) {
      for (const entry of group.entries) {
        assert.ok(slugs.has(entry.slug), `${section}/${entry.slug} is listed but not recovered`);
      }
    }
  }
});
