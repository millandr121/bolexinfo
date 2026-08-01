# Recovery Status

_Last updated: 2026-07-31_

## Where things stand

Recovery is **complete**. The archive is fully populated and the modern edition
renders it.

| Milestone | Status |
| --- | --- |
| URL discovery | ✅ Wayback CDX enumeration, with availability-API and Common Crawl fallbacks |
| Archive download | ✅ **1,146 assets** preserved byte-for-byte with a SHA-1 manifest |
| Integrity | ✅ Verified on every commit — 0 corrupt, 0 missing |
| Extraction | ✅ 22 articles, 293 section pages, 359 tables, all provenance-marked |
| Serial tables | ✅ 47 ranges (1936–1976) extracted from the recovered serial-numbers article |
| Modern site | ✅ All routes prerendered and deployed |

## What is preserved

- **Cameras** — 54 models, each with the specifications, photographs and serial
  table published on its archived page.
- **Projectors** — 17 models with specifications.
- **Lenses** — 9 maker/decade pages; **Accessories** — 20 pages by type and decade.
- **Ephemera** — 171 pieces: period advertising, catalogues, brochures and
  *Bolex Reporter* volumes.
- **Reference** — timeline (45 entries), glossary, and the recovered articles.

Every record carries its original URL, capture timestamp, and source archive.

## Re-running the pipeline

`npm run pipeline` is idempotent: it re-downloads only what is missing or newer,
so it is safe to run again to fill gaps or refresh from the archive. It needs
HTTPS access to `web.archive.org`; where that host is blocked it falls back to
Common Crawl, and if both are unreachable it fails with an explicit message
rather than fabricating output. See [PIPELINE.md](PIPELINE.md).

## Remaining gaps

These are genuine holes in the historical record, not pipeline failures:

- Some images and outbound links referenced by recovered pages were never
  archived by any source, and cannot be retrieved. They are listed in
  `data/recovery/verification.json` rather than hidden.
- A handful of recovered pages are not yet surfaced as routes on the modern
  site: FAQ, Links, Previous Updates (archives), Contribute, Contact and the
  regional auction pages. Their bytes are preserved in `/archive` regardless.

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
