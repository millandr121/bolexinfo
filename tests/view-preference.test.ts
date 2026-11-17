import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import {
  chooseView,
  DESKTOP_MIN_WIDTH,
  VIEW_INIT_SCRIPT,
  VIEW_STORAGE_KEY,
} from "../lib/view-preference";

test("a first-time visitor is sorted by screen width", () => {
  assert.equal(chooseView(null, 1440), "original");
  assert.equal(chooseView(null, DESKTOP_MIN_WIDTH), "original");
  assert.equal(chooseView(null, DESKTOP_MIN_WIDTH - 1), "modern");
  assert.equal(chooseView(null, 390), "modern");
});

test("a stored choice wins on any screen", () => {
  // The whole point of remembering: someone who switched on their phone is
  // not sorted back by width next time, and nor is someone on a desktop who
  // chose the modern edition.
  assert.equal(chooseView("original", 390), "original");
  assert.equal(chooseView("modern", 1920), "modern");
});

test("a damaged or unknown stored value falls back to the width rule", () => {
  for (const stored of ["", "classic", "true", "null", undefined]) {
    assert.equal(chooseView(stored, 1440), "original", `stored=${String(stored)}`);
    assert.equal(chooseView(stored, 390), "modern", `stored=${String(stored)}`);
  }
});

/*
 * The inline script is a hand-written copy of `chooseView` that runs before
 * paint, so the two can drift. These pin the values they share and then run
 * the script itself against a stub document to prove it still agrees.
 */
test("the inline script carries the same key and breakpoint", () => {
  assert.ok(VIEW_INIT_SCRIPT.includes(`"${VIEW_STORAGE_KEY}"`));
  assert.ok(VIEW_INIT_SCRIPT.includes(`>=${DESKTOP_MIN_WIDTH}`));
});

test("the inline script reaches the same decision as chooseView", () => {
  const run = (stored: string | null, width: number, throwOnStorage = false) => {
    let applied: string | undefined;
    const sandbox = {
      localStorage: {
        getItem(key: string) {
          if (throwOnStorage) throw new Error("storage blocked");
          return key === VIEW_STORAGE_KEY ? stored : null;
        },
      },
      window: { innerWidth: width },
      document: {
        documentElement: {
          setAttribute(name: string, value: string) {
            if (name === "data-view") applied = value;
          },
        },
      },
    };
    new Function("localStorage", "window", "document", VIEW_INIT_SCRIPT)(
      sandbox.localStorage,
      sandbox.window,
      sandbox.document,
    );
    return applied;
  };

  for (const [stored, width] of [
    [null, 1440],
    [null, 390],
    ["original", 390],
    ["modern", 1920],
    ["nonsense", 1440],
  ] as const) {
    assert.equal(run(stored, width), chooseView(stored, width), `${stored} @ ${width}`);
  }

  // Blocked storage must not throw and must still sort by width.
  assert.equal(run(null, 1440, true), "original");
  assert.equal(run(null, 390, true), "modern");
});

/*
 * The source string being right is not enough: the first version of this
 * shipped as valid-looking HTML containing broken JavaScript, because the
 * build mangled the inline script after every source-level check had passed.
 * So this one reads the built page.
 */
test("the built homepage carries the init script intact", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  const match = /<script>\((?:function)\(\)\{[\s\S]*?<\/script>/.exec(html);
  assert.ok(match, "the inline view-init script should be in the built page");

  const emitted = match[0].replace(/^<script>/, "").replace(/<\/script>$/, "");
  assert.equal(emitted, VIEW_INIT_SCRIPT, "the built script must match the source byte for byte");

  // And it must actually parse — the broken version did not.
  assert.doesNotThrow(() => new Function(emitted), "the emitted script must be valid JavaScript");
});

test("the built homepage serves both editions", { skip: !fs.existsSync("out/index.html") }, () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  assert.match(html, /class="original-edition"/, "the preserved edition should be served");
  assert.match(html, /class="modern-edition"/, "the modern edition should be served");
  // Hidden for most visitors, so it must not be fetched by them.
  assert.match(html, /<iframe[^>]+loading="lazy"/, "the framed original should be lazily loaded");
});

/*
 * The header toggle collapses to its icon below `sm` with `hidden sm:inline`,
 * which is `display: none` — the label leaves the accessibility tree, not just
 * the screen. Without an explicit name the control is announced as nothing on
 * exactly the devices that get it by default.
 */
test("the header toggle keeps an accessible name when its label is hidden", { skip: !fs.existsSync("out/cameras/h16.html") }, () => {
  const html = fs.readFileSync("out/cameras/h16.html", "utf8");
  const button = /<button[^>]*aria-label="[^"]+"[^>]*>(?:(?!<\/button>)[\s\S])*?hidden sm:inline/.exec(html);
  assert.ok(button, "the icon-only toggle must carry an aria-label");
});
