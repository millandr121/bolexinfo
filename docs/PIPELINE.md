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

If the CDX API is unreachable, discovery falls back to the Wayback
availability API (`archive.org/wayback/available`, a different host than
`web.archive.org` — sometimes reachable when the CDX host isn't) for a
closest-capture timestamp per seed URL, then to Common Crawl's index
(`index.commoncrawl.org`) for any URL still without a usable capture. Each
fallback is recorded in that URL's `sources` array so provenance stays
explicit about which archive actually supplied the lead.

### 2. Download — `npm run pipeline:download`

For each discovered URL:

- ranks captures (HTTP 200 only; larger capture first — truncated archives are
  shorter; later timestamp as tiebreak) and downloads the best one using the
  Wayback `id_` flag for **original bytes** (no toolbar, no URL rewriting);
- preserves up to 5 earlier distinct revisions of each HTML page under
  `<file>.revisions/<timestamp>`;
- recursively follows internal links, images and downloads found in each page,
  queueing anything the CDX index missed;
- records everything (URL, timestamp, MIME, size, SHA-1, revisions, source
  archive) in `archive/meta/manifest.json`.

If Wayback proves unreachable partway through, download switches to fetching
original bytes from Common Crawl's public WARC files (`data.commoncrawl.org`,
via ranged HTTP requests) for the rest of the run — real content, but with no
revision history and sparser coverage of non-HTML assets than Wayback offers.
Each stored asset's manifest entry records which archive (`wayback` or
`common-crawl`) it came from.

Rate-limited (1.5 s between requests to archive.org, 400 ms to Common Crawl),
retried with exponential backoff (2 s/4 s/8 s/16 s) and a 20 s per-attempt
timeout, resumable — interrupted runs pick up where they stopped (the
manifest is saved after every asset).

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

The pipeline needs HTTPS access to `web.archive.org` for complete, byte-exact
recovery with full revision history. It also uses Common Crawl
(`index.commoncrawl.org`, `data.commoncrawl.org`) as a fallback discovery and
download source — real content, but shallower: no revisions, sparser
non-HTML coverage, and only whatever Common Crawl happened to crawl.
`archive.ph` is listed in `scripts/lib/config.ts` as a further candidate
source but isn't wired into the pipeline yet.

If a host is genuinely unreachable — not just slow — every network call in
`scripts/lib/net.ts` fails within a bounded number of retries (a 20 s
per-attempt timeout, 4 retries with exponential backoff) rather than hanging
indefinitely, and each stage falls back to the next source instead of
aborting the run.

Node's built-in `fetch` does not read the `HTTPS_PROXY` environment variable
by default, so on Node ≥ 22.21 the pipeline scripts set
`NODE_USE_ENV_PROXY=1` to route through a configured proxy — without it, a
host blocked by a proxy-level policy can appear to hang forever instead of
failing with a clear denial.

**Fix for full recovery:** add `web.archive.org` (and optionally
`index.commoncrawl.org`, `data.commoncrawl.org`, `archive.ph`) to the
environment's allowed network egress hosts, then re-run `npm run pipeline`.
Alternatively run the pipeline from any developer machine and commit the
results — every stage is deterministic and idempotent, so re-running after
partial recovery only fills in what's still missing.

## Beyond the Wayback Machine

`data/recovery/url-inventory.json` also records candidate URL patterns
(Bolex Reporter volumes 1–24, P/K-series camera pages, per-decade lens and
accessory pages) with the documentary basis for each. Discovery probes these
against the CDX index. Additional recovery sources worth manual sweeps —
Common Crawl, archive.today, collector forums, university archives — are
tracked in `docs/RECOVERY-STATUS.md`.
