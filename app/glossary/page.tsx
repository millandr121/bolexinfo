import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { RecoveredContent } from "@/components/RecoveredContent";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getRecoveredPage } from "@/lib/recovered";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "A glossary of Bolex and filmmaking terminology, recovered from the original BolexCollector.com.",
};

export default function GlossaryPage() {
  const page = getRecoveredPage("reference", "glossary");
  const archiveHref = originalArchiveHref(page?.originalPath);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Glossary
        </h1>
        <p className="mt-4 text-[var(--fg-soft)] leading-relaxed">
          Bolex and filmmaking terminology, as defined on the original site.
        </p>
      </Reveal>

      {page && page.blocks.length > 0 ? (
        <>
          <Reveal>
            <RecoveredContent blocks={page.blocks} treatment="product" />
          </Reveal>
          {archiveHref && (
            <Reveal>
              <ArchiveCompare originalHref={archiveHref} title="Glossary" />
            </Reveal>
          )}
          <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
            <span className="uppercase tracking-[0.18em]">Provenance — </span>
            Recovered from{" "}
            <span className="text-[var(--fg)]">{page.originalUrl ?? "bolexcollector.com/glossary.html"}</span>
            {page.capturedAt ? `, Wayback capture ${page.capturedAt}` : ""}, reproduced verbatim.
          </aside>
        </>
      ) : (
        <Reveal>
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">Awaiting recovery</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The glossary page has not yet been recovered from the archive.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
