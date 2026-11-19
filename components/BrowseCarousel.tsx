"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowseSection } from "@/lib/browse";

/**
 * A shelf of everything, slid up from the bottom of an object page.
 *
 * Replaces walking a collection one previous/next click at a time. The
 * sequence links were faithful to the original site but slow: to reach the
 * Rex-5 from the Auto Cine B you either guessed how many clicks away it was
 * or went back to the index. Here the whole gauge is on one shelf, scrolled
 * sideways, with the thumbnails that make a Rex 4 and a Rex 5 tellable
 * apart — and the gauge itself, or the whole section, is one more tap.
 *
 * It is a panel rather than a block at the foot of the page because the
 * point is to reach it without scrolling: the trigger sits fixed at the
 * bottom edge, and the shelf rises over the page rather than displacing it.
 */
export function BrowseCarousel({
  index,
  currentSection,
  currentSlug,
}: {
  index: BrowseSection[];
  currentSection: string;
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState(currentSection);
  const [groupIdState, setGroupId] = useState<string | null>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const section = index.find((s) => s.id === sectionId) ?? index[0];
  const homeGroup = index
    .find((s) => s.id === currentSection)
    ?.groups.find((g) => g.items.some((i) => i.slug === currentSlug));
  const group =
    section?.groups.find((g) => g.id === groupIdState) ??
    (section?.id === currentSection ? homeGroup : undefined) ??
    section?.groups[0];

  /* Escape closes, as it does for every other layer on this site. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /*
   * Opening on the item you are already looking at is the whole trick: the
   * shelf should show where you are, not its own beginning. Scrolled
   * without smooth behaviour because this happens while the panel is still
   * rising — an animated scroll would be visible as a lurch.
   */
  useEffect(() => {
    if (!open) return;
    const rail = railRef.current;
    const here = rail?.querySelector<HTMLElement>("[data-current='true']");
    if (rail && here) {
      rail.scrollLeft = here.offsetLeft - rail.clientWidth / 2 + here.clientWidth / 2;
    }
  }, [open, group?.id]);

  const nudge = useCallback((direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.8), behavior: "smooth" });
  }, []);

  if (!section || !group) return null;

  return (
    <>
      {/*
       * The trigger. Fixed to the bottom edge so it is reachable from
       * anywhere on a long object page, and thumb-height on a phone.
       */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="browse-shelf"
        className={`fixed bottom-0 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 border border-b-0 border-[var(--line)] bg-[var(--bg-raised)] px-5 py-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] transition-[transform,color] duration-300 hover:text-[var(--fg)] ${
          open ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 15l-6-6-6 6" />
        </svg>
        Browse more equipment
      </button>

      {/* Click-away. Transparent: this dims nothing, it only catches taps. */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        id="browse-shelf"
        ref={panelRef}
        role="dialog"
        aria-label="Browse equipment"
        aria-hidden={!open}
        className={`safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[var(--bg-raised)] shadow-[0_-4px_24px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-8">
          {/* Sections, then groups: the two axes, kept visually distinct. */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <ul className="scroll-x flex gap-1 pb-1" aria-label="Sections">
                {index.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSectionId(s.id);
                        setGroupId(null);
                      }}
                      aria-current={s.id === section.id ? "true" : undefined}
                      className={`whitespace-nowrap px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
                        s.id === section.id
                          ? "bg-[var(--accent)] text-[var(--bg)]"
                          : "text-[var(--fg-soft)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the shelf"
              className="tap-target shrink-0 px-2 text-[var(--fg-soft)] hover:text-[var(--fg)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <ul className="scroll-x scroll-fade mt-1 flex gap-1 pb-2" aria-label={`${section.label} groups`}>
            {section.groups.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setGroupId(g.id)}
                  aria-current={g.id === group.id ? "true" : undefined}
                  className={`whitespace-nowrap border px-2.5 py-1 text-[0.72rem] transition-colors ${
                    g.id === group.id
                      ? "border-[var(--accent)] text-[var(--fg)]"
                      : "border-[var(--line)] text-[var(--fg-soft)] hover:text-[var(--fg)]"
                  }`}
                >
                  {g.label}
                  <span className="ml-1.5 opacity-50">{g.items.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* The shelf itself. */}
        <div className="relative">
          <ul
            ref={railRef}
            className="flick flex snap-x gap-3 px-4 pb-4 pt-1 sm:px-8"
          >
            {group.items.map((item) => {
              const here = item.slug === currentSlug && section.id === currentSection;
              return (
                <li key={item.slug} className="shrink-0 snap-start">
                  <Link
                    href={item.href}
                    data-current={here ? "true" : undefined}
                    aria-current={here ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`group flex w-[132px] flex-col gap-2 border p-2 transition-colors ${
                      here
                        ? "border-[var(--accent)] bg-[var(--bg)]"
                        : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <span className="plate flex h-[74px] items-center justify-center overflow-hidden">
                      {item.thumb ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumb}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-300 no-touch-zoom group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]/60">
                          no photo
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-[family-name:var(--font-display)] text-[0.82rem] font-[560] leading-tight">
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[0.6rem] text-[var(--fg-soft)]">
                          {item.note}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/*
           * Arrows for a mouse. Hidden where there is no pointer, because a
           * touch screen scrolls the rail directly and the arrows would only
           * cover two of the thumbnails.
           */}
          {group.items.length > 3 && (
            <>
              <button
                type="button"
                onClick={() => nudge(-1)}
                aria-label="Scroll left"
                className="absolute left-1 top-[44px] hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-[var(--line)] bg-[var(--bg-raised)]/95 text-[var(--fg-soft)] hover:text-[var(--fg)] [@media(hover:hover)and(pointer:fine)]:flex"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                aria-label="Scroll right"
                className="absolute right-1 top-[44px] hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-[var(--line)] bg-[var(--bg-raised)]/95 text-[var(--fg-soft)] hover:text-[var(--fg)] [@media(hover:hover)and(pointer:fine)]:flex"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
}
