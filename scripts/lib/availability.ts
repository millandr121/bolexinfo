import { WAYBACK } from "./config";
import { fetchJson } from "./net";

interface AvailabilityResponse {
  url: string;
  archived_snapshots: {
    closest?: {
      status: string;
      available: boolean;
      url: string;
      timestamp: string;
    };
  };
}

export interface ClosestCapture {
  timestamp: string;
  original: string;
  snapshotUrl: string;
}

/**
 * Query the Wayback availability API (hosted on archive.org, not
 * web.archive.org) for the closest capture of a URL. Returns null when the
 * Wayback Machine holds no successful capture. Unlike the CDX API this
 * yields a single capture with no MIME type, digest or length — callers must
 * treat those fields as unknown rather than guessing.
 */
export async function closestCapture(originalUrl: string): Promise<ClosestCapture | null> {
  const params = new URLSearchParams({ url: originalUrl });
  const res = await fetchJson<AvailabilityResponse>(`${WAYBACK.availability}?${params}`);
  const closest = res.archived_snapshots.closest;
  if (!closest?.available || closest.status !== "200") return null;
  return {
    timestamp: closest.timestamp,
    original: originalUrl,
    snapshotUrl: closest.url,
  };
}
