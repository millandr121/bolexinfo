import assert from "node:assert/strict";
import { test } from "node:test";
import { GLANCE_MAX_LENGTH, partitionSpecs, type Spec } from "../lib/specs";
import { getCameraRecords } from "../lib/museum";

const specs: Spec[] = [
  { label: "Weight", value: "4 lbs. 6 oz. (1.98 kg)" },
  { label: "Overall Dimensions", value: '7" x 4" x 2 1/2"' },
  {
    label: "Film Capacity",
    value:
      "100 ft. (30 m) daylight loading spools. The spool chambers accept the standard Bolex " +
      "100 ft. spool only; longer loads require the 400 ft. magazine attached to the rear " +
      "of the camera body.",
  },
];

test("short measurements go to the glance group, prose to detail", () => {
  const { glance, detail } = partitionSpecs(specs);
  assert.deepEqual(
    glance.map((s) => s.label),
    ["Weight", "Overall Dimensions"],
  );
  assert.deepEqual(
    detail.map((s) => s.label),
    ["Film Capacity"],
  );
});

test("the partition is lossless and order-preserving", () => {
  const { glance, detail } = partitionSpecs(specs);
  assert.equal(glance.length + detail.length, specs.length);
  // Every original spec survives, by identity, exactly once.
  for (const spec of specs) {
    const hits = [...glance, ...detail].filter((s) => s === spec);
    assert.equal(hits.length, 1, `${spec.label} should appear exactly once`);
  }
});

test("the boundary is inclusive at the threshold", () => {
  const atLimit = { label: "Edge", value: "x".repeat(GLANCE_MAX_LENGTH) };
  const overLimit = { label: "Over", value: "x".repeat(GLANCE_MAX_LENGTH + 1) };
  const { glance, detail } = partitionSpecs([atLimit, overLimit]);
  assert.deepEqual(glance, [atLimit]);
  assert.deepEqual(detail, [overLimit]);
});

test("empty input yields two empty groups rather than throwing", () => {
  assert.deepEqual(partitionSpecs([]), { glance: [], detail: [] });
});

/*
 * The threshold is a judgement about real recovered content, so it is checked
 * against that content: if a future recovery pass changes the spec shapes
 * enough that the split stops being useful, this fails rather than silently
 * degrading into a one-sided layout.
 */
test("every recovered camera splits into a usable glance group", () => {
  const records = getCameraRecords();
  assert.ok(records.length > 0, "expected recovered cameras");

  for (const model of records) {
    if (model.specs.length === 0) continue;
    const { glance, detail } = partitionSpecs(model.specs);
    assert.equal(glance.length + detail.length, model.specs.length, model.slug);
    assert.ok(glance.length >= 2, `${model.slug} should have at least 2 glanceable facts`);
    // A glance grid that swallowed everything would just be the old list.
    assert.ok(detail.length >= 1, `${model.slug} should retain prose specs`);
  }
});
