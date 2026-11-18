import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { thumbnailFor } from "../lib/thumbnails";
import { getCameraRecords, getProjectorRecords, type ModelImage } from "../lib/museum";
import { getRecoveredSection } from "../lib/recovered";

type Section = "cameras" | "projectors" | "lenses" | "accessories";

function everything(): Array<{ section: Section; slug: string; images: ModelImage[] }> {
  return [
    ...getCameraRecords().map((m) => ({ section: "cameras" as const, slug: m.slug, images: m.images })),
    ...getProjectorRecords().map((m) => ({ section: "projectors" as const, slug: m.slug, images: m.images })),
    ...getRecoveredSection("lenses").map((p) => ({ section: "lenses" as const, slug: p.slug, images: p.images })),
    ...getRecoveredSection("accessories").map((p) => ({
      section: "accessories" as const,
      slug: p.slug,
      images: p.images,
    })),
  ];
}

test("every item with imagery gets a thumbnail", () => {
  for (const item of everything()) {
    const thumb = thumbnailFor(item.section, item.slug, item.images);
    if (item.images.length === 0) {
      assert.equal(thumb, undefined, `${item.section}/${item.slug} has no images but produced one`);
    } else {
      assert.ok(thumb, `${item.section}/${item.slug} has ${item.images.length} images but no thumbnail`);
    }
  }
});

test("a chosen thumbnail is one of that item's own images", () => {
  // The stored picks are generated from a snapshot of the archive. If an
  // image is renamed or dropped, the pick must fall back rather than point at
  // something that belongs to a different model.
  for (const item of everything()) {
    const thumb = thumbnailFor(item.section, item.slug, item.images);
    if (!thumb) continue;
    assert.ok(
      item.images.some((i) => i.src === thumb),
      `${item.section}/${item.slug} is showing ${thumb}, which is not one of its images`,
    );
  }
});

test("every chosen thumbnail is a file that exists", () => {
  for (const item of everything()) {
    const thumb = thumbnailFor(item.section, item.slug, item.images);
    if (!thumb) continue;
    const file = path.join(process.cwd(), "archive", "wayback", thumb.replace(/^\//, ""));
    assert.ok(fs.existsSync(file), `${item.section}/${item.slug} points at missing ${thumb}`);
  }
});

/*
 * The whole point of the selection pass. These four led with something that
 * does not identify the model — a period snapshot, a specification plate, a
 * blank — and a regression in the scoring would quietly put them back.
 */
test("the known-bad leading images stay rejected", () => {
  const cases: Array<[Section, string, string]> = [
    ["cameras", "h16rex2", "/images/cameras/h16rex2_1.jpg"],
    ["cameras", "h16s", "/images/cameras/h16s_plate.jpg"],
    ["lenses", "50berthiot", "/images/lenses/lens_blank.jpg"],
    ["lenses", "40meyer", "/images/rudolph.jpg"],
  ];

  const index = new Map(everything().map((i) => [`${i.section}/${i.slug}`, i]));
  for (const [section, slug, rejected] of cases) {
    const item = index.get(`${section}/${slug}`);
    assert.ok(item, `${section}/${slug} is no longer in the catalogue — update this test`);
    assert.ok(
      item!.images.some((i) => i.src === rejected),
      `${section}/${slug} no longer carries ${rejected} — update this test`,
    );
    assert.notEqual(
      thumbnailFor(section, slug, item!.images),
      rejected,
      `${section}/${slug} is back to showing ${rejected}`,
    );
  }
});
