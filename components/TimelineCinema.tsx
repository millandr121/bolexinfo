"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The timeline, played like credits — and the same page when it is not.
 *
 * The central decision: there are not two views here. The slideshow *is* the
 * timeline, scrolled for you. That is what makes taking over seamless —
 * stopping the playback leaves the reader exactly where the animation had
 * reached, because the animation was only moving the page's own scroll
 * position. Nothing has to be handed from one mode to another, and nothing
 * can get out of step.
 *
 * Two things follow from that:
 *
 *  - Scrolling, by any means, simply stops the playback. There is no
 *    "exit animation", because there is nothing to exit.
 *  - With JavaScript off, or motion reduced, the page is an ordinary
 *    chronology and loses nothing.
 *
 * The credits feel comes from a focal band: entries are brightest in the
 * middle of the screen and fade towards both edges. That is applied on every
 * frame while playing and on scroll otherwise, so manual reading has the same
 * texture as the playback rather than looking like a different page.
 */

/**
 * Pixels per second.
 *
 * Set against the measured height of the piece rather than picked. At this
 * speed an unattended playthrough runs a little under two minutes, and an
 * entry spends roughly twelve seconds crossing the screen — unhurried enough
 * to read a long one twice. The earlier 105px/s read as something you were
 * chasing.
 */
const SPEED = 72;

/** How far from the focal line an entry is fully faded. */
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
  const frame = useRef<number | null>(null);
  const carry = useRef(0); // sub-pixel remainder, so slow speeds stay smooth
  const last = useRef(0);
  const programmatic = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [offered, setOffered] = useState(false);
  const [done, setDone] = useState(false);

  /** Brighten what is near the middle of the screen, dim the rest. */
  const paint = useCallback(() => {
    const beats = root.current?.querySelectorAll<HTMLElement>("[data-beat]");
    if (!beats) return;
    const h = window.innerHeight;
    const focus = h * 0.42; // a little above centre reads better than dead centre
    for (const beat of beats) {
      const box = beat.getBoundingClientRect();
      if (box.bottom < -200 || box.top > h + 200) continue;
      const mid = box.top + box.height / 2;
      const away = Math.abs(mid - focus) / h;
      const lit = Math.max(0, 1 - Math.max(0, away - 0.08) / FADE_DISTANCE);
      beat.style.setProperty("--lit", lit.toFixed(3));
    }
  }, []);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setPlaying(false);
  }, []);

  const step = useCallback(
    (now: number) => {
      const dt = last.current ? Math.min(100, now - last.current) : 16;
      last.current = now;

      const want = (SPEED * dt) / 1000 + carry.current;
      const whole = Math.floor(want);
      carry.current = want - whole;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = Math.min(max, window.scrollY + whole);

      if (whole > 0) {
        programmatic.current = true;
        window.scrollTo(0, next);
      }
      paint();

      if (next >= max - 1) {
        setDone(true);
        stop();
        return;
      }
      frame.current = requestAnimationFrame(step);
    },
    [paint, stop],
  );

  const play = useCallback(() => {
    if (frame.current !== null) return;
    setDone(false);
    last.current = 0;
    carry.current = 0;
    setPlaying(true);
    frame.current = requestAnimationFrame(step);
  }, [step]);

  // Playback, and the handover.
  useEffect(() => {
    paint();

    /*
     * Anything the reader does to move the page takes it over. The scroll
     * listener cannot tell our own scrolling from theirs, so our writes set a
     * flag that the very next scroll event clears — every other scroll is
     * someone's own.
     */
    const onScroll = () => {
      if (programmatic.current) {
        programmatic.current = false;
      } else if (frame.current !== null) {
        stop();
      }
      paint();
    };

    const takeOver = (e: Event) => {
      if (frame.current === null) return;
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        const moves = [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
          "Spacebar",
        ];
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
     * Autoplay only from the top of an untouched page. Someone who followed a
     * link to a particular year, or who came back to where they were, did not
     * ask to be taken on a tour — and reduced motion means never.
     */
    const fresh = window.scrollY < 4 && !window.location.hash;
    if (fresh && !prefersReducedMotion()) {
      // A beat before starting, so the first card is read, not missed.
      const id = window.setTimeout(play, 900);
      setOffered(true);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("wheel", takeOver);
        window.removeEventListener("touchstart", takeOver);
        window.removeEventListener("keydown", takeOver);
        window.removeEventListener("resize", paint);
        if (frame.current !== null) cancelAnimationFrame(frame.current);
      };
    }

    setOffered(true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      window.removeEventListener("keydown", takeOver);
      window.removeEventListener("resize", paint);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [paint, play, stop]);

  return (
    <div ref={root} data-cinema={playing ? "playing" : "idle"} className="cinema">
      {children}

      {/*
       * The only control, and it stays in one place rather than appearing and
       * disappearing under the reader's cursor. It is a real button, so it is
       * reachable by keyboard and announces its state; `aria-live` is
       * deliberately absent, because narrating a scroll position to a screen
       * reader is noise.
       */}
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
