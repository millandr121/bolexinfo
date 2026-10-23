import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getUpdates } from "@/lib/directory";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Previous Updates",
  description:
    "The update log of BolexCollector.com, 2005–2011 — what Michael Tisdale added to the site and when, recovered from the original archives page.",
};

const ORIGINAL_PATH = "/archives.html";

export default function UpdatesPage() {
  const updates = getUpdates(ORIGINAL_PATH);
  const archiveHref = originalArchiveHref(ORIGINAL_PATH);
  const years = updates
    .map((u) => (u.sortKey ? String(u.sortKey).slice(0, 4) : null))
    .filter((y): y is string => y !== null);
  const span = years.length > 0 ? `${years[years.length - 1]}–${years[0]}` : "";

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Previous Updates
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          The site&rsquo;s own record of itself: what was added to BolexCollector.com and when,
          kept by its author as he built it. It is the only account of the archive&rsquo;s working
          life{span ? `, and it runs from ${span}` : ""}.
        </p>
      </Reveal>

      {updates.length > 0 ? (
        <>
          <Reveal delay={0.05}>
            <ol className="mt-12 border-t border-[var(--line)]">
              {updates.map((update, i) => (
                <li
                  key={`${update.date}-${i}`}
                  className="grid gap-1 border-b border-[var(--line)] py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  {/*
                   * The date is shown exactly as written. One entry carries a
                   * year the original site mistyped; it keeps its own ordering
                   * and its own text, because correcting it would edit the
                   * record rather than preserve it.
                   */}
                  {/*
                   * The original wrote its dates as "September 2, 2011 --
                   * Friday". Set as one run that separator wraps badly, so the
                   * two halves are given a line each. The words are the
                   * archived ones either way; only the line break is ours.
                   */}
                  <p className="pt-0.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--fg-soft)]">
                    {(() => {
                      const [day, weekday] = update.date.split(/\s*--\s*/);
                      return (
                        <>
                          <span className="block text-[var(--fg)]">{day}</span>
                          {weekday && <span className="block mt-0.5 opacity-70">{weekday}</span>}
                        </>
                      );
                    })()}
                  </p>
                  <div className="min-w-0">
                    {update.title &&
                      (update.articleSlug ? (
                        <Link
                          href={`/articles/${update.articleSlug}`}
                          className="group font-[family-name:var(--font-display)] text-lg font-[560] hover:text-[var(--accent)] transition-colors"
                        >
                          {update.title}
                          <span aria-hidden="true" className="reveal-on-hover ml-2 text-xs text-[var(--accent)]">
                            Read the article →
                          </span>
                        </Link>
                      ) : (
                        <p className="font-[family-name:var(--font-display)] text-lg font-[560]">
                          {update.title}
                        </p>
                      ))}
                    <p
                      className={`text-sm leading-relaxed text-[var(--fg-soft)] ${
                        update.title ? "mt-1" : ""
                      }`}
                    >
                      {update.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          {archiveHref && (
            <Reveal>
              <ArchiveCompare originalHref={archiveHref} title="Previous Updates" />
            </Reveal>
          )}

          <aside className="rule mt-14 pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
            <span className="uppercase tracking-[0.18em]">Provenance — </span>
            Recovered from{" "}
            <span className="text-[var(--fg)]">bolexcollector.com/archives.html</span>. Entries,
            dates and ordering are reproduced verbatim; an update links onward only where the
            article it announced was itself recovered.
          </aside>
        </>
      ) : (
        <Reveal>
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
              Awaiting recovery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The archives page has not yet been recovered.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
