"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SerialRow } from "@/lib/museum";
import {
  formatSerialInput,
  formatYearSpan,
  lookupModels,
  lookupSerial,
  type SerialModel,
} from "@/lib/serials";

/**
 * Instant, as-you-type serial lookup. Pure client-side computation over the
 * statically embedded tables — no network round-trip, no layout shift.
 *
 * Two answers are given: the year, from the master table published in the
 * serial-numbers article, and the specific models that documented this serial
 * in their own range tables, each linking to its page.
 */
export function SerialLookup({ rows, models }: { rows: SerialRow[]; models: SerialModel[] }) {
  const [raw, setRaw] = useState("");
  const serial = formatSerialInput(raw);
  const result = useMemo(() => lookupSerial(serial, rows), [serial, rows]);
  const modelMatches = useMemo(() => lookupModels(serial, models), [serial, models]);
  const active = raw.trim().length > 0 && serial > 0;

  return (
    <div>
      <label
        htmlFor="serial-input"
        className="block font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]"
      >
        Serial number
      </label>
      <input
        id="serial-input"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="e.g. 188400"
        className="mt-2 w-full border border-[var(--line)] bg-[var(--bg-raised)] px-5 py-4 font-[family-name:var(--font-mono)] text-2xl tracking-wide outline-none focus:border-[var(--accent)] transition-colors"
      />

      <div aria-live="polite" className="mt-6 min-h-24">
        {active && result.matches.length > 0 && (
          <>
            {result.matches.map((m) => (
              <div
                key={`${m.yearFrom}-${m.from}`}
                className="border border-[var(--line)] bg-[var(--bg-raised)] p-6 mb-3"
              >
                <p className="font-[family-name:var(--font-display)] text-3xl font-[560]">
                  {formatYearSpan(m)}
                  <span className="ml-3 text-base text-[var(--fg-soft)] font-normal">
                    {m.position < 0.33 ? "early" : m.position < 0.66 ? "mid" : "late"} in the run
                  </span>
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-soft)]">
                  Master range {m.from!.toLocaleString()} – {m.to!.toLocaleString()}
                </p>
              </div>
            ))}
            {result.matches.length > 1 && (
              <p className="mb-4 text-sm text-[var(--fg-soft)]">
                Paillard numbered some series independently, so more than one year can apply to
                the same number. The models below narrow it down.
              </p>
            )}
          </>
        )}

        {active && modelMatches.length > 0 && (
          <section aria-label="Matching models" className="mt-6">
            <h3 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              Documented on {modelMatches.length} model{modelMatches.length === 1 ? "" : "s"}
            </h3>
            <ul className="mt-3 grid gap-px bg-[var(--line)] border border-[var(--line)]">
              {modelMatches.map(({ model, row }) => (
                <li key={model.slug}>
                  <Link
                    href={model.href}
                    className="group flex items-baseline justify-between gap-4 bg-[var(--bg)] px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors duration-200"
                  >
                    <span>
                      <span className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors">
                        {model.name}
                      </span>
                      {model.format && (
                        <span className="ml-3 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
                          {model.format}
                        </span>
                      )}
                      <span className="block mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                        {formatYearSpan(row)} · this model&rsquo;s range{" "}
                        {row.from!.toLocaleString()}–{row.to!.toLocaleString()}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {active && result.matches.length > 0 && modelMatches.length === 0 && (
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            No individual model page published a range covering this serial — only the master
            table does. The year above still applies.
          </p>
        )}

        {active && result.matches.length === 0 && result.nearest && (
          <div className="border border-[var(--line)] p-6">
            <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
              No documented range contains{" "}
              <span className="font-[family-name:var(--font-mono)]">{serial.toLocaleString()}</span>. The
              nearest is{" "}
              <span className="font-[family-name:var(--font-mono)]">
                {result.nearest.row.from!.toLocaleString()}–{result.nearest.row.to!.toLocaleString()}
              </span>{" "}
              ({formatYearSpan(result.nearest.row)}), {result.nearest.distance.toLocaleString()} away.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
