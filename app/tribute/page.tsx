import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SupportCallout } from "@/components/SupportCallout";

export const metadata: Metadata = {
  title: "A Dedication — Michael Tisdale, the Bolex Collector",
  description:
    "In appreciation of Michael Tisdale, the collector and filmmaker who created BolexCollector.com in 2005 and spent years documenting Paillard-Bolex for everyone who came after.",
};

/**
 * A tribute to the person this whole project exists because of. Every
 * biographical claim here is drawn from Michael Tisdale's own words on the
 * preserved site or from the published Collectors Weekly interview — sourced,
 * never invented.
 */
export default function TributePage() {
  return (
    <article className="pt-16 pb-10 max-w-2xl mx-auto">
      <Reveal>
        <p className="text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
          In appreciation
        </p>
        <h1 className="mt-5 text-center font-[family-name:var(--font-display)] text-4xl sm:text-6xl leading-[1.05] tracking-tight font-[560]">
          Michael Tisdale
        </h1>
        <p className="mt-4 text-center font-[family-name:var(--font-display)] text-xl text-[var(--fg-soft)] italic">
          the Bolex Collector
        </p>
        <div className="mt-8 mx-auto w-16 rule" />
      </Reveal>

      <div className="prose-archive mt-12 mx-auto">
        <Reveal>
          <p>
            Everything in this archive exists because one collector in Atlanta decided that the
            cameras he loved deserved to be remembered properly. In 2005, Michael Tisdale began
            BolexCollector.com &mdash; in his own words, &ldquo;a personal project to catalog
            information about Paillard-Bolex, a Swiss company that manufactured clockwork movie
            cameras for both the professional and home movie maker.&rdquo;
          </p>
        </Reveal>

        <Reveal>
          <p>
            He had been collecting still and movie cameras since 1991, with a particular devotion to
            Paillard-Bolex. What began as a way to organize his own collection grew, over nearly two
            decades, into the definitive independent reference on the subject: cameras and projectors
            catalogued model by model, lenses and accessories by decade, serial-number tables,
            scanned catalogs and advertising, the Bolex Reporter magazine, a company timeline, and a
            glossary &mdash; assembled with a care that most institutions never manage.
          </p>
        </Reveal>

        <Reveal>
          <blockquote>
            It is intended to serve as an online resource for Bolex enthusiasts, collectors of motion
            picture cameras and anyone with an interest in the history of amateur movie-making
            equipment.
          </blockquote>
        </Reveal>

        <Reveal>
          <p>
            He was never only an archivist. He was a filmmaker who used the machines he documented
            &mdash; shooting time-lapse, animation, and b-roll, preferring, as he put it, &ldquo;spring-wound
            cameras over anything that uses a battery.&rdquo; For years his hands-on knowledge came
            mostly through a Bolex H16 Rex-4 and an H16 Supreme on 16mm; later, almost exclusively on
            double-8mm reversal. That he actually <em>ran film</em> through these cameras is why the
            site reads like it was written by someone who knew them, not merely someone who owned
            them.
          </p>
        </Reveal>

        <Reveal>
          <p>
            In an interview with{" "}
            <a href="https://www.collectorsweekly.com/articles/an-interview-with-vintage-bolex-movie-camera-collector-michael-tisdale/">
              Collectors Weekly
            </a>
            , he traced the passion to a convergence of older ones &mdash; photography, broadcasting, and
            collecting vintage records and magazines &mdash; and, above all, to an admiration for the Swiss
            craftsmanship and sheer quality of the cameras themselves. The site earned a place in that
            publication&rsquo;s Hall of Fame.
          </p>
        </Reveal>

        <Reveal>
          <h2>Why this project owes him everything</h2>
          <p>
            When BolexCollector.com went offline, a great deal of carefully gathered history was at
            risk of vanishing with it &mdash; the fate of most personal reference sites once the person
            behind them moves on. This restoration is, first and last, an act of gratitude: to
            preserve what he built exactly as he made it, and to keep it freely available to the
            collectors, filmmakers, and curious readers he always meant it for.
          </p>
          <p>
            We have changed nothing of his record. His pages are preserved byte-for-byte; his words,
            tables, and scans are reproduced as he published them. The modern edition is only a new
            reading room built around his library.
          </p>
        </Reveal>

        <Reveal>
          <p className="text-center font-[family-name:var(--font-display)] text-lg italic text-[var(--fg-soft)] not-prose mt-12">
            With thanks to Michael Tisdale &mdash; for the years, the care, and the generosity of
            sharing it all.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <SupportCallout />
      </Reveal>

      <Reveal>
        <section aria-label="Sources and further reading" className="rule mt-14 pt-6 max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--fg-soft)]">
            Sources &amp; further reading
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <a href="/original/aboutme.html" className="text-[var(--accent)] underline underline-offset-4">
                &ldquo;About the Webmaster&rdquo;
              </a>{" "}
              &mdash; Michael Tisdale&rsquo;s own biography, preserved from the original site.
            </li>
            <li>
              <a href="/original/about.html" className="text-[var(--accent)] underline underline-offset-4">
                &ldquo;About This Site&rdquo;
              </a>{" "}
              &mdash; his statement of the project&rsquo;s purpose, preserved from the original site.
            </li>
            <li>
              <a
                href="https://www.collectorsweekly.com/articles/an-interview-with-vintage-bolex-movie-camera-collector-michael-tisdale/"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                &ldquo;Hollywood at Home: Vintage Bolex Movie Cameras&rdquo;
              </a>{" "}
              &mdash; interview, Collectors Weekly.
            </li>
            <li>
              <a
                href="https://www.collectorsweekly.com/hall-of-fame/view/bolex-collector"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                Bolex Collector
              </a>{" "}
              &mdash; Collectors Weekly Hall of Fame.
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
            All quotations are Michael Tisdale&rsquo;s own words, preserved verbatim from
            bolexcollector.com. Nothing on this page is invented.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <p className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--fg-soft)] hover:text-[var(--accent)]"
          >
            ← Return to the collection
          </Link>
        </p>
      </Reveal>
    </article>
  );
}
