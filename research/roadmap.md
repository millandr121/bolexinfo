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
| **Reddit** | **harvested, with gaps** | 7,703 records, 1,259 threads, 2,536 named people in `corpus/bolex-reddit-corpus.jsonl`, via Arctic Shift. Four title sweeps are still owed: see below |
| **Facebook group** 746982282801800 | blocked | Login wall. Only route is files brought in by hand |
| **Live cinematography.com** | blocked to automation | A logged-in person can read what the archive missed |

When adding a source, record it in `sources.md` first — reachability, what
it holds, and what its terms allow. That register exists so the same dead
ends are not re-walked.

### Reddit sweeps still owed

Arctic Shift answers `HTTP 422` when it wants the caller to slow down, not
when the request is wrong. The harvester now reports each sweep it could
not finish rather than returning an empty page and pretending the
subreddit ended there, so these are known rather than silent:

Re-run 2026-11-23. Four of the six came through, adding 2,633 records:
r/cinematography selftext alone brought 134 threads and over 2,000
posts, and r/AnalogCommunity 69 threads. What is still owed:

| Subreddit | Field | Reached back to |
|---|---|---|
| r/cinematography | title | 2022-11-18 |
| r/AnalogCommunity | title | nothing fetched |
| r/Filmmakers | title | 2026-11-14 |
| r/super8 | title | 2026-11-15 |

These are **title** sweeps, and the selftext sweep of each subreddit has
already run, so what is missing is threads whose *title* names a Bolex
but whose body does not. That is a real gap but a narrow one, and the
corpus is already usable.

Resuming only goes forward, and each subreddit resumes from its own
newest record. Every one of these four now has a recent watermark from
its selftext sweep, so a plain re-run will fetch nothing: each needs an
explicit `--since` with the date in the table (or `--full`) to reach
back past it. Running them one subreddit at a time, rather than all in
one pass, is also likelier to stay under whatever Arctic Shift's 422
actually measures.

One thread's comments (`un1sra`) came back 422 and are absent; the
submission itself is held.

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
- Repair manuals to be hosted (decided; none ingested yet)
- ~~192 dead-end article/ephemera pages~~ — stale, see below

## "192 dead-end pages": stale, and now checked continuously

Measured 2026-11-20 and the number does not survive any reading of it:

- **0** broken internal links, out of 12,439 checked across the built
  site. A test holds that at zero from now on.
- **0** pages with no content blocks at all.
- **0** ephemera pages without a picture, since the thumbnail fallback.
- 22 recovered articles, none of them thin.

The nearest thing to a match is 29 ephemera pages with a heading and
several images and no prose — "1950s Books", "1940s Catalogs",
"Bolex Reporter Vol. 1". Those are gallery pages and were galleries on
the original site. They are not dead ends and want no fixing.

Where the 192 came from is not recorded, which is the lesson: a count
in a backlog without the query that produced it cannot be rechecked,
and goes stale without anyone noticing.

## The 95 ephemera scans: closed

Settled 2026-11-20, and the answer is that they are gone.

The ephemera section had 95 pages showing no picture. The cause was
not a processing bug and not a failed harvest: the Wayback Machine
never captured those full-size scans. Its index for
`/images/ephemera/` holds 220 files — 81 full-size and 139
thumbnails — which is exactly what `archive/wayback/images/ephemera/`
contains. The harvest took everything there was.

So `scripts/backfill-ephemera-scans.mjs` recovers nothing, and no
amount of rate-limit patience will change that. It is kept because it
is the thing that proved the point, and because it would pick up any
scan that was added to Wayback later.

Those images only ever existed on Michael's own server. The one route
left is a person who has the originals or saved copies, which is a
question for the suggestions page rather than a script.

**The pages are no longer blank.** Each one falls back to its
thumbnail, marked "Thumbnail only — the full-size scan was not
preserved." A 58×80 scan of a 1940s advertisement is a poor substitute
for the real thing and far better than an empty page, and saying so on
the page is also how someone holding the original finds out it is
wanted.
- Bolex Stereo/Triorama, SP8/SP80, 5120 entries
- A primary source for the 16 Pro introduction year


## The repair directory, properly

Asked for 2026-11-20. The list currently holds six businesses and is
the thinnest useful thing on the site, for the subject people most
often arrive needing.

### Find who is actually working, and actually good

The brief is the most respected technicians currently taking work, not
every business with a web page. The names that carry weight are the
ones who have been answering on cinematography.com for twenty years —
Dom Jaeger, Simon Wyss, Jean-Louis Seguin and others at that level —
and their standing comes from decades of public, checkable answers
rather than from marketing.

Both corpora are the obvious place to look. 1,929 forum posts and a
growing Reddit set already name who people are sent to and who they
come back satisfied from. Du-All Camera came out of exactly that: 13
separate Reddit threads, more than twice anyone else, then verified
from their own site and added.

### On reputation: curate, never criticise

The standard is **inclusion, not judgement**. The list should hold
technicians this project is willing to stand behind, and simply not
hold anyone else. Nothing on the site says, or implies, that a named
business does poor work.

That is not squeamishness. People trust this site, and a listing here
reads as a recommendation whether or not it is labelled as one —
someone ships a camera across a continent on the strength of it. So
the harm runs in one direction: listing a technician who does a bad
job hurts a reader and the site's standing, while leaving someone off
costs them nothing they can point to, because absence says nothing.

Working rules:

- **Omission is silent.** No "not recommended" section, no asterisks,
  no implications. A business either appears or does not.
- **A listing needs a reason.** Their own current site for the facts,
  and corroboration that they are respected and taking work: repeated
  unprompted recommendations from the long-standing names, or a track
  record visible in the forums.
- **Negative hearsay removes, it never publishes.** Enough credible
  doubt means quietly not listing them, and that is the whole action.
- **Write nothing down that would be unfair if it leaked.** These
  research notes are in a public repository, so the reasoning here
  stays factual and the gossip stays out of it.

Specific cases, recorded only as things to resolve:

- **Dr Bolex** is currently listed. There is secondhand doubt about
  their standing among senior technicians. Worth checking properly
  before the directory is promoted; if the doubt holds up, the entry
  comes out with no announcement.
- A Reddit thread titled "Avoid Les Boscher Super16!" is one
  customer's account against a reputation built over decades. One bad
  experience is not evidence of anything, and it changes nothing by
  itself.

### Leads, not listings

Names that have come up and have not met the bar to appear on the site.
Recorded so they can be checked, not so they can be published.

- **TCS — Technological Cinevideo Services.** Raised 2026-11-20, rep
  explicitly unverified. The evidence here is thin: one Reddit mention,
  and it is a *question* — someone asking whether anyone has reviews of
  "Du-all, Dr. Bolex, or TCS" — with no answer about TCS in the thread.
  The three forum hits for "TCS" are a different thing entirely, a TCS
  time-lapse motor. `tcscinevideo.com` did not resolve when tried from
  the build environment, which may be the environment rather than the
  business. Needs a working site or a named recommendation before it
  goes anywhere near the list.
- **Procam, trading as Bolex USA.** Named in the same thread, with the
  useful detail that they do not work on Super 16 Bolexes. Worth
  checking as a listing in its own right; that limitation belongs in
  the entry if they are added.
- **bolexrepair** — mentioned once, by someone comparing turnarounds
  with Du-All. No other trace yet.

**Pacific Rim Camera and the 95 missing scans.** Checked 2026-11-20
and the answer is no, with a caveat worth keeping.

Their reference library holds 73 Bolex items, and 58 of our 95 missing
scans are brochures rather than advertisements, so the overlap looked
promising. It is not: their collection is instruction books, sales
brochures, catalogues, technical bulletins and dealer notebook pages,
scanned as PDFs. Ours are Michael's own photographs of his own
ephemera collection. Fuzzy title matching produced 31 "matches" and
nearly all are noise — "Doris Day Brochure" against "Bolex B8 Sales
Brochure".

Perhaps three are worth a human comparing by eye: our 155 Macrozoom
and 8mm brochures against their "155 Macrozoom Sales Brochure" and
"8mm Sales Brochure". Even then it would be a different scan of a
possibly different printing, not the missing file.

The real point is that Pacific Rim is a complementary source rather
than a replacement one, and a good one: catalogues from 1946, 1952 and
1965, the 16 Pro brochure, 29 technical bulletins. Their scans are
theirs, so anything used needs asking. See research/sources.md.
- **Martin Stent — Steicca.** Was on the live list and has been taken
  off. It came from bolexh16user.net's links page, never confirmed,
  and carried no website, email or phone — a listing telling a reader
  a technician exists while giving them no way to reach him, and no
  evidence he is still working. Nothing found under steicca.co.uk or
  steicca.com. Needs a working contact before it goes back.

**Dom Jaeger** is the strongest lead on this list and the hardest to
act on. The forum corpus holds **95 of his posts across 70 threads,
2010 to July 2025**, which is the kind of record the whole "respected
technician" idea is pointing at — other members send people to him
unprompted ("Dom Jaeger knows a lot about bolexes and often drops in
to a thread like this and helps out").

What he has said himself, in 2020: *"I work on mechanical Bolexes, but
I avoid the electronic ones even if it's a mechanical issue because
they are a real pain to work on."* That is a service scope and a
useful limitation, from him.

What is missing is everything a listing needs: a business name, a
location and a way to contact him. The corpus has none of it. One
member mentioned "the bolex service center in Melbourne, Australia" in
2009, but that is someone else's passing remark, not his, and it must
not be welded to his name on the strength of a guess.

He may also not advertise repair work at all, in which case listing
him would send strangers at someone who has not asked for them. So the
only clean route is to ask him, through his cinematography.com
profile — which the forum-technicians draft in outreach.md already
covers. Add nothing until he answers.

### The map

A world atlas with a dot per technician, so someone can see who is
near them, next to the list rather than instead of it. Clicking a dot
opens that technician's details with a direct link to their site and
their contact.

**Built, 2026-11-23.** How each requirement landed:

- **Coordinates.** Six of the seven carry them, geocoded to the town
  centre and never to a street address. The seventh gives no location
  finer than a region and is named under the map rather than given an
  invented dot.
- **A base map with no API key and no tracking.** An inline SVG path,
  generated into the repository by `scripts/build-world-map.mjs` from
  Natural Earth's public-domain 110m land outline. 26 kB of path, about
  12 kB over the wire. The page makes no third-party request, which
  keeps the static export's one real promise intact.
- **The list stays canonical.** The map carries names and contact only;
  what each person does and what the entry rests on stay in the list,
  and every mark links down into it.
- **Accessibility.** The marks are real buttons positioned over the
  map, so they tab, focus and take a ring like any other control, and
  the map carries a text alternative pointing at the list.

Two things that only showed up in the building:

- **Marks have to cluster.** Pigeon Creek, Visual Products and Du-All
  sit 13 to 22 frame units apart on a map of the whole world. At any
  size a finger can hit they overlap, and whichever drew last took the
  clicks meant for the others. They share one numbered mark, which is
  also the truer reading at this scale.
- **The dateline draws lines across the map.** Natural Earth cuts its
  polygons at the antimeridian, so four rings run up one side at +180
  and resume at −180; joined rather than split, each drew a stroke
  clean across the world. Faint enough to miss in a screenshot, so
  there is a test for it.

Still wanted: a longer list. The map's emptiness is honest but it is
also the argument for finding more people, particularly in continental
Europe and Asia, where it currently shows nobody at all.

### Les Bosher has died

**He was removed from the directory on 2026-11-23.** Two independent
sources:

- A customer writing on r/cinematography in February 2026: "I sent my
  Bolex once to Les Bosher but he tragically passed away last year."
- A thread on cinematography.com titled "Les Bosher RIP", opened by
  his son, giving the date as 5 December. With the Reddit post that
  places it in 2025.

The cinematography.com thread could not be read directly from here:
the live site answers 403 to anything non-interactive, and
web.archive.org is unreachable from this container, so the snapshot
that exists (20260218005138) could not be fetched. Worth confirming
from a browser when someone has one.

`lesbosher.co.uk` is **still up and unchanged**, written in his own
voice ("run by myself & Chris, my son") and advertising accessories
for a Sony EX-3 camcorder, so it dates from around 2008 and is no
evidence either way about the business today. His son Chris worked
with him and the RIP thread says enquiries would be answered in the
New Year, so the business may continue. Until that is established,
listing it would send someone's camera and shipping money somewhere
that may not answer.

### Technician leads, not yet listed

Found by searching the corpora for service talk outside North America,
then checking each against its own site. Recorded so the same ground
is not re-walked.

| Lead | Where | Why not listed |
|---|---|---|
| **Simon Wyss** | Basel, Switzerland | Recommended by name on r/cinematography and a long-standing cinematography.com contributor. `filmmechaniksimonwyss.biz` exists but answers 403 to us, so it has never been read. **The best lead here** — needs a browser. |
| **Stecica** | Near London | A customer described a full CLA there in 2022 and named "Jamie". `stecica.com` no longer resolves. Probably gone. |
| **Bolex International** | Switzerland | The manufacturer, and the obvious thing to try from Europe, but its own site has no repair or service page at all, only a contact form, and does not even give a town. Nothing to quote. People did send cameras there: a 2020 thread says they were "crazy busy" and not returning calls. |
| **Guido Wilhelm** | Italy | Listed on aciarfilm.org for Bolex SB and SBM but not RX, EBM or EL. The page is undated. |
| **Yves Bornand** | Switzerland | Same undated aciarfilm.org page, for all models except EL. |
| **Cine Repair** | Queens, New York | Named in r/bolex as having overhauled a REX-4. Not yet checked against a site. |
| **CameraCrate** | UK | Sells refurbished H16s rather than taking repairs in. |
| **P+S Technik** | Munich | Suggested in a thread by someone who said themselves they did not know whether it handles Bolex. |
| **ausgeknipst.de** | Germany | A directory of analogue repair workshops, apparently maintained. Worth reading properly as a source of further names. |

Checked and **dead**: `super16inc.com`, named in r/bolex alongside
Du-All and Visual Products, is now a parked domain offered for sale.

### Reddit names

Asked whether the respected Reddit contributors can be surfaced too.
Partly. The corpus shows who answers most often and what they say,
which is checkable. It does not show who is *trusted*, and post counts
are not standing — the most prolific poster in a subreddit is rarely
the best technician in it. Volume can be reported as volume. Anything
stronger needs a person who knows the field to say so.
