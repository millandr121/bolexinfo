"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Thumb } from "./Thumb";
import { ACCESSORY_TYPES, type AccessoryItem } from "@/lib/accessory-types";

/**
 * The accessories, arranged either way.
 *
 * Two questions bring people here and they want opposite orderings. "What
 * did Bolex make for holding a camera steady" wants everything of a type
 * together. "I have this thing and I think it is from the fifties" wants
 * everything of a period together. The old site could only answer the first,
 * because its pages were the grouping.
 *
 * A filter box as well, because 98 objects is more than a page you can scan,
 * and because the names are the kind of thing people half-remember —
 * Rexofader, Octameter, Declic. It matches names and descriptions both, so
 * searching "underwater" finds the housing even though the word is not in
 * its name.
 */

type Arrangement = "type" | "year";

function dateLabel(item: AccessoryItem): string {
  if (item.year) return String(item.year);
  return item.decade ? `${item.decade}s` : "Date not known";
}

export function AccessoryBrowser({ items }: { items: readonly AccessoryItem[] }) {
  const [by, setBy] = useState<Arrangement>("type");
  const [query, setQuery] = useState("");

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    if (by === "year") {
      const decades = [
        ...new Set(matching.map((i) => i.decade).filter((d): d is number => d !== null)),
      ].sort((a, b) => a - b);
      const out = decades.map((decade) => ({
        key: String(decade),
        label: `${decade}s`,
        items: matching
          .filter((i) => i.decade === decade)
          .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.name.localeCompare(b.name)),
      }));
      /* Anything with no decade at all — the entries this archive added —
         goes last under its own heading rather than being dropped. */
      const undated = matching.filter((i) => i.decade === null);
      if (undated.length) {
        out.push({ key: "undated", label: "Added by this archive", items: undated });
      }
      return out;
    }

    const order = [...ACCESSORY_TYPES, "Added by this archive"];
    return order
      .map((type) => ({
        key: type,
        label: type,
        items: matching.filter((i) => i.type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [matching, by]);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-2">
          <Toggle on={by === "type"} onClick={() => setBy("type")}>
            By type
          </Toggle>
          <Toggle on={by === "year"} onClick={() => setBy("year")}>
            By year
          </Toggle>
        </div>
        <label className="min-w-[14rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter the accessories</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name or description"
            className="w-full border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm"
          />
        </label>
      </div>

      {query && (
        <p
          aria-live="polite"
          className="mt-4 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]"
        >
          {matching.length === 0
            ? "Nothing matches that"
            : `${matching.length} of ${items.length}`}
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
                  href={`/accessories/${item.slug}`}
                  className="group flex h-full items-start gap-4 bg-[var(--bg)] p-5 transition-colors duration-300 hover:bg-[var(--bg-raised)]"
                >
                  <Thumb src={item.images[0]?.src} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] transition-colors group-hover:text-[var(--accent)]">
                      {item.name}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {dateLabel(item)}
                      {by === "year" && item.type !== "Added by this archive" && (
                        <> · {item.type}</>
                      )}
                    </p>
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
