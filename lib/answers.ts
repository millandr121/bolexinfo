/**
 * Searching what people worked out.
 *
 * The index is a flat list of short quotations from two harvested
 * corpora — cinematography.com's Bolex forum and Reddit — and this is
 * the part that finds the right ones. It is deliberately plain
 * BM25 rather than anything cleverer: the corpus is under two million
 * words, plain ranking gets a long way on it, and when a result looks
 * wrong it is possible to sit down and work out why. An embedding
 * model would be better at paraphrase and impossible to debug from a
 * static site.
 *
 * Everything here is pure and runs the same in Node and the browser,
 * so the tests exercise the code the page actually uses.
 */

export interface AnswerIndex {
  threads: Array<{ title: string; url: string; source: string }>;
  docs: Array<{ t: string; a: string; d: string; h: number }>;
}

export interface Answer {
  /** The quotation, as the index holds it. */
  text: string;
  author: string;
  date: string;
  thread: string;
  url: string;
  source: string;
  score: number;
  /** Which query words matched, for highlighting. */
  matched: string[];
}

/**
 * Words too common in this corpus to tell anything apart.
 *
 * The ordinary English stop words, plus five that are stop words
 * *here*: every thread on a Bolex forum says bolex, camera, film,
 * 16mm and 8mm, so matching them ranks the whole corpus equally and
 * drowns the word that actually mattered. They are still searchable
 * as part of a phrase — see `phraseBonus` — just not on their own.
 */
const STOP = new Set(
  ("a an and are as at be but by for from had has have he her his i if in is it its me my of on or " +
    "our out she so that the their them then there these they this to too was we were what when " +
    "which who will with would you your am been being do does did doing just can could should " +
    "about after all also any because before could get got how into like more most no not now " +
    "one only other over said same see some than up very want way well " +
    "bolex camera cameras film films")
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean),
);

/**
 * How people actually type the model names.
 *
 * Someone with a problem types "rex 5" or "rex5" or "REX-5" and the
 * corpus has all three. Folding them to one token is the single
 * biggest thing that makes this feel like it works, and it has to
 * happen on both sides — the query and the text — or it does nothing.
 */
const FOLD: Array<[RegExp, string]> = [
  [/\bh[\s.-]?(8|9|16)\b/g, "h$1"],
  [/\brex[\s.-]?([1-5])\b/g, "rex$1"],
  [/\bm[\s.-]?([1-5])\b/g, "m$1"],
  [/\bsbm\b/g, "sbm"],
  [/\bebm\b/g, "ebm"],
  [/\bsuper[\s.-]?(8|16)\b/g, "super$1"],
  [/\bs[\s.-]?(8|16)\b/g, "super$1"],
  [/\b(\d+)\s?mm\b/g, "$1mm"],
  [/\bf[\s.\/]?(\d(?:\.\d+)?)\b/g, "f$1"],
  [/\bfps\b/g, "fps"],
  [/\bframes? per second\b/g, "fps"],
];

/** Light plural folding. Deliberately not a stemmer: a stemmer turns
 *  "spring" into "spring" and "springs" into "spring" but also
 *  "shutter" into "shutt", and the wrong roots are worse than none. */
function singular(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("hes")))
    return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokenise(input: string): string[] {
  let s = input.toLowerCase();
  for (const [re, to] of FOLD) s = s.replace(re, to);
  const out: string[] = [];
  for (const raw of s.split(/[^a-z0-9.]+/)) {
    const word = raw.replace(/^\.+|\.+$/g, "");
    if (!word || word.length < 2) continue;
    const w = singular(word);
    if (STOP.has(w) || STOP.has(word)) continue;
    out.push(w);
  }
  return out;
}

interface Prepared {
  index: AnswerIndex;
  /** token → [docId, termFrequency][] */
  postings: Map<string, Array<[number, number]>>;
  lengths: Int32Array;
  averageLength: number;
  /** Lowercased text per doc, for the phrase test and highlighting. */
  haystack: string[];
}

/**
 * Turn the shipped index into something searchable.
 *
 * Done once, in the browser, on the first search: about 7,600 short
 * passages is a fifth of a second, which is cheaper than shipping the
 * inverted index and roughly doubling the download.
 */
export function prepare(index: AnswerIndex): Prepared {
  const postings = new Map<string, Array<[number, number]>>();
  const lengths = new Int32Array(index.docs.length);
  const haystack: string[] = new Array(index.docs.length);
  let total = 0;

  for (let i = 0; i < index.docs.length; i++) {
    const doc = index.docs[i]!;
    const thread = index.threads[doc.h];
    /* The thread's own title is indexed with each of its passages: a
       question is usually in the title and the answer underneath it,
       so a post that answers "prism chipped" may never say either
       word. Counted once rather than weighted, which is enough. */
    const tokens = tokenise(`${thread?.title ?? ""} ${doc.t}`);
    lengths[i] = tokens.length;
    total += tokens.length;
    haystack[i] = `${thread?.title ?? ""} ${doc.t}`.toLowerCase();

    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [t, c] of counts) {
      let list = postings.get(t);
      if (!list) postings.set(t, (list = []));
      list.push([i, c]);
    }
  }

  return {
    index,
    postings,
    lengths,
    averageLength: index.docs.length ? total / index.docs.length : 0,
    haystack,
  };
}

const K1 = 1.2;
const B = 0.75;

/** A whole query found as a phrase is worth more than its words apart. */
function phraseBonus(haystack: string, query: string): number {
  const phrase = query.toLowerCase().trim();
  if (phrase.length < 6 || !phrase.includes(" ")) return 0;
  return haystack.includes(phrase) ? 6 : 0;
}

export interface SearchOptions {
  limit?: number;
  /** At most this many passages from any one thread, so a long
   *  argument between two people cannot fill the page. */
  perThread?: number;
}

export function search(prepared: Prepared, query: string, options: SearchOptions = {}): Answer[] {
  const { limit = 20, perThread = 2 } = options;
  const terms = [...new Set(tokenise(query))];
  if (terms.length === 0) return [];

  const N = prepared.index.docs.length;
  const scores = new Map<number, number>();
  const hits = new Map<number, string[]>();

  for (const term of terms) {
    const list = prepared.postings.get(term);
    if (!list) continue;
    /* A word in nearly every document tells us nothing; the +1 keeps
       the idf positive so a common word still breaks a tie rather
       than subtracting from the score. */
    const idf = Math.log(1 + (N - list.length + 0.5) / (list.length + 0.5));
    for (const [docId, tf] of list) {
      const norm = 1 - B + (B * prepared.lengths[docId]!) / (prepared.averageLength || 1);
      const score = (idf * (tf * (K1 + 1))) / (tf + K1 * norm);
      scores.set(docId, (scores.get(docId) ?? 0) + score);
      const seen = hits.get(docId);
      if (seen) seen.push(term);
      else hits.set(docId, [term]);
    }
  }

  if (scores.size === 0) return [];

  /*
   * Every query word present beats more of one word.
   *
   * Without this, a passage saying "spring spring spring" outranks
   * one saying "the spring motor on a REX-5", which is the opposite
   * of useful on a search where somebody has described a problem in
   * several words.
   */
  const ranked = [...scores.entries()].map(([docId, base]) => {
    const matched = [...new Set(hits.get(docId) ?? [])];
    const coverage = matched.length / terms.length;
    return {
      docId,
      matched,
      score: base * (0.45 + 0.55 * coverage) + phraseBonus(prepared.haystack[docId]!, query),
    };
  });

  ranked.sort((a, b) => b.score - a.score || a.docId - b.docId);

  const out: Answer[] = [];
  const fromThread = new Map<number, number>();
  for (const row of ranked) {
    const doc = prepared.index.docs[row.docId]!;
    const used = fromThread.get(doc.h) ?? 0;
    if (used >= perThread) continue;
    fromThread.set(doc.h, used + 1);
    const thread = prepared.index.threads[doc.h];
    out.push({
      text: doc.t,
      author: doc.a,
      date: doc.d,
      thread: thread?.title ?? "",
      url: thread?.url ?? "",
      source: thread?.source ?? "",
      score: row.score,
      matched: row.matched,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * The quotation with any repeat of the thread title taken off the
 * front.
 *
 * A Reddit title is often the whole question — "Hello, I just got my
 * first roll back from my new Bolex REX4 and there are blue lines" —
 * and the body of the post then opens with the same sentence. Shown
 * as a heading with the quotation under it, that reads as the same
 * text printed twice, which looks like a bug in the page rather than
 * a habit of the people writing.
 */
export function withoutTitleEcho(text: string, thread: string): string {
  const title = thread.trim().replace(/[.…]+$/, "");
  if (title.length < 25) return text;
  const head = title.slice(0, Math.min(title.length, 60)).toLowerCase();
  if (!text.slice(0, head.length + 4).toLowerCase().startsWith(head)) return text;
  const rest = text.slice(head.length).replace(/^[\s.,;:?!—–-]+/, "");
  /* Only if something worth reading is left; a post that is nothing
     but its own title is better shown whole than as a fragment. */
  return rest.length > 60 ? rest : text;
}

/**
 * The same thread in the Wayback Machine.
 *
 * Every link here points at a live page on somebody else's site, and
 * those go. The Bolex forum is the reason this corpus exists: a third
 * of its threads are already gone, and the live site is behind a
 * challenge page that an ordinary reader can get past and an archive
 * cannot. A quotation whose link has rotted is an unverifiable claim,
 * which is the one thing this whole page must not produce.
 *
 * So a forum result carries a second link. `/web/2/<url>` is the
 * Wayback Machine's own shorthand for "the closest capture to now",
 * so it needs no timestamp stored per thread and cannot go stale as
 * new captures are made.
 *
 * Only the forum, though. That corpus was read through Wayback in the
 * first place, so a capture is known to exist for every thread in it;
 * Reddit was read live and its coverage is patchy — the availability
 * API has no snapshot at all for the first Reddit thread tried. An
 * "archived copy" link that lands on "page not in the archive" is
 * worse than no link, because it tells the reader the quotation is
 * unverifiable when it is merely un-mirrored.
 */
export function archiveUrl(url: string, source: string): string | null {
  if (!source.startsWith("cinematography.com")) return null;
  return `https://web.archive.org/web/2/${url}`;
}

/** "cinematography.com/forum78" → "cinematography.com" */
export function sourceName(source: string): string {
  if (source.startsWith("reddit.com/")) return source.slice("reddit.com/".length);
  return source.split("/")[0] ?? source;
}
