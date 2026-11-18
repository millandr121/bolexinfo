import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import { getNeighbours, resolveNeighbours } from "../lib/sequence";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";
import { getRecoveredSection } from "../lib/recovered";

const cameras = () => getCameraRecords().map((m) => ({ slug: m.slug, label: m.name }));

test("the original's own chain is read, not invented", () => {
  const has = new Set(cameras().map((c) => c.slug));
  const n = getNeighbours("cameras", "155", (s) => has.has(s));
  // From the archived page: "Previous: 150 Super" / "Next: 7.5 Macrozoom".
  assert.equal(n.previous?.slug, "150");
  assert.equal(n.next?.slug, "75macro");
  assert.equal(n.previous?.label, "150 Super", "the direction word is stripped from the label");
  assert.equal(n.next?.label, "7.5 Macrozoom");
});

test("every camera and projector can be walked in both directions", () => {
  for (const [section, list] of [
    ["cameras", cameras()],
    ["projectors", getProjectorRecords().map((m) => ({ slug: m.slug, label: m.name }))],
  ] as const) {
    for (const item of list) {
      const n = resolveNeighbours(section, item.slug, [...list]);
      const ends = item.slug === list[0]!.slug || item.slug === list[list.length - 1]!.slug;
      if (!ends) {
        assert.ok(n.previous, `${section}/${item.slug} has no previous`);
        assert.ok(n.next, `${section}/${item.slug} has no next`);
      }
    }
  }
});

test("a neighbour always points at a page that exists", () => {
  const sections = [
    ["cameras", cameras()],
    ["projectors", getProjectorRecords().map((m) => ({ slug: m.slug, label: m.name }))],
    ["lenses", getRecoveredSection("lenses").map((p) => ({ slug: p.slug, label: p.title }))],
    ["accessories", getRecoveredSection("accessories").map((p) => ({ slug: p.slug, label: p.title }))],
  ] as const;

  for (const [section, list] of sections) {
    const has = new Set(list.map((i) => i.slug));
    for (const item of list) {
      const n = resolveNeighbours(section, item.slug, [...list]);
      for (const step of [n.previous, n.next]) {
        if (!step) continue;
        assert.ok(has.has(step.slug), `${section}/${item.slug} links to missing ${step.slug}`);
        assert.equal(step.href, `/${section}/${step.slug}`);
        assert.ok(step.label.trim().length > 0, `${section}/${step.slug} has an empty label`);
        assert.ok(
          !/^(previous|next|back)\s*:/i.test(step.label),
          `${step.label} still carries its direction word`,
        );
      }
    }
  }
});

test("nothing is its own neighbour", () => {
  for (const item of cameras()) {
    const n = resolveNeighbours("cameras", item.slug, cameras());
    assert.notEqual(n.previous?.slug, item.slug);
    assert.notEqual(n.next?.slug, item.slug);
  }
});

/*
 * The lens pages never carried a chain, so they are the case the fallback
 * exists for. If it ever stopped working they would silently lose their
 * buttons — which is exactly the bouncing-off-the-index problem this was
 * meant to fix.
 */
test("a section the original never chained still gets buttons", () => {
  const lenses = getRecoveredSection("lenses").map((p) => ({ slug: p.slug, label: p.title }));
  assert.ok(lenses.length >= 3, "need a few lens pages to test the fallback");

  const middle = lenses[1]!;
  const n = resolveNeighbours("lenses", middle.slug, lenses);
  assert.equal(n.previous?.slug, lenses[0]!.slug);
  assert.equal(n.next?.slug, lenses[2]!.slug);

  // And the ends stay open rather than wrapping around.
  assert.equal(resolveNeighbours("lenses", lenses[0]!.slug, lenses).previous, undefined);
  assert.equal(resolveNeighbours("lenses", lenses[lenses.length - 1]!.slug, lenses).next, undefined);
});

test("the built pages carry the links", { skip: !fs.existsSync("out/cameras/155.html") }, () => {
  const html = fs.readFileSync("out/cameras/155.html", "utf8");
  assert.match(html, /rel="prev"/);
  assert.match(html, /rel="next"/);
  assert.match(html, /href="\/cameras\/150"/);
  assert.match(html, /href="\/cameras\/75macro"/);
});
