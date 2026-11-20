import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { getNotes, resolveHref } from "../lib/notes";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";

/*
 * The "Notes and Comments" prose.
 *
 * This is the part of the archive that was present in the preserved
 * original and missing from the modern page for months, which is the
 * failure mode worth testing against: the build succeeded, the page
 * rendered, the specifications were all correct, and the writing was
 * simply not there. Counting it is the only way that shows up.
 */

const records = [...getCameraRecords(), ...getProjectorRecords()];

test("every model whose original page has notes shows them", () => {
  const missing: string[] = [];
  let shown = 0;

  for (const model of records) {
    if (!model.originalPath) continue;
    const file = `archive/wayback${model.originalPath}`;
    if (!fs.existsSync(file)) continue;

    const original = fs.readFileSync(file, "utf8");
    const hasSection = /<h4[^>]*>\s*Notes and Comments\s*<\/h4>/i.test(original);
    if (!hasSection) continue;

    const notes = getNotes(model.originalPath);
    if (notes.blocks.length === 0) missing.push(model.slug);
    else shown++;
  }

  assert.deepEqual(missing, [], "originals with notes that extract to nothing");
  assert.ok(shown > 60, `expected the notes on most models, extracted ${shown}`);
});

test("the notes keep their links, emphasis and citations", () => {
  const notes = getNotes("/cameras/h16rex.html");

  const paragraphs = notes.blocks.filter((b) => b.kind === "paragraph");
  assert.ok(paragraphs.length >= 5, "the REX notes run to several paragraphs");

  /* Michael's own sub-headings survive, including the list of the rest
     of the series, which is why the generated related-models block is
     no longer needed. */
  const headings = notes.blocks.flatMap((b) => (b.kind === "heading" ? [b.text] : []));
  assert.ok(
    headings.some((h) => /H16 Reflex Series/i.test(h)),
    `expected the series heading, got ${JSON.stringify(headings)}`,
  );

  const links = notes.blocks.flatMap((b) =>
    b.kind === "paragraph" ? b.parts.filter((p) => p.href) : [],
  );
  assert.ok(
    links.some((p) => p.href === "/cameras/h16rex4"),
    "cross-references point at the modern route",
  );

  /* The citation lives in its own container at the foot of the original
     page, so it is easy to leave behind. */
  assert.equal(notes.footnotes.length, 1);
  assert.match(notes.footnotes[0]!.parts.map((p) => p.text).join(""), /Bolex Reporter/);
  assert.ok(
    notes.footnotes[0]!.parts.some((p) => p.italic),
    "the journal title stays italic",
  );
});

test("entities are decoded and the source's hard wrapping collapsed", () => {
  const text = getNotes("/cameras/h16rex.html")
    .blocks.flatMap((b) => (b.kind === "paragraph" ? b.parts.map((p) => p.text) : []))
    .join("");

  assert.ok(text.includes("145°"), "degree signs are decoded, not left as entities");
  assert.doesNotMatch(text, /&[a-z]+;/i, "no raw entities survive");
  assert.doesNotMatch(text, /\s{2,}|\n/, "no runs of whitespace from the source's wrapping");
});

test("a link is repointed, preserved or dropped — never left broken", () => {
  /* A page this edition has: the modern route. */
  assert.equal(resolveHref("h16rex4.html", "/cameras/h16rex.html"), "/cameras/h16rex4");
  /* A section index. */
  assert.equal(resolveHref("../lenses/index.html", "/cameras/h16rex.html"), null);
  /* Off-site and mail links are left exactly as written. */
  assert.equal(resolveHref("mailto:a@b.com", "/cameras/h16rex.html"), "mailto:a@b.com");
  /* An anchor into markup this page does not reproduce is dropped. */
  assert.equal(resolveHref("#ft1", "/cameras/h16rex.html"), null);
  /* Nothing resolves outside the original site. */
  assert.equal(resolveHref("https://example.com/x", "/cameras/h16rex.html"), "https://example.com/x");
});

test("no model page carries the generated related-models block", () => {
  assert.ok(
    !fs.existsSync("components/RelatedModels.tsx"),
    "the related-models block was removed: the originals list their own series",
  );
});
