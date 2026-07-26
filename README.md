# BolexCollector.com — Preservation Archive & Modern Edition

A museum-quality restoration of [BolexCollector.com](https://web.archive.org/web/20260509194326/http://bolexcollector.com/) —
the definitive independent reference for Paillard-Bolex movie cameras, projectors,
lenses and accessories, published by Michael Tisdale and now offline. Resurrected
with the original owner's permission.

**This repository is two things at once:**

1. **A permanent digital preservation archive.** Every recoverable page, image,
   table, serial number and download from the original site, retrieved from the
   Internet Archive and stored byte-for-byte with full provenance. The Git
   repository itself is the archival medium — no external service is required to
   read the record.
2. **A modern museum edition.** A fast, accessible, statically generated
   presentation layer built on the structured data, with instant search, serial
   number lookup, and side-by-side access to the original archived pages.

Preservation comes first. Modernization second. Performance third.

## Repository layout

| Directory | Purpose |
| --- | --- |
| `/archive` | Byte-faithful recovered originals + capture metadata (the preservation record) |
| `/scripts` | The recovery pipeline: discover → download → extract → verify → report |
| `/content` | Structured editorial content: recovered articles (Markdown + provenance frontmatter) |
| `/data` | Structured datasets: models, lenses, accessories, serial ranges, recovery ledger, JSON schemas |
| `/app`, `/components`, `/lib` | Next.js App Router site (strict TypeScript, Tailwind, Motion) |
| `/images`, `/downloads` | Recovered imagery and files (originals preserved; derivatives generated) |
| `/docs` | Pipeline runbook, recovery status, generated reports |

## Quick start

```bash
npm install
npm run dev        # local site at http://localhost:3000
npm test           # unit tests (serial lookup, HTML extraction)
npm run typecheck  # strict TypeScript
npm run build      # static export (out/) — Cloudflare Pages ready
```

## Running the preservation pipeline

```bash
npm run pipeline   # discover → download → extract → verify → report
```

Requires network access to `web.archive.org`. See **[docs/PIPELINE.md](docs/PIPELINE.md)**
for stage-by-stage details, and **[docs/RECOVERY-STATUS.md](docs/RECOVERY-STATUS.md)**
for exactly what has been recovered so far and what remains.

> **Note for Claude Code / CI environments:** if the environment's network
> egress policy blocks archive hosts, the pipeline fails fast with a clear
> policy-denial message instead of fabricating output. Add `web.archive.org`
> to the environment's allowed hosts to enable recovery.

## Principles

- **Nothing historical is altered, paraphrased or invented.** Unrecovered
  content is labeled as pending — never reconstructed from memory.
- **Provenance everywhere.** Every dataset and article records its source URL,
  capture timestamp, and recovery method.
- **The frontend is disposable; the archive is not.** The entire site can be
  rebuilt from `/content` + `/data` alone.

Original site © Michael Tisdale. Preserved and modernized with permission.
