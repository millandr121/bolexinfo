import assert from "node:assert/strict";
import { test } from "node:test";
import { formatSerialInput, formatYearSpan, lookupSerial } from "../lib/serials";
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
