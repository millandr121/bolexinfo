/**
 * Which archived scans can be blended into the page, and which cannot.
 *
 * The timeline lays photographs straight onto the paper with no frame
 * around them, using `mix-blend-mode: multiply` so a scan's white
 * background becomes the page. That is only true of scans whose
 * background actually is white. A handful in this archive are not —
 * one is a camera photographed against near-black, a few are magazine
 * pages or scans with a grey cast — and multiply turns those into a
 * hard rectangle sitting on the page, which is exactly the "box frame"
 * the composition exists to avoid.
 *
 * It cannot be decided in CSS, and guessing per file would rot the
 * moment a scan is replaced. So it is measured: this samples a ring of
 * border pixels on every equipment scan, takes the median luminance,
 * and writes the ones that will not blend to
 * data/unblendable-plates.json for lib/timeline-media.ts to skip.
 *
 * Run it after adding or replacing equipment imagery:
 *
 *   node scripts/audit-plate-grounds.mjs
 *
 * It reads the files in public/images rather than the pictures the
 * built timeline happens to reference. That distinction matters: an
 * earlier version measured the rendered page, so marking a scan
 * unblendable pulled a replacement into the page that had never been
 * measured, and the next run produced a different answer. A property
 * of a file has to be measured from the file.
 */
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire("/opt/node-tools/");
const { chromium } = require("playwright");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..");
const ROOT = path.join(REPO, "public");
const OUT = path.join(REPO, "data", "unblendable-plates.json");
/** The scans the timeline draws on: equipment, not ephemera or articles. */
const LOOK_IN = ["images/cameras", "images/projectors"];

/**
 * Below this median border luminance a scan has a visible ground of its
 * own. 235 of 255 sits above every clean white scan in the archive
 * (which measure 242 and up) and below every problem one (206 and
 * down), with a wide gap either side — not a knob to be tuned.
 */
const WHITE_ENOUGH = 235;

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const files = LOOK_IN.flatMap((dir) => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .map((name) => `/${dir}/${name}`);
}).sort();

if (files.length === 0) {
  console.error(`No images found under ${LOOK_IN.map((d) => `public/${d}`).join(", ")}.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent((req.url ?? "/").split("?")[0]));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file += ".html";
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  res.end(fs.readFileSync(file));
});
await new Promise((done) => server.listen(8411, done));

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:8411/", { waitUntil: "domcontentloaded" }).catch(() => {});

const measured = await page.evaluate(async ({ threshold, sources }) => {
  const results = [];
  for (const src of sources) {
    const image = new Image();
    image.src = src;
    await image.decode().catch(() => {});
    if (!image.naturalWidth) {
      results.push({ src, median: 0, unreadable: true });
      continue;
    }
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    /* A ring of border samples, not four corners: a scan can be clean in
       the corners and carry a grey wash down one side. */
    const lums = [];
    for (let k = 0; k < 40; k++) {
      const fx = Math.floor((k / 39) * (w - 1));
      const fy = Math.floor((k / 39) * (h - 1));
      for (const [px, py] of [
        [fx, 1],
        [fx, h - 2],
        [1, fy],
        [w - 2, fy],
      ]) {
        const d = ctx.getImageData(px, py, 1, 1).data;
        lums.push(0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]);
      }
    }
    lums.sort((a, b) => a - b);
    results.push({
      src,
      median: Math.round(lums[Math.floor(lums.length / 2)]),
      blendable: lums[Math.floor(lums.length / 2)] >= threshold,
    });
  }
  return results;
}, { threshold: WHITE_ENOUGH, sources: files });

await browser.close();
server.close();

const unblendable = measured
  .filter((m) => m.unreadable || !m.blendable)
  .map((m) => m.src)
  .sort();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      note: "Generated by scripts/audit-plate-grounds.mjs — do not edit by hand.",
      threshold: WHITE_ENOUGH,
      sources: unblendable,
    },
    null,
    2,
  )}\n`,
);

console.log(`measured ${measured.length} · blendable ${measured.length - unblendable.length} · skipped ${unblendable.length}`);
for (const m of measured.filter((m) => !m.blendable || m.unreadable)) {
  console.log(`   ${m.src}  median ${m.median}${m.unreadable ? " (unreadable)" : ""}`);
}
