import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote } from "@/components/RecoveryBadge";
import { getArchiveStats, getUrlInventory } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archive & Recovery Status",
  description:
    "Live status of the BolexCollector.com preservation effort: every inventoried original URL and its recovery state.",
};

const SECTION_LABELS: Record<string, string> = {
  root: "Site",
  cameras: "Cameras",
  projectors: "Projectors",
  lenses: "Lenses",
  accessories: "Accessories",
  articles: "Articles",
  ephemera: "Ephemera",
  reference: "Reference",
};

export default function ArchivePage() {
  const { entries, note } = getUrlInventory();
  const stats = getArchiveStats();
  const sections = [...new Set(entries.map((e) => e.section))];

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          The Archive
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          This project treats the original BolexCollector.com as a historical document.
          Below is the public ledger of the preservation effort: every original URL we
          have verified, and how much of it has been recovered so far.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">URLs inventoried</dt>
            <dd className="text-2xl mt-1">{entries.length}</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Assets preserved</dt>
            <dd className="text-2xl mt-1">{stats.assets}</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Pages preserved</dt>
            <dd className="text-2xl mt-1">{stats.pages}</dd>
          </div>
        </dl>
      </Reveal>

      {sections.map((section) => (
        <section key={section} className="mt-12" aria-label={SECTION_LABELS[section] ?? section}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {SECTION_LABELS[section] ?? section}
            </h2>
            <div className="mt-3 overflow-x-auto border border-[var(--line)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left font-[family-name:var(--font-sans)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] border-b border-[var(--line)]">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Original page</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Original URL</th>
                  </tr>
                </thead>
                <tbody className="font-[family-name:var(--font-mono)] text-xs">
                  {entries
                    .filter((e) => e.section === section)
                    .map((entry) => (
                      <tr key={entry.path} className="border-b border-[var(--line)] last:border-0">
                        <td className="px-4 py-2">{entry.title.replace(/^Bolex Collector \| /, "")}</td>
                        <td className="px-4 py-2 text-[var(--fg-soft)]">{entry.path}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      ))}

      <ProvenanceNote>{note}</ProvenanceNote>
    </div>
  );
}
