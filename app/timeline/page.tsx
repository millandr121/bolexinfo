import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { TimelineCinema } from "@/components/TimelineCinema";
import { TimelineEntry } from "@/components/TimelineEntry";
import { TimelinePlate } from "@/components/TimelinePlate";
import { getTimeline } from "@/lib/timeline";
import { originalArchiveHref } from "@/lib/archive";
import { closingPlate, interludes, openingPlate, plateForYear } from "@/lib/scenes";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The chronological development of Swiss-manufactured Bolex cameras and projectors, from the earliest cinema pioneers through Paillard's Bolex era.",
};

/**
 * The chronology, laid out to be read either way.
 *
 * It plays itself on arrival, like credits, and scrolling at any moment
 * takes it over. Both are the same page: see components/TimelineCinema.tsx
 * for why that is the whole trick.
 *
 * ## No title cards
 *
 * There used to be an opening screen, then a chapter screen for each
 * of the four eras, and only then the chronology. Every one of those
 * was a screen a reader had to get past to reach what they came for —
 * and the only part of the page with no picture on it was the part
 * they came for.
 *
 * So the titles sit on the photographs now. The opening paragraph is
 * on the opening photograph; each year's own words are on that year's
 * photograph; the era is a four-word label above the date on the first
 * entry of each chapter rather than a screen of its own.
 *
 * ## No product cut-outs
 *
 * Entries used to carry whatever camera their text named, lifted out
 * of a catalogue onto the cream paper. It was the obvious thing and it
 * was dull: an object on a white ground says nothing about a year. The
 * pictures are of the company and the people now, and an entry with no
 * photograph is type on paper, which is better than a dull photograph.
 *
 * `Reveal` is deliberately not used here. It fades things in once on entry,
 * which would fight the focal fade and leave entries stuck invisible if the
 * page were scrolled past them quickly.
 */
export default function TimelinePage() {
  const timeline = getTimeline();
  const archiveHref = originalArchiveHref("/timeline.html");
  const total = timeline.eras.reduce((n, e) => n + e.entries.length, 0);
  const first = timeline.eras[0]?.entries[0]?.year;
  const lastEra = timeline.eras[timeline.eras.length - 1];
  const last = lastEra?.entries[lastEra.entries.length - 1]?.year;
  const opening = openingPlate();
  const closing = closingPlate();

  return (
    <TimelineCinema>
      {/* Full width: the film wants the page, the words want a measure.
          The reading column is set inside each panel instead. */}
      <div className="pb-8">
        {/*
          The opening. One screen, not two: the title and the first
          paragraph set on Paillard's own 1946 cover rather than after
          it, so the page starts on a face.
        */}
        <TimelinePlate plate={opening}>
          <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em]">
            {first && last ? `${first} to ${last}` : "A chronology"}
          </p>
          <h1 className="mt-4 max-w-[18ch] font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-[560] tracking-tight leading-[1.04]">
            How Bolex came to be
          </h1>
          {timeline.intro[0] && (
            <p className="mt-5 max-w-xl leading-relaxed">{timeline.intro[0]}</p>
          )}
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
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-[var(--accent)] pl-4 text-sm">
            <span className="font-[family-name:var(--font-display)] text-base">Paillard</span>
            <span className="font-[family-name:var(--font-mono)]">&ldquo;pie-ard&rdquo;</span>
            <span className="text-xs">
              the <i>ll</i> is silent.{" "}
              <Link href="/articles/07-01-26" className="underline underline-offset-2">
                Amateur Movie-Maker, 1959
              </Link>
            </span>
          </p>
        </TimelinePlate>

        {timeline.eras.map((era) => (
          <section key={era.era} aria-label={era.era}>
            <ol>
              {era.entries.map((entry, i) => (
                <TimelineEntry
                  key={`${entry.year}-${i}`}
                  entry={entry}
                  /* The chapter, as a label on its first entry rather
                     than a screen of its own. */
                  era={i === 0 ? era.era : undefined}
                  placed={plateForYear(entry.year)}
                />
              ))}
            </ol>
          </section>
        ))}

        {timeline.eras.length === 0 && (
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
              Awaiting recovery
            </h2>
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
            className="mx-auto flex min-h-[52svh] w-[min(72rem,100%-3rem)] flex-col justify-center py-16"
          >
            <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              Where the record ends
            </p>
            <p className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-[560] leading-snug sm:text-3xl">
              Michael Tisdale&rsquo;s chronology closes in {last}, with Paillard Bolex becoming
              Bolex International S.A.
            </p>
            <p className="mt-5 max-w-2xl leading-relaxed text-[var(--fg-soft)]">
              What came after is not in this archive, and nothing here will invent it. What
              follows is only what the paper from those years looks like.
            </p>
          </div>
        )}

        {/*
          The coda. Photographs with nothing on them but their own
          caption, every one of them from 1970 or after.
        */}
        {total > 0 && interludes().map((plate) => <TimelinePlate key={plate.src} plate={plate} />)}

        {total > 0 && closing && (
          <TimelinePlate plate={closing}>
            <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em]">
              Still standing
            </p>
            <p className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-2xl font-[560] leading-snug">
              The company still trades from Sainte-Croix; the cameras are still being run,
              repaired and shot on.
            </p>
          </TimelinePlate>
        )}

        {total > 0 && (
          <div className="mx-auto flex w-[min(72rem,100%-3rem)] flex-wrap gap-3 py-12">
            <Link
              href="/cameras"
              className="tap-target border border-[var(--fg)] px-5 text-[0.78rem] uppercase tracking-[0.1em] transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              The cameras
            </Link>
            <Link
              href="/tribute"
              className="tap-target border border-[var(--line)] px-5 text-[0.78rem] uppercase tracking-[0.1em] text-[var(--fg-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Who wrote this
            </Link>
          </div>
        )}

        {archiveHref && <ArchiveCompare originalHref={archiveHref} title="Timeline" />}

        <aside className="rule mt-14 pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          Chronology by Michael Tisdale.
        </aside>
      </div>
    </TimelineCinema>
  );
}
