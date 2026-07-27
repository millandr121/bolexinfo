import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote } from "@/components/RecoveryBadge";
import { getSerialDataset } from "@/lib/content";
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

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Serial Number Lookup
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Paillard allocated a block of serial numbers to each production year. Enter a
          serial number to estimate the year of manufacture and where in that year&rsquo;s
          run the camera falls.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-2xl">
          {rows.length > 0 ? (
            <SerialLookup rows={rows} />
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
          <section aria-label="Full serial number table" className="mt-16">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              The complete recovered table
            </h2>
            <div className="mt-3 max-w-2xl overflow-x-auto border border-[var(--line)]">
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
          </section>
        </Reveal>
      )}

      <ProvenanceNote>{dataset.source}</ProvenanceNote>
    </div>
  );
}
