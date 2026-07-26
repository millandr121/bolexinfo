import { HOSTS, WAYBACK } from "./config";
import { fetchText } from "./net";

export interface CdxRecord {
  urlkey: string;
  timestamp: string;
  original: string;
  mimetype: string;
  statuscode: string;
  digest: string;
  length: number;
}

/**
 * Enumerate every capture the Wayback Machine holds for the site, across all
 * hostname variants, with resumption-key pagination. Returns *all* captures
 * (not collapsed) so snapshot comparison can pick the best-preserved version
 * of each URL and merge across revisions.
 */
export async function enumerateCaptures(): Promise<CdxRecord[]> {
  const records: CdxRecord[] = [];
  for (const host of HOSTS) {
    let resumeKey: string | undefined;
    do {
      const params = new URLSearchParams({
        url: `${host}*`,
        output: "text",
        fl: "urlkey,timestamp,original,mimetype,statuscode,digest,length",
        showResumeKey: "true",
        limit: "5000",
      });
      if (resumeKey) params.set("resumeKey", resumeKey);
      const { status, text } = await fetchText(`${WAYBACK.cdx}?${params}`);
      if (status !== 200) throw new Error(`CDX API returned HTTP ${status}: ${text.slice(0, 200)}`);
      const lines = text.trimEnd().split("\n").filter(Boolean);
      // A resume key, when present, follows a blank line at the end of the body.
      resumeKey = undefined;
      for (const line of lines) {
        const parts = line.trim().split(" ");
        if (parts.length === 1 && parts[0]) {
          resumeKey = parts[0];
          continue;
        }
        if (parts.length < 7) continue;
        const [urlkey, timestamp, original, mimetype, statuscode, digest, length] = parts;
        records.push({
          urlkey: urlkey!,
          timestamp: timestamp!,
          original: original!,
          mimetype: mimetype!,
          statuscode: statuscode!,
          digest: digest!,
          length: Number(length) || 0,
        });
      }
    } while (resumeKey);
  }
  return records;
}

/**
 * Group captures by canonical URL (urlkey collapses www/non-www and query
 * ordering) and rank candidate snapshots for download.
 *
 * Ranking heuristic, in order:
 *  1. HTTP 200 captures only.
 *  2. Larger capture length first — truncated or partially archived pages
 *     are almost always shorter than complete ones.
 *  3. Later timestamp as tiebreak — the site grew over time, and the final
 *     revision of a page is normally its most complete.
 *
 * All distinct digests are kept (newest first) so the extractor can merge
 * content that only exists in earlier revisions.
 */
export function groupAndRank(records: CdxRecord[]): Map<string, CdxRecord[]> {
  const byUrl = new Map<string, CdxRecord[]>();
  for (const rec of records) {
    if (rec.statuscode !== "200") continue;
    const list = byUrl.get(rec.urlkey) ?? [];
    list.push(rec);
    byUrl.set(rec.urlkey, list);
  }
  for (const [key, list] of byUrl) {
    list.sort((a, b) => b.length - a.length || b.timestamp.localeCompare(a.timestamp));
    // Deduplicate identical content: same digest means byte-identical capture.
    const seen = new Set<string>();
    byUrl.set(
      key,
      list.filter((r) => !seen.has(r.digest) && seen.add(r.digest) !== undefined),
    );
  }
  return byUrl;
}
