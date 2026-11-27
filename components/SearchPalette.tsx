"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  prepare,
  search as searchAnswers,
  sourceName,
  withoutTitleEcho,
  type AnswerIndex,
  type Answer,
} from "@/lib/answers";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface SearchDoc {
  title: string;
  href: string;
  section: string;
  keywords?: string;
  summary?: string;
}

/**
 * Spotlight-style command palette: ⌘K / Ctrl-K, fuzzy + typo-tolerant via
 * Fuse.js over a statically generated index, full keyboard navigation.
 */
export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-1.5 text-xs text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--fg)] transition-colors duration-200"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline font-[family-name:var(--font-mono)] text-[0.65rem] border border-[var(--line)] px-1 rounded-sm">
          ⌘K
        </kbd>
      </button>
      <AnimatePresence>{open && <Palette onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const answers = useAnswers(query);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    inputRef.current?.focus();
    let cancelled = false;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: SearchDoc[]) => !cancelled && setDocs(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Escape closes from anywhere, including when focus has left the input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Hold the page still while the palette owns the screen.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "keywords", weight: 0.3 },
          { name: "summary", weight: 0.15 },
          { name: "section", weight: 0.05 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        /* Needed by the question filter below: without it Fuse
           returns no score at all and every hit looks like a perfect
           one. */
        includeScore: true,
      }),
    [docs],
  );

  /*
   * Fewer pages when the query is a sentence.
   *
   * Fuse is tuned for "h16 rex" — a name being typed, where a loose
   * threshold is what makes it forgiving of a typo. Give it "light
   * leak in the door" and that same looseness returns Lileks,
   * Filmshooting and Solid!, which are ephemera titles sharing a few
   * letters with the words and answering nothing. A question is not a
   * page title, so past three words the page list is cut to the few
   * that might really be meant, and the forum passages below get the
   * room they deserve.
   */
  const results = useMemo(() => {
    const words = query.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return docs.slice(0, 8).map((item) => ({ item }));
    /*
     * Sliced here rather than through Fuse's `limit`, which this
     * version ignores: a limit of twelve returned seventeen hits.
     *
     * Three words or more is a question rather than a name being
     * typed, and a question is what the forum passages below are for.
     * Fuse is tuned to be forgiving of a typo in "h16 rex", and that
     * same looseness answers "light leak in the door" with Lileks and
     * Filmshooting — ephemera titles sharing a few letters and
     * nothing else. So a question gets a short list of pages and the
     * quotations get the room.
     */
    return fuse.search(query).slice(0, words.length >= 3 ? 4 : 12);
  }, [query, fuse, docs]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].item.href);
    }
  };

  if (!mounted) return null;

  /*
   * Rendered through a portal to document.body on purpose. The site header
   * uses `backdrop-blur`, and a backdrop-filter establishes a containing block
   * for fixed-position descendants — so an overlay rendered inside the header
   * would size itself to the header strip rather than the viewport, leaving
   * most of the page un-clickable and the palette impossible to dismiss by
   * clicking away. The portal escapes that containing block entirely.
   */
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.15 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-stretch sm:items-start justify-center sm:pt-[14vh] sm:px-4"
      onMouseDown={onClose}
    >
      {/*
       * Full-height sheet on phones, floating panel on desktop. A centred
       * dialog is the wrong shape for a phone: the on-screen keyboard claims
       * roughly the lower half, so a panel floating in the middle ends up
       * squeezed into a sliver with its results hidden behind the keyboard.
       * Occupying the full height keeps the field anchored at the top and
       * gives the list every pixel the keyboard leaves.
       */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search the archive"
        initial={{ opacity: 0, y: reduceMotion ? 0 : -10, scale: reduceMotion ? 1 : 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full sm:max-w-xl flex flex-col bg-[var(--bg-raised)] sm:border border-[var(--line)] shadow-2xl safe-top"
        // Stop clicks inside the panel from reaching the dismissing backdrop.
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[var(--line)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search cameras, serials, lenses, ephemera…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `result-${active}` : undefined}
            className="flex-1 bg-transparent px-5 py-4 text-base outline-none placeholder:text-[var(--fg-soft)]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="px-4 py-4 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--fg-soft)] hover:text-[var(--accent)]"
          >
            Esc
          </button>
        </div>
        <div className="flex-1 sm:flex-none sm:max-h-[60vh] overflow-y-auto overscroll-contain safe-bottom">
        <ul
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="py-1"
        >
          {results.length === 0 && answers.length === 0 && (
            <li className="px-5 py-6 text-sm text-[var(--fg-soft)]">
              Nothing found{query ? ` for “${query}”` : ""}.
            </li>
          )}
          {results.map(({ item }, i) => (
            /*
              Keyed by position, not by href.
              
              193 of the 806 indexed pages share an href with another
              — /projectors alone is in there 28 times — and a
              duplicate key stops React reconciling the list. It left
              seventeen rows on screen for a result set of none,
              which looked like the filter below failing and was
              really the list never being emptied. The builder
              deduplicates now as well; this is the belt.
            */
            <li key={`${item.href}-${i}`} id={`result-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item.href)}
                className={`w-full text-left px-5 py-3.5 min-h-[44px] flex items-baseline justify-between gap-4 ${
                  i === active ? "bg-[var(--accent)] text-[var(--bg)]" : ""
                }`}
              >
                <span className="text-sm">{item.title}</span>
                <span
                  className={`text-[0.65rem] uppercase tracking-[0.15em] font-[family-name:var(--font-mono)] ${
                    i === active ? "opacity-80" : "text-[var(--fg-soft)]"
                  }`}
                >
                  {item.section}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/*
          What people worked out, under what the archive wrote.
          Pages first, always: somebody typing "h16 rex 5" wants the
          model page, not an argument about one from 2011. These are
          the answer to the other kind of query, the one phrased as a
          problem, and they are quotations rather than destinations —
          so they are listed apart rather than mixed into the keyboard
          run above.
        */}
        {answers.length > 0 && (
          <div className="border-t border-[var(--line)]">
            <p className="px-5 pt-3.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]">
              What people worked out
            </p>
            <ul className="py-1">
              {answers.map((a, i) => (
                <li key={`${a.url}-${i}`}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-5 py-3 hover:bg-[var(--bg)]"
                  >
                    <span className="line-clamp-2 text-sm leading-snug text-[var(--fg-soft)]">
                      &ldquo;{withoutTitleEcho(a.text, a.thread)}&rdquo;
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                      <span className="text-[var(--fg)]">{a.author}</span>
                      {a.date && <span>{a.date}</span>}
                      <span className="text-[var(--accent)]">{sourceName(a.source)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => go(`/answers?q=${encodeURIComponent(query)}`)}
              className="w-full px-5 py-3 text-left font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--accent)] hover:bg-[var(--bg)]"
            >
              Search all of it →
            </button>
          </div>
        )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/**
 * The forum corpus, fetched once and only when it is wanted.
 *
 * The index is the better part of a megabyte, which is the right
 * weight for a page built around it and quite wrong for a palette
 * somebody opened to jump to /cameras. So nothing is fetched until a
 * query is long enough to be a question rather than the beginning of
 * a model name, and once fetched it is kept for the life of the tab.
 *
 * The cache lives outside the component on purpose: the palette
 * unmounts every time it closes, and a reader who opens it twice
 * should not download the corpus twice.
 */
let cached: AnswerIndex | null = null;
let inFlight: Promise<AnswerIndex | null> | null = null;

function loadAnswers(): Promise<AnswerIndex | null> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = fetch("/answers-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AnswerIndex | null) => (cached = data))
      .catch(() => null);
  }
  return inFlight;
}

/** Long enough to be a question. Below this it is a model name being
 *  typed, and the pages above already answer that. */
const MIN_QUERY = 5;

function useAnswers(query: string): Answer[] {
  const [index, setIndex] = useState<AnswerIndex | null>(cached);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY || index) return;
    /* A short wait so a fast typist does not start the download on
       the way past five characters. */
    const timer = setTimeout(() => {
      let cancelled = false;
      void loadAnswers().then((data) => !cancelled && data && setIndex(data));
      return () => {
        cancelled = true;
      };
    }, 180);
    return () => clearTimeout(timer);
  }, [query, index]);

  const prepared = useMemo(() => (index ? prepare(index) : null), [index]);

  return useMemo(() => {
    if (!prepared || query.trim().length < MIN_QUERY) return [];
    return searchAnswers(prepared, query, { limit: 3, perThread: 1 });
  }, [prepared, query]);
}
