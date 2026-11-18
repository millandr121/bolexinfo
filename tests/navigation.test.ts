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
    assert.ok(fs.existsSync(page), `${leaf.href} has no page at app/${segment}/page.tsx`);
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
