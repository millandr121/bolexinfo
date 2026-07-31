/**
 * Regenerates data/serials/ranges.json from the recovered serial-number
 * article's tables — the flagship serial-lookup dataset.
 *
 * The original site's serial ranges live in the archived page
 * /articles/07_05_11.html ("Paillard-Bolex Serial Numbers"), extracted by the
 * pipeline to data/tables/articles/07-05-11.json. This step parses those
 * tables into structured, lookup-able ranges. Serial data is derived only from
 * the recovered original — never entered from memory.
 *
 * Run standalone: npm run build:serials  (also runs in prebuild)
 */
import fs from "node:fs";
import path from "node:path";
import { parseSerialRows } from "../lib/museum";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCE = path.join(ROOT, "data", "tables", "articles", "07-05-11.json");
const OUT = path.join(ROOT, "data", "serials", "ranges.json");

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Serial source table not found: ${SOURCE} — run the pipeline first.`);
    process.exitCode = 1;
    return;
  }
  const doc = JSON.parse(fs.readFileSync(SOURCE, "utf8")) as { source?: string; capturedAt?: string; tables: string[][][] };
  const ranges = parseSerialRows(doc.tables);

  const out = {
    $schema: "../schemas/serial-ranges.schema.json",
    source:
      'Extracted from the recovered page /articles/07_05_11.html ("Paillard-Bolex Serial Numbers", May 11 2007), which the original site credits to the Bolex International S.A. bulletin "Serial Numbers and Date of Manufacture" (September 1, 1977) and original Paillard service and repair manuals.',
    status: "extracted" as const,
    note:
      "Ranges parsed from the archived serial tables. Independent model series (e.g. the P/K/S1 cameras numbered from 1963) reused number blocks, so a serial may match more than one year — every candidate is shown.",
    // capturedAt (the Wayback capture time) is the meaningful provenance and is
    // stable; deliberately no build timestamp here, so rebuilding the file
    // produces identical bytes and never churns git.
    capturedAt: doc.capturedAt,
    ranges,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${ranges.length} serial ranges to data/serials/ranges.json`);
}

main();
