import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { FEATURED_LINKS, FEATURED_INIT_SCRIPT } from "../lib/featured";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";

test("every rotating card points at a page that exists", () => {
  for (const link of FEATURED_LINKS) {
    const segment = link.href.replace(/^\//, "");
    const page = path.join(process.cwd(), "app", segment, "page.tsx");
    assert.ok(fs.existsSync(page), `${link.href} has no page at app/${segment}/page.tsx`);
    assert.ok(link.label.trim().length > 0, `${link.href} needs a label`);
    assert.ok(link.blurb.trim().length > 0, `${link.href} needs a blurb`);
  }

  const hrefs = FEATURED_LINKS.map((l) => l.href);
  assert.equal(new Set(hrefs).size, hrefs.length, `the rotation repeats itself: ${hrefs.join(", ")}`);
});

/*
 * The CSS rules are written out one index at a time, because a selector cannot
 * compare two attributes. So adding a fourth card without adding its rule
 * would make that card unreachable — it would simply never show. This catches
 * that at test time rather than in production, where the symptom is a card
 * nobody ever sees.
 */
test("the stylesheet has a rule for every card in the rotation", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
  for (let i = 0; i < FEATURED_LINKS.length; i += 1) {
    assert.ok(
      css.includes(`html[data-featured="${i}"] .featured-slot[data-slot="${i}"]`),
      `app/globals.css has no rule for card ${i} — it would never be shown`,
    );
  }
  assert.ok(
    css.includes('html:not([data-featured]) .featured-slot[data-slot="0"]'),
    "there must be a no-JavaScript fallback card",
  );
  // A rule beyond the rotation's length would reserve a slot nothing fills.
  assert.ok(
    !css.includes(`html[data-featured="${FEATURED_LINKS.length}"]`),
    "the stylesheet has a rule for a card that does not exist",
  );
});

/*
 * Same discipline as the edition switch: the script runs before paint, so it
 * is run here against a stub document rather than merely read.
 */
test("the inline script always picks a card that exists", () => {
  const run = (random: number) => {
    let applied: string | undefined;
    const document = {
      documentElement: {
        setAttribute(name: string, value: string) {
          if (name === "data-featured") applied = value;
        },
      },
    };
    new Function("document", "Math", FEATURED_INIT_SCRIPT)(document, { ...Math, random: () => random, floor: Math.floor });
    return applied;
  };

  const seen = new Set<string>();
  // Including the two values that break a naive index calculation.
  for (const r of [0, 0.0001, 0.33, 0.34, 0.5, 0.66, 0.67, 0.999999]) {
    const got = run(r);
    assert.ok(got !== undefined, `nothing was applied for random()=${r}`);
    const i = Number(got);
    assert.ok(
      Number.isInteger(i) && i >= 0 && i < FEATURED_LINKS.length,
      `random()=${r} chose card ${got}, which is outside 0–${FEATURED_LINKS.length - 1}`,
    );
    seen.add(got!);
  }
  assert.equal(seen.size, FEATURED_LINKS.length, `only ${[...seen].join(", ")} are ever reachable`);
});

test("a thrown error still leaves a card showing", () => {
  let applied: string | undefined;
  const document = {
    documentElement: {
      setAttribute(name: string, value: string) {
        if (name === "data-featured") applied = value;
      },
    },
  };
  const broken = {
    ...Math,
    random() {
      throw new Error("no randomness for you");
    },
  };
  assert.doesNotThrow(() => new Function("document", "Math", FEATURED_INIT_SCRIPT)(document, broken));
  assert.equal(applied, "0", "the catch must fall back to the first card");
});

test("the built homepage carries the rotation intact", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");

  /*
   * Read from the build, not the source. A template literal in an inline
   * script was silently mangled by the build once before — valid-looking HTML
   * holding broken JavaScript, which no source-level check caught.
   */
  assert.ok(
    html.includes(FEATURED_INIT_SCRIPT),
    "the featured-init script must appear in the built page byte for byte",
  );
  assert.doesNotThrow(() => new Function(FEATURED_INIT_SCRIPT));

  for (let i = 0; i < FEATURED_LINKS.length; i += 1) {
    assert.ok(
      html.includes(`data-slot="${i}"`),
      `card ${i} is not in the served HTML, so CSS could never reveal it`,
    );
  }
});

test("the front page leads with the lookup, not with statistics", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  assert.match(html, /Everything Bolex\s*(?:<br\/?>)?\s*ever made, in one place/);
  assert.match(html, /id="serial-input"/, "the serial lookup must be on the front page");
  assert.match(html, /id="identify"/, "the hero button needs something to jump to");
  assert.ok(
    !html.includes("Models catalogued"),
    "the statistics row was replaced by the three quick links",
  );
});

/*
 * The hero gives its counts in words, because a sentence reads better
 * there than a row of figures. Words cannot be derived from the data the
 * way a rendered count can, so this reads the words back out of the
 * built page and turns them into numbers, rather than carrying a copy of
 * the numbers here. A test holding its own copy of the answer goes stale
 * in exactly the same way the page does, which is how this one came to
 * be asserting fifty-five after the page had moved on.
 */
const NUMBER_WORDS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80,
  ninety: 90, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9,
};

/** "Fifty-six" or "eighteen" to a number. Tens and units only, which is
 *  all the catalogue will plausibly need. */
function spelled(word: string): number {
  return word
    .toLowerCase()
    .split("-")
    .reduce((total, part) => total + (NUMBER_WORDS[part] ?? Number.NaN), 0);
}

/*
 * Read from the source, not from out/.
 *
 * Every other built-page test here skips when there is no build, and CI
 * runs the tests before the build, so a guard would have meant this one
 * never ran where it matters. The sentence lives in app/page.tsx and the
 * words are what go stale, so reading the source checks the same thing
 * and checks it on every push. This test failed in CI exactly once, for
 * exactly this reason, which is how it came to be written this way.
 */
test("the hero's spelled-out counts still match the catalogue", () => {
  const html = fs.readFileSync("app/page.tsx", "utf8");
  const sentence = /([A-Za-z-]+) cameras, ([a-z-]+) projectors/.exec(html);
  assert.ok(sentence, "the hero sentence giving the counts in words has moved or changed shape");

  assert.equal(
    spelled(sentence[1]!),
    getCameraRecords().length,
    `the front page says "${sentence[1]} cameras" but there are ${getCameraRecords().length}`,
  );
  assert.equal(
    spelled(sentence[2]!),
    getProjectorRecords().length,
    `the front page says "${sentence[2]} projectors" but there are ${getProjectorRecords().length}`,
  );
});
