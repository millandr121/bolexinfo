import assert from "node:assert/strict";
import { test } from "node:test";
import { formatSerial, lookupSerial } from "../lib/serials";
import type { SerialRange } from "../lib/content";

const ranges: SerialRange[] = [
  { year: 1946, from: 20001, to: 32000 },
  { year: 1947, from: 32001, to: 46000 },
  { year: 1963, from: 1000001, to: 1100000, series: "P/K/S1 1963 sequence" },
];

test("serial inside a range resolves its year", () => {
  const result = lookupSerial(33000, ranges);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0]!.year, 1947);
});

test("position reflects placement within the production year", () => {
  const early = lookupSerial(32100, ranges).matches[0]!;
  const late = lookupSerial(45900, ranges).matches[0]!;
  assert.ok(early.position < 0.05);
  assert.ok(late.position > 0.95);
});

test("overlapping sequences return every matching range", () => {
  const overlapping = [...ranges, { year: 1947, from: 40000, to: 50000, series: "projectors" }];
  const result = lookupSerial(45000, overlapping);
  assert.equal(result.matches.length, 2);
});

test("out-of-range serial reports the nearest documented range", () => {
  const result = lookupSerial(19000, ranges);
  assert.equal(result.matches.length, 0);
  assert.equal(result.nearest?.range.year, 1946);
  assert.equal(result.nearest?.distance, 1001);
});

test("empty dataset yields no matches and no nearest", () => {
  const result = lookupSerial(12345, []);
  assert.deepEqual(result, { matches: [] });
});

test("formatSerial strips punctuation and labels", () => {
  assert.equal(formatSerial("No. 100,240"), 100240);
  assert.equal(formatSerial(" 32 001 "), 32001);
  // Non-numeric input collapses to 0, which lookupSerial treats as invalid.
  assert.equal(formatSerial("abc"), 0);
});
