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
import { enumerateCaptures, groupAndRank, type CdxRecord } from "./lib/cdx";
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
    if (err instanceof PolicyDeniedError) {
      console.error(`\n✗ ${err.message}`);
      console.error(
        "Discovery recorded the seed inventory only. Re-run from an environment " +
          "with access to web.archive.org to complete enumeration.",
      );
    } else {
      throw err;
    }
  }

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
