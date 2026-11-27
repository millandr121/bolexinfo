/**
 * Builds the answers index: public/answers-index.json.
 *
 * The archive holds two harvested corpora — 1,929 posts from
 * cinematography.com's Bolex forum and 9,544 from Reddit — and until
 * now they sat in research/corpus as a pair of jsonl files nobody
 * could read. This turns them into something a reader can search.
 *
 * ## What it is allowed to publish
 *
 * Other people wrote this. Short attributed quotations with a link
 * home are citation; republishing whole post archives is not, and the
 * difference is the whole basis on which any of it may be shown. So
 * the index is built to make the wrong thing impossible rather than
 * merely discouraged:
 *
 *  - Each post is cut to QUOTE characters, at a sentence end where
 *    there is one. Nothing longer than that is ever shipped, so no
 *    page can reproduce a whole post even by accident.
 *  - Every record carries its author, its date and the URL of the
 *    thread it came from, and a result that cannot name its author is
 *    dropped rather than shown anonymously.
 *
 * ## What it leaves out
 *
 * Most of a forum is not worth searching. Posts shorter than MIN_CHARS
 * are "thanks, that worked" and answer nothing. Deleted and removed
 * bodies are placeholders. Quoted blocks are somebody else's words
 * repeated, and indexing them makes the same sentence match five
 * times over.
 *
 * Run standalone: npm run answers:index
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CORPUS = path.join(ROOT, "research", "corpus");
const OUT = path.join(ROOT, "public", "answers-index.json");

/** The most of anybody's post that is ever shipped. */
const QUOTE = 480;
/** Shorter than this answers nothing. */
const MIN_CHARS = 90;

interface Raw {
  source: string;
  thread_id: string;
  thread: string;
  url: string;
  n: number;
  author: string;
  date: string;
  text: string;
}

/**
 * The shipped record, with short keys because there are thousands of
 * them and the field names would otherwise be most of the file.
 *
 *  t  the quoted text          a  author
 *  d  date (YYYY-MM-DD)        h  thread index, into `threads`
 */
interface Doc {
  t: string;
  a: string;
  d: string;
  h: number;
}

const DELETED = /^\s*\[(deleted|removed)]\s*$/i;
/* The harvester leaves this where a forum quote block was. 485 posts
   carry one and 464 of those open with it, so it is not a stray: a
   passage that begins by repeating somebody else is not that
   person's answer and is dropped rather than quoted under their
   name. Where it appears later it is cut out with the sentence. */
const QUOTE_MARK = /\[quoting an earlier post]/gi;
/* A line beginning with "> " is Reddit's quote; the forum's own quote
   blocks arrive as "Name said:" or "On <date>, Name said:". */
const QUOTED_LINE = /^\s*>/;
const SAID = /^\s*(On .{0,40}?,\s*)?.{0,60}?\s+said:\s*$/i;

/** The handful of entities the forum's own export leaves behind. */
const ENTITY: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#039;": "'", "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
  "&hellip;": "…", "&mdash;": "—", "&ndash;": "–", "&deg;": "°",
};

export function unescapeEntities(text: string): string {
  return text
    .replace(/&[a-z]+;|&#\d+;/gi, (e) => ENTITY[e.toLowerCase()] ?? ENTITY[e] ?? e)
    /* A lone replacement character is a scrape that lost an
       apostrophe or an accent; a space reads better than a lozenge. */
    .replace(/\uFFFD/g, "");
}

function clean(text: string): string {
  const kept: string[] = [];
  for (const line of text.split("\n")) {
    if (QUOTED_LINE.test(line) || SAID.test(line)) continue;
    kept.push(line);
  }
  return unescapeEntities(kept.join(" "))
    .replace(QUOTE_MARK, " ")
    .replace(/\[([^\]]+)]\((https?:[^)]+)\)/g, "$1") // markdown links to their words
    .replace(/\s+/g, " ")
    .trim();
}

/** Cut to a sentence end inside the limit, or a word boundary. */
function quote(text: string): string {
  if (text.length <= QUOTE) return text;
  const window = text.slice(0, QUOTE + 1);
  const stop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "));
  if (stop > QUOTE * 0.55) return window.slice(0, stop + 1);
  const space = window.lastIndexOf(" ");
  return `${window.slice(0, space > 0 ? space : QUOTE).trimEnd()}…`;
}

const threads: Array<{ title: string; url: string; source: string }> = [];
const threadIndex = new Map<string, number>();
const docs: Doc[] = [];

let read = 0;
let dropped = 0;
/*
 * The same words, by the same person, twice.
 *
 * Reddit cross-posts put one announcement in r/bolex and r/16mm, and
 * the harvester's title and selftext sweeps both caught some posts,
 * so the corpus holds each of those twice. Two identical quotations
 * in a list of results reads as a bug whatever the reason for it, so
 * the first one wins and the rest are dropped.
 */
const seen = new Set<string>();

for (const file of ["bolex-forum-corpus.jsonl", "bolex-reddit-corpus.jsonl"]) {
  const full = path.join(CORPUS, file);
  if (!fs.existsSync(full)) {
    console.log(`  no ${file}; skipped`);
    continue;
  }
  for (const line of fs.readFileSync(full, "utf8").split("\n")) {
    if (!line.trim()) continue;
    read++;
    const raw = JSON.parse(line) as Raw;

    const author = (raw.author ?? "").trim();
    const url = (raw.url ?? "").trim();
    if (!author || !url || DELETED.test(raw.text ?? "")) {
      dropped++;
      continue;
    }

    /* Opening with somebody else's words means the post is a reply to
       a quote, and what the index would show under this author's name
       is the person they were answering. */
    if (QUOTE_MARK.test((raw.text ?? "").trimStart().slice(0, 30))) {
      QUOTE_MARK.lastIndex = 0;
      dropped++;
      continue;
    }
    QUOTE_MARK.lastIndex = 0;

    const text = clean(raw.text ?? "");
    if (text.length < MIN_CHARS) {
      dropped++;
      continue;
    }

    const key = `${raw.source}:${raw.thread_id}`;
    let h = threadIndex.get(key);
    if (h === undefined) {
      h = threads.length;
      threadIndex.set(key, h);
      threads.push({
        title: unescapeEntities(raw.thread ?? "").replace(/\s+/g, " ").trim(),
        url,
        source: raw.source,
      });
    }

    /* The first 120 characters, not the whole passage: the same post
       cross-posted picks up a different trailing sentence often
       enough that a longer fingerprint lets the pair through. */
    const fingerprint = `${author.toLowerCase()}|${text.slice(0, 120).toLowerCase()}`;
    if (seen.has(fingerprint)) {
      dropped++;
      continue;
    }
    seen.add(fingerprint);

    docs.push({ t: quote(text), a: author, d: (raw.date ?? "").slice(0, 10), h });
  }
}

fs.writeFileSync(OUT, JSON.stringify({ threads, docs }));
const bytes = fs.statSync(OUT).size;
console.log(
  `  ${docs.length} passages from ${threads.length} threads → public/answers-index.json ` +
    `(${(bytes / 1024 / 1024).toFixed(2)} MB; ${read} read, ${dropped} dropped)`,
);
