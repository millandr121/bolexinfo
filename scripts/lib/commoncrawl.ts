import zlib from "node:zlib";
import { COMMON_CRAWL, HOSTS } from "./config";
import { politeFetch } from "./net";

interface CcIndexRecord {
  urlkey: string;
  timestamp: string;
  url: string;
  mime?: string;
  status?: string;
  digest?: string;
  length?: string;
  offset?: string;
  filename?: string;
}

interface CcCollection {
  id: string;
  cdxApi: string;
}

export interface CommonCrawlCapture {
  timestamp: string;
  original: string;
  collection: string;
  filename: string;
  offset: number;
  length: number;
  digest: string;
}

export interface CommonCrawlAsset {
  body: Buffer;
  mimetype: string;
}

let collectionsCache: CcCollection[] | null = null;

/**
 * Common Crawl's monthly crawl collections, newest first. Cached for the
 * process lifetime — the collection list rarely changes mid-run.
 */
async function getCollections(): Promise<CcCollection[]> {
  if (collectionsCache) return collectionsCache;
  const res = await politeFetch(COMMON_CRAWL.collinfo);
  if (!res.ok) throw new Error(`Common Crawl collinfo returned HTTP ${res.status}`);
  const raw = (await res.json()) as Array<{ id: string; "cdx-api": string }>;
  collectionsCache = raw.map((c) => ({ id: c.id, cdxApi: c["cdx-api"] }));
  return collectionsCache;
}

async function queryCollection(cdxApi: string, url: string): Promise<CcIndexRecord[]> {
  const params = new URLSearchParams({ url, output: "json" });
  const res = await politeFetch(`${cdxApi}?${params}`);
  if (res.status === 404) return []; // no captures of this URL in this collection
  if (!res.ok) throw new Error(`Common Crawl index ${cdxApi} returned HTTP ${res.status}`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CcIndexRecord);
}

/**
 * Find the most recent Common Crawl capture of a site-relative URL path that
 * carries real payload bytes (not a `warc/revisit` stub, which points at
 * previously-seen content without an independently fetchable offset).
 * Checks the newest `maxCollections` collections, across all known hostname
 * variants, and returns on the first hit — deeper history is available by
 * raising `maxCollections` but costs one request per collection per host.
 */
export async function closestCommonCrawlCapture(
  urlPath: string,
  maxCollections = COMMON_CRAWL.maxCollectionsChecked,
): Promise<CommonCrawlCapture | null> {
  const collections = (await getCollections()).slice(0, maxCollections);
  for (const host of HOSTS) {
    const url = `http://${host}${urlPath}`;
    for (const col of collections) {
      const records = await queryCollection(col.cdxApi, url);
      const usable = records.find(
        (r) => r.status === "200" && r.mime !== "warc/revisit" && r.filename && r.offset && r.length,
      );
      if (usable) {
        return {
          timestamp: usable.timestamp,
          original: usable.url,
          collection: col.id,
          filename: usable.filename!,
          offset: Number(usable.offset),
          length: Number(usable.length),
          digest: usable.digest ?? "",
        };
      }
    }
  }
  return null;
}

const CRLF2 = Buffer.from("\r\n\r\n");

function splitOnce(buf: Buffer, sep: Buffer): [Buffer, Buffer] | null {
  const idx = buf.indexOf(sep);
  if (idx === -1) return null;
  return [buf.subarray(0, idx), buf.subarray(idx + sep.length)];
}

/**
 * Fetch a single WARC record via HTTP range request and extract the HTTP
 * response body it contains. A WARC record is gzip-compressed and holds two
 * header blocks back to back (WARC headers, then the raw HTTP response) —
 * both are stripped to recover the original page bytes.
 */
export async function fetchCommonCrawlAsset(capture: CommonCrawlCapture): Promise<CommonCrawlAsset | null> {
  const res = await politeFetch(`${COMMON_CRAWL.dataHost}/${capture.filename}`, {
    headers: { Range: `bytes=${capture.offset}-${capture.offset + capture.length - 1}` },
  });
  if (!res.ok && res.status !== 206) return null;
  const compressed = Buffer.from(await res.arrayBuffer());
  const gunzipped = zlib.gunzipSync(compressed);

  const afterWarcHeaders = splitOnce(gunzipped, CRLF2);
  if (!afterWarcHeaders) return null;
  const afterHttpHeaders = splitOnce(afterWarcHeaders[1], CRLF2);
  if (!afterHttpHeaders) return null;
  const [httpHeaders, body] = afterHttpHeaders;

  const contentTypeMatch = /content-type:\s*([^\r\n;]+)/i.exec(httpHeaders.toString("latin1"));
  return { body, mimetype: contentTypeMatch?.[1]?.trim() ?? "application/octet-stream" };
}
