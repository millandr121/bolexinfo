import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { THEME_INIT_SCRIPT, chooseTheme } from "../lib/theme-preference";

test("a stored choice is honoured", () => {
  assert.equal(chooseTheme("light"), "light");
  assert.equal(chooseTheme("dark"), "dark");
});

/*
 * With nothing stored the answer must be null, not a guess. Returning
 * "light" here would override the device preference of every first-time
 * visitor whose machine asks for a dark page.
 */
test("no stored choice defers to the device", () => {
  assert.equal(chooseTheme(null), null);
  assert.equal(chooseTheme(undefined), null);
  assert.equal(chooseTheme(""), null);
  assert.equal(chooseTheme("DARK"), null, "the comparison is exact");
  assert.equal(chooseTheme("sepia"), null, "an unknown value is not a theme");
});

/*
 * The same trap as the view script: a source string that reads correctly can
 * still be mangled into broken JavaScript by the build, so this reads the
 * built page rather than the module.
 */
test("the built homepage carries the theme script intact", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  assert.ok(
    html.includes(THEME_INIT_SCRIPT),
    "the inline theme-init script must appear in the built page byte for byte",
  );
  assert.doesNotThrow(
    () => new Function(THEME_INIT_SCRIPT),
    "the emitted script must be valid JavaScript",
  );
});

/*
 * The attribute has to beat the media query, or someone on a device set to
 * dark could never keep a light page. Specificity decides it: `:root` plus an
 * attribute (0,2,0) outranks the bare `:root` inside the media block (0,1,0),
 * whatever the source order. If these rules are ever lost the toggle silently
 * stops working in one direction only, which is easy to miss by hand.
 */
test("the stylesheet lets an explicit choice override the device", { skip: !fs.existsSync("app/globals.css") }, () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  for (const selector of ['[data-theme="dark"]', '[data-theme="light"]']) {
    const block = new RegExp(`:root\\${selector}\\s*\\{([^}]*)\\}`).exec(css);
    assert.ok(block, `globals.css should define :root${selector}`);
    const body = block[1] ?? "";
    assert.match(body, /--bg:/, `:root${selector} must set the page background`);
    assert.match(body, /--fg:/, `:root${selector} must set the text colour`);
    assert.match(body, /color-scheme:/, `:root${selector} must set color-scheme`);
  }
});
