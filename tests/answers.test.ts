import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { prepare, search, tokenise, sourceName, type AnswerIndex } from "../lib/answers";

const INDEX = path.join(process.cwd(), "public", "answers-index.json");
const missing = !fs.existsSync(INDEX);

function load(): AnswerIndex {
  return JSON.parse(fs.readFileSync(INDEX, "utf8")) as AnswerIndex;
}

let cached: ReturnType<typeof prepare> | null = null;
function corpus() {
  if (!cached) cached = prepare(load());
  return cached;
}

/**
 * The model names, however they are typed.
 *
 * Somebody with a problem types "rex 5", "rex-5" or "REX5" and the
 * corpus has all three. Folding them to one token is the single thing
 * that makes this feel like it works, and it has to happen on both
 * sides of the comparison or it does nothing at all.
 */
test("the ways people write a model name all fold together", () => {
  for (const group of [
    ["rex 5", "rex-5", "REX5", "Rex.5"],
    ["h 16", "h-16", "H16"],
    ["super 8", "super-8", "S8", "s 8"],
    ["16 mm", "16mm"],
  ]) {
    const first = tokenise(group[0]!);
    for (const other of group.slice(1)) {
      assert.deepEqual(tokenise(other), first, `"${other}" should tokenise like "${group[0]}"`);
    }
  }
});

/**
 * Words that are in every single document carry no information here.
 *
 * "bolex", "camera" and "film" are on a Bolex forum what "the" is in
 * English. Matching them ranks the whole corpus equally and drowns
 * the word the reader actually cared about.
 */
test("words common to the whole corpus are not searched on their own", () => {
  assert.deepEqual(tokenise("bolex camera film"), []);
  assert.deepEqual(tokenise("a bolex prism"), ["prism"]);
});

test("the quotations are short enough to be quotations", { skip: missing }, () => {
  const index = load();
  const longest = Math.max(...index.docs.map((d) => d.t.length));
  assert.ok(longest <= 520, `the longest passage is ${longest} characters`);
  /* And nothing shipped without somebody's name on it. */
  for (const doc of index.docs) assert.ok(doc.a.trim(), "a passage has no author");
  for (const thread of index.threads) {
    assert.ok(thread.url.startsWith("http"), `${thread.title} has no link home`);
  }
});

test("no passage is shipped twice", { skip: missing }, () => {
  const index = load();
  const seen = new Set(index.docs.map((d) => `${d.a.toLowerCase()}|${d.t.slice(0, 120)}`));
  assert.equal(seen.size, index.docs.length, "the same words appear twice under one name");
});

/**
 * The thing this was built for.
 *
 * The roadmap's own example: somebody types a problem in their own
 * words and gets back the people who actually knew. If this stops
 * being true the index or the ranking has regressed, and no other
 * test would notice.
 */
test("a question in plain words finds the people who answered it", { skip: missing }, () => {
  const results = search(corpus(), "how do I clean the prism", { limit: 10 });
  assert.ok(results.length > 0, "a plain question should find something");
  assert.ok(
    results.slice(0, 5).some((r) => /prism/i.test(`${r.thread} ${r.text}`)),
    "the top results should be about prisms",
  );
  for (const r of results) {
    assert.ok(r.author.trim(), "every result names its author");
    assert.ok(r.url.startsWith("http"), "every result links home");
  }
});

test("a query every word of which is present beats a query half-matched", { skip: missing }, () => {
  const both = search(corpus(), "light leak door", { limit: 5 });
  assert.ok(both.length > 0);
  const top = `${both[0]!.thread} ${both[0]!.text}`.toLowerCase();
  assert.ok(
    top.includes("leak") || top.includes("light"),
    `the top hit should be about light leaks, got: ${top.slice(0, 120)}`,
  );
});

test("one thread cannot fill the results", { skip: missing }, () => {
  const results = search(corpus(), "bolex h16 motor", { limit: 20, perThread: 2 });
  const perThread = new Map<string, number>();
  for (const r of results) perThread.set(r.url, (perThread.get(r.url) ?? 0) + 1);
  for (const [url, n] of perThread) {
    assert.ok(n <= 2, `${n} passages from ${url}`);
  }
});

test("an empty or meaningless query returns nothing rather than everything", { skip: missing }, () => {
  for (const q of ["", "   ", "the and of", "bolex"]) {
    assert.deepEqual(search(corpus(), q), [], `"${q}" should return nothing`);
  }
});

test("sources are named the way a reader would say them", () => {
  assert.equal(sourceName("cinematography.com/forum78"), "cinematography.com");
  assert.equal(sourceName("reddit.com/r/bolex"), "r/bolex");
});

/**
 * The second link, and only where it leads somewhere.
 *
 * Every result points at a live page on somebody else's site, and
 * those go: a third of the Bolex forum's threads are already gone
 * and the live site is behind a challenge page. A forum result
 * therefore carries a Wayback link as well, because that corpus was
 * read through Wayback and a capture is known to exist for all of
 * it.
 *
 * Reddit deliberately gets none. It was read live, its coverage is
 * patchy — the availability API has no snapshot for the first thread
 * tried — and a link landing on "page not in the archive" tells the
 * reader a quotation is unverifiable when it is merely un-mirrored.
 */
test("a forum quotation has a copy that outlives the thread", async () => {
  const { archiveUrl } = await import("../lib/answers");
  const thread = "https://cinematography.com/index.php?/forums/topic/72750-x/";
  assert.equal(
    archiveUrl(thread, "cinematography.com/forum78"),
    `https://web.archive.org/web/2/${thread}`,
  );
  assert.equal(
    archiveUrl("https://www.reddit.com/r/bolex/comments/abc/", "reddit.com/r/bolex"),
    null,
  );
});
