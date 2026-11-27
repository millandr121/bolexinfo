import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

const INDEX = path.join(process.cwd(), "public", "search-index.json");
const missing = !fs.existsSync(INDEX);

interface Doc {
  title: string;
  href: string;
  section: string;
}

/**
 * One entry per destination.
 *
 * This is not tidiness. The palette keys its result list by href, and
 * React cannot reconcile a list whose keys repeat: with 193 duplicated
 * hrefs in the index — /projectors appeared twenty-eight times — rows
 * from an earlier query stayed on screen underneath the results of a
 * later one. Seventeen stale rows were showing for a result set of
 * none, which read as a broken filter and was really a broken list.
 *
 * The builder deduplicates and the palette keys by position as well,
 * so this is the test that stops the data drifting back.
 */
test("no destination is indexed twice", { skip: missing }, () => {
  const docs = JSON.parse(fs.readFileSync(INDEX, "utf8")) as Doc[];
  assert.ok(docs.length > 100, `${docs.length} indexed documents looks wrong`);

  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  for (const doc of docs) {
    const first = seen.get(doc.href);
    if (first) duplicates.push(`${doc.href} (“${first}” and “${doc.title}”)`);
    else seen.set(doc.href, doc.title);
  }
  assert.deepEqual(duplicates, [], `duplicated in the search index: ${duplicates.join(", ")}`);
});

test("every indexed destination is a site path", { skip: missing }, () => {
  const docs = JSON.parse(fs.readFileSync(INDEX, "utf8")) as Doc[];
  for (const doc of docs) {
    assert.ok(doc.href.startsWith("/"), `${doc.title} points at ${doc.href}`);
    assert.ok(doc.title.trim(), `${doc.href} has no title`);
  }
});
