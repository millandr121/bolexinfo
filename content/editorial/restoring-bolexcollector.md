---
title: "Restoring BolexCollector.com"
kind: "modern-editorial"
date: "2026-07-26"
description: "How and why the original BolexCollector.com is being preserved and rebuilt as a permanent digital archive and modern museum edition."
---

# Restoring BolexCollector.com

For nearly two decades, BolexCollector.com — published by collector Michael Tisdale —
was the definitive independent reference for the cameras, projectors, lenses and
accessories of Paillard-Bolex, the Swiss manufacturer whose clockwork movie cameras
defined amateur and professional filmmaking from the 1930s through the 1960s.

The original site documented the complete H-16 and H-8 lineages, the B, C, D and L
series, the Super 8 era, every Paillard projector line, lens catalogues from
Kern-Paillard to SOM Berthiot, decades of accessories, the Bolex Reporter magazine,
factory ephemera, a glossary, a company timeline — and the serial number tables,
drawn from the Bolex International S.A. bulletin of September 1977, that collectors
worldwide still rely on to date their cameras.

The site has since gone offline. Its domain no longer resolves.

## This project

This project is two things at once:

1. **A permanent preservation archive.** Every recoverable page, image, table,
   serial number and download is retrieved from the Internet Archive's Wayback
   Machine and other sources, stored byte-for-byte in `/archive`, and converted
   into structured, presentation-independent data in `/content` and `/data`.
   The Git repository itself is the archival medium.

2. **A modern museum edition.** A fast, accessible, typographically serious
   presentation layer built on the structured data — with instant search, a serial
   number lookup, and a side-by-side "View Original Archive" mode so the historical
   record is never more than one click away.

## Principles

- **Preservation comes first.** Nothing historical is altered, paraphrased or
  invented. Where a page has not yet been recovered, the site says so plainly.
- **Provenance everywhere.** Every dataset records where it came from and when it
  was captured.
- **Independence of the record.** The archive in this repository does not depend
  on any external service to remain readable. Future maintainers can rebuild the
  entire website from the structured content alone.
