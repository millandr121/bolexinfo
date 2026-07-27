import type { SerialRow } from "./museum";

export interface SerialMatch extends SerialRow {
  /** 0–1 position of the serial within this year-range's span. */
  position: number;
}

export interface SerialLookupResult {
  matches: SerialMatch[];
  nearest?: { row: SerialRow; distance: number };
}

/**
 * Serial → year lookup against recovered range tables.
 *
 * Pure and dependency-free so it runs identically on the server, in the
 * client bundle, and in tests. Rows with unknown ("???") bounds are skipped
 * for matching but preserved elsewhere for display. A serial can legitimately
 * match more than one row when independent model series reused number blocks,
 * so every match is returned.
 */
export function lookupSerial(serial: number, rows: SerialRow[]): SerialLookupResult {
  if (!Number.isFinite(serial) || serial <= 0 || rows.length === 0) return { matches: [] };
  const usable = rows.filter((r): r is SerialRow & { from: number; to: number } => r.from !== null && r.to !== null);

  const matches: SerialMatch[] = usable
    .filter((r) => serial >= r.from && serial <= r.to)
    .map((r) => ({ ...r, position: r.to === r.from ? 0 : (serial - r.from) / (r.to - r.from) }));

  if (matches.length > 0) {
    return { matches: matches.sort((a, b) => a.yearFrom - b.yearFrom) };
  }

  let nearest: SerialLookupResult["nearest"];
  for (const r of usable) {
    const distance = serial < r.from ? r.from - serial : serial - r.to;
    if (!nearest || distance < nearest.distance) nearest = { row: r, distance };
  }
  return { matches: [], nearest };
}

/** Human label for a row's year span: "1938" or "1938–1940". */
export function formatYearSpan(row: Pick<SerialRow, "yearFrom" | "yearTo">): string {
  return row.yearFrom === row.yearTo ? String(row.yearFrom) : `${row.yearFrom}–${row.yearTo}`;
}

export function formatSerialInput(value: string): number {
  return Number(value.replace(/[^\d]/g, ""));
}
