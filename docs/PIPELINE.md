# The Preservation Pipeline

Five idempotent stages, run together (`npm run pipeline`) or individually.
Every stage writes machine-readable records under `data/recovery/` and never
destroys previously recovered material.

## Stages

### 1. Discover — `npm run pipeline:discover`

Enumerates every URL the Wayback Machine ever captured for
`bolexcollector.com` and `www.bolexcollector.com` via the CDX API (paginated,
all years, all MIME types), merges the search-index seed inventory
(`data/recovery/url-inventory.json`), and writes `data/recovery/discovered.json`.
All captures per URL are retained — not just the newest — so later stages can
compare snapshots.

### 2. Download — `npm run pipeline:download`

For each discovered URL:

- ranks captures (HTTP 200 only; larger capture first — truncated archives are
  shorter; later timestamp as tiebreak) and downloads the best one using the
  Wayback `id_` flag for **original bytes** (no toolbar, no URL rewriting);
- preserves up to 5 earlier distinct revisions of each HTML page under
  `<file>.revisions/<timestamp>`;
- recursively follows internal links, images and downloads found in each page,
  queueing anything the CDX index missed;
- records everything (URL, timestamp, MIME, size, SHA-1, revisions) in
  `archive/meta/manifest.json`.

Rate-limited (1.5 s between requests), retried with exponential backoff
(2 s/4 s/8 s/16 s), resumable — interrupted runs pick up where they stopped.

### 3. Extract — `npm run pipeline:extract`

Converts preserved HTML to structured, presentation-independent content:

| Source | Destination |
| --- | --- |
| Articles | `content/articles/<slug>.md` (frontmatter: original URL, capture timestamp, images) |
| Camera / projector / lens / accessory / ephemera pages | `data/<section>/<slug>.json` |
| Every `<table>` on every page | `data/tables/<section>/<slug>.json` (verbatim) |
| Serial number tables | `data/serials/ranges.json` |
| Glossary, timeline | `data/reference/*.json` |

### 4. Verify — `npm run pipeline:verify`

- SHA-1 + size check of every stored asset against the manifest (integrity);
- every internal link, image and download reference resolved within the
  archive (gaps are reported, not fatal — some resources were never archived);
- writes `data/recovery/verification.json`; exits non-zero on integrity failure.

### 5. Report — `npm run pipeline:report`

Renders `docs/reports/recovery-report.md`: recovered pages/images/PDFs/downloads,
preserved revisions, missing pages, download failures, verification summary.

## Network requirements

The pipeline needs HTTPS access to `web.archive.org`. Optional secondary
sources (Common Crawl, archive.today) are listed in `scripts/lib/config.ts`.

Running inside a sandboxed environment (Claude Code remote, CI) whose egress
policy blocks archive hosts produces a fast, explicit failure:

```
✗ Egress policy denied access to web.archive.org. Add the host to the
  environment's network egress allowlist, or run the pipeline from a
  network-enabled environment.
```

**Fix:** add `web.archive.org` (and optionally `index.commoncrawl.org`,
`data.commoncrawl.org`, `archive.ph`) to the environment's allowed network
egress hosts, then re-run `npm run pipeline`. Alternatively run the pipeline
from any developer machine and commit the results — every stage is
deterministic and idempotent.

## Beyond the Wayback Machine

`data/recovery/url-inventory.json` also records candidate URL patterns
(Bolex Reporter volumes 1–24, P/K-series camera pages, per-decade lens and
accessory pages) with the documentary basis for each. Discovery probes these
against the CDX index. Additional recovery sources worth manual sweeps —
Common Crawl, archive.today, collector forums, university archives — are
tracked in `docs/RECOVERY-STATUS.md`.
