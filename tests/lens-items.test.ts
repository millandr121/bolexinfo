import test from "node:test";
import assert from "node:assert/strict";
import { getLensItems, lensDateLabel } from "../lib/lens-items";
import { getRecoveredSection } from "../lib/recovered";

/*
 * The lens index is generated and committed, and is now what the section
 * renders, so the shape of the extractor's output is asserted rather than
 * trusted. The code assertions matter most: a lens found by the five
 * letters on its barrel is the thing this section is for.
 */

test("every lens knows its gauge, and most its mount", () => {
  const items = getLensItems();
  for (const item of items) {
    assert.ok(item.gauge === "16mm" || item.gauge === "8mm", `${item.slug}: ${item.gauge}`);
  }
  /* The mount comes from his heading, and three of the nine pages head
     their sections without naming one. Most should still have it. */
  assert.ok(items.filter((i) => i.mount).length >= items.length * 0.8);
});

test("every lens page yielded lenses", () => {
  const items = getLensItems();
  assert.ok(items.length >= 110, `expected the full set, got ${items.length}`);

  const covered = new Set(items.map((i) => i.from.page));
  for (const page of getRecoveredSection("lenses")) {
    assert.ok(covered.has(page.slug), `nothing was extracted from ${page.slug}`);
  }
});

test("slugs are unique and URL-safe", () => {
  const slugs = getLensItems().map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length, "two lenses share a slug");
  for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/, `${slug} is not URL-safe`);
});

test("product codes are five upper-case letters and unambiguous", () => {
  const owner = new Map<string, string>();
  for (const item of getLensItems()) {
    for (const code of item.codes) {
      assert.match(code, /^[A-Z]{5}$/, `${item.slug}: "${code}" is not a Paillard code`);
      /* A code is engraved on one lens. If two entries claim the same one,
         the parser has picked up a word, or he listed a variant twice, and
         either way a search for it would land somewhere arbitrary. */
      const already = owner.get(code);
      assert.equal(already, undefined, `${code} is claimed by both ${already} and ${item.slug}`);
      owner.set(code, item.slug);
    }
  }
});

test("parsed facts match the name they came from", () => {
  for (const item of getLensItems()) {
    if (item.aperture) {
      assert.match(item.aperture, /^f\/\d+(\.\d+)?$/, `${item.slug}: ${item.aperture}`);
      assert.ok(
        item.name.toLowerCase().replace(/\s+/g, "").includes(item.aperture.toLowerCase().replace("/", "")) ||
          item.name.toLowerCase().replace(/\s+/g, "").includes(item.aperture.toLowerCase()),
        `${item.slug}: aperture ${item.aperture} is not in "${item.name}"`,
      );
    }
    if (item.focalLength) {
      assert.match(item.focalLength, /^[\d.½¼¾-]+(mm|")$/, `${item.slug}: ${item.focalLength}`);
    }
  }
});

test("a decade is never shown as a year", () => {
  for (const item of getLensItems()) {
    const label = lensDateLabel(item);
    if (item.year) assert.equal(label, String(item.year));
    else
      assert.ok(
        label.endsWith("s") || label === "Date not known",
        `${item.slug} has no stated year but shows "${label}"`,
      );
  }
});

test("every lens has a name, a maker and prose", () => {
  for (const item of getLensItems()) {
    assert.ok(item.name.length > 1, `${item.slug} has no name`);
    assert.ok(item.maker.length > 1, `${item.slug} has no maker`);
    /* An empty description is correct for 41 of these: on the Wollensak,
       Meyer and Goerz pages he listed the lenses and wrote about the
       company instead. What must never happen is a description that is
       just the name again, which is what a markup change would produce. */
    if (item.description) {
      assert.ok(item.description.length > 10, `${item.slug}: description is a fragment`);
      assert.ok(!item.description.startsWith(item.name), `${item.slug} repeats its name`);
    }
  }
});
