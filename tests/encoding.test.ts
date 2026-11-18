import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { readArchiveHtml } from "../lib/archive-text";

/*
 * Guards against double-encoded text coming back.
 *
 * The recovery pipeline once read UTF-8 bytes as Latin-1, which turned
 * "Pathé Frères" into "PathÃ© FrÃ¨res" and "Neuchâtel" into "NeuchÃ¢tel" in
 * 22 places. Mojibake is not part of the record — the original site published
 * the accents, and the damage was introduced in transcription — so it was
 * repaired. This fails if an extraction run reintroduces it.
 */
const DOUBLE_ENCODED = /(?:Ã[\u0080-¿]|â€[\u0080-¿]|Â[ -¿])/;

function walk(dir: string, match = /\.(json|md)$/): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, match));
    else if (match.test(entry.name)) out.push(p);
  }
  return out;
}

/*
 * The source files being clean is not enough, and this test exists because
 * it wasn't.
 *
 * The first version of this file checked content/ and data/ only. It passed
 * while the site was still rendering "MÃ¶ise Paillard", because the timeline
 * is parsed live out of archive/wayback/ at build time and that reader was
 * decoding UTF-8 as Latin-1. The damage never touched a source file. So the
 * check that matters is on the pages as built.
 */
test("no built page shows double-encoded text", { skip: !fs.existsSync("out/index.html") }, () => {
  const damaged: string[] = [];
  for (const file of walk(path.join(process.cwd(), "out"), /\.html$/)) {
    // The preserved copies of the original site are served verbatim and are
    // not ours to judge; this is about pages this project renders.
    if (file.includes(`${path.sep}original${path.sep}`)) continue;
    const text = fs.readFileSync(file, "utf8");
    const hit = DOUBLE_ENCODED.exec(text);
    if (!hit) continue;
    const at = Math.max(0, hit.index - 30);
    damaged.push(`${path.relative(process.cwd(), file)}: …${text.slice(at, hit.index + 25)}…`);
  }
  assert.deepEqual(damaged.slice(0, 10), [], `double-encoded text in the built site:\n${damaged.join("\n")}`);
});

test("the archive itself is read as the UTF-8 it is", () => {
  // The bytes were always right; only our reading of them was wrong.
  const file = path.join(process.cwd(), "archive", "wayback", "timeline.html");
  if (!fs.existsSync(file)) return;
  const text = readArchiveHtml(file);
  assert.ok(text.includes("Möise Paillard"), "the archived timeline should decode to real accents");
  assert.ok(!text.includes("MÃ¶ise"), "reading the archive must not produce mojibake");
});

test("no recovered text is double-encoded", () => {
  const roots = ["content", "data"].map((d) => path.join(process.cwd(), d)).filter((d) => fs.existsSync(d));
  const damaged: string[] = [];

  for (const root of roots) {
    for (const file of walk(root)) {
      const text = fs.readFileSync(file, "utf8");
      const hit = DOUBLE_ENCODED.exec(text);
      if (!hit) continue;
      const at = Math.max(0, hit.index - 30);
      damaged.push(`${path.relative(process.cwd(), file)}: …${text.slice(at, hit.index + 25)}…`);
    }
  }

  assert.deepEqual(damaged, [], `double-encoded text found:\n${damaged.join("\n")}`);
});
