import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { TimelineCinema } from "@/components/TimelineCinema";
import { getTimeline } from "@/lib/timeline";
import { getTimelineMedia } from "@/lib/timeline-media";
import { originalArchiveHref } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The chronological development of Swiss-manufactured Bolex cameras and projectors — from the earliest cinema pioneers through Paillard's Bolex era.",
};

/**
 * The chronology, laid out to be read either way.
 *
 * It plays itself on arrival, like credits, and scrolling at any moment
 * takes it over. Both are the same page: see components/TimelineCinema.tsx
 * for why that is the whole trick.
 *
 * The layout changed to suit that. Entries used to sit in a dense left-ruled
 * list, which reads well under the eye and badly in motion — too many lines
 * crossing the focal band at once. Each entry is now a beat with room around
 * it, one thought at a time, so a line can be read as it passes.
 *
 * `Reveal` is deliberately not used here. It fades things in once on entry,
 * which would fight the focal fade and leave entries stuck invisible if the
 * page were scrolled past them quickly.
 */
export default function TimelinePage() {
  const timeline = getTimeline();
  const media = getTimelineMedia();
  const archiveHref = originalArchiveHref("/timeline.html");
  const total = timeline.eras.reduce((n, e) => n + e.entries.length, 0);
  const first = timeline.eras[0]?.entries[0]?.year;
  const lastEra = timeline.eras[timeline.eras.length - 1];
  const last = lastEra?.entries[lastEra.entries.length - 1]?.year;

  return (
    <TimelineCinema>
      <div className="pb-8 max-w-3xl">
        {/* Opening title. Tall enough to hold the screen for a moment before
            the first date arrives, so the piece starts rather than lurches. */}
        <header data-beat className="min-h-[46vh] flex flex-col justify-center py-14">
          <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
            {first && last ? `${first} — ${last}` : "A chronology"}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight leading-[1.08]">
            How Bolex came to be
          </h1>
          {timeline.intro.map((p, i) => (
            <p key={i} className="mt-5 leading-relaxed text-[var(--fg-soft)] max-w-2xl">
              {p}
            </p>
          ))}
          {/*
           * How to say it.
           *
           * The timeline is where the name Paillard first appears and where
           * a reader is most likely to wonder, so the note lives here rather
           * than in a glossary nobody opens. It is not an aside this project
           * invented: Amateur Movie-Maker said it in 1959, in a piece
           * Michael reprinted on the original site, so it comes out of the
           * archive like everything else.
           */}
          <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-[var(--accent)] pl-4 text-sm text-[var(--fg-soft)]">
            <span className="font-[family-name:var(--font-display)] text-base text-[var(--fg)]">
              Paillard
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[var(--accent)]">
              &ldquo;pie-ard&rdquo;
            </span>
            <span className="text-xs">
              — the <i>ll</i> is silent.{" "}
              <Link
                href="/articles/07-01-26"
                className="underline underline-offset-2 hover:text-[var(--accent)]"
              >
                Amateur Movie-Maker, 1959
              </Link>
            </span>
          </p>

          {total > 0 && (
            <p className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
              {total} entries · {timeline.eras.length} eras
            </p>
          )}
        </header>

        {timeline.eras.map((era) => (
          <section key={era.era} aria-label={era.era}>
            {/* Era cards break the chronology into chapters. They get a
                screen of their own while playing, which is what gives the
                piece its rhythm. */}
            <div data-beat className="min-h-[26vh] flex flex-col justify-center border-t border-[var(--line)] py-12">
              <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
                {era.entries.length} entries
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-[560]">
                {era.era}
              </h2>
            </div>

            <ol>
              {era.entries.map((entry, i) => {
                const picture = media.get(entry.year);
                return (
                  <li
                    key={`${entry.year}-${i}`}
                    data-beat
                    id={`year-${entry.year}`}
                    className="scroll-mt-24 py-5 sm:py-7"
                  >
                    <div className="sm:flex sm:gap-8">
                      <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent)] sm:w-20 shrink-0 tabular-nums">
                        {entry.year}
                      </p>
                      <div className="mt-1.5 min-w-0 sm:mt-0">
                        <p className="text-lg leading-[1.6] max-w-[36rem]">{entry.event}</p>

                        {/*
                         * The picture sits under its year's text rather than
                         * beside it. Alternating left and right looked livelier
                         * in the abstract and read as noise in practice: the eye
                         * has to find where the next line starts every time, on
                         * a page whose whole purpose is to be read straight
                         * down. One column, one rhythm.
                         *
                         * It is a link, not decoration — every image here is an
                         * object or an advertisement the site holds a page for,
                         * and saying so is what makes it a citation.
                         */}
                        {picture && (
                          <figure className="mt-4 max-w-[26rem]" data-figure>
                            <Link
                              href={picture.href}
                              className="group block overflow-hidden border border-[var(--line)] plate"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={picture.src}
                                alt={picture.alt}
                                loading="lazy"
                                decoding="async"
                                className="h-[190px] w-full object-contain p-3 transition-transform duration-700 no-touch-zoom group-hover:scale-[1.03] sm:h-[230px]"
                              />
                            </Link>
                            <figcaption className="mt-1.5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                              {picture.caption}
                              {/* A given photograph is credited wherever it is shown,
                                  not only on the page it belongs to. */}
                              {picture.credit && (
                                <span className="normal-case tracking-normal opacity-80">
                                  {" "}
                                  — photograph by {picture.credit}
                                </span>
                              )}
                            </figcaption>
                          </figure>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {timeline.eras.length === 0 && (
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">Awaiting recovery</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The timeline page has not yet been recovered from the archive.
            </p>
          </div>
        )}

        {/*
         * The closing card.
         *
         * The recovered chronology stops in 1970, so this does not pretend to
         * carry on to the present — the years between are not in the archive,
         * and inventing them would be the one thing this project must not do.
         * It says where the record ends and hands the reader somewhere real
         * to go next.
         */}
        {total > 0 && (
          <div
            data-beat
            className="min-h-[42vh] flex flex-col justify-center border-t border-[var(--line)] py-16"
          >
            <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              Where the record ends
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl leading-snug font-[560] max-w-2xl">
              Michael Tisdale&rsquo;s chronology closes in {last}, with Paillard Bolex becoming
              Bolex International S.A.
            </p>
            <p className="mt-5 leading-relaxed text-[var(--fg-soft)] max-w-2xl">
              What came after is not in this archive, and nothing here will invent it. The
              company still trades from Sainte-Croix; the cameras are still being run, repaired
              and shot on.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/cameras"
                className="tap-target border border-[var(--fg)] px-5 text-[0.78rem] uppercase tracking-[0.1em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
              >
                The cameras
              </Link>
              <Link
                href="/tribute"
                className="tap-target border border-[var(--line)] px-5 text-[0.78rem] uppercase tracking-[0.1em] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                Who wrote this
              </Link>
            </div>
          </div>
        )}

        {archiveHref && <ArchiveCompare originalHref={archiveHref} title="Timeline" />}

        <aside className="rule mt-14 pt-4 pb-16 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
          <span className="uppercase tracking-[0.18em]">Provenance — </span>
          Recovered from{" "}
          <span className="text-[var(--fg)]">{timeline.originalUrl ?? "bolexcollector.com/timeline.html"}</span>
          {timeline.capturedAt ? `, Wayback capture ${timeline.capturedAt}` : ""}. Entries are
          reproduced verbatim from the archived chronology.
        </aside>
      </div>
    </TimelineCinema>
  );
}
