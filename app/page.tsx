import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { OriginalFrame } from "@/components/OriginalFrame";
import { SerialLookup } from "@/app/serials/SerialLookup";
import { getSerialDataset } from "@/lib/content";
import { serialModels } from "@/lib/serial-models";
import { FEATURED_LINKS } from "@/lib/featured";
import { FACEBOOK_GROUP_URL } from "@/lib/community";

/**
 * The collections — the things a visitor came to browse. Every primary
 * destination in the header appears here too, so the front door and the
 * navigation describe the same site rather than two different ones.
 */
const COLLECTIONS = [
  {
    href: "/cameras",
    title: "Cameras",
    body: "The H-16 and H-8 lineages, the Auto Cine, the B, C, D and L series, the Zoom Reflex and Automatic lines, and the Super 8 era.",
    count: "54 models",
  },
  {
    href: "/projectors",
    title: "Projectors",
    body: "From the multi-gauge Model G of 1936 to the S-series sound projectors.",
    count: "17 models",
  },
  {
    href: "/lenses",
    title: "Lenses",
    body: "Kern-Paillard, Hugo Meyer, Goerz, Wollensak, SOM Berthiot and Angénieux optics for Bolex cameras.",
    count: "6 makers",
  },
  {
    href: "/accessories",
    title: "Accessories",
    body: "Motors, matte boxes, grips, viewfinders, filters, cases and editing gear, decade by decade.",
    count: "20 pages",
  },
  {
    href: "/ephemera",
    title: "Ephemera",
    body: "Period advertising, dealer catalogues, promotional brochures and the Bolex Reporter magazine.",
    count: "171 pieces",
  },
  {
    href: "/articles",
    title: "Articles",
    body: "Recovered writing from the original site — tips, histories and the serial-number reference.",
    count: "22 articles",
  },
] as const;

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
        <section className="pt-16 sm:pt-20 pb-12">
          <Reveal>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              Paillard-Bolex · Sainte-Croix, Switzerland · 1935–1970s
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl font-[560]">
              Everything Bolex ever made, in one place.
            </h1>
            {/* One line, not three. On a phone every extra line of preamble
                pushes the lookup — and the three cards under it — further off
                the first screen. */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)]">
              Start with the serial number: it will tell you what you are holding, and when it
              was made.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 max-w-2xl">
              {dataset.ranges.length > 0 ? (
                <SerialLookup rows={dataset.ranges} models={models} />
              ) : (
                <div className="border border-[var(--line)] bg-[var(--bg-raised)] p-8">
                  <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
                    The serial tables have not been extracted yet. The lookup activates as soon
                    as they are.
                  </p>
                </div>
              )}
              {/* Why the filter offers two kinds and not three: the recovered
                  lens and accessory pages carry no serial tables at all. */}
              <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.68rem] leading-relaxed text-[var(--fg-soft)]">
                Lenses and accessories were never serial-numbered.{" "}
                <Link href="/serials" className="text-[var(--accent)] hover:underline underline-offset-4">
                  The complete table →
                </Link>
              </p>
            </div>
          </Reveal>
        </section>

        {/*
         * Three doors, where the statistics used to be. Two are fixed because
         * they answer the two questions that follow identifying a camera —
         * where are the other owners, and who can service this — and the third
         * changes between visits so the page can point somewhere different
         * without growing a fourth and fifth card.
         */}
        <section aria-label="Start here" className="rule py-12">
          <ul className="grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            <li>
              <a
                href={FACEBOOK_GROUP_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  The collectors{" "}
                  <span aria-hidden="true" className="text-xs text-[var(--accent)] align-middle">
                    ↗
                  </span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                  The Bolex group on Facebook, where manuals, repairs and finds get shared
                  daily.
                </p>
              </a>
            </li>

            <li>
              <Link
                href="/technicians"
                className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  Find a technician
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                  Who services, repairs and converts these cameras — and how current each
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
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {link.label}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{link.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Collections" className="rule py-14">
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              The collections
            </h2>
          </Reveal>
          <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {COLLECTIONS.map((s, i) => (
              <Reveal key={s.href} as="li" delay={Math.min(i * 0.05, 0.25)}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                      {s.title}
                    </h3>
                    {/* The count sets expectations before the tap — a card that
                        says "171 pieces" reads as a place worth entering. */}
                    <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)] shrink-0">
                      {s.count}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{s.body}</p>
                  <span
                    aria-hidden="true"
                    className="reveal-on-hover mt-5 inline-block font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]"
                  >
                    View →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="rule py-14">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-[560]">
                A preservation project, in the open.
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
                The original site has gone offline. Every recoverable page has been retrieved
                from the Internet Archive and preserved — byte-for-byte — alongside this
                modern edition. Recovery status is public, and every entry states its
                provenance.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-block border border-[var(--fg)] px-5 py-2.5 text-sm uppercase tracking-[0.12em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-200"
              >
                About the restoration
              </Link>
            </div>
          </Reveal>
        </section>

        <section aria-label="Dedication" className="rule py-16">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
                In appreciation
              </p>
              <p className="mt-5 font-[family-name:var(--font-display)] text-2xl sm:text-3xl leading-snug font-[560]">
                This archive is dedicated to Michael Tisdale, who built the original
                BolexCollector.com and shared it freely for nearly twenty years.
              </p>
              <Link
                href="/tribute"
                className="mt-6 inline-block font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--accent)] hover:underline underline-offset-4"
              >
                Read the dedication →
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
