/**
 * Chooses which recovered photograph represents each model in an index list.
 *
 * The index pages show a thumbnail beside every name so a visitor holding a
 * camera can tell an H-16 REX-4 from a REX-5 by looking instead of opening
 * pages until one matches. That only works if the thumbnail is a picture of
 * the thing.
 *
 * Taking the page's first image does not give that. The REX-2's first image
 * is a period photograph of someone filming with one — a fine picture, and
 * useless at 64px — while its second is a clean studio shot on white. Some
 * pages lead with a specification plate or a diagram of the controls, which
 * are the same for half the range.
 *
 * So each candidate is scored on what it actually is:
 *
 *   - its filename (a plate, a control diagram or a shared generic is
 *     demoted; one that starts with the model's own slug is promoted),
 *   - whether it was shot on white, which is what separates a catalogue
 *     photograph from a snapshot, measured from the real pixels,
 *   - and its size, as a tie-break.
 *
 * Pixels are measured in headless Chromium because this environment has no
 * working image library in Node, and guessing from file size would be
 * guessing. The result is written to data/thumbnails.json and committed, so
 * the site build stays a pure read and nobody needs a browser to build it.
 *
 * Re-run after recovering new imagery:  npx tsx scripts/pick-thumbnails.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { getCameraRecords, getProjectorRecords } from "../lib/museum";
import { getRecoveredSection } from "../lib/recovered";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "data", "thumbnails.json");

/** Never a portrait of one model: spec plates, control diagrams, shared art. */
const GENERIC = /plate|control|chart|diagram|schematic|htype|logo|banner|_t\./i;

interface Candidate {
  src: string;
  score: number;
  why: string;
}

/*
 * Playwright is not a dependency of this project — it is provided by the
 * environment, outside node_modules, so it is required at run time and typed
 * here rather than imported. Only the handful of calls below are used.
 */
interface Browser {
  newPage(): Promise<{
    evaluate<T>(fn: (arg: string) => Promise<T> | T, arg: string): Promise<T>;
  }>;
  close(): Promise<void>;
}

async function measure(sources: string[]) {
  const require_ = createRequire("/opt/node-tools/");
  const { chromium } = require_("playwright") as { chromium: { launch(): Promise<Browser> } };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = new Map<string, { w: number; h: number; white: boolean }>();

  for (const src of sources) {
    const file = path.join(PUBLIC, src.replace(/^\//, ""));
    if (!fs.existsSync(file)) continue;
    const ext = /\.gif$/i.test(file) ? "gif" : /\.png$/i.test(file) ? "png" : "jpeg";
    const data = `data:image/${ext};base64,${fs.readFileSync(file).toString("base64")}`;
    const measured = await page.evaluate(async (url) => {
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
      } catch {
        return null;
      }
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      if (!c.width || !c.height) return null;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const w = c.width;
      const h = c.height;
      // Four corners and the top edge midpoint: a studio shot is paper there.
      const pts: Array<[number, number]> = [
        [1, 1],
        [w - 2, 1],
        [1, h - 2],
        [w - 2, h - 2],
        [Math.floor(w / 2), 1],
      ];
      const darkest = Math.min(
        ...pts.map(([x, y]) => {
          const d = ctx.getImageData(x, y, 1, 1).data;
          return Math.min(d[0]!, d[1]!, d[2]!);
        }),
      );
      return { w, h, white: darkest > 215 };
    }, data);
    if (measured) out.set(src, measured);
  }

  await browser.close();
  return out;
}

function score(
  src: string,
  index: number,
  slug: string,
  m: { w: number; h: number; white: boolean } | undefined,
): Candidate {
  const file = src.split("/").pop() ?? src;
  const reasons: string[] = [];
  let s = 0;

  if (GENERIC.test(file)) {
    s -= 100;
    reasons.push("generic");
  }
  if (file.toLowerCase().startsWith(slug.toLowerCase())) {
    s += 30;
    reasons.push("own slug");
  }
  if (m?.white) {
    s += 40;
    reasons.push("shot on white");
  }
  if (m) {
    // Bigger is better, gently — a 480px plate should not beat a 200px
    // product shot on its size alone.
    s += Math.min(20, Math.round((m.w * m.h) / 4000));
  } else {
    s -= 200;
    reasons.push("missing");
  }
  // Earlier on the page breaks ties: that was the author's own ordering.
  s -= index * 0.5;

  return { src, score: s, why: reasons.join(", ") || "plain" };
}

async function main() {
  const groups: Array<{ section: string; items: Array<{ slug: string; images: { src: string }[] }> }> = [
    { section: "cameras", items: getCameraRecords() },
    { section: "projectors", items: getProjectorRecords() },
    { section: "lenses", items: getRecoveredSection("lenses") },
    { section: "accessories", items: getRecoveredSection("accessories") },
  ];

  const all = [...new Set(groups.flatMap((g) => g.items.flatMap((i) => i.images.map((im) => im.src))))];
  process.stdout.write(`measuring ${all.length} images…\n`);
  const measured = await measure(all);

  const picks: Record<string, string> = {};
  let changed = 0;
  for (const { section, items } of groups) {
    for (const item of items) {
      if (item.images.length === 0) continue;
      const ranked = item.images
        .map((img, i) => score(img.src, i, item.slug, measured.get(img.src)))
        .sort((a, b) => b.score - a.score);
      const best = ranked[0]!;
      picks[`${section}/${item.slug}`] = best.src;
      if (best.src !== item.images[0]!.src) {
        changed += 1;
        process.stdout.write(
          `  ${section}/${item.slug}: ${item.images[0]!.src.split("/").pop()} → ${best.src
            .split("/")
            .pop()}  (${best.why})\n`,
        );
      }
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(picks, null, 2)}\n`);
  process.stdout.write(
    `\n${Object.keys(picks).length} thumbnails chosen, ${changed} different from the page's first image\n→ ${path.relative(ROOT, OUT)}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
