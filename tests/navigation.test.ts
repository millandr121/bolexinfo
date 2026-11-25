import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  NAVIGATION,
  flattenNavigation,
  isActiveEntry,
  isActiveHref,
  isGroup,
} from "../lib/navigation";

test("the top level stays small enough to fit beside the tools", () => {
  // Nine flat items is what overflowed the header in the first place.
  assert.ok(NAVIGATION.length <= 5, `${NAVIGATION.length} top-level entries is too many`);
});

test("every destination resolves to a real route", () => {
  for (const leaf of flattenNavigation()) {
    const segment = leaf.href.replace(/^\//, "");
    const page = path.join(process.cwd(), "app", segment, "page.tsx");
    if (fs.existsSync(page)) continue;

    /*
     * A destination can also be one page of a dynamic route, which has
     * no file of its own: /articles/what-one-is-worth is served by
     * app/articles/[slug]/page.tsx out of a markdown file. Check that
     * the parent route and the content behind it both exist, which is
     * the same promise the literal check makes.
     */
    const parts = segment.split("/");
    const slug = parts.pop()!;
    const parent = parts.join("/");
    const dynamic = path.join(process.cwd(), "app", parent, "[slug]", "page.tsx");
    const content = path.join(process.cwd(), "content", parent, `${slug}.md`);
    assert.ok(
      fs.existsSync(dynamic) && fs.existsSync(content),
      `${leaf.href} has no page at app/${segment}/page.tsx, and no ` +
        `content/${parent}/${slug}.md behind app/${parent}/[slug]/page.tsx either`,
    );
  }
});

test("no destination is listed twice", () => {
  const hrefs = flattenNavigation().map((l) => l.href);
  assert.equal(new Set(hrefs).size, hrefs.length, `duplicate: ${hrefs.join(", ")}`);
});

test("the serial lookup stays one click away", () => {
  /*
   * Someone holding a camera with a number stamped on it is this site's most
   * common visitor. If a tidy-up ever folds Identify into a menu, this fails.
   */
  const top = NAVIGATION.find((e) => !isGroup(e) && e.href === "/serials");
  assert.ok(top, "/serials must stay a top-level entry, not live inside a menu");
});

test("the collections and the reading material are separated", () => {
  const equipment = NAVIGATION.find((e) => isGroup(e) && e.label === "Equipment");
  assert.ok(equipment && isGroup(equipment));
  assert.deepEqual(
    equipment.items.map((i) => i.href),
    ["/cameras", "/projectors", "/lenses", "/accessories"],
  );
});

test("active state reaches detail pages", () => {
  assert.ok(isActiveHref("/cameras/h16", "/cameras"), "a model page marks its section");
  assert.ok(!isActiveHref("/camerasomething", "/cameras"), "a prefix is not a path segment");

  const equipment = NAVIGATION.find((e) => isGroup(e) && e.label === "Equipment")!;
  assert.ok(isActiveEntry("/cameras/h16", equipment), "the group marks itself from a detail page");
  assert.ok(!isActiveEntry("/serials", equipment));
});

/*
 * The footer was ten links in one column, eight of which the header already
 * carried — it was the tallest thing on a short page. These check it stays
 * short and stays honest, from the built page rather than the source.
 */
test("the footer does not re-list the header", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  const footer = /<footer[\s\S]*?<\/footer>/.exec(html);
  assert.ok(footer, "the built page should have a footer");

  const internal = [...footer[0].matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]!);
  const unique = [...new Set(internal)];

  assert.ok(unique.length <= 7, `${unique.length} footer links is a second navigation`);

  for (const href of unique) {
    const segment = href.replace(/^\//, "").replace(/\/$/, "");
    assert.ok(
      fs.existsSync(path.join(process.cwd(), "app", segment, "page.tsx")),
      `the footer links to ${href}, which has no page`,
    );
  }

  // /revisit is the one destination that lives nowhere else, so losing it
  // from here would strand it.
  assert.ok(unique.includes("/revisit"), "the way back to the original site must stay in the footer");
});

test("the mobile rail still reaches everything the menus do", () => {
  const rail = flattenNavigation().map((l) => l.href);
  for (const entry of NAVIGATION) {
    const hrefs = isGroup(entry) ? entry.items.map((i) => i.href) : [entry.href];
    for (const href of hrefs) {
      assert.ok(rail.includes(href), `${href} is unreachable on a phone`);
    }
  }
});

/**
 * An article this archive wrote keeps all of its words.
 *
 * The recovered articles are cleaned on the way out: everything up to
 * and including the first H2 is dropped, because that is where the
 * captured HTML keeps its masthead and navigation. Run that cleaner
 * over an article written here and it eats the opening paragraphs and
 * the first heading. The page still builds and every other test still
 * passes; it just starts in the middle. This is the only thing that
 * would notice.
 */
test("an article the archive wrote is not cleaned like a recovered one", async () => {
  const { getRecoveredArticles } = await import("../lib/content");
  const ours = getRecoveredArticles().filter((a) => a.author && !a.originalUrl);
  for (const article of ours) {
    const source = fs.readFileSync(
      path.join(process.cwd(), "content", "articles", `${article.slug}.md`),
      "utf8",
    );
    const body = source.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
    const firstLine = body.split("\n").find((l) => l.trim().length > 0)!.trim();
    assert.ok(
      article.body.trim().startsWith(firstLine),
      `${article.slug} does not start where its file does. It begins ` +
        `"${article.body.trim().slice(0, 60)}" but the file begins ` +
        `"${firstLine.slice(0, 60)}". The recovered-article cleaner has ` +
        `most likely been let loose on it.`,
    );
    /* Length, not headings. The first version of this checked that the
       body still contained an "##", which only worked while every
       article happened to have subheadings; an article written as plain
       paragraphs then failed a test meant to catch truncation. Comparing
       what was read against what is on disk catches the amputation
       whatever the article's shape. */
    assert.equal(
      article.body.trim().length,
      body.length,
      `${article.slug} is ${body.length - article.body.trim().length} characters ` +
        `shorter than its file. Something is trimming it.`,
    );
  }
});

/**
 * The counts in the navigation blurbs are real counts.
 *
 * Four of them had drifted: the menu offered "56 models" when there
 * were 65, and "18 models" against 24. Nothing failed, because nothing
 * was checking — the numbers are prose in a config file and they go
 * stale silently every time an entry is added. The front page's own
 * counts have had a test for exactly this reason; the menu should not
 * be the honest-looking part of the site that quietly lies.
 */
test("the navigation's counts match the catalogue", async () => {
  const { NAVIGATION, isGroup } = await import("../lib/navigation");
  const { getCameraRecords, getProjectorRecords, getAddedRecords } = await import(
    "../lib/museum"
  );
  const { getLensItems } = await import("../lib/lens-items");
  const { getAccessoryItems } = await import("../lib/accessory-items");
  const { getEphemeraItems } = await import("../lib/ephemera-items");

  const actual: Record<string, number> = {
    "/cameras": getCameraRecords().length,
    "/projectors": getProjectorRecords().length,
    "/lenses": getLensItems().length + getAddedRecords("lenses").length,
    "/accessories": getAccessoryItems().length + getAddedRecords("accessories").length,
    "/ephemera": getEphemeraItems().length,
  };

  const leaves = NAVIGATION.flatMap((entry) => (isGroup(entry) ? [...entry.items] : [entry]));
  for (const leaf of leaves) {
    const expected = actual[leaf.href];
    if (expected === undefined || !leaf.blurb) continue;
    const claimed = Number(/^(\d[\d,]*)/.exec(leaf.blurb)?.[1]?.replace(/,/g, ""));
    if (Number.isNaN(claimed)) continue;
    assert.equal(
      claimed,
      expected,
      `the menu says "${leaf.blurb}" for ${leaf.href}, but there are ${expected}`,
    );
  }
});
