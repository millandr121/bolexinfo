import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SourceNote } from "@/components/RecoveryBadge";
import { getSerialDataset, getSerialLandmarks } from "@/lib/content";
import { serialModels } from "@/lib/serial-models";
import { formatYearSpan } from "@/lib/serials";
import { SerialLookup } from "./SerialLookup";

export const metadata: Metadata = {
  title: "Serial Number Lookup",
  description:
    "Date a Paillard-Bolex camera or projector from its serial number, using the year ranges preserved from the original BolexCollector.com.",
};

export default function SerialsPage() {
  const dataset = getSerialDataset();
  const rows = dataset.ranges;
  const models = serialModels();
  const { note, landmarks } = getSerialLandmarks();

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Serial Number Lookup
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Enter a serial number to identify which Paillard-Bolex models it could be, when it
          was made, and how to tell the candidates apart. Cameras and projectors were serial
          catalogued; lenses and accessories were not.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-2xl">
          {rows.length > 0 ? (
            <SerialLookup rows={rows} models={models} />
          ) : (
            <div className="border border-[var(--line)] bg-[var(--bg-raised)] p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
                Dataset awaiting recovery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                The serial number tables have not yet been extracted from the archived pages.
                The lookup engine activates automatically once{" "}
                <span className="font-[family-name:var(--font-mono)] text-xs">data/serials/ranges.json</span>{" "}
                is populated by the preservation pipeline.
              </p>
            </div>
          )}
        </div>
      </Reveal>

      {rows.length > 0 && (
        <Reveal delay={0.15}>
          {/*
           * The full 47-row master table used to be dumped straight onto the
           * page, which buried the lookup — the thing people came for — under
           * a wall of numbers. It is reference material, so it is kept one tap
           * away rather than removed.
           */}
          <details className="mt-16 max-w-2xl border border-[var(--line)] group">
            <summary className="tap-target px-5 cursor-pointer list-none flex items-center justify-between gap-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
              <span>The complete table · {rows.length} ranges, 1936–1976</span>
              <span aria-hidden="true" className="text-[var(--accent)] group-open:rotate-90 transition-transform">
                ›
              </span>
            </summary>
            <div className="scroll-x border-t border-[var(--line)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left font-[family-name:var(--font-sans)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] border-b border-[var(--line)]">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Serial range</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Year</th>
                  </tr>
                </thead>
                <tbody className="font-[family-name:var(--font-mono)] text-xs">
                  {rows.map((r, i) => (
                    <tr key={`${r.yearFrom}-${r.from}-${i}`} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-2">
                        {r.from?.toLocaleString() ?? "???"} – {r.to?.toLocaleString() ?? "???"}
                      </td>
                      <td className="px-4 py-2 text-[var(--fg-soft)]">{formatYearSpan(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Reveal>
      )}

      {landmarks.length > 0 && (
        <Reveal delay={0.2}>
          {/*
           * Not a second table. These are the individual numbers Paillard,
           * EPOI and Bolex printed in their own documents as the point where
           * something about a camera changed, and they answer a question the
           * range table cannot: not when was mine built, but what is
           * different about mine. The last of them is the only thing here
           * that reaches past 1976, where the bulletin's table ends.
           */}
          <section className="mt-16 max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560]">
              Numbers Bolex drew a line at
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{note}</p>

            <ul className="mt-6 border-t border-[var(--line)]">
              {landmarks.map((l) => (
                <li key={l.serial} className="border-b border-[var(--line)] py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-[family-name:var(--font-mono)] text-base tabular-nums text-[var(--accent)]">
                      {l.serial.toLocaleString()}
                    </span>
                    <span className="text-sm text-[var(--fg)]">{l.model}</span>
                    <span className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                      {l.year === null ? "past the end of the table" : l.year}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)]">{l.what}</p>
                  <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--fg-soft)]">
                    {l.sources.map((src, i) => (
                      <span key={src.title}>
                        {i > 0 && "; "}
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--accent)] underline underline-offset-2"
                          >
                            {src.title}
                          </a>
                        ) : (
                          src.title
                        )}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      <SourceNote>{dataset.source}</SourceNote>
    </div>
  );
}
