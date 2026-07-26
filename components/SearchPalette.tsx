"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
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
      if (e.key === "Escape") setOpen(false);
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      }),
    [docs],
  );

  const results = useMemo(() => {
    if (!query.trim()) return docs.slice(0, 8).map((item) => ({ item }));
    return fuse.search(query, { limit: 12 });
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.15 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[14vh] px-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search the archive"
        initial={{ opacity: 0, y: reduceMotion ? 0 : -10, scale: reduceMotion ? 1 : 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-xl bg-[var(--bg-raised)] border border-[var(--line)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search cameras, serials, lenses, articles…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `result-${active}` : undefined}
          className="w-full bg-transparent px-5 py-4 text-base outline-none border-b border-[var(--line)] placeholder:text-[var(--fg-soft)]"
        />
        <ul id="search-results" role="listbox" aria-label="Search results" className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-5 py-6 text-sm text-[var(--fg-soft)]">
              Nothing found{query ? ` for “${query}”` : ""}.
            </li>
          )}
          {results.map(({ item }, i) => (
            <li key={item.href} id={`result-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item.href)}
                className={`w-full text-left px-5 py-2.5 flex items-baseline justify-between gap-4 ${
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
      </motion.div>
    </motion.div>
  );
}
