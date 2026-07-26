# Recovery Status

_Last updated: 2026-07-26_

## Where things stand

| Milestone | Status |
| --- | --- |
| Site structure & URL inventory | ✅ **82 original URLs verified** (titles + sections) via live search index |
| Preservation pipeline | ✅ Built, tested, idempotent — ready to run |
| Wayback Machine download | ⏸ **Blocked by this environment's network egress policy**; Common Crawl fallback recovered 40/82 pages instead (see below) |
| Structured seed datasets | ✅ 25 cameras, 10 projectors, 6 lens makers, 8 accessory categories — every field provenance-marked |
| Serial number tables | ⏸ `/articles/07_05_11.html` (the page with the master serial tables) not yet recovered — not in Common Crawl's index; needs Wayback access |
| Modern site | ✅ Builds statically; all routes prerendered; search + serial lookup engines live |

## The one blocker, and how to clear it

This session's sandbox denies direct access to `web.archive.org` (the pipeline
gets `ECONNRESET` from every request), and `bolexcollector.com` itself no
longer resolves — the site is dead; the Wayback Machine holds by far the most
complete capture history and is the only source for full CDX enumeration and
byte-exact snapshots.

As a fallback, the pipeline now also queries Common Crawl (`index.commoncrawl.org`,
`data.commoncrawl.org`), which *is* reachable from this sandbox and holds a
genuine (if partial) crawl of the site from June 2026. The latest run recovered
**40 of 82 pages** this way — real content, not fabricated, but Common Crawl's
coverage is far shallower than Wayback's: no image assets, no historical
revisions, and it missed several key pages (including the serial-number
reference page).

**To complete recovery, either:**

1. Add `web.archive.org` to this environment's network egress allowlist
   (Claude Code → environment settings → network), then run `npm run pipeline`; or
2. Run `npm run pipeline` from any machine with normal internet access and
   commit the results.

Everything downstream — extraction, verification, reports, the Archives
side-by-side view, the serial lookup dataset — activates automatically once
`/archive` is populated, and re-running the pipeline with Wayback access will
backfill the 42 pages Common Crawl couldn't supply plus all images and
revisions, without disturbing what's already recovered (idempotent by
digest/timestamp).

## What was recovered via Common Crawl

40 pages recovered byte-faithfully from Common Crawl's June 2026 crawl of
bolexcollector.com: the homepage, `cameras.html`, 6 individual camera pages
(H8, H8 REX, H8 REX-3, H16 M-4, H16 REX-2, S1), `contact.html`, and 28 period
advertising pages plus 2 Bolex Reporter volume pages under `/ephemera/`.
Extraction turned these into 37 structured JSON datasets and 6 verbatim
tables (`data/cameras/`, `data/ephemera/`, `data/tables/`), each carrying its
original URL, capture timestamp, and source archive (`common-crawl`) in the
manifest. 1,603 internal links and 57 images referenced by these pages point
to content Common Crawl didn't have — tracked as gaps, not filled in.

## What was recovered in this session (no archive access required)

- **Complete URL inventory** (`data/recovery/url-inventory.json`): all main
  sections confirmed — cameras (25 pages), projectors (10), lenses (8 by
  maker/decade), accessories (12 by type/decade), articles (4 verified of a
  larger set), ephemera (9 verified incl. Bolex Reporter vols. 1/4/11,
  1940s/1950s catalogs, period advertising), reference pages (timeline,
  glossary, FAQ, links, archives, about ×2).
- **Candidate URL patterns** with documentary basis (Reporter vols. 1–24,
  P-1/P-2/P-3/K-1/K-2 cameras, per-decade lens/accessory pages, dated article
  URLs) — discovery probes these against the CDX index.
- **Verified model facts** now seeding `data/models/*.json`: introduction years
  (H-16 1935, H-8 1938, L-8 1942, B-8 1953, C-8 1954, H-16 REX 1959, M-4 1965,
  REX-5 1966/67, M-5 1967, 150 Super 1967, 155 Macrozoom 1968, 7.5 Macrozoom
  1969, 160 Macrozoom 1970, Model G projector 1936), format assignments, and
  descriptive summaries from indexed page content. Each entry carries a
  `recovery` flag (`summary-only` / `pending`) so nothing overstates its
  completeness.
- **Serial numbering provenance**: the original site's tables derive from the
  Bolex International S.A. bulletin _Serial Numbers and Date of Manufacture_
  (September 1, 1977) and Paillard service manuals; P/K/S1 cameras received
  their own number range in 1963.

## Post-download checklist

After the first successful `npm run pipeline`:

- [ ] Review `docs/reports/recovery-report.md` for missing pages/images
- [ ] Spot-check extracted serial ranges against archived originals
- [ ] Promote `data/models/*` entries from `summary-only` → `full` as pages land
- [ ] Enable the Archives side-by-side view for recovered pages
- [x] Sweep Common Crawl for gaps — wired into the pipeline as an automatic
      fallback; recovered 40/82 pages this session
- [ ] Sweep remaining secondary sources: archive.today, LIFT
      (lift.ca/resources-home/bolex-collector), collector forums (8mm Forum,
      cinematography.com), university film-archive links
- [ ] Optimize recovered images → WebP derivatives (originals untouched)
