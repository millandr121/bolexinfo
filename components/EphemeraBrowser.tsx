"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  EPHEMERA_TYPES,
  ephemeraDateLabel,
  type EphemeraItem,
} from "@/lib/ephemera-types";

/**
 * 171 pieces of paper, arranged by kind or by year.
 *
 * The old index could only group by kind, which meant the only way to
 * find the advertising from a given year was to open pages until one
 * matched. The dates were in Michael's descriptions all along.
 *
 * Undated pieces are not hidden under the year view. They go last, under
 * their decade, because "we know it is 1950s advertising and no more" is
 * the honest state of most of this collection and burying it would make
 * the archive look more complete than it is.
 */

type Arrangement = "type" | "year";

export function EphemeraBrowser({ items }: { items: readonly EphemeraItem[] }) {
  const [by, setBy] = useState<Arrangement>("type");
  const [query, setQuery] = useState("");

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        String(i.year ?? "").includes(q),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    if (by === "year") {
      const years = [...new Set(matching.map((i) => i.year).filter((y): y is number => !!y))].sort(
        (a, b) => a - b,
      );
      const out = years.map((year) => ({
        key: String(year),
        label: String(year),
        items: matching.filter((i) => i.year === year),
      }));

      const undated = matching.filter((i) => !i.year);
      for (const decade of [...new Set(undated.map((i) => i.decade))].sort(
        (a, b) => (a ?? 0) - (b ?? 0),
      )) {
        out.push({
          key: `undated-${decade}`,
          label: decade ? `${decade}s, no year recorded` : "No date recorded",
          items: undated.filter((i) => i.decade === decade),
        });
      }
      return out;
    }

    return EPHEMERA_TYPES.map((type) => ({
      key: type,
      label: type,
      items: matching.filter((i) => i.type === type),
    })).filter((g) => g.items.length > 0);
  }, [matching, by]);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-2">
          <Toggle on={by === "type"} onClick={() => setBy("type")}>
            By kind
          </Toggle>
          <Toggle on={by === "year"} onClick={() => setBy("year")}>
            By year
          </Toggle>
        </div>
        <label className="min-w-[14rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter the ephemera</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by title, year or subject"
            className="w-full border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm"
          />
        </label>
      </div>

      {query && (
        <p
          aria-live="polite"
          className="mt-4 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]"
        >
          {matching.length === 0 ? "Nothing matches that" : `${matching.length} of ${items.length}`}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.key} className="mt-14" aria-label={group.label}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {group.label}
            </h2>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
              {group.items.length}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/ephemera/${item.slug}`}
                  className="group flex h-full flex-col bg-[var(--bg)] p-4 transition-colors duration-300 hover:bg-[var(--bg-raised)]"
                >
                  {item.cover && (
                    <div className="document mb-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.cover}
                        alt={item.title}
                        loading="lazy"
                        className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <h3 className="font-[family-name:var(--font-display)] text-sm font-[560] leading-snug transition-colors group-hover:text-[var(--accent)]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {ephemeraDateLabel(item)}
                    {by === "year" && <> · {item.type}</>}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] transition-colors ${
        on
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
          : "border-[var(--line)] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}
