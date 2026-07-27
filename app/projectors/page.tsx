import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getProjectors } from "@/lib/content";
import { getProjectorRecords } from "@/lib/museum";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Projectors",
  description:
    "Paillard-Bolex movie projectors for 8mm, Super 8 and 16mm film, recovered from BolexCollector.com — from the multi-gauge Model G of 1936 to the S-series sound projectors.",
};

export default function ProjectorsPage() {
  const models = getProjectorRecords();
  const provenance = getProjectors().provenance;

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Projectors
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Paillard&rsquo;s single and multi-format projectors for the amateur and home-movie
          market — {models.length} models recovered, each with its original specifications.
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-px bg-[var(--line)] border border-[var(--line)]">
        {models.map((model, i) => {
          const archiveHref = originalArchiveHref(model.originalPath);
          return (
            <Reveal key={model.slug} as="li" delay={Math.min(i * 0.03, 0.25)}>
              <div className="h-full bg-[var(--bg)] p-6 sm:flex sm:items-start sm:gap-8">
                <div className="sm:w-48 shrink-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">{model.name}</h2>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                      {model.introduced ?? ""}
                    </span>
                  </div>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {model.format ?? "projector"}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex-1">
                  {model.summary && <p className="text-sm leading-relaxed text-[var(--fg-soft)] max-w-xl">{model.summary}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                    {model.specs.length > 0 && <span>{model.specs.length} specifications</span>}
                    {archiveHref && (
                      <a href={archiveHref} className="text-[var(--accent)] underline underline-offset-4">
                        View original archive ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>

      <aside className="rule mt-16 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        {provenance}
      </aside>
    </div>
  );
}
