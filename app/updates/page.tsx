import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getUpdates } from "@/lib/directory";
import { editionUpdates } from "@/lib/edition-updates";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "What has been added to this archive and when: Michael Tisdale's own log from 2005 to 2011, continued since.",
};

const ORIGINAL_PATH = "/archives.html";

export default function UpdatesPage() {
  const updates = getUpdates(ORIGINAL_PATH);
  const recent = editionUpdates();
  const archiveHref = originalArchiveHref(ORIGINAL_PATH);
  const years = updates
    .map((u) => (u.sortKey ? String(u.sortKey).slice(0, 4) : null))
    .filter((y): y is string => y !== null);
  const span = years.length > 0 ? `${years[years.length - 1]}–${years[0]}` : "";

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Updates
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          The archive&rsquo;s record of itself: what was added and when. Michael Tisdale kept it
          as he built the site{span ? `, from ${span}` : ""}, and it carries on below with the
          work done since.
        </p>
      </Reveal>

      {recent.length > 0 && (
        <Reveal delay={0.05}>
          <section className="mt-12" aria-labelledby="since">
            <h2
              id="since"
              className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]"
            >
              Since
            </h2>
            <ol className="mt-4 border-t border-[var(--line)]">
              {recent.map((update) => (
                <li
                  key={update.date + update.title}
                  className="grid gap-1 border-b border-[var(--line)] py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  <p className="pt-0.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--fg-soft)]">
                    <span className="block text-[var(--fg)]">
                      {new Date(`${update.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </span>
                  </p>
                  <div className="min-w-0">
                    {update.href ? (
                      <Link
                        href={update.href}
                        className="group font-[family-name:var(--font-display)] text-lg font-[560] hover:text-[var(--accent)] transition-colors"
                      >
                        {update.title}
                        <span aria-hidden="true" className="reveal-on-hover ml-2 text-xs text-[var(--accent)]">
                          Go →
                        </span>
                      </Link>
                    ) : (
                      <p className="font-[family-name:var(--font-display)] text-lg font-[560]">
                        {update.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-[var(--fg-soft)]">
                      {update.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      )}

      {updates.length > 0 ? (
        <>
          <Reveal delay={0.05}>
            <h2 className="mt-14 font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              Michael Tisdale&rsquo;s log
            </h2>
            <ol className="mt-4 border-t border-[var(--line)]">
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
            Entries above &ldquo;Since&rdquo; are this edition&rsquo;s. Michael&rsquo;s own log is
            reproduced as he wrote it, dates and ordering included.
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
