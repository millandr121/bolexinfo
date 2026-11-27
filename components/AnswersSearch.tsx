"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  prepare,
  search,
  archiveUrl,
  sourceName,
  withoutTitleEcho,
  type AnswerIndex,
  type Answer,
} from "@/lib/answers";

/**
 * Searching what other people worked out.
 *
 * The index is about nine hundred kilobytes gzipped, which is fine to
 * fetch when somebody has come to this page to use it and quite wrong
 * to put on every page load. So it is fetched here, once, on mount,
 * and the component says plainly what it is doing while it waits —
 * nothing is worse than a search box that silently ignores you for
 * two seconds.
 *
 * `prepare` tokenises the whole corpus and takes about a fifth of a
 * second. It runs once, memoised, and every keystroke after that is a
 * millisecond or two.
 */

const EXAMPLES = [
  "light leak in the door",
  "how to clean the prism",
  "spring motor runs slow",
  "what does a CLA cost",
  "rex 5 vs rex 4",
];

export function AnswersSearch() {
  const [index, setIndex] = useState<AnswerIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);

  /*
   * ?q= read in the browser rather than from searchParams.
   *
   * The site is a static export, so there are no request-time search
   * params to hand a server component: every page is one file, built
   * once. Reading it here on mount is the only way a link from the
   * palette can arrive with its query already in the box, and it
   * costs one render.
   */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setQuery(q);
    } catch {
      /* A URL this browser will not parse is not worth a broken page. */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/answers-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: AnswerIndex) => !cancelled && setIndex(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const prepared = useMemo(() => (index ? prepare(index) : null), [index]);
  const results = useMemo(
    () => (prepared && query.trim() ? search(prepared, query, { limit: 40 }) : []),
    [prepared, query],
  );

  const searching = query.trim().length > 0;

  return (
    <div>
      <div className="relative">
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the problem, or name the part"
          aria-label="Search what people worked out"
          autoFocus
          className="w-full border border-[var(--line)] bg-[var(--bg-raised)] px-4 py-4 text-lg outline-none focus:border-[var(--accent)]"
        />
      </div>

      <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
        {failed
          ? "The index could not be loaded. Try again in a moment."
          : !index
            ? "Reading the forums…"
            : searching
              ? `${results.length === 40 ? "40+" : results.length} ${results.length === 1 ? "passage" : "passages"}`
              : `${index.docs.length.toLocaleString()} passages from ${index.threads.length.toLocaleString()} conversations`}
      </p>

      {!searching && index && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <li key={e}>
              <button
                type="button"
                onClick={() => {
                  setQuery(e);
                  input.current?.focus();
                }}
                className="border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--fg-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
      )}

      {searching && index && results.length === 0 && (
        <p className="mt-8 leading-relaxed text-[var(--fg-soft)]">
          Nothing matched. The corpus is two forums and not the whole internet, so a word
          nobody there used finds nothing; try the part, the model, or what went wrong.
        </p>
      )}

      <ol className="mt-8 space-y-px">
        {results.map((answer, i) => (
          <AnswerCard key={`${answer.url}-${i}`} answer={answer} />
        ))}
      </ol>
    </div>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  const mirror = archiveUrl(answer.url, answer.source);
  return (
    <li className="border border-[var(--line)] bg-[var(--bg-raised)] p-5">
      <a
        href={answer.url}
        target="_blank"
        rel="noreferrer"
        className="line-clamp-2 font-[family-name:var(--font-display)] text-lg font-[560] leading-snug hover:text-[var(--accent)]"
      >
        {answer.thread}
        <span aria-hidden="true" className="ml-1.5 align-middle text-[0.6em] text-[var(--accent)]">
          ↗
        </span>
      </a>

      <blockquote className="mt-3 border-l-2 border-[var(--line)] pl-4 leading-relaxed text-[var(--fg-soft)]">
        {withoutTitleEcho(answer.text, answer.thread)}
      </blockquote>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-[family-name:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
        <span className="text-[var(--fg)]">{answer.author}</span>
        {answer.date && <span>{answer.date}</span>}
        <span className="text-[var(--accent)]">{sourceName(answer.source)}</span>
        {/* The copy that outlives the thread. See archiveUrl. */}
        {mirror && (
          <a
            href={mirror}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] hover:text-[var(--accent)]"
          >
            Archived copy
          </a>
        )}
      </p>
    </li>
  );
}
