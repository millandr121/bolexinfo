import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getLinkDirectory } from "@/lib/directory";
import { originalArchiveHref } from "@/lib/archive";
import { COMMUNITY_LINKS } from "@/lib/community";

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

      {/*
       * Added now, not recovered — and kept visibly apart from the rest of the
       * page for that reason. The directory below is a 2011 record reproduced
       * verbatim, so mixing live links into it would quietly rewrite the
       * record. These sit above it under their own heading, which also puts
       * the links that still work first.
       */}
      <Reveal delay={0.05}>
        <section className="mt-12" aria-labelledby="community">
          <h2
            id="community"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Where people talk — added by this archive
          </h2>
          <ul className="mt-4 border-t border-[var(--line)]">
            {COMMUNITY_LINKS.map((link) => (
              <li key={link.href} className="border-b border-[var(--line)] py-4">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="group inline-flex items-baseline gap-2 font-[family-name:var(--font-display)] text-lg font-[560] hover:text-[var(--accent)] transition-colors"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-xs text-[var(--accent)]">
                    ↗
                  </span>
                </a>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fg-soft)]">{link.blurb}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.68rem] leading-relaxed text-[var(--fg-soft)]">
            No Bolex subreddit is listed because none could be confirmed as an active Bolex
            community. For repair, see{" "}
            <Link href="/technicians" className="text-[var(--accent)] hover:underline underline-offset-4">
              repair &amp; service
            </Link>
            .
          </p>
        </section>
      </Reveal>

      {categories.length > 0 ? (
        <>
          <Reveal>
            <h2 className="rule mt-14 pt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--fg-soft)]">
              The original directory, as published
            </h2>
          </Reveal>

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
