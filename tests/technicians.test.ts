import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import { TECHNICIANS, TECHNICIAN_REGIONS, techniciansByRegion } from "../lib/technicians";

/*
 * This is the one list on the site that can cost somebody money. Someone
 * reads an entry, packs a camera and posts it. So the tests here are about
 * the claims each entry makes rather than about rendering: every entry has to
 * say what it rests on, and nothing may be presented as checked when it was
 * not.
 */
test("every entry states its evidence", () => {
  for (const t of TECHNICIANS) {
    assert.ok(["site", "listed"].includes(t.evidence.kind), `${t.name}: unknown evidence kind`);
    assert.ok(t.evidence.note.trim().length > 20, `${t.name}: the evidence note says too little`);
    assert.ok(t.work.trim().length > 0, `${t.name}: needs a description of the work`);
    assert.ok(TECHNICIAN_REGIONS.includes(t.region), `${t.name}: ${t.region} is not a region`);
  }
});

test("an entry read from a site has that site on it", () => {
  for (const t of TECHNICIANS) {
    if (t.evidence.kind === "site") {
      assert.ok(t.url, `${t.name} claims its own site was read but carries no URL`);
      assert.match(t.url!, /^https:\/\//, `${t.name}: ${t.url} should be https`);
    }
  }
});

test("an unconfirmed entry does not look confirmed", () => {
  for (const t of TECHNICIANS) {
    if (t.evidence.kind === "listed") {
      assert.match(
        t.evidence.note,
        /not confirmed|unconfirmed|rather than confirmed/i,
        `${t.name}: an unverified entry must say so in its note`,
      );
    }
  }
});

test("no entry is listed twice and every one is grouped", () => {
  const names = TECHNICIANS.map((t) => t.name);
  assert.equal(new Set(names).size, names.length, `duplicate entry: ${names.join(", ")}`);

  const grouped = techniciansByRegion().flatMap((g) => g.people);
  assert.equal(grouped.length, TECHNICIANS.length, "an entry fell out of its region group");
  for (const group of techniciansByRegion()) {
    assert.ok(group.people.length > 0, `${group.region} is an empty heading`);
  }
});

test("the built page keeps the warning above the list", { skip: !fs.existsSync("out/technicians.html") }, () => {
  const html = fs.readFileSync("out/technicians.html", "utf8");

  const warning = html.indexOf("Check before you ship");
  assert.ok(warning > 0, "the page must carry the caveat");

  const first = html.indexOf(TECHNICIANS[0]!.name);
  assert.ok(first > warning, "the caveat must come before the first entry, not after the list");

  // Every entry reaches the page — a silently dropped one is a missing option.
  for (const t of TECHNICIANS) {
    assert.ok(html.includes(t.name), `${t.name} is not in the built page`);
  }

  // An outbound link that leaks the visitor's referrer or hands over the tab
  // is the kind of detail that only shows up in the build.
  assert.match(html, /rel="noreferrer nofollow"/);
});
