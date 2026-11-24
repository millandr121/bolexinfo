"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PricedItem } from "@/lib/prices";

/**
 * Look up one thing and see what it cost.
 *
 * This is the front of the prices page because it answers the question
 * people actually arrive with. They are holding a camera, or thinking
 * about buying one, and they want a number for that object — not a
 * chart of the whole catalogue. The chart is a good thing to find
 * afterwards; it is a bad thing to be met by.
 *
 * Every figure is US dollars and says so, in the heading, in the column
 * and again under the table. The prices come from American price lists
 * and a reader in Melbourne or Milan has no reason to assume that.
 */

const SECTIONS = [
  { id: "all", label: "Everything" },
  { id: "cameras", label: "Cameras" },
  { id: "lenses", label: "Lenses" },
  { id: "accessories", label: "Accessories" },
  { id: "projectors", label: "Projectors" },
] as const;

function usd(value: number): string {
  return `US$${Math.round(value).toLocaleString("en-US")}`;
}

/** "US$178.50" — cents kept, because the lists printed them. */
function exact(value: number): string {
  return `US$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PriceFinder({
  items,
  baseYear,
}: {
  items: readonly PricedItem[];
  baseYear: number;
}) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<(typeof SECTIONS)[number]["id"]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (section !== "all" && item.section !== section) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.prices.some((p) => p.asPrinted.toLowerCase().includes(q))
      );
    });
  }, [items, query, section]);

  return (
    <section className="mt-10" aria-labelledby="finder">
      <h2 id="finder" className="sr-only">
        Look up what something cost
      </h2>

      <label className="block">
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Look something up
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="H-16, Switar, matte box, Unimotor…"
          className="mt-3 w-full border border-[var(--line)] bg-[var(--bg-raised)] px-4 py-3 font-[family-name:var(--font-mono)] text-base"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            aria-pressed={section === s.id}
            className={`border px-2.5 py-1 font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] transition-colors ${
              section === s.id
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                : "border-[var(--line)] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p
        aria-live="polite"
        className="mt-4 font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]"
      >
        {matching.length === 0
          ? "Nothing with a recorded price matches that"
          : `${matching.length} of ${items.length} · all figures US dollars`}
      </p>

      {matching.length > 0 && (
        <ul className="mt-4 border-t border-[var(--line)]">
          {matching.map((item) => {
            const several = item.prices.length > 1;
            const overTime = item.first.date !== item.last.date;
            const sorted = [...item.prices].sort((a, b) => a.nominal - b.nominal);
            const cheapest = overTime ? item.first : sorted[0]!;
            const dearest = overTime ? item.last : sorted[sorted.length - 1]!;
            const isOpen = open === item.slug;
            return (
              <li key={item.slug} className="border-b border-[var(--line)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.href}
                      className="font-[family-name:var(--font-display)] text-base font-[560] transition-colors hover:text-[var(--accent)]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {item.first.date}
                      {overTime && ` → ${item.last.date}`}
                      {!overTime && several && ` · ${item.prices.length} versions`}
                    </p>
                  </div>

                  <div className="text-right">
                    {/*
                      An arrow means the price changed over time. Several
                      prices on one date are variants of the same thing —
                      an outfit with a different lens in it — so those get
                      a plain range, because an arrow would claim a
                      movement that never happened.
                    */}
                    <p className="font-[family-name:var(--font-mono)] text-sm">
                      {exact(cheapest.nominal)}
                      {dearest.nominal !== cheapest.nominal && (
                        <span className={overTime ? "text-[var(--fg-soft)]" : ""}>
                          {overTime ? " → " : "–"}
                          {exact(dearest.nominal)}
                        </span>
                      )}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--fg-soft)]">
                      {/*
                        Low to high, always. The same nominal price in two
                        years adjusts to two different figures, and the
                        earlier one is the larger, so following the
                        nominal order would print a range backwards.
                      */}
                      about {usd(Math.min(cheapest.adjusted, dearest.adjusted))}
                      {Math.round(dearest.adjusted) !== Math.round(cheapest.adjusted) &&
                        ` to ${usd(Math.max(cheapest.adjusted, dearest.adjusted))}`}{" "}
                      in {baseYear} money
                    </p>
                  </div>
                </div>

                {/*
                 * The detail is folded away because most rows are one
                 * price and one document, and the few that are not
                 * would otherwise bury the rest.
                 */}
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.slug)}
                  aria-expanded={isOpen}
                  className="mb-3 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
                >
                  {isOpen
                    ? "Hide"
                    : several
                      ? `${item.prices.length} ${overTime ? "listings" : "versions"}, and where from`
                      : "Where this comes from"}
                </button>

                {isOpen && (
                  <ul className="mb-4 space-y-2 border-l-2 border-[var(--line)] pl-4">
                    {item.prices.map((p) => (
                      <li
                        key={`${p.year}-${p.doc}-${p.asPrinted}`}
                        className="font-[family-name:var(--font-mono)] text-[0.68rem] leading-relaxed"
                      >
                        <span className="text-[var(--fg)]">{exact(p.nominal)}</span>
                        <span className="text-[var(--fg-soft)]">
                          {" · "}
                          {p.date} · about {usd(p.adjusted)} today · listed as &ldquo;
                          {p.asPrinted}&rdquo; ·{" "}
                          <a
                            href={`https://www.pacificrimcamera.com/rl/${p.doc}/${p.doc}.pdf`}
                            target="_blank"
                            rel="noreferrer nofollow"
                            className="text-[var(--accent)] underline underline-offset-4"
                          >
                            the list ↗
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
