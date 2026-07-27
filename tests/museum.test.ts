import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSerialRows, parseSpecs } from "../lib/museum";

test("parseSerialRows reads the [from, —, to, year] column layout", () => {
  const tables = [
    [
      ["", "#", "", "Year"],
      ["7510", "—", "10000", "1936 / 37"],
      ["10000", "—", "15000", "1938 / 40"],
      ["20000", "—", "25000", "1944"],
    ],
  ];
  const rows = parseSerialRows(tables);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { from: 7510, to: 10000, yearFrom: 1936, yearTo: 1937 });
  assert.deepEqual(rows[1], { from: 10000, to: 15000, yearFrom: 1938, yearTo: 1940 });
  assert.deepEqual(rows[2], { from: 20000, to: 25000, yearFrom: 1944, yearTo: 1944 });
});

test("a to-bound whose digits contain a year is not misread as the year (regression)", () => {
  // "192000" contains the substring "1920" — the real year is "1961".
  const rows = parseSerialRows([[["186000", "—", "192000", "1961"]]]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.yearFrom, 1961);
  assert.equal(rows[0]!.to, 192000);
});

test("parseSerialRows keeps '???' bounds as null but still records the year", () => {
  const rows = parseSerialRows([[["???", "—", "???", "1935"]]]);
  assert.equal(rows.length, 0); // both bounds unknown → not lookup-able, skipped
  const oneKnown = parseSerialRows([[["7000", "—", "???", "1935"]]]);
  assert.deepEqual(oneKnown[0], { from: 7000, to: null, yearFrom: 1935, yearTo: 1935 });
});

test("parseSpecs extracts LABEL: value pairs and skips nav chrome", () => {
  const body =
    " Home\n Cameras\n Projectors\n H-16\n 160 Macrozoom\n H-16\n 16mm Camera\n 1935\n" +
    ' OVERALL DIMENSIONS: 8 1/2" x 6" x 3"\n WEIGHT: Approximately 5 1/2 lbs\n' +
    " OUTER CASE: Highly polished duraluminium body.\n";
  const specs = parseSpecs(body);
  const labels = specs.map((s) => s.label);
  assert.ok(labels.includes("Overall Dimensions"));
  assert.ok(labels.includes("Weight"));
  assert.ok(labels.includes("Outer Case"));
  // Nav items ("Home", "Cameras", "H-16") have no colon and must not appear.
  assert.ok(!labels.some((l) => l === "Home" || l === "Cameras"));
  assert.equal(specs.find((s) => s.label === "Weight")?.value, "Approximately 5 1/2 lbs");
});
