/**
 * Stage 1 — Discovery.
 *
 * Enumerates every URL the Wayback Machine ever captured for
 * bolexcollector.com (all hostname variants, all years, all MIME types),
 * merges the search-index seed inventory, expands documented candidate URL
 * patterns, and writes the consolidated discovery record to
 * data/recovery/discovered.json.
 *
 * Run: npm run pipeline:discover
 */
import path from "node:path";
import { closestCapture } from "./lib/availability";
import { enumerateCaptures, groupAndRank, type CdxRecord } from "./lib/cdx";
import { closestCommonCrawlCapture, type CommonCrawlCapture } from "./lib/commoncrawl";
import { paths } from "./lib/config";
import { PolicyDeniedError } from "./lib/net";
import { readJson, writeJson } from "./lib/store";

interface SeedInventory {
  verifiedUrls: Array<{ path: string; title: string; section: string }>;
}

export interface DiscoveredUrl {
  urlPath: string;
  sources: string[];
  seedTitle?: string;
  captures: Array<Pick<CdxRecord, "timestamp" | "mimetype" | "digest" | "length" | "original">>;
  /**
   * Fallback content location on Common Crawl, populated when a Wayback
   * capture is known only by timestamp (no digest/length — e.g. from the
   * availability API) or is missing entirely. Download prefers a
   * digest-bearing Wayback capture over this when both exist.
   */
  commonCrawl?: CommonCrawlCapture;
}

/**
 * Degraded discovery when the CDX API is unreachable: ask the availability
 * API (archive.org host) for the closest capture of every seed URL. MIME
 * type, digest and length are unavailable from this endpoint and recorded as
 * unknown — never guessed.
 */
async function availabilityFallback(discovered: Map<string, DiscoveredUrl>): Promise<void> {
  let found = 0;
  let checked = 0;
  for (const entry of discovered.values()) {
    checked++;
    if (entry.captures.length > 0) continue;
    try {
      const capture = await closestCapture(`http://bolexcollector.com${entry.urlPath}`);
      if (!capture) continue;
      if (!entry.sources.includes("wayback-availability")) entry.sources.push("wayback-availability");
      entry.captures = [
        {
          timestamp: capture.timestamp,
          original: capture.original,
          mimetype: "unknown",
          digest: "",
          length: 0,
        },
      ];
      found++;
      if (found % 10 === 0) console.log(`…${found} captures located (${checked}/${discovered.size} URLs checked)`);
    } catch (err) {
      if (err instanceof PolicyDeniedError) {
        console.error(`✗ Availability API also unreachable: ${err.message}`);
        return;
      }
      console.error(`  availability lookup failed for ${entry.urlPath}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`Availability fallback: closest captures confirmed for ${found} of ${discovered.size} URLs`);
}

/**
 * Common Crawl enrichment: for any URL still lacking a digest-bearing,
 * independently-fetchable capture — whether Wayback discovery failed
 * outright or only returned a timestamp via the availability fallback —
 * look up a Common Crawl WARC location. This runs unconditionally (not just
 * when Wayback is blocked) because some sandboxed egress policies allow
 * Common Crawl's hosts while blocking web.archive.org, making it a genuine
 * independent source rather than a last resort.
 */
async function commonCrawlFallback(discovered: Map<string, DiscoveredUrl>): Promise<void> {
  let found = 0;
  let checked = 0;
  const needsLookup = [...discovered.values()].filter(
    (e) => !e.captures[0] || !e.captures[0].digest,
  );
  if (needsLookup.length === 0) return;
  console.log(`Checking Common Crawl for ${needsLookup.length} URLs without a verified Wayback capture…`);
  for (const entry of needsLookup) {
    checked++;
    try {
      const capture = await closestCommonCrawlCapture(entry.urlPath);
      if (!capture) continue;
      if (!entry.sources.includes("common-crawl")) entry.sources.push("common-crawl");
      entry.commonCrawl = capture;
      found++;
      if (found % 10 === 0) console.log(`…${found} Common Crawl captures located (${checked}/${needsLookup.length} checked)`);
    } catch (err) {
      console.error(`  Common Crawl lookup failed for ${entry.urlPath}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`Common Crawl fallback: content located for ${found} of ${needsLookup.length} URLs`);
}

async function main() {
  const seed = readJson<SeedInventory>(path.join(paths.recovery, "url-inventory.json"), {
    verifiedUrls: [],
  });
  const discovered = new Map<string, DiscoveredUrl>();

  for (const entry of seed.verifiedUrls) {
    discovered.set(entry.path, {
      urlPath: entry.path,
      sources: ["search-index-seed"],
      seedTitle: entry.title,
      captures: [],
    });
  }

  console.log(`Seed inventory: ${discovered.size} URLs`);
  console.log("Enumerating Wayback Machine captures (CDX API)…");

  try {
    const records = await enumerateCaptures();
    const ranked = groupAndRank(records);
    console.log(`CDX returned ${records.length} captures across ${ranked.size} distinct URLs`);

    for (const captures of ranked.values()) {
      const best = captures[0];
      if (!best) continue;
      const urlPath = new URL(best.original).pathname + (new URL(best.original).search || "");
      const existing = discovered.get(urlPath);
      const entry: DiscoveredUrl = existing ?? { urlPath, sources: [], captures: [] };
      if (!entry.sources.includes("wayback-cdx")) entry.sources.push("wayback-cdx");
      entry.captures = captures.map(({ timestamp, mimetype, digest, length, original }) => ({
        timestamp,
        mimetype,
        digest,
        length,
        original,
      }));
      discovered.set(urlPath, entry);
    }
  } catch (err) {
    // Treat any failure to reach the CDX API as "host unreachable" and fall
    // back — not just an explicit PolicyDeniedError. A policy denial on a
    // CONNECT-based HTTPS proxy often surfaces to the client as a bare
    // connection reset rather than a readable 403 body, so pattern-matching
    // every possible manifestation would be brittle; any failure here means
    // the same thing for our purposes: move on to the next source.
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ Wayback CDX API unreachable: ${reason}`);
    console.error(
      "Falling back to the availability API on archive.org — it yields only " +
        "the closest capture per seed URL (no full enumeration, no MIME/digest " +
        "metadata). Re-run from an environment with access to web.archive.org " +
        "for complete enumeration.",
    );
    await availabilityFallback(discovered);
  }

  await commonCrawlFallback(discovered);

  const output = {
    generated: new Date().toISOString(),
    totalUrls: discovered.size,
    urls: [...discovered.values()].sort((a, b) => a.urlPath.localeCompare(b.urlPath)),
  };
  writeJson(path.join(paths.recovery, "discovered.json"), output);
  console.log(`Wrote ${output.totalUrls} URLs to data/recovery/discovered.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
