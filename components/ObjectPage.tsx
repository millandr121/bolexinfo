import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { ModelNotes } from "./ModelNotes";
import { partitionSpecs } from "@/lib/specs";
import type { ModelRecord } from "@/lib/museum";
import { getNotes } from "@/lib/notes";
import { PriceAsk } from "./PriceAsk";
import { originalArchiveHref } from "@/lib/archive";
import { hasControls } from "@/lib/controls";
import { BrowseCarousel } from "@/components/BrowseCarousel";
import type { BrowseSection } from "@/lib/browse";

/**
 * The object page: one shared layout for every catalogued piece of hardware.
 *
 * Cameras and projectors previously had near-identical copies of this page
 * which had already drifted apart — the projector copy never gained the serial
 * table even though projectors were serial-catalogued just as cameras were.
 * One template keeps the record consistent and gives lenses and accessories
 * something to inherit.
 *
 * The layout answers two complaints about the old single-column version: that
 * the pages scrolled too far, and that the photographs felt dropped in beside
 * the text rather than part of it. Three things follow from that:
 *
 *  - A lead photograph anchors the top of the page, in the same grid row as
 *    the identifying facts, so the object and its description are read
 *    together instead of in sequence.
 *  - The short specifications — dimensions, weight, speeds, mount — are lifted
 *    out into a compact grid near the top, where they take a couple of rows
 *    instead of one full-width row each.
 *  - Only the prose specifications keep a full reading measure below.
 *
 * Nothing is hidden or dropped to achieve this: `partitionSpecs` is a pure
 * regrouping, and both groups are always rendered.
 */
export function ObjectPage({
  model,
  section,
  browse,
}: {
  model: ModelRecord;
  /** The collection this object belongs to, for the breadcrumb. */
  section: { label: string; href: string; kind?: "cameras" | "projectors" };
  /** Everything there is to browse between, for the shelf at the foot. */
  browse?: { index: BrowseSection[]; sectionId: string };
}) {
  const archiveHref = originalArchiveHref(model.originalPath);
  const notes = getNotes(model.originalPath);
  const { glance, detail } = partitionSpecs(model.specs);
  const hasImages = model.images.length > 0;
  /* The right-hand column earns its place if it has either thing to carry. */
  /* Photographers of anything not recovered from the archive. */
  const credits = [...new Set(model.images.map((i) => i.credit).filter((c): c is string => Boolean(c)))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Paillard-Bolex ${model.name}`,
    description: model.summary ?? undefined,
    brand: { "@type": "Brand", name: "Paillard-Bolex" },
    ...(model.introduced ? { releaseDate: String(model.introduced) } : {}),
  };

  return (
    <article className="pt-14 pb-8">
      <Reveal>
        <nav
          aria-label="Breadcrumb"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]"
        >
          <Link href={section.href} className="hover:text-[var(--accent)]">
            {section.label}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{model.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {model.name}
        </h1>
        {/*
         * Where the original published a numbered figure set, it is offered
         * as a real link rather than the 100×100 icon it used to hide behind
         * in the photo gallery. Only one model has one, so this appears once.
         */}
        {section.kind === "cameras" && hasControls(model.slug) && (
          <Link
            href={`/cameras/${model.slug}/controls`}
            className="tap-target mt-5 gap-2 border border-[var(--line)] px-4 text-[0.72rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            What everything is called
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          {model.format && <Fact label="Format">{model.format}</Fact>}
          <Fact label="Introduced">{model.introduced ?? "Not known"}</Fact>
          {archiveHref && (
            <Fact label="Original archive">
              <a href={archiveHref} className="text-[var(--accent)] underline underline-offset-4">
                View preserved page ↗
              </a>
            </Fact>
          )}
        </dl>
      </Reveal>

      {/*
       * Hero. The photograph and the text share one grid row on wide screens,
       * so neither has to be scrolled past to reach the other. On a phone the
       * grid collapses and `order` puts the photograph first — you see the
       * object, then read about it.
       */}
      {/* The rail is unconditional: with no photographs and no serial
          table it still carries the note saying why there is no table. */}
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        {
          /*
           * The rail sticks while the specifications scroll past it, so the
           * object stays in view for the whole description instead of being
           * left behind at the top of the page. It also puts the otherwise
           * empty right-hand column to use.
           */
          <Reveal className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            {hasImages && (
              <section aria-label="Photographs">
                <ImageGallery images={model.images} caption={model.name} layout="feature" />
              </section>
            )}

            {/*
             * The serial table rides with the photograph rather than
             * sitting at the foot of the page.
             *
             * It is the most looked-up thing on a model page: someone
             * with the camera in their hands wants the year, and they
             * were scrolling past the whole specification list and the
             * notes to reach it. Up here it is visible from the top and
             * stays in view while the rest of the page scrolls under it.
             */}
            {model.serialRows.length > 0 ? <SerialRail model={model} /> : <SerialNote model={model} />}
          </Reveal>
        }

        <div className="order-2 min-w-0 lg:order-1">
          {model.summary && (
            <Reveal delay={0.05}>
              <p className="max-w-2xl text-lg leading-relaxed">{model.summary}</p>
            </Reveal>
          )}

          {glance.length > 0 && (
            <Reveal delay={0.08}>
              <section aria-label="Key specifications" className={model.summary ? "mt-8" : ""}>
                <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                  At a glance
                </h2>
                {/* An odd number of facts left the last cell of the grid
                    empty, showing as a filled rectangle of the rule colour.
                    The final entry widens to close it. */}
                <dl className="mt-4 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] [&>*:last-child:nth-child(odd)]:col-span-2">
                  {glance.map((spec) => (
                    <div key={spec.label} className="bg-[var(--bg)] px-4 py-3">
                      <dt className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
                        {spec.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          )}

          {/*
           * The detail specifications stay inside the text column rather than
           * starting a new full-width band below the grid. Keeping them here
           * closes the gap that otherwise opened under a short summary, and
           * gives the photograph something to stay beside.
           *
           * Set small and tight. This is reference matter that is scanned
           * for one row, not read through: a dozen entries at body size
           * with generous rows ran most of a screen on their own and put
           * the writing below the fold. The label column narrows with it,
           * since the labels are two or three words.
           */}
          {detail.length > 0 && (
            <Reveal delay={0.1}>
              <section aria-label="Specifications" className="mt-12 max-w-3xl">
                <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                  Specifications in detail
                </h2>
                <dl className="mt-3 border-t border-[var(--line)] text-sm">
                  {detail.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid gap-0.5 border-b border-[var(--line)] py-2 sm:grid-cols-[9rem_1fr] sm:gap-5"
                    >
                      <dt className="pt-px font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                        {spec.label}
                      </dt>
                      <dd className="leading-snug">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          )}

          {/*
           * The writing sits in the same column, so the rail stays beside
           * it instead of the page widening out under the specifications.
           */}
          <ModelNotes notes={notes} />
        </div>
      </div>

      {/*
       * The record of where this page came from, all in one place.
       *
       * These were three stacked blocks — the archive viewer, the provenance
       * note, and the line inviting a correction — each with its own rule and
       * its own margin, which cost most of a screen of scrolling to say three
       * short things that belong together. They are one footer now: the same
       * content, one rule, one heading.
       */}
      <section className="rule mt-14 max-w-3xl pt-4" aria-label="Provenance and corrections">
        {archiveHref && (
          <Reveal delay={0.1}>
            <ArchiveCompare originalHref={archiveHref} title={model.name} />
          </Reveal>
        )}

        {/*
         * Two notes, because there are two kinds of page.
         *
         * Most of this is Michael Tisdale's own research and is credited to
         * him. A few models he never covered were researched and added since,
         * and must not borrow his authority by implying otherwise. Getting
         * that wrong would be the quietest and worst failure this site could
         * have.
         *
         * What is deliberately absent is the machinery: which Wayback capture
         * a page came from, and when. That is real and worth keeping, but it
         * is a note to ourselves rather than something a reader wants between
         * them and a camera, so it lives in the archive ledger instead.
         */}
        <p
          className={`font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)] ${
            archiveHref ? "mt-6" : ""
          }`}
        >
          <span className="uppercase tracking-[0.18em]">Source: </span>
        {model.recovered ? (
          <>
            Specifications, serial ranges and photographs by{" "}
            <span className="text-[var(--fg)]">Michael Tisdale</span>.
          </>
        ) : (
          <>
            <span className="text-[var(--fg)]">Added since.</span> Michael Tisdale never
            covered this model; it was researched for this edition.
            {credits.length > 0 && (
              <>
                {" "}
                {/* Not "photographs by": most of these are the
                    manufacturer's own brochure figures, and a document
                    does not take a photograph. */}
                Photographs:{" "}
                <span className="text-[var(--fg)]">{credits.join(", ")}</span>.
              </>
            )}

            {/*
             * The sources, actually listed. A page that says it was
             * researched and then names nothing is asking to be taken on
             * trust, which is the opposite of the point.
             */}
            {model.sources && model.sources.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {model.sources.map((s) => (
                  <li key={s.title} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--accent)]">
                      ·
                    </span>
                    <span>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer nofollow"
                          className="text-[var(--fg)] underline underline-offset-2 hover:text-[var(--accent)]"
                        >
                          {s.title}
                        </a>
                      ) : (
                        <span className="text-[var(--fg)]">{s.title}</span>
                      )}
                      {s.note ? `: ${s.note}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        </p>

        {/*
          Taken from the breadcrumb's href rather than from section.kind,
          because kind is only set for cameras and projectors. This same
          template also renders accessories the archive added itself, the
          Bolex Stereo among them, and those would otherwise file their
          price reports under cameras.
        */}
        <PriceAsk
          slug={model.slug}
          section={
            section.href === "/projectors"
              ? "projectors"
              : section.href === "/accessories"
                ? "accessories"
                : section.href === "/lenses"
                  ? "lenses"
                  : "cameras"
          }
          name={model.name}
        />

        {/* Carries the page with it, so the form opens knowing what it is about. */}
        <p className="mt-3 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          Something wrong, or something to add?{" "}
          <Link
            href={`/suggest?page=${encodeURIComponent(`${section.href}/${model.slug}`)}`}
            className="text-[var(--accent)] underline underline-offset-2"
          >
            Tell us
          </Link>
        </p>
      </section>

      {/*
       * The shelf replaces the previous/next pair that used to sit here. It
       * reaches any object in a few taps instead of one at a time, and it
       * keeps the archived order as a line inside itself rather than losing
       * it. Where no browse index was supplied the old pair still stands.
       */}
      {browse && (
        <BrowseCarousel
          index={browse.index}
          currentSection={browse.sectionId}
          currentSlug={model.slug}
        />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

/**
 * What to say when a model has no serial table of its own.
 *
 * Twenty-nine cameras and fourteen projectors are in that position, and
 * until now their pages said nothing at all, which reads as though the
 * question had never been asked. It has, and there are three different
 * answers to it.
 *
 * The Bolex International bulletin of 1 September 1977 numbers the
 * Swiss-built H, B, C, D and L cameras in one continuous series, so a
 * model without a table of its own is usually still datable: the
 * general lookup is the answer, not a shrug. What falls outside it is
 * the Super 8 line, which Eumig and Chinon built and which the bulletin
 * does not cover, and the earliest cameras, because the bulletin's
 * table opens at 7510 in 1936 and the Auto Cine came first.
 */
function SerialNote({ model }: { model: ModelRecord }) {
  const superEight = model.format === "Super 8";
  const beforeTheTable = model.introduced !== null && model.introduced < 1936;

  const body = superEight ? (
    <>
      Bolex published no serial table for the Super 8 cameras and projectors. The
      September 1977 bulletin numbers the Swiss-built H, B, C, D and L machines only,
      and these were built by Eumig and by Chinon.
    </>
  ) : beforeTheTable ? (
    <>
      The September 1977 bulletin opens its table at 7510 in 1936, so this one is
      older than the record. Nothing the archive holds dates it by its number.
    </>
  ) : (
    <>
      No table of its own. The September 1977 bulletin numbers the H, B, C, D and L
      cameras in one series, so a number from this one can still be dated.{" "}
      <Link href="/serials" className="text-[var(--accent)] underline underline-offset-2">
        Look up a serial
      </Link>
    </>
  );

  return (
    <section
      aria-label="Serial numbers"
      className="mt-8 border border-[var(--line)] lg:mt-6"
    >
      <h2 className="border-b border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">
        Serial numbers
      </h2>
      <p className="px-3 py-2.5 text-[0.65rem] leading-relaxed text-[var(--fg-soft)]">{body}</p>
    </section>
  );
}

/**
 * Serial numbers, in the right-hand rail.
 *
 * Narrow, so the two columns are set as a plain grid rather than a
 * table that would need to scroll sideways at 20rem. Years run to four
 * digits and serials to six, which fits with room to spare.
 *
 * The longest table here is nineteen rows, which would push the rail
 * past the height of the window and stop it sticking, so the list
 * scrolls within itself past about a dozen. The median model has six
 * and never scrolls at all.
 */
function SerialRail({ model }: { model: ModelRecord }) {
  return (
    <section
      aria-label="Serial numbers"
      className="mt-8 border border-[var(--line)] lg:mt-6"
    >
      <h2 className="border-b border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">
        Serial numbers
      </h2>

      <dl className="max-h-[21rem] overflow-y-auto font-[family-name:var(--font-mono)] text-[0.7rem]">
        {model.serialRows.map((r, i) => (
          <div
            key={`${r.yearFrom}-${r.from}-${i}`}
            className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] px-3 py-1.5 last:border-0"
          >
            <dt className="tabular-nums">
              {r.from?.toLocaleString() ?? "???"} – {r.to?.toLocaleString() ?? "???"}
            </dt>
            <dd className="shrink-0 tabular-nums text-[var(--fg-soft)]">
              {r.yearFrom === r.yearTo ? r.yearFrom : `${r.yearFrom}–${r.yearTo}`}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-[var(--line)] px-3 py-2 text-[0.65rem] leading-relaxed text-[var(--fg-soft)]">
        Bolex International S.A. bulletin, September 1977.{" "}
        <Link href="/serials" className="text-[var(--accent)] underline underline-offset-2">
          Look up a serial
        </Link>
      </p>
    </section>
  );
}
