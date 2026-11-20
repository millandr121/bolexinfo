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
 *     node scripts/backfill-ephemera-scans.mjs             # fetch
 *     node scripts/backfill-ephemera-scans.mjs --dry-run   # just look
 *     node scripts/backfill-ephemera-scans.mjs --delay=10  # slower still
 *
 * It is safe to stop and re-run. Files are written as they arrive and
 * the list of what is missing is recomputed from the directory each
 * time, so a second run asks only for what is still absent. If Wayback
 * starts refusing requests it waits, then gives up cleanly and says so
 * rather than failing its way down the rest of the list.
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

/*
 * Wayback rate-limits, and the first version of this ignored that
 * completely: 1.2 seconds between requests, two requests per file, and
 * no handling for 429. It got through part of the list, was blocked,
 * and then failed every remaining request while still reporting each
 * one as an individual error. Nothing was saved.
 *
 * Two things fix it. The index is now read once for the whole
 * directory instead of once per file, which halves the requests
 * outright, and a 429 is now something to wait out rather than run
 * into repeatedly.
 */
const delayArg = /^--delay=(\d+)$/.exec(process.argv.find((a) => a.startsWith("--delay=")) ?? "");
const PAUSE = delayArg ? Number(delayArg[1]) * 1000 : 5000;
const TIMEOUT = 90_000;

/** Give up after this many blocks in a row rather than hammer a closed door. */
const MAX_CONSECUTIVE_BLOCKS = 3;

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

class Blocked extends Error {}

/**
 * One request, waiting out a rate limit rather than walking into it.
 *
 * 429 and 503 mean "later", not "no". Wayback sometimes says how much
 * later in Retry-After; where it does not, this backs off 30s, 60s,
 * then 120s. A request still refused after that raises Blocked, and
 * the caller stops the run instead of failing its way down the rest of
 * the list.
 */
async function request(url, { binary = false } = {}) {
  const waits = [30_000, 60_000, 120_000];
  for (let attempt = 0; ; attempt++) {
    let response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { "User-Agent": "bolexcollector-archive/1.0 (preservation)" },
      });
    } catch (error) {
      if (attempt < waits.length) {
        console.log(`    network error, waiting ${waits[attempt] / 1000}s`);
        await sleep(waits[attempt]);
        continue;
      }
      throw new Blocked(String(error.message || error));
    }

    if (response.status === 429 || response.status === 503) {
      if (attempt >= waits.length) throw new Blocked(`HTTP ${response.status}`);
      const header = Number(response.headers.get("retry-after"));
      const wait = Number.isFinite(header) && header > 0 ? header * 1000 : waits[attempt];
      console.log(`    rate limited, waiting ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return binary ? Buffer.from(await response.arrayBuffer()) : response.text();
  }
}

/**
 * Every capture of every file in the directory, in one query.
 *
 * The first version asked the index once per file: 95 lookups before a
 * single image was downloaded, which is most of what got it blocked.
 * A wildcard query returns the lot, and the result is a map from
 * filename to its timestamps, newest first.
 */
async function captureIndex() {
  const url =
    `${CDX}?url=${encodeURIComponent(`${SITE}/*`)}` +
    `&output=json&filter=statuscode:200&collapse=digest&limit=20000`;
  const body = await request(url);
  if (!body.trim()) return new Map();

  const rows = JSON.parse(body);
  const [header, ...data] = rows;
  const atUrl = header.indexOf("original");
  const atStamp = header.indexOf("timestamp");

  const index = new Map();
  for (const row of data) {
    const name = String(row[atUrl]).split("/").pop()?.split("?")[0];
    if (!name) continue;
    if (!index.has(name)) index.set(name, []);
    index.get(name).push(row[atStamp]);
  }
  /* Newest first: a later capture is more likely to be the real image
     than an early one taken before the page was finished. */
  for (const stamps of index.values()) stamps.reverse();
  return index;
}

async function fetchCapture(stamp, file) {
  /* `id_` asks for the original bytes rather than the viewer page. */
  const url = `https://web.archive.org/web/${stamp}id_/http://www.${SITE}/${file}`;
  const buffer = await request(url, { binary: true });
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
let blocks = 0;
const failed = [];
let stoppedEarly = null;

console.log("Reading the Wayback index for the whole directory (one request)…");
let index;
try {
  index = await captureIndex();
} catch (error) {
  console.error(`Could not read the index: ${error.message}`);
  console.error(
    "If that is a rate limit, the block usually clears within the hour.\n" +
      "Nothing was written, so re-running later starts cleanly.",
  );
  process.exit(1);
}
console.log(`  ${index.size} filenames in the index\n`);

for (const [i, file] of wanted.entries()) {
  const label = `[${i + 1}/${wanted.length}] ${file}`;
  const stamps = index.get(file) ?? [];

  if (stamps.length === 0) {
    console.log(`${label} — never archived`);
    failed.push([file, "never archived"]);
    continue;
  }

  let saved = false;
  let lastError = "no usable capture";
  /* Several captures, because the newest is sometimes a 404 page that
     was itself archived with a 200. */
  for (const stamp of stamps.slice(0, 3)) {
    try {
      const bytes = await fetchCapture(stamp, file);
      fs.writeFileSync(path.join(DIR, file), bytes);
      console.log(`${label} — ${(bytes.length / 1024).toFixed(0)} KB (${stamp})`);
      got++;
      saved = true;
      blocks = 0;
      break;
    } catch (error) {
      lastError = error.message;
      if (error instanceof Blocked) {
        blocks++;
        break;
      }
      await sleep(PAUSE);
    }
  }

  if (!saved) {
    if (blocks >= MAX_CONSECUTIVE_BLOCKS) {
      stoppedEarly = `blocked after ${i} of ${wanted.length} files`;
      break;
    }
    if (blocks === 0) console.log(`${label} — ${lastError}`);
    failed.push([file, lastError]);
  }
  await sleep(PAUSE);
}

console.log(`\nRecovered ${got} of ${wanted.length}.`);

if (stoppedEarly) {
  console.log(
    `\nStopped early: ${stoppedEarly}.\n` +
      "Wayback is refusing requests, which usually clears within the hour.\n" +
      `Whatever was fetched is already on disk — commit it, then run this\n` +
      "again later and it will pick up only what is still missing.",
  );
} else if (failed.length) {
  console.log(`${failed.length} could not be fetched:`);
  for (const [file, why] of failed) console.log(`  ${file} — ${why}`);
  console.log(
    "\nA scan the Wayback Machine never captured is genuinely gone unless\n" +
      "someone has the original. Those belong in research/roadmap.md, not\n" +
      "in a silently empty page.",
  );
}

if (got > 0) {
  console.log(
    `\n${got} new files in ${path.relative(REPO, DIR)}. To publish them:\n` +
      "  git add archive/wayback/images/ephemera\n" +
      '  git commit -m "Recover missing full-size ephemera scans"\n' +
      "  git push",
  );
}
