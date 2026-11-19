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
