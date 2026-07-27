"use client";

import { useMemo, useState } from "react";
import type { SerialRow } from "@/lib/museum";
import { formatSerialInput, formatYearSpan, lookupSerial } from "@/lib/serials";

/**
 * Instant, as-you-type serial lookup. Pure client-side computation over the
 * statically embedded range table — no network round-trip, no layout shift.
 */
export function SerialLookup({ rows }: { rows: SerialRow[] }) {
  const [raw, setRaw] = useState("");
  const serial = formatSerialInput(raw);
  const result = useMemo(() => lookupSerial(serial, rows), [serial, rows]);
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
            {result.matches.length > 1 && (
              <p className="mb-3 text-sm text-[var(--fg-soft)]">
                This serial falls in {result.matches.length} documented ranges — Paillard numbered some
                model series independently, so more than one year can apply. Narrow it down by the model.
              </p>
            )}
            {result.matches.map((m) => (
              <div key={`${m.yearFrom}-${m.from}`} className="border border-[var(--line)] bg-[var(--bg-raised)] p-6 mb-3">
                <p className="font-[family-name:var(--font-display)] text-3xl font-[560]">
                  {formatYearSpan(m)}
                  <span className="ml-3 text-base text-[var(--fg-soft)] font-normal">
                    {m.position < 0.33 ? "early" : m.position < 0.66 ? "mid" : "late"} in the run
                  </span>
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-soft)]">
                  Range {m.from!.toLocaleString()} – {m.to!.toLocaleString()}
                </p>
              </div>
            ))}
          </>
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
