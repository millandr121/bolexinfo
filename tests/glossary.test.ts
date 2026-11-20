import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { getGlossary, glossaryCount, rewriteHref } from "../lib/glossary";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";
import { getRecoveredSection } from "../lib/recovered";
import { getRecoveredArticles } from "../lib/content";

/*
 * The glossary shipped for months as its own introduction and nothing
 * else: 105 definitions silently dropped because the generic recovered
 * -content reader does not understand `<dl>`. Nothing failed, no page
 * 404'd, the text simply was not there. These assert the content is
 * present rather than that the code runs.
 */

const glossary = getGlossary();

test("every term in the archived page is recovered", () => {
  const html = fs.readFileSync("archive/wayback/glossary.html", "utf8");
  const inSource = (html.match(/<dt>[\s\S]*?<\/dt>\s*<dd>[\s\S]*?<\/dd>/gi) ?? []).length;
  assert.ok(inSource > 100, `expected the archive to hold the terms, found ${inSource}`);
  assert.equal(
    glossaryCount(),
    inSource,
    "every definition pair in the archive should reach the page",
  );
});

test("terms are grouped under letters, and empty letters are dropped", () => {
  assert.ok(glossary.length > 15, "expected most letters to carry terms");
  for (const group of glossary) {
    assert.match(group.letter, /^[A-Z]$/, `odd letter heading: ${group.letter}`);
    assert.ok(group.terms.length > 0, `${group.letter} should not be an empty section`);
  }
  /* The original printed Q, X and Y with nothing under them. */
  const letters = glossary.map((g) => g.letter);
  for (const empty of ["Q", "X", "Y"]) {
    assert.ok(!letters.includes(empty), `${empty} has no terms and should not appear`);
  }
});

test("every term has a definition and a usable anchor", () => {
  const seen = new Set<string>();
  for (const group of glossary) {
    for (const term of group.terms) {
      assert.ok(term.term.trim(), "a term should have a name");
      assert.ok(term.definition.length > 0, `${term.term} has no definition`);
      assert.ok(
        term.definition.some((p) => p.text.trim().length > 0),
        `${term.term}'s definition is empty`,
      );
      assert.match(term.slug, /^[A-Za-z0-9][\w.-]*$/, `${term.term} has an unusable anchor`);
      assert.ok(!seen.has(term.slug), `two terms share the anchor ${term.slug}`);
      seen.add(term.slug);
    }
  }
});

/*
 * The original's own anchor names are kept so that a link written
 * against bolexcollector.com/glossary.html#aperture still lands on the
 * right definition here. Regenerating them from the term text would
 * break every such link silently.
 */
test("the original's anchors are preserved", () => {
  const html = fs.readFileSync("archive/wayback/glossary.html", "utf8");
  const names = new Set(
    [...html.matchAll(/<dt>\s*<a\s+name\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]),
  );
  assert.ok(names.size > 100, `expected the archive to carry anchors, found ${names.size}`);
  const slugs = new Set(glossary.flatMap((g) => g.terms).map((t) => t.slug));
  for (const name of names) {
    assert.ok(name && slugs.has(name), `the anchor #${name} was not preserved`);
  }
});

test("hrefs are rewritten to where the material now lives", () => {
  assert.equal(rewriteHref("articles/06_04_26.html"), "/articles/06-04-26");
  assert.equal(rewriteHref("cameras/h16rex.html"), "/cameras/h16rex");
  assert.equal(rewriteHref("#aperture"), "#aperture", "internal anchors stay as they are");
  assert.equal(rewriteHref("https://example.com/x"), "https://example.com/x");
});

/*
 * A cross-reference that 404s is worse than no cross-reference: it
 * tells a reader the archive is broken. Every link in every definition
 * is checked against the routes the site actually builds.
 */
test("every cross-reference points at a page that exists", () => {
  const routes = new Set<string>();
  for (const model of getCameraRecords()) routes.add(`/cameras/${model.slug}`);
  for (const model of getProjectorRecords()) routes.add(`/projectors/${model.slug}`);
  for (const section of ["accessories", "lenses", "ephemera"]) {
    for (const page of getRecoveredSection(section)) routes.add(`/${section}/${page.slug}`);
  }
  for (const article of getRecoveredArticles()) routes.add(`/articles/${article.slug}`);

  const anchors = new Set(glossary.flatMap((g) => g.terms).map((t) => `#${t.slug}`));

  let checked = 0;
  for (const group of glossary) {
    for (const term of group.terms) {
      for (const part of term.definition) {
        if (!part.href) continue;
        checked++;
        if (part.href.startsWith("http")) continue;
        if (part.href.startsWith("#")) {
          assert.ok(
            anchors.has(part.href),
            `${term.term} links to ${part.href}, which is not a term here`,
          );
          continue;
        }
        assert.ok(
          routes.has(part.href),
          `${term.term} links to ${part.href}, which the site does not build`,
        );
      }
    }
  }
  assert.ok(checked > 30, `expected the definitions to carry links, found ${checked}`);
});

test("the built page actually contains the definitions", { skip: !fs.existsSync("out/glossary.html") }, () => {
  const html = fs.readFileSync("out/glossary.html", "utf8");
  for (const term of ["AMBOL", "Anamorphic Lens", "Zoom Viewfinder", "Aperture"]) {
    assert.ok(html.includes(term), `the built page is missing "${term}"`);
  }
  assert.ok(
    html.includes('id="aperture"'),
    "the built page should carry the original's anchors",
  );
});
