import fs from "node:fs";

/**
 * Reads an archived page as the text it actually is.
 *
 * Every reader of the archive used to decode it as Latin-1. The archive is
 * not Latin-1: 322 of its 378 pages declare UTF-8, and 375 of 378 decode
 * cleanly as UTF-8. Reading those bytes as Latin-1 turned the UTF-8 for "ö"
 * into "Ã¶", so the site displayed "MÃ¶ise Paillard" and "PathÃ© FrÃ¨res" —
 * damage this project introduced while claiming to preserve the text
 * unaltered. The bytes on disk were always correct.
 *
 * The declared charset is not trusted, because 56 pages declare iso-8859-1
 * and are plain ASCII or UTF-8 regardless. What is trusted is whether the
 * bytes form valid UTF-8: a Latin-1 document with accented characters almost
 * never does, because UTF-8's continuation-byte structure is unforgiving.
 * So UTF-8 is tried strictly, and Latin-1 is the fallback for the three
 * forum captures that genuinely are not UTF-8.
 */
export function readArchiveHtml(file: string): string {
  const bytes = fs.readFileSync(file);
  try {
    // `fatal` is the whole point: without it, invalid bytes are silently
    // replaced with U+FFFD and we could never tell the two encodings apart.
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return bytes.toString("latin1");
  }
}
