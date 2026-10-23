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

type Filter = "all" | "camera" | "projector";

/**
 * Serial identifier.
 *
 * The question a visitor arrives with is "what do I own?", not "what year is
 * this?". So the answer leads with the candidate models — each a tappable
 * route to its page — and reports the year as a quiet line above them rather
 * than a large card competing for attention.
 *
 * When a number matches several models (Paillard reused number blocks across
 * independently numbered series) each candidate carries the physical tells
 * that separate it from the others, so the list can be resolved by looking at
 * the camera in hand instead of opening several pages to compare.
 */
export function SerialLookup({ rows, models }: { rows: SerialRow[]; models: SerialModel[] }) {
  const [raw, setRaw] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const serial = formatSerialInput(raw);
  const active = raw.trim().length > 0 && serial > 0;

  const yearResult = useMemo(() => lookupSerial(serial, rows), [serial, rows]);
  const allMatches = useMemo(() => lookupModels(serial, models), [serial, models]);
  const matches = useMemo(
    () => (filter === "all" ? allMatches : allMatches.filter((m) => m.model.kind === filter)),
    [allMatches, filter],
  );

  const years = [...new Set(yearResult.matches.map((m) => formatYearSpan(m)))];
  const cameraCount = allMatches.filter((m) => m.model.kind === "camera").length;
  const projectorCount = allMatches.filter((m) => m.model.kind === "projector").length;

  const filters: Array<{ id: Filter; label: string; n: number }> = [
    { id: "all", label: "All", n: allMatches.length },
    { id: "camera", label: "Cameras", n: cameraCount },
    { id: "projector", label: "Projectors", n: projectorCount },
  ];

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

      {/* Filters appear only when both kinds actually matched — offering a
          filter that would empty the list is a dead end, not a choice. */}
      {active && cameraCount > 0 && projectorCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter results by kind">
          {filters.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={on}
                className={`tap-target px-4 border text-xs uppercase tracking-[0.12em] transition-colors ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                    : "border-[var(--line)] text-[var(--fg-soft)] hover:border-[var(--accent)]"
                }`}
              >
                {f.label} <span className="opacity-70">{f.n}</span>
              </button>
            );
          })}
        </div>
      )}

      <div aria-live="polite" className="mt-6">
        {active && allMatches.length > 0 && (
          <>
            <p className="text-sm text-[var(--fg-soft)]">
              {years.length > 0 && (
                <>
                  Serial{" "}
                  <span className="font-[family-name:var(--font-mono)] text-[var(--fg)]">
                    {serial.toLocaleString()}
                  </span>{" "}
                  dates to{" "}
                  <span className="font-[family-name:var(--font-mono)] text-[var(--fg)]">
                    {years.join(" or ")}
                  </span>
                  {" · "}
                </>
              )}
              {matches.length} possible {matches.length === 1 ? "model" : "models"}
              {matches.length > 1 && " — compare the tells below to narrow it down"}
            </p>

            <ul className="mt-4 grid gap-px bg-[var(--line)] border border-[var(--line)]">
              {matches.map(({ model, row }) => (
                <li key={model.slug}>
                  <Link
                    href={model.href}
                    className="group block bg-[var(--bg)] px-5 py-4 hover:bg-[var(--bg-raised)] transition-colors duration-200"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-[family-name:var(--font-display)] text-xl font-[560] group-hover:text-[var(--accent)] transition-colors">
                        {model.name}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--fg-soft)] shrink-0">
                        {model.kind} · {formatYearSpan(row)}
                      </span>
                    </div>

                    {model.tells.length > 0 && (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Distinguishing features">
                        {model.tells.map((t) => (
                          <li
                            key={t}
                            className="border border-[var(--line)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[0.62rem] text-[var(--fg-soft)]"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.68rem] text-[var(--fg-soft)]">
                      Documented range {row.from!.toLocaleString()}–{row.to!.toLocaleString()}
                      <span className="reveal-on-hover ml-2 text-[var(--accent)]">See the full model →</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* A dated serial that no model page covers is still a real answer. */}
        {active && allMatches.length === 0 && yearResult.matches.length > 0 && (
          <div className="border border-[var(--line)] bg-[var(--bg-raised)] p-6">
            <p className="font-[family-name:var(--font-display)] text-2xl font-[560]">{years.join(" or ")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)]">
              The master table dates this serial, but no individual model page published a range
              covering it — the year is documented, the model is not.
            </p>
          </div>
        )}

        {active && allMatches.length === 0 && yearResult.matches.length === 0 && (
          <div className="border border-[var(--line)] p-6">
            <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
              Nothing documented covers{" "}
              <span className="font-[family-name:var(--font-mono)]">{serial.toLocaleString()}</span>.
              {yearResult.nearest && (
                <>
                  {" "}
                  The nearest recorded range is{" "}
                  <span className="font-[family-name:var(--font-mono)]">
                    {yearResult.nearest.row.from!.toLocaleString()}–
                    {yearResult.nearest.row.to!.toLocaleString()}
                  </span>{" "}
                  ({formatYearSpan(yearResult.nearest.row)}).
                </>
              )}
            </p>
          </div>
        )}

        {!active && (
          <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
            The serial is stamped on the body — on H-series cameras, inside the film chamber or on
            the base. Type the digits and the matching models appear here.
          </p>
        )}
      </div>
    </div>
  );
}
