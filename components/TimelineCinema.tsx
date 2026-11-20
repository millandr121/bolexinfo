"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The timeline, played like a film — and the same page when it is not.
 *
 * The central decision has not changed: there are not two views here. The
 * film *is* the timeline, moved for you. Stopping the playback leaves the
 * reader exactly where it had reached, because the playback only ever moved
 * the page's own scroll position. Nothing is handed between modes and
 * nothing can get out of step. With scripting off, or motion reduced, the
 * page is an ordinary chronology and loses nothing.
 *
 * What changed is the movement. It used to crawl the page upward at a
 * constant speed, which read as a teleprompter: the text slid continuously
 * and nothing ever arrived. Now it moves a year at a time — settle, hold,
 * advance — which is what makes it feel like a sequence of shots rather
 * than a scroll. The holding is the part that does the work; a cut with no
 * dwell after it is just a jump.
 */

/**
 * How long a year holds the screen before the next one comes, in
 * milliseconds, plus a little for each line of text so a long entry is not
 * whipped away. Measured against reading it aloud, which is slower than
 * reading it silently and about right for something playing itself.
 */
const BASE_DWELL = 2600;
const DWELL_PER_CHARACTER = 13;
const MAX_DWELL = 9000;

/** How far from the focal line a panel is fully faded. */
const FADE_DISTANCE = 0.62;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function TimelineCinema({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const settling = useRef(false);
  const playingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [offered, setOffered] = useState(false);
  const [done, setDone] = useState(false);

  const panels = useCallback(
    () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-beat]") ?? []),
    [],
  );

  /** Brighten what is near the focal line, dim the rest. */
  const paint = useCallback(() => {
    const h = window.innerHeight;
    const focus = h * 0.46;
    for (const panel of panels()) {
      const box = panel.getBoundingClientRect();
      if (box.bottom < -400 || box.top > h + 400) continue;
      const mid = box.top + box.height / 2;
      const away = Math.abs(mid - focus) / h;
      const lit = Math.max(0, 1 - Math.max(0, away - 0.1) / FADE_DISTANCE);
      panel.style.setProperty("--lit", lit.toFixed(3));
      /*
       * Marks the panel holding the screen, so the slow drift across its
       * photographs runs there and nowhere else. Written only when it
       * changes: setting an attribute to the value it already has still
       * invalidates style for the subtree, which on a page of forty panels
       * is a scroll handler's worth of work for nothing.
       */
      const live = lit > 0.55 ? "on" : "off";
      if (panel.dataset.live !== live) panel.dataset.live = live;
    }
  }, [panels]);

  const stop = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    playingRef.current = false;
    setPlaying(false);
  }, []);

  /** The panel currently nearest the focal line. */
  const currentIndex = useCallback(() => {
    const all = panels();
    const focus = window.innerHeight * 0.46;
    let best = 0;
    let bestAway = Infinity;
    all.forEach((panel, i) => {
      const box = panel.getBoundingClientRect();
      const away = Math.abs(box.top + box.height / 2 - focus);
      if (away < bestAway) {
        bestAway = away;
        best = i;
      }
    });
    return best;
  }, [panels]);

  const advance = useCallback(() => {
    if (!playingRef.current) return;
    const all = panels();
    const next = currentIndex() + 1;
    if (next >= all.length) {
      setDone(true);
      stop();
      return;
    }
    const panel = all[next];
    if (!panel) {
      stop();
      return;
    }

    /*
     * A smooth scroll fires dozens of scroll events that are ours, not the
     * reader's, and the two are indistinguishable from the event alone. The
     * flag is held for the duration of the movement and released once the
     * page has stopped moving, which is the only honest way to tell them
     * apart without taking over the scroll entirely.
     */
    settling.current = true;
    panel.scrollIntoView({ behavior: "smooth", block: "center" });

    let still = 0;
    let previous = window.scrollY;
    const watch = window.setInterval(() => {
      if (Math.abs(window.scrollY - previous) < 1) still += 1;
      else still = 0;
      previous = window.scrollY;
      if (still >= 3) {
        window.clearInterval(watch);
        settling.current = false;
        if (!playingRef.current) return;
        const text = panel.innerText?.length ?? 0;
        const dwell = Math.min(MAX_DWELL, BASE_DWELL + text * DWELL_PER_CHARACTER);
        timer.current = window.setTimeout(advance, dwell);
      }
    }, 60);
  }, [currentIndex, panels, stop]);

  const play = useCallback(() => {
    if (playingRef.current) return;
    setDone(false);
    playingRef.current = true;
    setPlaying(true);
    timer.current = window.setTimeout(advance, 400);
  }, [advance]);

  useEffect(() => {
    paint();

    const onScroll = () => paint();

    /* Anything the reader does to move the page takes it over — except
       while we are mid-move, when the events are our own doing. */
    const takeOver = (e: Event) => {
      if (!playingRef.current || settling.current) return;
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        const moves = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"];
        if (!moves.includes(k)) return;
      }
      stop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });
    window.addEventListener("keydown", takeOver);
    window.addEventListener("resize", paint);

    /*
     * Autoplay only from the top of an untouched page. Someone who followed
     * a link to a particular year, or came back to where they were, did not
     * ask to be taken on a tour — and reduced motion means never.
     */
    const fresh = window.scrollY < 4 && !window.location.hash;
    let start: number | undefined;
    if (fresh && !prefersReducedMotion()) start = window.setTimeout(play, 1400);
    setOffered(true);

    return () => {
      if (start) window.clearTimeout(start);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      window.removeEventListener("keydown", takeOver);
      window.removeEventListener("resize", paint);
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [paint, play, stop]);

  return (
    <div ref={root} data-cinema={playing ? "playing" : "idle"} className="cinema">
      {children}

      {offered && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-5 px-4 print:hidden">
          <div className="pointer-events-auto flex items-center gap-3 border border-[var(--line)] bg-[var(--bg-raised)]/95 backdrop-blur-sm px-4 py-2 shadow-sm">
            <button
              type="button"
              onClick={playing ? stop : play}
              className="tap-target gap-2 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
            >
              {playing ? (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3">
                    <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3">
                    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
                  </svg>
                  {done ? "Play again" : "Play the history"}
                </>
              )}
            </button>
            <span
              aria-hidden="true"
              className="hidden sm:inline font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--fg-soft)]"
            >
              {playing ? "scroll to take over" : "or scroll"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
