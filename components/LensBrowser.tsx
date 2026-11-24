"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Thumb } from "./Thumb";
import { LENS_MAKERS, lensDateLabel, lensSubtitle, type LensItem } from "@/lib/lens-types";

/**
 * The lenses, arranged by maker, by year, or by series.
 *
 * Three arrangements rather than the accessories' two, because a lens has
 * one more axis people actually think in. "Which Switars were there" is a
 * real question and a common one, and it cuts across both makers and
 * decades.
 *
 * The filter matches the product code as well as the name, which is the
 * whole reason the codes were pulled out of his prose: someone with a lens
 * in their hand reads five letters off the barrel and types those.
 */

type Arrangement = "maker" | "year" | "series";

export function LensBrowser({ items }: { items: readonly LensItem[] }) {
  const [by, setBy] = useState<Arrangement>("maker");
  const [query, setQuery] = useState("");

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.maker.toLowerCase().includes(q) ||
        i.codes.some((c) => c.toLowerCase().includes(q)) ||
        (i.mount ?? "").toLowerCase().includes(q) ||
        (i.gauge ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    if (by === "year") {
      const decades = [
        ...new Set(matching.map((i) => i.decade).filter((d): d is number => d !== null)),
      ].sort((a, b) => a - b);
      return decades.map((decade) => ({
        key: String(decade),
        label: `${decade}s`,
        items: matching
          .filter((i) => i.decade === decade)
          .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.name.localeCompare(b.name)),
      }));
    }

    if (by === "series") {
      const series = [...new Set(matching.map((i) => i.series ?? "Unnamed"))].sort((a, b) =>
        a.localeCompare(b),
      );
      return series.map((name) => ({
        key: name,
        label: name,
        items: matching
          .filter((i) => (i.series ?? "Unnamed") === name)
          .sort((a, b) => (a.year ?? a.decade ?? 9999) - (b.year ?? b.decade ?? 9999)),
      }));
    }

    return LENS_MAKERS.map((maker) => ({
      key: maker,
      label: maker,
      items: matching.filter((i) => i.maker === maker),
    })).filter((g) => g.items.length > 0);
  }, [matching, by]);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-2">
          <Toggle on={by === "maker"} onClick={() => setBy("maker")}>
            By maker
          </Toggle>
          <Toggle on={by === "year"} onClick={() => setBy("year")}>
            By year
          </Toggle>
          <Toggle on={by === "series"} onClick={() => setBy("series")}>
            By series
          </Toggle>
        </div>
        <label className="min-w-[14rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter the lenses</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, code (SWINQ), or description"
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
        <section key={group.key} className="mt-12" aria-label={group.label}>
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            {group.label}
          </h2>
          <ul className="mt-4 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/lenses/${item.slug}`}
                  className="group flex h-full items-start gap-4 bg-[var(--bg)] p-5 transition-colors duration-300 hover:bg-[var(--bg-raised)]"
                >
                  <Thumb src={item.images[0]?.src} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-base font-[560] leading-snug transition-colors group-hover:text-[var(--accent)]">
                      {item.name}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {lensDateLabel(item)}
                      {item.gauge && <> · {item.gauge}</>}
                      {by !== "maker" && <> · {item.maker}</>}
                    </p>
                    {item.codes.length > 0 && (
                      <p className="mt-1.5 flex flex-wrap gap-1.5 font-[family-name:var(--font-mono)] text-[0.62rem]">
                        {item.codes.map((code) => (
                          <span key={code} className="border border-[var(--line)] px-1.5 py-0.5">
                            {code}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
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
