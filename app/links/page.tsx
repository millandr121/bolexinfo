import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getLinkDirectory } from "@/lib/directory";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Links",
  description:
    "The directory of Bolex and filmmaking resources recommended by BolexCollector.com — manufacturers, repair specialists, film stock, and cinema history.",
};

const ORIGINAL_PATH = "/links.html";

export default function LinksPage() {
  const { intro, categories } = getLinkDirectory(ORIGINAL_PATH);
  const archiveHref = originalArchiveHref(ORIGINAL_PATH);
  const total = categories.reduce((n, c) => n + c.entries.length, 0);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Links
        </h1>
        {intro && <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{intro}</p>}
        {/*
         * These were one collector's recommendations, made while the site was
         * running. Some of the sites they point to will have moved or closed
         * since. They are reproduced exactly as recorded rather than pruned or
         * updated: the list is itself part of the record, and which resources
         * a Bolex collector pointed people to is worth preserving even where
         * the destination has gone.
         */}
        <p className="mt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          {total} links in {categories.length} sections, as listed on the original site. External
          sites are beyond this archive&rsquo;s keeping — some may have moved or closed since.
        </p>
      </Reveal>

      {categories.length > 0 ? (
        <>
          {categories.map((category, i) => (
            <Reveal key={category.title} delay={i === 0 ? 0.05 : 0}>
              <section className="mt-12" aria-labelledby={`cat-${i}`}>
                <h2
                  id={`cat-${i}`}
                  className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
                >
                  {category.title}
                </h2>
                <ul className="mt-4 border-t border-[var(--line)]">
                  {category.entries.map((entry) => (
                    <li key={entry.href + entry.name} className="border-b border-[var(--line)] py-4">
                      <a
                        href={entry.href}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="group inline-flex items-baseline gap-2 font-[family-name:var(--font-display)] text-lg font-[560] hover:text-[var(--accent)] transition-colors"
                      >
                        {entry.name}
                        <span aria-hidden="true" className="text-xs text-[var(--accent)]">
                          ↗
                        </span>
                      </a>
                      {entry.description && (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--fg-soft)]">
                          {entry.description}
                        </p>
                      )}
                      <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-[var(--fg-soft)] break-all">
                        {entry.href.replace(/^https?:\/\//, "")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}

          {archiveHref && (
            <Reveal>
              <ArchiveCompare originalHref={archiveHref} title="Links" />
            </Reveal>
          )}

          <aside className="rule mt-14 pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
            <span className="uppercase tracking-[0.18em]">Provenance — </span>
            Recovered from{" "}
            <span className="text-[var(--fg)]">bolexcollector.com/links.html</span>, reproduced
            verbatim: every link, its description and its ordering are as published.
          </aside>
        </>
      ) : (
        <Reveal>
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
              Awaiting recovery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The links page has not yet been recovered from the archive.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
