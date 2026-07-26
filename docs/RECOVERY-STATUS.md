# Recovery Status

_Last updated: 2026-07-26_

## Where things stand

| Milestone | Status |
| --- | --- |
| Site structure & URL inventory | ✅ **82 original URLs verified** (titles + sections) via live search index |
| Preservation pipeline | ✅ Built, tested, idempotent — ready to run |
| Wayback Machine download | ⏸ **Blocked by this environment's network egress policy** (see below) |
| Structured seed datasets | ✅ 25 cameras, 10 projectors, 6 lens makers, 8 accessory categories — every field provenance-marked |
| Serial number tables | ⏸ Awaiting extraction from `/articles/07_05_11.html` once downloaded (never entered from memory) |
| Modern site | ✅ Builds statically; all routes prerendered; search + serial lookup engines live |

## The one blocker, and how to clear it

This session's sandbox allows package registries but returns a policy denial
(`Host not in allowlist: web.archive.org`) for archive hosts, and
`bolexcollector.com` itself no longer resolves — the site is dead; the Wayback
Machine is the primary source.

**To complete recovery, either:**

1. Add `web.archive.org` to this environment's network egress allowlist
   (Claude Code → environment settings → network), then run `npm run pipeline`; or
2. Run `npm run pipeline` from any machine with normal internet access and
   commit the results.

Everything downstream — extraction, verification, reports, the Archives
side-by-side view, the serial lookup dataset — activates automatically once
`/archive` is populated.

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
- [ ] Sweep secondary sources for gaps: Common Crawl, archive.today, LIFT
      (lift.ca/resources-home/bolex-collector), collector forums (8mm Forum,
      cinematography.com), university film-archive links
- [ ] Optimize recovered images → WebP derivatives (originals untouched)
