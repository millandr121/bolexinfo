/**
 * Stage 2 — Download.
 *
 * Downloads the best-preserved capture of every discovered URL (original
 * bytes via the Wayback `id_` flag), preserves earlier distinct revisions of
 * HTML pages, recursively follows internal links found in downloaded pages
 * to catch URLs the CDX index missed, and routes images/PDFs/downloads to
 * their preservation directories. Every stored byte is recorded in
 * archive/meta/manifest.json.
 *
 * Idempotent: already-stored assets (matched by digest) are skipped, so an
 * interrupted run resumes where it left off.
 *
 * Run: npm run pipeline:download
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { paths, WAYBACK } from "./lib/config";
import { analyzePage } from "./lib/html";
import { PolicyDeniedError, politeFetch } from "./lib/net";
import { loadManifest, readJson, saveManifest, writeAsset, writeJson, writeRevision } from "./lib/store";
import type { DiscoveredUrl } from "./discover";

const MAX_REVISIONS_PER_PAGE = 5;

async function fetchCapture(timestamp: string, original: string): Promise<Buffer | null> {
  const res = await politeFetch(WAYBACK.snapshot(timestamp, original, true));
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const discovered = readJson<{ urls: DiscoveredUrl[] }>(
    path.join(paths.recovery, "discovered.json"),
    { urls: [] },
  );
  if (discovered.urls.length === 0) {
    console.error("No discovery record found — run `npm run pipeline:discover` first.");
    process.exitCode = 1;
    return;
  }

  const manifest = loadManifest();
  const queue = new Map(discovered.urls.map((u) => [u.urlPath, u]));
  const crawled = new Set<string>();
  const failures: Array<{ urlPath: string; reason: string }> = [];
  let stored = 0;

  try {
    for (const [urlPath, entry] of queue) {
      if (crawled.has(urlPath)) continue;
      crawled.add(urlPath);

      const best = entry.captures[0];
      if (!best) {
        failures.push({ urlPath, reason: "no-capture-known" });
        continue;
      }
      const existing = manifest.assets[urlPath];
      if (existing && existing.timestamp === best.timestamp) continue;

      const body = await fetchCapture(best.timestamp, best.original);
      if (!body) {
        failures.push({ urlPath, reason: `capture-${best.timestamp}-unavailable` });
        continue;
      }
      writeAsset(urlPath, body);
      stored++;

      const isHtml = best.mimetype.includes("html");
      const revisionsKept: string[] = [];
      if (isHtml) {
        // Preserve earlier distinct revisions so no content edit is ever lost.
        for (const rev of entry.captures.slice(1, 1 + MAX_REVISIONS_PER_PAGE)) {
          const revBody = await fetchCapture(rev.timestamp, rev.original);
          if (revBody) {
            writeRevision(urlPath, rev.timestamp, revBody);
            revisionsKept.push(rev.timestamp);
          }
        }
        // Recursive crawl: any internal link or asset the CDX pass missed
        // joins the queue with the parent page's best timestamp as a hint.
        const analysis = analyzePage(body.toString("latin1"), urlPath);
        for (const linked of [...analysis.internalLinks, ...analysis.images.map((i) => i.src), ...analysis.downloads]) {
          if (!queue.has(linked) && !crawled.has(linked)) {
            queue.set(linked, {
              urlPath: linked,
              sources: [`crawled-from:${urlPath}`],
              captures: [{ ...best, original: `http://bolexcollector.com${linked}` }],
            });
          }
        }
      }

      manifest.assets[urlPath] = {
        urlPath,
        originalUrl: best.original,
        mimetype: best.mimetype,
        bytes: body.byteLength,
        sha1: crypto.createHash("sha1").update(body).digest("hex"),
        timestamp: best.timestamp,
        revisions: revisionsKept,
        storedAt: new Date().toISOString(),
      };
      if (stored % 25 === 0) {
        saveManifest(manifest);
        console.log(`…${stored} assets stored (queue: ${queue.size - crawled.size} remaining)`);
      }
    }
  } catch (err) {
    saveManifest(manifest);
    if (err instanceof PolicyDeniedError) {
      console.error(`\n✗ ${err.message}`);
      process.exitCode = 2;
      return;
    }
    throw err;
  }

  saveManifest(manifest);
  writeJson(path.join(paths.recovery, "download-failures.json"), {
    generated: new Date().toISOString(),
    failures,
  });
  fs.mkdirSync(paths.archiveWayback, { recursive: true });
  console.log(`Stored ${stored} assets (${Object.keys(manifest.assets).length} total in manifest).`);
  console.log(`${failures.length} failures recorded in data/recovery/download-failures.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
