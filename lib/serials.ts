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

/**
 * A model that published its own serial table on its archived page, reduced to
 * what the lookup needs to identify and link to it.
 */
export interface SerialModel {
  slug: string;
  name: string;
  format?: string;
  href: string;
  rows: SerialRow[];
}

export interface ModelMatch {
  model: SerialModel;
  row: SerialRow;
}

/**
 * Identify which documented models a serial actually belongs to.
 *
 * The master table dates a serial, but each camera and projector page also
 * published its own range table — so a serial can be attributed to specific
 * models rather than a bare year. Paillard numbered several series
 * independently, so more than one model legitimately matches; all are returned,
 * ordered by year.
 */
export function lookupModels(serial: number, models: SerialModel[]): ModelMatch[] {
  if (!Number.isFinite(serial) || serial <= 0) return [];
  const matches: ModelMatch[] = [];
  for (const model of models) {
    for (const row of model.rows) {
      if (row.from === null || row.to === null) continue;
      if (serial >= row.from && serial <= row.to) {
        matches.push({ model, row });
        break; // one attribution per model is enough
      }
    }
  }
  return matches.sort((a, b) => a.row.yearFrom - b.row.yearFrom || a.model.name.localeCompare(b.model.name));
}

export function formatSerialInput(value: string): number {
  return Number(value.replace(/[^\d]/g, ""));
}
