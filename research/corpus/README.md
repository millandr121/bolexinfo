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

Reddit, harvested by `research/scripts/harvest-reddit.py`. Same record
shape as the forum corpus — source, thread_id, thread, url, n, author,
date, text — so one reader serves both.

**Still partial.** As of 2026-11-20 it holds 2,655 records across 601
threads and 732 people:

| Subreddit | Records | Threads | Span |
| --- | --- | --- | --- |
| r/bolex | 1,074 | 390 | 2013-10-11 → 2026-11-11 (complete) |
| r/16mm | 1,581 | 211 | 2016-01-21 → 2026-08-13 (comments incomplete) |

r/bolex is swept in full. r/16mm was still having its comments fetched
when the run was stopped, and five more subreddits have not been
touched: r/super8, r/AnalogCommunity, r/Filmmakers, r/cinematography
and r/8mm, each searched by keyword rather than taken whole.

Re-running picks up where it left off, per subreddit — each resumes
from its own newest date rather than from the newest date in the file,
so a subreddit cut short is not skipped over. A run that was truncated
mid-sweep names the subreddit and the date at the end, and that gap
needs `--since` with that date, because resuming only goes forward.

Reddit itself cannot be read from this environment — every
unauthenticated route answers 403 to a datacenter address — so this
comes via Arctic Shift, a public research mirror of the Reddit archive.
The script's docstring records the three API quirks that cost time.

Deleted and removed posts are dropped on the way in.
