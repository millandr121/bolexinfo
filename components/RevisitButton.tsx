"use client";

import { ViewToggle } from "./ViewToggle";

/**
 * Entry to the preserved original site, from the header.
 *
 * It sits beside the search button rather than in the navigation on purpose:
 * the nav lists sections of the archive, and this is not a section but a
 * change of view — the same kind of control as search.
 *
 * It switches the view rather than merely linking, so that choosing the old
 * site is remembered the way choosing the modern one is. The label collapses
 * to the icon alone below `sm`, exactly as search does, so the header costs no
 * extra width on a phone. The icon is a period browser window, which reads as
 * "the old site" faster than a clock or a rewind arrow.
 */
export function RevisitButton() {
  return (
    <ViewToggle
      to="original"
      label="Browse the original site as it was"
      className="flex shrink-0 items-center gap-2 border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-1.5 text-xs text-[var(--fg-soft)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--fg)]"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
        <circle cx="6.5" cy="6.5" r="0.9" fill="currentColor" />
      </svg>
      <span className="hidden sm:inline">Original</span>
    </ViewToggle>
  );
}
