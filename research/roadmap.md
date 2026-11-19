# Roadmap: the knowledge archive

Written 2026-11-18, at the end of a session, so the next one can pick this
up cold. Everything here is Andrew's direction; the notes under each item
are what has actually been established so far.

## The idea

> "I'm picturing our own kind of Wayback machine… if users have questions,
> it goes through a harvest library and then delivers a bunch of quotes and
> dialogue, timestamped, by the person. A little time capsule of knowledge
> that has been lost or at least buried. Even messages from Michael Tisdale
> himself."

Concretely: a reader types *"H16 Rex 5 spring motor issue"* and gets back
real answers from the people who actually knew — Dom Jaeger, Simon Wyss,
Jean-Louis Seguin — each quoted, named, dated, and linked to its source.

Two things make this worth building rather than just nice:

1. **The forums are dying.** cinematography.com's Bolex forum is already
   unreadable without getting past Cloudflare, and a third of its threads
   exist now only as titles. The knowledge is going, not gone.
2. **Quotation is the right shape.** A short passage, attributed and
   linked, credits the author instead of absorbing them. It is what this
   whole project does for Michael Tisdale, applied to everyone else who
   taught people how these cameras work.

## Harvest queue

| Source | State | Notes |
|---|---|---|
| **cinematography.com forum 78** (Bolex) | **harvested** | 571 threads, ~65% with full text. See `findings/cinematography-forum.md` |
| cinematography.com — other forums | not started | Bolex discussion also lands in the 16mm, lenses and telecine forums. 21,500+ archived topics site-wide; filter by slug |
| **Reddit** | not started | r/Filmmakers, r/analog, r/16mm, r/Cinematography. Has a real API and an archive; far easier than Facebook |
| **Facebook group** 746982282801800 | blocked | Login wall. Only route is files brought in by hand |
| **Live cinematography.com** | blocked to automation | A logged-in person can read what the archive missed |

When adding a source, record it in `sources.md` first — reachability, what
it holds, and what its terms allow. That register exists so the same dead
ends are not re-walked.

## Building the search

Rough shape, not a committed design:

1. **Corpus.** One record per post: source, thread, id, author, date, text,
   archived URL. The harvest already produces exactly this.
2. **Index.** The corpus is small — the Bolex forum alone is well under a
   million words. Plain full-text search gets a long way before anything
   cleverer is needed, and it stays debuggable.
3. **Results as citations.** Quote, author, date, link. Never a synthesised
   paragraph presented as though a named person said it.
4. **Static-site constraint.** The site is `output: "export"` on Cloudflare
   Pages with a CSP that allows no third-party origins. A prebuilt index
   shipped as a static asset fits that; a search server does not, without a
   deliberate decision to add one.

### Where the corpus lives

Decided 2026-11-19, and then changed the same day.

The first decision was to hold the harvested post text privately: a working
research copy, kept out of a public repository, with only the finding aid
and the scholarship published. That is how an archive normally separates its
material and it is still the tidier answer.

It was overtaken by a plainer problem. The corpus existed in exactly one
place — a session scratchpad that is wiped on cleanup — no private
repository had been created, and this session cannot create one. Andrew's
call was to commit it publicly rather than risk losing fifty minutes of
harvest and, more to the point, a body of knowledge that is itself
disappearing. Preservation beat tidiness, which is the right order.

So `corpus/bolex-forum-corpus.jsonl` is in this public repository, with a
README beside it saying plainly whose writing it is and on what terms it is
held. Worth being clear-eyed about the cost: a public repository is
permanent and gets scraped, and this cannot be quietly undone later.

What has not changed is what may be *published from* it — see below.

### The line to hold

Andrew's direction is to extract and use this knowledge, and that is the
right goal. Where it needs care: **short attributed quotations are
citation; republishing whole post archives verbatim is not.** The search
form naturally stays on the right side of that, because a result *is* a
short quote with a link home. If full-text pages are ever wanted instead,
that is a deliberate decision worth taking knowingly rather than drifting
into — and the people involved are reachable and would likely say yes if
asked.

## Harvest method

Kept in `sources.md` under "Reading cinematography.com": the raw `id_`
replay endpoint, the single-quoted Invision markup, and why the ordinary
replay URL fails in a cloud session. The scripts themselves are scaffolding
and are not committed; they are about an hour's work to rebuild from those
notes, and the thread index below means the expensive discovery step does
not have to be repeated.

`cinematography-forum-index.tsv` — every thread found, whether or not its
text could be recovered.

## Also outstanding

Carried over, not forgotten:

- **H-9 photographs.** Catawiki is unreadable to automation and the page
  offered held no Bolex at all. Lot images sit on `assets.catawiki.com` and
  are directly fetchable — but a photographer's name on a listing is not a
  licence. Clean route is a short message to the seller.
- **Edwin Molenaar** — H16 non-reflex photograph via Instagram, credited to
  him. Recorded as a lead; same permission question, same clean route.
- Technician map and geolocation
- Repair manuals to be hosted (decided; none ingested yet)
- Glossary's 105 definitions rendering as 3 paragraphs
- 192 dead-end article/ephemera pages; 95 missing full-size scans
- Bolex Stereo/Triorama, SP8/SP80, 5120 entries
- A primary source for the 16 Pro introduction year
