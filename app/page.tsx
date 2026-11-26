import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { OriginalFrame } from "@/components/OriginalFrame";
import { SerialLookup } from "@/app/serials/SerialLookup";
import { LookupCta } from "@/components/LookupCta";
import { Icon } from "@/components/Icons";
import { getSerialDataset } from "@/lib/content";
import { serialModels } from "@/lib/serial-models";
import { FEATURED_LINKS } from "@/lib/featured";
import { FACEBOOK_GROUP_URL } from "@/lib/community";

/*
 * The three cards' icons. Sized to read at a glance without competing with
 * the heading under them, and quiet until the card is hovered — they are
 * there to make the row scannable, not to be the loudest thing on the page.
 */
const CARD_ICON =
  "h-7 w-7 text-[var(--fg-soft)] group-hover:text-[var(--accent)] transition-colors duration-300";

export default function HomePage() {
  const dataset = getSerialDataset();
  const models = serialModels();

  return (
    <>
      {/*
       * Both editions are served on the front page and CSS shows one of them,
       * from the attribute the inline script sets before paint. A desktop
       * visitor with no stored choice opens on the preserved site; a phone
       * visitor opens on this one, which is the only one of the two that was
       * built to be read on a phone. Whatever anyone toggles to is remembered
       * and wins from then on.
       *
       * The frame is lazily loaded, so the visitors who are shown this edition
       * never fetch the other one.
       */}
      <div className="original-edition">
        <OriginalFrame lazy />
      </div>

      <div className="modern-edition">
        {/*
         * The front page leads with the lookup because that is what people
         * arrive holding: a camera with a number stamped inside the film
         * chamber and no idea what it is. A statistics row used to sit here
         * instead, and a count of 54 models answers nobody's question.
         *
         * The lookup's results render in normal flow above the three cards, so
         * typing a serial pushes them down rather than covering them — the
         * page grows into an answer instead of swapping to a different view.
         */}
        <section className="pt-14 sm:pt-16 pb-12">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <Reveal>
              <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                A resource for Bolex collectors and enthusiasts
              </p>
              <h1 className="mt-3.5 font-[family-name:var(--font-display)] text-[2.4rem] sm:text-5xl leading-[1.04] tracking-[-0.02em] font-[560]">
                Everything Bolex
                <br />
                ever made, in one place
              </h1>
              {/* The counts that used to sit in a statistics row, said as a
                  sentence instead. A test keeps the words honest if the
                  catalogue ever grows. */}
              <p className="mt-5 max-w-[29rem] leading-[1.65] text-[var(--fg-soft)]">
                Sixty-seven cameras, twenty-seven projectors, the lenses and accessories that went
                with them, and the paper that sold them, verified and kept.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <LookupCta>Identify my Bolex</LookupCta>
                <Link
                  href="/cameras"
                  className="tap-target border border-[var(--fg)] px-6 text-[0.8rem] uppercase tracking-[0.08em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-200"
                >
                  Browse the cameras
                </Link>
              </div>
            </Reveal>

            {/*
             * The lookup sits beside the headline rather than under it, so the
             * first screen carries both what this place is and the one tool
             * most people came for. Typing grows this card downward, which
             * grows the row and pushes the three links below it down the page
             * — the answer arrives without anything being covered up.
             */}
            <Reveal delay={0.1}>
              <div id="identify" className="border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-7 scroll-mt-28">
                {dataset.ranges.length > 0 ? (
                  <SerialLookup rows={dataset.ranges} models={models} />
                ) : (
                  <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
                    The serial tables have not been extracted yet. The lookup activates as soon
                    as they are.
                  </p>
                )}
                {/* Why the filter offers two kinds and not three: the recovered
                    lens and accessory pages carry no serial tables at all. */}
                <p className="mt-5 border-t border-[var(--line)] pt-4 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
                  Lenses and accessories were never serial-numbered.{" "}
                  <Link href="/serials" className="text-[var(--accent)] hover:underline underline-offset-4">
                    The complete table →
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/*
         * Three doors, where the statistics used to be. Two are fixed because
         * they answer the two questions that follow identifying a camera —
         * where are the other owners, and who can service this — and the third
         * changes between visits so the page can point somewhere different
         * without growing a fourth and fifth card.
         */}
        {/*
         * The page stops here, on purpose.
         *
         * It used to carry a collections grid, a paragraph about the
         * restoration and a dedication panel below this row — all of it
         * reachable from the navigation and the footer already, and all of it
         * standing between a visitor and the two things this page is for:
         * identifying a camera, and the three doors below. A front page that
         * repeats the whole site is a front page nobody reads.
         */}
        <section aria-label="Start here" className="rule pt-12 pb-20">
          <ul className="grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            <li>
              <a
                href={FACEBOOK_GROUP_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <Icon name="facebook" className={CARD_ICON} />
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  Ask the group{" "}
                  <span aria-hidden="true" className="text-xs text-[var(--accent)] align-middle">
                    ↗
                  </span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                  Advice, answers, manuals, and buying and selling. The Bolex group on
                  Facebook, busy most days.
                </p>
              </a>
            </li>

            <li>
              <Link
                href="/technicians"
                className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <Icon name="wrench" className={CARD_ICON} />
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  Find a technician
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                  Who services, repairs and converts these cameras, and how current each
                  listing is.
                </p>
              </Link>
            </li>

            {/*
             * All three rotating cards are in the HTML and CSS shows one, from
             * the attribute set before paint. Picking in React instead would
             * mean the server and the client disagreed about what to render,
             * and no card flashes past on the way to another this way.
             */}
            {FEATURED_LINKS.map((link, i) => (
              <li key={link.href} className="featured-slot" data-slot={i}>
                <Link
                  href={link.href}
                  className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <Icon name={link.icon} className={CARD_ICON} />
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {link.label}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{link.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </>
  );
}
