import test from "node:test";
import assert from "node:assert/strict";
import { CONDITIONS, VENUES, conditionRank, conditionLabel } from "../lib/conditions";

/*
 * The scale is a judgement, not a list, so it is worth asserting.
 */

test("the condition scale runs worst to best", () => {
  const ids = CONDITIONS.map((c) => c.id);
  assert.deepEqual(ids, ["broken", "as-is", "fair", "good", "excellent", "serviced"]);
  for (let i = 1; i < ids.length; i++) {
    assert.ok(conditionRank(ids[i]!) > conditionRank(ids[i - 1]!));
  }
});

/*
 * The one ordering anyone would be tempted to "fix". A recent overhaul
 * is worth more on a sixty-year-old camera than good cosmetics are: a
 * clean Bolex that has not run in twenty years is a worse buy than a
 * scuffed one just back from a technician. If someone reorders these,
 * this is the test that should make them stop and think.
 */
test("serviced ranks above excellent, deliberately", () => {
  assert.ok(conditionRank("serviced") > conditionRank("excellent"));
});

test("every condition and venue carries a label and is url-safe", () => {
  for (const c of CONDITIONS) {
    assert.match(c.id, /^[a-z-]+$/);
    assert.ok(c.label.length > 2 && c.blurb.length > 10, `${c.id} needs a label and a blurb`);
    assert.equal(conditionLabel(c.id), c.label);
  }
  for (const v of VENUES) {
    assert.match(v.id, /^[a-z-]+$/);
    assert.ok(v.label.length > 2);
  }
});

test("an unknown condition falls back rather than throwing", () => {
  assert.equal(conditionLabel("mint"), "mint");
  assert.equal(conditionRank("mint"), 99);
});
