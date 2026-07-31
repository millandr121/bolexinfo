import assert from "node:assert/strict";
import { test } from "node:test";
import { formatSerialInput, formatYearSpan, lookupModels, lookupSerial } from "../lib/serials";
import type { SerialRow } from "../lib/museum";

const rows: SerialRow[] = [
  { from: 20001, to: 32000, yearFrom: 1946, yearTo: 1947 },
  { from: 32001, to: 46000, yearFrom: 1948, yearTo: 1948 },
  { from: 200000, to: 208000, yearFrom: 1963, yearTo: 1963 },
];

test("serial inside a range resolves its year span", () => {
  const result = lookupSerial(33000, rows);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0]!.yearFrom, 1948);
});

test("position reflects placement within the production span", () => {
  const early = lookupSerial(32100, rows).matches[0]!;
  const late = lookupSerial(45900, rows).matches[0]!;
  assert.ok(early.position < 0.05);
  assert.ok(late.position > 0.95);
});

test("overlapping series return every matching range", () => {
  const overlapping: SerialRow[] = [...rows, { from: 30000, to: 50000, yearFrom: 1948, yearTo: 1948 }];
  const result = lookupSerial(33000, overlapping);
  assert.equal(result.matches.length, 2);
});

test("out-of-range serial reports the nearest documented range", () => {
  const result = lookupSerial(19000, rows);
  assert.equal(result.matches.length, 0);
  assert.equal(result.nearest?.row.yearFrom, 1946);
  assert.equal(result.nearest?.distance, 1001);
});

test("rows with unknown bounds are skipped for matching", () => {
  const withUnknown: SerialRow[] = [{ from: null, to: null, yearFrom: 1935, yearTo: 1935 }, ...rows];
  const result = lookupSerial(33000, withUnknown);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0]!.yearFrom, 1948);
});

test("empty dataset yields no matches and no nearest", () => {
  assert.deepEqual(lookupSerial(12345, []), { matches: [] });
});

test("formatYearSpan renders single years and spans", () => {
  assert.equal(formatYearSpan({ yearFrom: 1958, yearTo: 1958 }), "1958");
  assert.equal(formatYearSpan({ yearFrom: 1936, yearTo: 1937 }), "1936–1937");
});

test("formatSerialInput strips punctuation and labels", () => {
  assert.equal(formatSerialInput("No. 100,240"), 100240);
  assert.equal(formatSerialInput(" 32 001 "), 32001);
  assert.equal(formatSerialInput("abc"), 0);
});

test("lookupModels attributes a serial to the models that documented it", () => {
  const models = [
    { slug: "h16", name: "H-16", format: "16mm", href: "/cameras/h16", rows: [{ from: 20000, to: 25000, yearFrom: 1944, yearTo: 1944 }] },
    { slug: "h8", name: "H-8", format: "8mm", href: "/cameras/h8", rows: [{ from: 20000, to: 25000, yearFrom: 1944, yearTo: 1944 }] },
    { slug: "b8", name: "B-8", format: "8mm", href: "/cameras/b8", rows: [{ from: 90000, to: 95000, yearFrom: 1953, yearTo: 1953 }] },
  ];
  const hits = lookupModels(22000, models);
  assert.equal(hits.length, 2);
  assert.deepEqual(hits.map((h) => h.model.slug).sort(), ["h16", "h8"]);
  assert.equal(hits[0]!.row.yearFrom, 1944);
  assert.equal(lookupModels(93000, models)[0]!.model.slug, "b8");
  assert.equal(lookupModels(1, models).length, 0);
});

test("lookupModels skips rows with unknown bounds and never double-counts a model", () => {
  const models = [
    {
      slug: "x",
      name: "X",
      href: "/cameras/x",
      rows: [
        { from: null, to: null, yearFrom: 1935, yearTo: 1935 },
        { from: 100, to: 200, yearFrom: 1940, yearTo: 1940 },
        { from: 150, to: 250, yearFrom: 1941, yearTo: 1941 },
      ],
    },
  ];
  const hits = lookupModels(175, models);
  assert.equal(hits.length, 1, "one attribution per model");
  assert.equal(hits[0]!.row.yearFrom, 1940);
});
