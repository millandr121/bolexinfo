import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getTimeline } from "@/lib/timeline";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The chronological development of Swiss-manufactured Bolex cameras and projectors — from the earliest cinema pioneers through Paillard's Bolex era.",
};

export default function TimelinePage() {
  const timeline = getTimeline();
  const archiveHref = originalArchiveHref("/timeline.html");
  const total = timeline.eras.reduce((n, e) => n + e.entries.length, 0);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Timeline
        </h1>
        {timeline.intro.map((p, i) => (
          <p key={i} className="mt-4 leading-relaxed text-[var(--fg-soft)] max-w-2xl">
            {p}
          </p>
        ))}
        {total > 0 && (
          <p className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
            {total} entries · {timeline.eras.length} eras
          </p>
        )}
      </Reveal>

      {timeline.eras.map((era) => (
        <section key={era.era} className="mt-14" aria-label={era.era}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {era.era}
            </h2>
          </Reveal>
          <ol className="mt-5 border-l border-[var(--line)]">
            {era.entries.map((entry, i) => (
              <Reveal key={`${entry.year}-${i}`} as="li" delay={Math.min(i * 0.03, 0.2)}>
                <div className="relative pl-6 sm:pl-8 pb-7 group">
                  {/* Marker on the era's spine */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.45rem] -translate-x-1/2 w-[7px] h-[7px] rounded-full bg-[var(--line)] group-hover:bg-[var(--accent)] transition-colors duration-300"
                  />
                  <div className="sm:flex sm:gap-6">
                    <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent)] sm:w-20 shrink-0 tabular-nums">
                      {entry.year}
                    </p>
                    <p className="mt-1 sm:mt-0 leading-relaxed">{entry.event}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      ))}

      {timeline.eras.length === 0 && (
        <Reveal>
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">Awaiting recovery</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The timeline page has not yet been recovered from the archive.
            </p>
          </div>
        </Reveal>
      )}

      {archiveHref && (
        <Reveal>
          <ArchiveCompare originalHref={archiveHref} title="Timeline" />
        </Reveal>
      )}

      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        Recovered from{" "}
        <span className="text-[var(--fg)]">{timeline.originalUrl ?? "bolexcollector.com/timeline.html"}</span>
        {timeline.capturedAt ? `, Wayback capture ${timeline.capturedAt}` : ""}. Entries are
        reproduced verbatim from the archived chronology.
      </aside>
    </div>
  );
}
