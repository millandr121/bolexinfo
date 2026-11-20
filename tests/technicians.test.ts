import assert from "node:assert/strict";
import { test } from "node:test";
import { TECHNICIANS } from "../lib/technicians";

/*
 * The repair list is the page most likely to cost someone real money
 * if it is wrong: a reader ships a camera across a continent on the
 * strength of it. These check the things that would do that damage
 * quietly.
 */

test("every entry carries its evidence", () => {
  assert.ok(TECHNICIANS.length > 0);
  for (const t of TECHNICIANS) {
    assert.ok(t.name.trim(), "a technician needs a name");
    assert.ok(t.location.trim(), `${t.name} needs a location`);
    assert.ok(t.work.trim().length > 20, `${t.name} needs a real description of the work`);
    assert.ok(t.evidence?.note?.trim(), `${t.name} needs an evidence note`);
    assert.ok(
      ["site", "listed"].includes(t.evidence.kind),
      `${t.name} has an unknown evidence kind`,
    );
  }
});

test("a way to reach them", () => {
  for (const t of TECHNICIANS) {
    assert.ok(
      t.url || t.email || t.phone,
      `${t.name} has no website, email or phone — a listing nobody can act on`,
    );
    if (t.url) assert.match(t.url, /^https?:\/\//, `${t.name} has a malformed URL`);
    if (t.email) assert.match(t.email, /^[^@\s]+@[^@\s]+\.\w+$/, `${t.name} has a malformed email`);
  }
});

test("no two entries are the same business", () => {
  const names = TECHNICIANS.map((t) => t.name.toLowerCase());
  assert.equal(new Set(names).size, names.length, "a technician is listed twice");
});

/*
 * Coordinates locate a town, never a business's own address — a repair
 * shop is often someone's home workshop, and a map pin on a house is
 * not something this project is going to publish.
 */
test("coordinates are plausible and say what they locate", () => {
  for (const t of TECHNICIANS) {
    if (!t.place) continue;
    const { lat, lon, precision, from } = t.place;
    assert.ok(Number.isFinite(lat) && lat >= -90 && lat <= 90, `${t.name} has a bad latitude`);
    assert.ok(Number.isFinite(lon) && lon >= -180 && lon <= 180, `${t.name} has a bad longitude`);
    assert.ok(["town", "city"].includes(precision), `${t.name} has an odd precision`);
    assert.ok(from.trim(), `${t.name}'s coordinates need a source`);
    assert.ok(lat !== 0 || lon !== 0, `${t.name} is at null island`);
  }
});

/*
 * A vague location must not acquire coordinates. "Canada" and "United
 * Kingdom" cannot be placed, and inventing a point for them would put
 * a business in a town it is not in — worse on a map than an absence,
 * because a dot looks like knowledge.
 */
test("a location too vague to place carries no coordinates", () => {
  const tooVague = /^(canada|united kingdom|usa|united states|england|wales|scotland)$/i;
  for (const t of TECHNICIANS) {
    const last = t.location.split(",").pop()?.trim() ?? "";
    const isCountryOnly = tooVague.test(t.location.trim());
    const isRegionOnly = t.location.trim().split(",").length === 2 && /^(south|north|east|west)\s/i.test(t.location.trim());
    if (isCountryOnly || isRegionOnly) {
      assert.equal(
        t.place,
        undefined,
        `${t.name} is located only as "${t.location}" and must not be given a point`,
      );
    }
    assert.ok(last, `${t.name} has a malformed location`);
  }
});
