"use client";

import { useId, useMemo, useState } from "react";
import type { PriceSeries } from "@/lib/prices";

/**
 * What Paillard charged, over the years it charged it.
 *
 * A line per thing, because the job is change over time. Only things the
 * archive can follow across more than one dated price list are drawn: a
 * line between one point and nothing is not a trend, and everything else
 * is in the table below.
 *
 * Two readings, and the toggle matters more than it looks. In dollars of
 * the day the story is that almost nothing moved until the 1970s. In
 * today's money the same figures show the opposite — a steady fall
 * through the 1960s as wages rose and the price stood still — and then
 * the same sharp climb. Neither reading alone is honest, so both are
 * here and the adjusted one is the default, because that is the one a
 * reader can actually feel.
 *
 * The five colours are not decorative. They were run through a
 * colour-vision validator against this site's own paper and night
 * surfaces: both sets clear the lightness band, the chroma floor, the
 * deuteranope and protanope separation, and contrast. Dark mode gets its
 * own steps rather than a flip, which is why there are two lists.
 */

type Mode = "adjusted" | "nominal";

const PAD = { top: 18, right: 150, bottom: 34, left: 56 };
const W = 760;
const H = 330;

function money(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function PriceChart({
  series,
  baseYear,
}: {
  series: readonly PriceSeries[];
  /** The year the adjusted figures are expressed in. */
  baseYear: number;
}) {
  const [mode, setMode] = useState<Mode>("adjusted");
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const uid = useId().replace(/:/g, "");

  const value = (p: PriceSeries["points"][number]) =>
    mode === "adjusted" ? p.adjusted : p.nominal;

  const { years, maxValue } = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    return {
      years: [...new Set(all.map((p) => p.year))].sort((a, b) => a - b),
      maxValue: Math.max(...all.map((p) => (mode === "adjusted" ? p.adjusted : p.nominal))),
    };
  }, [series, mode]);

  const minYear = years[0]!;
  const maxYear = years[years.length - 1]!;
  /* A round ceiling, so the axis reads in money and not in data. */
  const ceiling = useMemo(() => {
    const step = maxValue > 2000 ? 1000 : maxValue > 800 ? 500 : 200;
    return Math.ceil(maxValue / step) * step;
  }, [maxValue]);

  const x = (year: number) =>
    PAD.left + ((year - minYear) / (maxYear - minYear)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / ceiling) * (H - PAD.top - PAD.bottom);

  const ticks = useMemo(() => {
    const n = 4;
    return Array.from({ length: n + 1 }, (_, i) => (ceiling / n) * i);
  }, [ceiling]);

  /*
   * End labels, nudged apart. Five lines converging near the right edge
   * would otherwise stack their names on top of each other, and the
   * legend alone is a worse way to read a chart than a name beside the
   * line it belongs to.
   */
  const endLabels = useMemo(() => {
    const raw = series
      .map((s, i) => {
        const last = s.points[s.points.length - 1]!;
        return { i, name: s.name, x: x(last.year), y: y(value(last)) };
      })
      .sort((a, b) => a.y - b.y);
    const MIN_GAP = 15;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i]!.y - raw[i - 1]!.y < MIN_GAP) raw[i]!.y = raw[i - 1]!.y + MIN_GAP;
    }
    return raw;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, mode, ceiling]);

  const hoverYear = hover === null ? null : years[hover] ?? null;

  return (
    <figure id={uid} className="mt-8 m-0">
      {/*
       * Series colours as custom properties so dark mode can take its own
       * validated steps rather than an automatic inversion of the light
       * ones, which would fail the same checks the light set passes.
       */}
      <style>{`
        #${uid} {
          --s1:#00897b; --s2:#c2521d; --s3:#7b4fa8; --s4:#9a8c0a; --s5:#1c6fb0;
        }
        :root[data-theme="dark"] #${uid} {
          --s1:#1f9f8c; --s2:#d1623c; --s3:#a07fd8; --s4:#a89525; --s5:#4e9ad8;
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Toggle on={mode === "adjusted"} onClick={() => setMode("adjusted")}>
            In {baseYear} money
          </Toggle>
          <Toggle on={mode === "nominal"} onClick={() => setMode("nominal")}>
            Dollars of the day
          </Toggle>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
        >
          {showTable ? "Hide the figures" : "Show the figures"}
        </button>
      </div>

      {/* Legend, always, so identity is never colour alone. */}
      <ul
        className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 font-[family-name:var(--font-mono)] text-[0.66rem]"
      >
        {series.map((s, i) => (
          <li key={s.slug} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: `var(--s${i + 1})` }}
            />
            <span className="text-[var(--fg-soft)]">{s.name}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Line chart of what ${series.length} Bolex items cost in Paillard's price lists between ${minYear} and ${maxYear}, ${
            mode === "adjusted" ? `adjusted to ${baseYear} dollars` : "in dollars of the day"
          }. The same figures are in the table below.`}
          onMouseLeave={() => setHover(null)}
        >
          <g>
            {/* Grid: recessive, behind everything. */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--line)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(t) + 3.5}
                  textAnchor="end"
                  className="font-[family-name:var(--font-mono)]"
                  fontSize={9.5}
                  fill="var(--fg-soft)"
                >
                  {money(t)}
                </text>
              </g>
            ))}

            {years.map((yr, i) => (
              <g key={yr}>
                <line
                  x1={x(yr)}
                  x2={x(yr)}
                  y1={PAD.top}
                  y2={H - PAD.bottom}
                  stroke="var(--line)"
                  strokeWidth={hoverYear === yr ? 1.5 : 1}
                  strokeDasharray={hoverYear === yr ? undefined : "2 3"}
                />
                <text
                  x={x(yr)}
                  y={H - PAD.bottom + 16}
                  textAnchor="middle"
                  className="font-[family-name:var(--font-mono)]"
                  fontSize={10}
                  fill={hoverYear === yr ? "var(--fg)" : "var(--fg-soft)"}
                >
                  {yr}
                </text>
                {/* A generous invisible target, wider than the line. */}
                <rect
                  x={x(yr) - 22}
                  y={0}
                  width={44}
                  height={H - PAD.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
              </g>
            ))}

            {/* The lines, in a group so colours resolve from the legend's vars. */}
            <g>
              {series.map((s, i) => {
                const d = s.points
                  .map((p, n) => `${n === 0 ? "M" : "L"}${x(p.year)},${y(value(p))}`)
                  .join(" ");
                return (
                  <g key={s.slug} style={{ color: `var(--s${i + 1})` }}>
                    <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
                    {s.points.map((p) => (
                      <circle
                        key={`${p.year}-${p.doc}`}
                        cx={x(p.year)}
                        cy={y(value(p))}
                        r={hoverYear === p.year ? 5.5 : 4.5}
                        fill="currentColor"
                        /* A surface ring, so overlapping marks stay legible. */
                        stroke="var(--bg)"
                        strokeWidth={2}
                      />
                    ))}
                  </g>
                );
              })}
            </g>

            {/* Direct labels, so a reader need not go back to the legend. */}
            {endLabels.map((label) => (
              <text
                key={label.name}
                x={label.x + 10}
                y={label.y + 3.5}
                className="font-[family-name:var(--font-mono)]"
                fontSize={9.5}
                fill="var(--fg-soft)"
              >
                {label.name.length > 24 ? `${label.name.slice(0, 23)}…` : label.name}
              </text>
            ))}
          </g>
        </svg>

        {/* The tooltip: every series at the year under the pointer. */}
        {hoverYear !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-[0.66rem] shadow-sm"
            style={{
              left: `${(x(hoverYear) / W) * 100}%`,
              transform: x(hoverYear) > W / 2 ? "translateX(-108%)" : "translateX(8%)",
            }}
          >
            <p className="text-[var(--accent)]">{hoverYear}</p>
            <ul className="mt-1.5 space-y-0.5">
              {series.map((s, i) => {
                const p = s.points.find((q) => q.year === hoverYear);
                if (!p) return null;
                return (
                  <li key={s.slug} className="flex items-baseline gap-2 whitespace-nowrap">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: `var(--s${i + 1})` }}
                    />
                    <span className="text-[var(--fg-soft)]">{s.name}</span>
                    <span className="ml-auto text-[var(--fg)]">{money(value(p))}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <figcaption className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
        {mode === "adjusted"
          ? `Adjusted to ${baseYear} dollars with the US consumer price index. A general measure of prices, and a blunt one for a Swiss camera: it says nothing about the franc, about tariffs, or about what happened to the cost of precision optics in particular.`
          : "Dollars of the day, exactly as the price lists printed them."}
      </figcaption>

      {showTable && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse font-[family-name:var(--font-mono)] text-[0.68rem]">
            <caption className="sr-only">
              Every charted price, in dollars of the day and in {baseYear} money
            </caption>
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[var(--fg-soft)]">
                <th scope="col" className="py-1.5 pr-4 font-[460]">Item</th>
                <th scope="col" className="py-1.5 pr-4 font-[460]">Date</th>
                <th scope="col" className="py-1.5 pr-4 text-right font-[460]">Then</th>
                <th scope="col" className="py-1.5 text-right font-[460]">In {baseYear} money</th>
              </tr>
            </thead>
            <tbody>
              {series.flatMap((s) =>
                s.points.map((p) => (
                  <tr key={`${s.slug}-${p.year}`} className="border-b border-[var(--line)]">
                    <td className="py-1.5 pr-4 text-[var(--fg-soft)]">{s.name}</td>
                    <td className="py-1.5 pr-4 text-[var(--fg-soft)]">{p.date}</td>
                    <td className="py-1.5 pr-4 text-right">{money(p.nominal)}</td>
                    <td className="py-1.5 text-right">{money(p.adjusted)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </figure>
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
