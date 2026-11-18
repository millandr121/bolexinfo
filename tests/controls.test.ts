import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import { getControls, hasControls, CONTROLS_PAGES } from "../lib/controls";
import { getCameraRecord } from "../lib/museum";

test("only models with a recovered figure set report controls", () => {
  assert.ok(hasControls("h16reflex"), "the H-16 Reflex published one");
  assert.ok(!hasControls("h16"), "the plain H-16 did not");
  assert.ok(!hasControls("nonexistent-model"));
});

test("the figures and their parts come through", () => {
  const c = getControls("h16reflex");
  assert.ok(c, "the H-16 Reflex controls should parse");
  assert.equal(c!.figures.length, 4);

  const named = c!.figures.reduce((n, f) => n + f.parts.length, 0);
  assert.equal(named, 26, `expected 26 named parts, got ${named}`);

  for (const f of c!.figures) {
    assert.ok(f.caption.length > 0, "every figure needs its caption");
    assert.ok(f.image?.startsWith("/images/"), `${f.caption}: image path should be site-absolute`);
    assert.ok(
      fs.existsSync(`archive/wayback${f.image}`),
      `${f.caption}: ${f.image} is not in the archive`,
    );
  }
});

/*
 * The numbering runs continuously across all four figures, and the original's
 * own captions are the proof: figure 2 refers to "the film knife (14)" and
 * figure 3 to "the loop shaper lever (24)". If the page ever restarted each
 * list at 1, every cross-reference in the prose would point at the wrong
 * part — silently, because nothing would look broken.
 */
test("part numbers match the cross-references in the original captions", () => {
  const c = getControls("h16reflex")!;
  const flat: string[] = [];
  for (const f of c.figures) flat.push(...f.parts);

  const numberOf = (name: RegExp) => flat.findIndex((p) => name.test(p)) + 1;

  assert.equal(numberOf(/^film knife$/i), 14, "the film knife is (14) in figure 2's caption");
  assert.equal(
    numberOf(/loop shapers? control lever/i),
    24,
    "the loop shaper lever is (24) in figure 3's note",
  );
  assert.equal(flat.length, 26);
});

test("the controls icon no longer poses as a photograph", () => {
  const model = getCameraRecord("h16reflex");
  assert.ok(model);
  assert.ok(
    !model!.images.some((i) => /_instruction\./i.test(i.src)),
    "the 100x100 link icon must not appear in the gallery",
  );
  assert.ok(model!.images.length >= 2, "the real photographs are still there");
});

test("every declared controls page exists in the archive", () => {
  for (const [slug, rel] of Object.entries(CONTROLS_PAGES)) {
    assert.ok(fs.existsSync(`archive/wayback/${rel}`), `${slug} points at missing ${rel}`);
  }
});

test("the built controls page carries the parts", { skip: !fs.existsSync("out/cameras/h16reflex/controls.html") }, () => {
  /*
   * React separates adjacent text nodes with an empty comment, so a count
   * rendered next to prose reaches the HTML as "26<!-- --> named controls".
   * Stripping those is the honest way to assert on what a reader sees; the
   * alternative is contorting the page to suit the test.
   */
  const html = fs.readFileSync("out/cameras/h16reflex/controls.html", "utf8").replace(/<!-- -->/g, "");
  assert.match(html, /Frame counter/);
  assert.match(html, /Film knife/i);
  assert.match(html, /26 named controls/);
  // The figure images must be referenced, not just the list.
  assert.match(html, /h16reflex_3\.jpg/);
});
