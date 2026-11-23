# Corpus

Harvested source material, kept so it is not lost.

## bolex-forum-corpus.jsonl

**1,929 posts · 326 threads · 412 contributors · 2007–2025 · 1.5 MB**

The Bolex forum from cinematography.com (forum 78), recovered through the
Wayback Machine. One JSON object per post, oldest thread first:

```json
{
  "source": "cinematography.com/forum78",
  "thread_id": "72750",
  "thread": "Removing Sprockets on a Bolex H16?",
  "url": "https://cinematography.com/index.php?/forums/topic/72750-…",
  "n": 2,
  "author": "Simon Wyss",
  "date": "2016-09-09",
  "text": "Simply order a pair of one-side sprocket drums at Bolex International…"
}
```

`n` is the post's position in its thread, so a conversation can be put back
in order. Every record carries the archived URL it came from, which is what
makes a quotation checkable.

How it was gathered, and why the live site cannot be read directly, is in
`../sources.md`. What the forum holds and which threads are worth reading is
in `../findings/cinematography-forum.md`. The 245 threads the archive never
captured are listed, unrecovered, in
`../findings/cinematography-forum-index.tsv`.

## Whose writing this is

**Not ours.** These are posts by 412 named people, most of them living, and
several of them — Simon Wyss, Dom Jaeger, Jean-Louis Seguin — working camera
technicians who answered strangers' questions for twenty years for nothing.

It is committed here because the forum is disappearing. A third of the
threads are already gone from the archive, the live site is behind a bot
wall, and the file existed in one place that was about to be deleted.
Preserving it was the urgent thing; this is the copy that survives.

That is a reason to hold it, not a licence to republish it. The rules this
project works to, set out in `../sources.md`:

- Facts learned here may be stated on the site **in our own words, cited**.
- **Short quotations** with the author named and a link to the thread are
  ordinary scholarly use, and are what the planned search will serve.
- **Bulk republication** of these posts as site content is not ours to do.
- Nothing is **attributed** to anyone who did not write it.

If you are one of the people in this file and would rather your posts were
not here, that is a fair thing to ask: say so and they come out. Drafts of
the notes asking permission properly are in `../outreach.md`.
## bolex-reddit-corpus.jsonl

**7,703 records · 1,259 threads · 2,536 contributors · 2011–2026 · 4.2 MB**

Reddit, harvested by `research/scripts/harvest-reddit.py`. Same record
shape as the forum corpus: source, thread_id, thread, url, n, author,
date, text, so one reader serves both.

| Subreddit | Records | Threads | Span |
| --- | --- | --- | --- |
| r/bolex | 1,076 | 392 | 2013-10-11 → 2026-11-23 |
| r/cinematography | 2,307 | 207 | 2012-05-23 → 2026-11-20 |
| r/16mm | 1,852 | 248 | 2016-01-21 → 2026-11-23 |
| r/8mm | 1,159 | 194 | 2016-04-12 → 2026-10-28 |
| r/Filmmakers | 765 | 103 | 2011-07-25 → 2026-11-15 |
| r/AnalogCommunity | 313 | 69 | 2019-07-24 → 2026-09-09 |
| r/super8 | 231 | 46 | 2021-03-15 → 2026-11-16 |

r/bolex and r/super8 are swept whole. The rest are searched by keyword,
by title and by body separately, because a thread that mentions a Bolex
in its text rarely says so in its title.

**Four sweeps are still owed**, down from six. They are listed in
`../roadmap.md` with where each stopped. Arctic Shift answers HTTP 422 when it wants the
caller to slow down rather than when a request is wrong, and a sweep
refused that way stops short; the harvester reports each one instead of
returning an empty page and treating the subreddit as finished.

Re-running picks up where it left off, per subreddit: each resumes from
its own newest date rather than from the newest date in the file, so a
subreddit cut short is not skipped over. A sweep that stopped before
reaching back to where another sweep of the same subreddit already
ended needs `--since` with that date, because resuming only goes
forward.

Reddit itself cannot be read from this environment, every
unauthenticated route answers 403 to a datacenter address, so this
comes via Arctic Shift, a public research mirror of the Reddit archive.
The script's docstring records the three API quirks that cost time.

Deleted and removed posts are dropped on the way in.

## Whose writing the Reddit file is

The same rules as the forum corpus, above, and for the same reasons:
these are 1,497 named people's posts, held because the material is
worth not losing, not because it is ours to republish.

