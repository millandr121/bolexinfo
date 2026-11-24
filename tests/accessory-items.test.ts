import test from "node:test";
import assert from "node:assert/strict";
import { getAccessoryItems, dateLabel } from "../lib/accessory-items";
import { getRecoveredSection } from "../lib/recovered";

/*
 * The accessory index is generated, committed, and now the thing the site
 * renders. A silent regression in the extractor would quietly empty a
 * section of the collection, so the shape of its output is asserted here
 * rather than trusted.
 */

test("every accessory page yielded objects", () => {
  const items = getAccessoryItems();
  assert.ok(items.length >= 90, `expected the full set, got ${items.length}`);

  const pages = new Set(getRecoveredSection("accessories").map((p) => p.slug));
  const covered = new Set(items.map((i) => i.from.page));
  for (const page of pages) {
    assert.ok(covered.has(page), `nothing was extracted from ${page}`);
  }
});

test("slugs are unique and URL-safe", () => {
  const slugs = getAccessoryItems().map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length, "two objects share a slug");
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9-]+$/, `${slug} is not URL-safe`);
  }
});

test("every object has a name and prose", () => {
  for (const item of getAccessoryItems()) {
    assert.ok(item.name.length > 1, `${item.slug} has no name`);
    assert.ok(item.description.length > 20, `${item.slug} has no description`);
    /* The name must not have been left duplicated at the head of its own
       description, which is what a change to the markup would cause. */
    assert.ok(
      !item.description.startsWith(item.name),
      `${item.slug} repeats its name in the prose`,
    );
  }
});

/*
 * The point of the whole exercise: a decade must never be presented as a
 * year. This is the one guarantee the index page makes to a reader trying
 * to date something they own.
 */
test("a decade is never shown as a year", () => {
  for (const item of getAccessoryItems()) {
    const label = dateLabel(item);
    if (item.year) {
      assert.equal(label, String(item.year));
    } else {
      assert.ok(
        label.endsWith("s") || label === "Date not known",
        `${item.slug} has no stated year but shows "${label}"`,
      );
    }
  }
});

test("stated years are plausible and inside their decade", () => {
  for (const item of getAccessoryItems()) {
    if (!item.year) continue;
    assert.ok(item.year >= 1920 && item.year <= 1990, `${item.slug}: ${item.year}`);
    if (item.decade) {
      /* Michael filed things by when they were written up, so a 1965 motor
         can sit on a 1960s page but not a 1940s one. One decade of slack
         either way catches a misread year without failing on his filing. */
      assert.ok(
        Math.abs(item.year - item.decade) <= 15,
        `${item.slug}: year ${item.year} is far from its ${item.decade}s page`,
      );
    }
  }
});

test("footnote markers do not run into the following word", () => {
  for (const item of getAccessoryItems()) {
    assert.doesNotMatch(
      item.description,
      /\[\d+\]\w/,
      `${item.slug} has a footnote marker stuck to a word`,
    );
  }
});
