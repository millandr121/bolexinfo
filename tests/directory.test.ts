import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { getLinkDirectory, getUpdates } from "../lib/directory";

/*
 * These read the preserved pages themselves rather than fixtures: the point of
 * the parsers is to hold against the real archived markup, so a recovery pass
 * that changes it should fail here rather than quietly empty the pages.
 */

test("the link directory recovers every category and link", () => {
  const { intro, categories } = getLinkDirectory();

  assert.ok(intro.length > 40, "the page's own introduction should survive");
  assert.equal(categories.length, 9);

  const links = categories.flatMap((c) => c.entries);
  assert.equal(links.length, 49);

  for (const link of links) {
    assert.ok(link.name.length > 0, "every link needs its name");
    assert.match(link.href, /^https?:\/\//, `${link.name} should carry an absolute URL`);
    // The href is the whole point of this page; losing it is the failure mode
    // that the generic block reader already has.
    assert.ok(!link.description.startsWith(link.name), "description should not repeat the name");
  }

  const bolex = categories[0]!;
  assert.equal(bolex.title, "Bolex Related");
  assert.deepEqual(bolex.entries[0], {
    name: "Bolex International S.A.",
    href: "http://www.bolex.ch",
    description: "The official website of Bolex International.",
  });
});

test("no category is rendered empty", () => {
  for (const category of getLinkDirectory().categories) {
    assert.ok(category.entries.length > 0, `${category.title} should have entries`);
  }
});

test("a missing archive yields an empty directory rather than throwing", () => {
  const directory = getLinkDirectory("/does-not-exist.html");
  assert.deepEqual(directory, { intro: "", categories: [] });
});

test("the update log recovers every dated entry", () => {
  const updates = getUpdates();

  assert.equal(updates.length, 39);
  // A date is what makes an entry an entry, so every one must parse.
  assert.equal(updates.filter((u) => u.sortKey === null).length, 0);

  for (const update of updates) {
    assert.ok(update.date.length > 0);
    assert.ok(update.description.length > 0, `${update.date} should keep its description`);
    // The date line is shown separately, so it must not also sit in the prose.
    assert.ok(!update.description.includes(update.date));
    if (update.title) assert.ok(!update.description.startsWith(update.title));
  }
});

test("updates span the site's working life and keep their archived order", () => {
  const updates = getUpdates();
  const keys = updates.map((u) => u.sortKey!);

  assert.equal(String(keys[0]).slice(0, 4), "2011", "newest first");
  assert.equal(String(keys[keys.length - 1]).slice(0, 4), "2005", "oldest last");

  /*
   * The log is newest-first apart from a single entry the original site dated
   * "January 26, 2006" while placing it among the January 2007 updates — a
   * typo in the source, sitting exactly where 2007-01-26 belongs.
   *
   * It is rendered in archived order and the date is shown as written: this is
   * a preserved record, and silently re-dating or re-sorting an entry to make
   * the sequence tidy would be editing it. This test pins the anomaly so it
   * stays a known quirk rather than being "fixed" later.
   */
  const ascents = keys.flatMap((key, i) => (i > 0 && key > keys[i - 1]! ? [i] : []));
  assert.deepEqual(ascents, [17], "exactly one out-of-sequence entry, the 2006/2007 typo");
  assert.equal(keys[16], 20060126);
  assert.equal(updates[16]!.date, "January 26, 2006 -- Friday");
});

test("an update only links an article the restoration actually holds", () => {
  const updates = getUpdates();
  const linked = updates.filter((u) => u.articleSlug);

  assert.ok(linked.length > 0, "expected some updates to announce recovered articles");
  for (const update of linked) {
    const file = path.join(process.cwd(), "content", "articles", `${update.articleSlug}.md`);
    assert.ok(fs.existsSync(file), `${update.articleSlug} should exist, or not be linked`);
  }
});
