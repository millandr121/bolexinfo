/**
 * Stage 2 — Download.
 *
 * Downloads the best-preserved capture of every discovered URL, preferring
 * the Wayback Machine (original bytes via the `id_` flag) and falling back
 * to Common Crawl's public WARC files when Wayback is unreachable — some
 * sandboxed egress policies allow one host but not the other. Preserves
 * earlier distinct revisions of HTML pages (Wayback only — Common Crawl
 * exposes a single recent capture), recursively follows internal links found
 * in downloaded pages to catch URLs the CDX index missed, and routes
 * images/PDFs/downloads to their preservation directories. Every stored byte
 * is recorded in archive/meta/manifest.json.
 *
 * Idempotent: already-stored assets (matched by digest) are skipped, so an
 * interrupted run resumes where it left off.
 *
 * Run: npm run pipeline:download
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { closestCommonCrawlCapture, fetchCommonCrawlAsset, type CommonCrawlCapture } from "./lib/commoncrawl";
import { paths, WAYBACK } from "./lib/config";
import { analyzePage } from "./lib/html";
import { PolicyDeniedError, politeFetch } from "./lib/net";
import { loadManifest, readJson, saveManifest, writeAsset, writeJson, writeRevision } from "./lib/store";
import type { DiscoveredUrl } from "./discover";

const MAX_REVISIONS_PER_PAGE = 5;

async function fetchFromWayback(timestamp: string, original: string): Promise<Buffer | null> {
  const res = await politeFetch(WAYBACK.snapshot(timestamp, original, true));
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

interface FetchedAsset {
  body: Buffer;
  mimetype: string;
  timestamp: string;
  originalUrl: string;
  source: "wayback" | "common-crawl";
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
  // Once a Wayback fetch fails at the network level (not just a 404), every
  // further attempt is almost certainly a doomed multi-retry timeout too —
  // so stop trying Wayback for the rest of the run and go straight to the
  // Common Crawl fallback instead of paying that cost 82 times over.
  let waybackReachable = true;

  for (const [urlPath, entry] of queue) {
    if (crawled.has(urlPath)) continue;
    crawled.add(urlPath);

    const best = entry.captures[0];
    const referenceTimestamp = best?.timestamp ?? entry.commonCrawl?.timestamp;
    const existing = manifest.assets[urlPath];
    if (existing && referenceTimestamp && existing.timestamp === referenceTimestamp) continue;

    let asset: FetchedAsset | null = null;

    if (best && waybackReachable) {
      try {
        const body = await fetchFromWayback(best.timestamp, best.original);
        if (body) {
          asset = { body, mimetype: best.mimetype, timestamp: best.timestamp, originalUrl: best.original, source: "wayback" };
        }
      } catch (err) {
        waybackReachable = false;
        const reason = err instanceof PolicyDeniedError ? err.message : err instanceof Error ? err.message : String(err);
        console.error(`✗ Wayback unreachable (${reason}); switching to Common Crawl for the rest of this run.`);
      }
    }

    if (!asset) {
      // Look up Common Crawl on the fly only for URLs discover.ts never
      // checked (i.e. found only by this run's recursive crawl) — entries
      // discover.ts already searched and came up empty for are marked
      // commonCrawlChecked, so re-querying them here would just repeat a
      // known miss 70+ times over.
      const ccCapture: CommonCrawlCapture | null =
        entry.commonCrawl ??
        (entry.commonCrawlChecked ? null : await closestCommonCrawlCapture(urlPath).catch(() => null));
      if (ccCapture) {
        const ccAsset = await fetchCommonCrawlAsset(ccCapture).catch(() => null);
        if (ccAsset) {
          asset = {
            body: ccAsset.body,
            mimetype: ccAsset.mimetype,
            timestamp: ccCapture.timestamp,
            originalUrl: ccCapture.original,
            source: "common-crawl",
          };
        }
      }
    }

    if (!asset) {
      failures.push({
        urlPath,
        reason: best ? `capture-${best.timestamp}-unavailable` : "no-capture-known",
      });
      continue;
    }

    writeAsset(urlPath, asset.body);
    stored++;

    const isHtml = asset.mimetype.includes("html");
    const revisionsKept: string[] = [];
    if (isHtml) {
      if (asset.source === "wayback" && best) {
        // Preserve earlier distinct revisions so no content edit is ever lost.
        // Common Crawl exposes only a single recent capture, so this only
        // applies when Wayback served the primary asset.
        for (const rev of entry.captures.slice(1, 1 + MAX_REVISIONS_PER_PAGE)) {
          const revBody = await fetchFromWayback(rev.timestamp, rev.original).catch(() => null);
          if (revBody) {
            writeRevision(urlPath, rev.timestamp, revBody);
            revisionsKept.push(rev.timestamp);
          }
        }
      }
      // Recursive crawl: any internal link or asset the discovery pass
      // missed joins the queue with this page's capture as a timestamp hint.
      const analysis = analyzePage(asset.body.toString("latin1"), urlPath);
      for (const linked of [...analysis.internalLinks, ...analysis.images.map((i) => i.src), ...analysis.downloads]) {
        if (!queue.has(linked) && !crawled.has(linked)) {
          queue.set(linked, {
            urlPath: linked,
            sources: [`crawled-from:${urlPath}`],
            captures: best ? [{ ...best, original: `http://bolexcollector.com${linked}` }] : [],
          });
        }
      }
    }

    manifest.assets[urlPath] = {
      urlPath,
      originalUrl: asset.originalUrl,
      mimetype: asset.mimetype,
      bytes: asset.body.byteLength,
      sha1: crypto.createHash("sha1").update(asset.body).digest("hex"),
      timestamp: asset.timestamp,
      revisions: revisionsKept,
      storedAt: new Date().toISOString(),
      source: asset.source,
    };
    // Save after every asset, not just every 25: this run's total is small
    // enough that the I/O cost is negligible, and losing an interrupted
    // run's progress (e.g. a bounded-time sandbox killing the process) would
    // cost far more than the extra writes.
    saveManifest(manifest);
    if (stored % 5 === 0) {
      console.log(`…${stored} assets stored (queue: ${queue.size - crawled.size} remaining)`);
    }
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
