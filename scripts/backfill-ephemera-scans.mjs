/**
 * Fetch the ephemera scans that were never recovered.
 *
 * The ephemera section has 171 pages and 95 of them show no picture.
 * They are not broken pages and nothing was lost in processing: the
 * archive holds the thumbnail for each one, `40ad007_t.jpg`, and not
 * the full-size scan, `40ad007.jpg`. 139 thumbnails, 81 full-size
 * images. The original pages all link to a full-size scan; that half
 * of the harvest simply never happened.
 *
 * This fetches the missing ones from the Wayback Machine.
 *
 * IT WILL NOT RUN IN THE CLOUD SESSION. web.archive.org answers
 * "Blocked by egress policy" there — not a Wayback refusal and not
 * this environment's allowlist, whose network is unrestricted, but the
 * platform's own egress rules. Run it anywhere with ordinary internet
 * access:
 *
 *     node scripts/backfill-ephemera-scans.mjs            # fetch
 *     node scripts/backfill-ephemera-scans.mjs --dry-run  # just look
 *
 * What it writes lands in archive/wayback/images/ephemera/, which is
 * the committed canonical copy, and `npm run build` stages it into
 * public/images. Commit the new files and the pages illustrate
 * themselves — lib/recovered.ts already reads the `<img>` tags, it has
 * simply been pointing at files that were not there.
 *
 * The `id_` suffix on the replay URL matters: without it the Wayback
 * Machine returns its own viewer page wrapped around the image rather
 * than the original bytes. That is the same requirement the forum
 * harvest ran into, recorded in research/sources.md.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..");
const DIR = path.join(REPO, "archive", "wayback", "images", "ephemera");

const SITE = "bolexcollector.com/images/ephemera";
const CDX = "https://web.archive.org/cdx/search/cdx";

const DRY = process.argv.includes("--dry-run");
const PAUSE = 1200;
const TIMEOUT = 90_000;

/** Image bytes, not an HTML error page dressed as one. */
const MAGIC = [
  [0xff, 0xd8, 0xff], // jpeg
  [0x89, 0x50, 0x4e, 0x47], // png
  [0x47, 0x49, 0x46, 0x38], // gif
];

function looksLikeImage(buffer) {
  return MAGIC.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function getText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "User-Agent": "bolexcollector-archive/1.0 (preservation)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

/** The timestamps Wayback holds for one file, newest first. */
async function captures(file) {
  const url =
    `${CDX}?url=${encodeURIComponent(`${SITE}/${file}`)}` +
    `&output=json&filter=statuscode:200&collapse=digest&limit=8`;
  const body = await getText(url);
  if (!body.trim()) return [];
  const rows = JSON.parse(body);
  const [header, ...data] = rows;
  const at = header.indexOf("timestamp");
  return data.map((row) => row[at]).reverse();
}

async function fetchCapture(stamp, file) {
  /* `id_` asks for the original bytes rather than the viewer page. */
  const url = `https://web.archive.org/web/${stamp}id_/http://www.${SITE}/${file}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "User-Agent": "bolexcollector-archive/1.0 (preservation)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1024) throw new Error(`only ${buffer.length} bytes`);
  if (!looksLikeImage(buffer)) throw new Error("not an image");
  return buffer;
}

function missing() {
  const files = new Set(fs.readdirSync(DIR));
  const wanted = [];
  for (const file of files) {
    if (!file.includes("_t.")) continue;
    const full = file.replace("_t.", ".");
    if (!files.has(full)) wanted.push(full);
  }
  return wanted.sort();
}

const wanted = missing();
console.log(`${wanted.length} full-size scans missing from ${path.relative(REPO, DIR)}`);
if (DRY) {
  for (const file of wanted) console.log("  " + file);
  process.exit(0);
}

let got = 0;
const failed = [];

for (const [i, file] of wanted.entries()) {
  const label = `[${i + 1}/${wanted.length}] ${file}`;
  try {
    const stamps = await captures(file);
    if (stamps.length === 0) {
      console.log(`${label} — no capture`);
      failed.push([file, "never archived"]);
      await sleep(PAUSE);
      continue;
    }

    let saved = false;
    /* Several captures, because the newest is sometimes a 404 page
       that was itself archived with a 200. */
    for (const stamp of stamps.slice(0, 3)) {
      try {
        const bytes = await fetchCapture(stamp, file);
        fs.writeFileSync(path.join(DIR, file), bytes);
        console.log(`${label} — ${(bytes.length / 1024).toFixed(0)} KB (${stamp})`);
        got++;
        saved = true;
        break;
      } catch (error) {
        if (stamp === stamps[Math.min(2, stamps.length - 1)]) throw error;
      }
      await sleep(PAUSE);
    }
    if (!saved) failed.push([file, "no usable capture"]);
  } catch (error) {
    console.log(`${label} — ${error.message}`);
    failed.push([file, error.message]);
  }
  await sleep(PAUSE);
}

console.log(`\nRecovered ${got} of ${wanted.length}.`);
if (failed.length) {
  console.log(`${failed.length} could not be fetched:`);
  for (const [file, why] of failed) console.log(`  ${file} — ${why}`);
  console.log(
    "\nA scan the Wayback Machine never captured is genuinely gone unless\n" +
      "someone has the original. Those belong in research/roadmap.md, not\n" +
      "in a silently empty page.",
  );
}
