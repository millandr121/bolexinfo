"use client";

import { useMemo, useState } from "react";
import type { SerialRange } from "@/lib/content";
import { formatSerial, lookupSerial } from "@/lib/serials";

/**
 * Instant, as-you-type serial lookup. Pure client-side computation over the
 * statically embedded range table — no network round-trip, no layout shift.
 */
export function SerialLookup({ ranges }: { ranges: SerialRange[] }) {
  const [raw, setRaw] = useState("");
  const serial = formatSerial(raw);
  const result = useMemo(() => lookupSerial(serial, ranges), [serial, ranges]);

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
        placeholder="e.g. 100240"
        className="mt-2 w-full border border-[var(--line)] bg-[var(--bg-raised)] px-5 py-4 font-[family-name:var(--font-mono)] text-2xl tracking-wide outline-none focus:border-[var(--accent)] transition-colors"
      />

      <div aria-live="polite" className="mt-6 min-h-24">
        {raw.trim().length > 0 && serial > 0 && (
          <>
            {result.matches.map((match) => (
              <div key={`${match.year}-${match.from}`} className="border border-[var(--line)] bg-[var(--bg-raised)] p-6 mb-3">
                <p className="font-[family-name:var(--font-display)] text-3xl font-[560]">
                  {match.year}
                  <span className="ml-3 text-base text-[var(--fg-soft)] font-normal">
                    {match.position < 0.33 ? "early" : match.position < 0.66 ? "mid" : "late"} in the
                    year&rsquo;s production run
                  </span>
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-soft)]">
                  Range {match.from.toLocaleString()} – {match.to.toLocaleString()}
                  {match.series ? ` · ${match.series}` : ""}
                </p>
                {match.note && <p className="mt-2 text-xs text-[var(--fg-soft)]">{match.note}</p>}
              </div>
            ))}
            {result.matches.length === 0 && result.nearest && (
              <div className="border border-[var(--line)] p-6">
                <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
                  No documented range contains{" "}
                  <span className="font-[family-name:var(--font-mono)]">{serial.toLocaleString()}</span>.
                  The nearest documented range is{" "}
                  <span className="font-[family-name:var(--font-mono)]">
                    {result.nearest.range.from.toLocaleString()}–{result.nearest.range.to.toLocaleString()}
                  </span>{" "}
                  ({result.nearest.range.year}), {result.nearest.distance.toLocaleString()} away.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
