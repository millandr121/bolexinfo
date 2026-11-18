# Research staging

Nothing in this folder is published. It is where new material waits while it
is checked, so that the site keeps its one real promise: that everything on
it is either recovered from BolexCollector.com or sourced and attributed.

Making a side folder first was the right instinct. The alternative — adding
facts straight to `data/` — mixes unverified claims into the recovered record
with nothing to tell them apart later.

## The flow

```
research/findings/<topic>.md     →  checked  →  data/… + a provenance line
         (claims + sources)                     (published)
```

A finding leaves this folder when every claim in it has a source that was
actually opened, and the entry says where it came from.

## What counts as checked

The bar is the same one the technician directory uses, because that is the
bar this site has already set:

- **Read it, don't recall it.** A URL that was opened, with the date it was
  opened. Not "I remember that the 16 Pro had…".
- **Prefer a primary source.** A Paillard manual, a dated catalogue, a
  serial plate in a photograph. A forum post is a lead, not a fact.
- **Two sources for anything surprising.** A date that contradicts the
  recovered timeline needs more than one voice behind it.
- **Say when it is uncertain.** "Probably 1965, from a dealer listing" is
  publishable. "1965" is not, unless it is.

## On manuals

Scans of Paillard manuals are almost certainly still in copyright. Bolex
International S.A. still trades from Sainte-Croix, so there is a rights
holder to ask, and "the company is gone" is not available as a defence.

The position that costs nothing and risks nothing: **link to manuals where
they are already hosted, host none here.** A page per model listing which
manuals exist and where to find them is nearly as useful to a researcher and
cannot be taken down.

Hosting scans is a decision for the site's owner, not something to drift
into. If the answer is yes, the clean route is to ask Bolex International for
permission first — a small archive asking politely about forty-year-old
manuals is not a hard conversation to have.

## Status of the sources we have

| Source | Reachable from here | Notes |
|---|---|---|
| camera-wiki.org | yes | GFDL 1.3 — reusable with attribution and share-alike |
| pathefilm.uk | yes | 9.5mm gear, good on the Pathé side |
| bolexh16user.net | yes | H16 cameras, lenses, motors, accessories |
| phsc.ca (H8/H16 repair manual) | yes | 31 MB PDF, reachable directly |
| bolex.com | **no** — 406 | blocks automated requests |
| manuals.plus | **no** — 403 | blocks automated requests |
| learncamerarepair.com | **no** — 403 | blocks automated requests |
| filmlabs.org PDF | **no** — no response | |
| Facebook group | **no** — login wall | see below |

## The Facebook group

It cannot be read from here. The group is private, Facebook serves a login
wall to anything unauthenticated, and no browser in this session carries an
account. Scraping it with someone's login would also breach Facebook's terms,
so it is not a question of finding a way around.

What works instead, in rough order of effort:

1. **Download what matters into a folder.** Facebook group *Files* and photo
   albums can be saved in bulk by hand. Dropped into `research/incoming/`,
   every PDF and image can be read, catalogued and attributed here.
2. **Post asking for the material.** A group of Bolex owners asked "does
   anyone have a scan of the H-9 manual" will usually produce one, and it
   comes with a person to credit.
3. **Share a folder through Remote Control** (Claude desktop app → Settings →
   Claude Code → Remote Control) so a session can read it directly. No folder
   is shared at the moment.

Anything arriving from the group needs its own provenance: who posted it,
when, and whether they are the one who scanned it. A manual someone uploaded
is not necessarily theirs to license.
