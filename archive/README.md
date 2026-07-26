# /archive — the preservation record

This directory holds the byte-faithful historical record of bolexcollector.com.

- `wayback/` — best-preserved original capture of every recovered URL, stored at
  its original path (`wayback/cameras/h16.html` ⇄ `http://bolexcollector.com/cameras/h16.html`).
  Earlier distinct revisions of a page live beside it in `<file>.revisions/<timestamp>`.
- `meta/manifest.json` — machine record of every stored asset: original URL,
  Wayback capture timestamp, MIME type, size, SHA-1, and preserved revisions.

Populated by `npm run pipeline` (see `docs/PIPELINE.md`). Nothing in this
directory is ever edited by hand; it is treated as an archival deposit.
