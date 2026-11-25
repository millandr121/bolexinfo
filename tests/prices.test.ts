import test from "node:test";
import assert from "node:assert/strict";
import { adjust, getCpi, getPricePoints, getPriceSeries } from "../lib/prices";

/**
 * Guards on the price data, written after one near miss and one real one.
 *
 * The near miss: October 1976 and January 1978 print their two columns in
 * opposite orders, Dealer Cost then Suggested Retail in the first and
 * Suggested Retail then Dealer Net in the second. Taking the same column
 * from both would have published a dealer's cost as a shop price. Nothing
 * here can test that, because it is a question about a scan rather than
 * about the data; it is written down in the listings files and in the
 * commit, and the rule is that every figure is read off the rendered page.
 *
 * The real one is below.
 */

/**
 * Every year we publish a price for must be in the CPI table.
 *
 * adjust() used to fall back to the nominal figure for a year it did not
 * know, so adding the 1976 and 1978 lists quietly printed "$272 in 2025
 * money" under a heading promising an adjusted number. It throws now, but
 * a throw only fires on a page that renders that year, which is a slow
 * way to find out. This finds out in the test run.
 */
test("every priced year has a CPI annual average", () => {
  const years = [...new Set(getPricePoints().map((p) => p.year))].sort((a, b) => a - b);
  const cpi = getCpi();
  assert.ok(years.length > 0, "there should be some prices");
  for (const year of years) {
    assert.ok(
      cpi.years[String(year)],
      `data/prices/cpi.json has no annual average for ${year}, so every ` +
        `adjusted figure from that price list would be wrong. Add it before ` +
        `publishing the list.`,
    );
  }
});

test("adjust refuses a year it has no index for, rather than guessing", () => {
  assert.throws(() => adjust(100, 1836), /cpi\.json/);
});

/** A sanity floor: the base year is later than anything priced, so no
 *  adjusted figure should come out below its nominal one. */
test("adjusted prices are never below nominal", () => {
  for (const p of getPricePoints()) {
    assert.ok(
      adjust(p.nominal, p.year) >= p.nominal,
      `${p.name} (${p.year}) adjusts downwards, which means the CPI entry ` +
        `for ${p.year} is wrong or the base year is stale`,
    );
  }
});

/** The chart draws these, and a line needs at least two readings. */
test("every charted series has at least two points, in year order", () => {
  for (const s of getPriceSeries()) {
    assert.ok(s.points.length >= 2, `${s.name} is a single dot and should not be a series`);
    const years = s.points.map((p) => p.year);
    assert.deepEqual([...years].sort((a, b) => a - b), years, `${s.name} is out of year order`);
  }
});

/** Price-list rows on an item page read as a mistake when they are not in
 *  date order, even though every figure in them is right. */
test("the richest series is ordered and spans the price lists", () => {
  const first = getPriceSeries()[0];
  assert.ok(first, "there should be at least one series");
  assert.ok(
    first.points.length >= 4,
    "the fullest series should cross at least four price lists; if this " +
      "fails, a listings file probably lost its rows rather than the test " +
      "being wrong",
  );
});
