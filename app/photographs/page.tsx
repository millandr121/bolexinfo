import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ARCHIVAL_PHOTOGRAPHS, creditLine } from "@/lib/archival";

export const metadata: Metadata = {
  title: "Archive photographs",
  description:
    "Photographs of Paillard and Bolex from public collections: the works at Sainte-Croix, a 1937 projector, a Bolex rigged to film an eclipse, each with its photographer, holding institution and licence.",
};

/**
 * Photographs from outside this archive.
 *
 * They get a page of their own rather than being scattered through the
 * site, for two reasons. The first is that they are not Michael's: the
 * rest of this site is a recovery of BolexCollector.com, and material
 * that did not come from there should be visibly separate rather than
 * quietly mixed in. The second is that each one carries conditions, and
 * conditions need somewhere they can be stated in full instead of
 * squeezed into a caption.
 *
 * They are shown large and uncropped. Several are licensed in ways that
 * forbid alteration, and the rest are photographs rather than product
 * shots, so none of them get the blending the catalogue plates receive.
 */
export default function PhotographsPage() {
  return (
    <div className="py-10 sm:py-14">
      <Reveal>
        <header className="max-w-3xl">
          <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.25em] text-[var(--accent)]">
            From other collections
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight leading-[1.08]">
            Archive photographs
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--fg-soft)]">
            Almost everything on this site was recovered from
            BolexCollector.com. These were not. They come from public
            collections that allow their material to be reused, and they
            answer something the original site could not: what Paillard
            looked like as a company, rather than as a shelf of cameras.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
            Each one names its photographer, the collection that holds it,
            that collection&rsquo;s own reference for it, and the licence it is
            published under. Nothing here has been cropped or retouched.
          </p>
        </header>
      </Reveal>

      <div className="mt-14 space-y-20">
        {ARCHIVAL_PHOTOGRAPHS.map((photo) => (
          <Reveal key={photo.slug}>
            <figure id={photo.slug} className="scroll-mt-24">
              {/*
                Capped by height rather than width. Several of these are
                portrait glass plates, and a portrait plate given the full
                width of a desktop page is three screens tall, and the reader
                never sees the photograph, only part of it.
              */}
              <div className="bg-[var(--bg-raised)] border border-[var(--line)] p-3 sm:p-5 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[76svh] w-auto max-w-full h-auto"
                />
              </div>

              <figcaption className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-[minmax(0,1fr)_17rem]">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                    {photo.when}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-[560] leading-snug">
                    {photo.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-[var(--fg-soft)] max-w-prose">
                    {photo.note}
                  </p>
                </div>

                {/*
                 * The provenance, set apart and in the monospace face, so
                 * it reads as a record rather than as prose — and so that
                 * it is obvious at a glance that every photograph has one.
                 */}
                <dl className="font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)] border-t border-[var(--line)] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                  <dt className="uppercase tracking-[0.18em] text-[0.62rem]">
                    Photograph
                  </dt>
                  <dd className="mt-1 text-[var(--fg)]">{photo.photographer}</dd>

                  <dt className="mt-3 uppercase tracking-[0.18em] text-[0.62rem]">
                    Collection
                  </dt>
                  <dd className="mt-1">
                    {photo.collection}
                    <br />
                    <span className="text-[var(--fg)]">{photo.reference}</span>
                  </dd>

                  <dt className="mt-3 uppercase tracking-[0.18em] text-[0.62rem]">
                    Licence
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={photo.licence.href}
                      rel="license noopener noreferrer"
                      target="_blank"
                      className="underline underline-offset-2 hover:text-[var(--accent)]"
                    >
                      {photo.licence.name}
                    </a>
                    {/*
                      Spelled out rather than left as an acronym. These are
                      obligations this site is under, and a reader who wants
                      to reuse the photograph themselves is under them too.
                    */}
                    {(photo.licence.nonCommercial || photo.licence.noDerivatives) && (
                      <span className="block mt-1 text-[0.62rem] leading-relaxed normal-case tracking-normal">
                        {photo.licence.nonCommercial && "Non-commercial use. "}
                        {photo.licence.noDerivatives && "Shown unaltered, as the licence requires."}
                      </span>
                    )}
                  </dd>

                  <dt className="mt-3 uppercase tracking-[0.18em] text-[0.62rem]">
                    Record
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={photo.source}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline underline-offset-2 hover:text-[var(--accent)] break-words"
                    >
                      View at source
                    </a>
                  </dd>
                </dl>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {/*
       * What is missing, and why.
       *
       * The gaps are the most informative thing on this page. Someone who
       * wonders why there is no photograph of the assembly line should be
       * told that one exists, who holds it, and that it has not been taken.
       */}
      <Reveal>
        <section className="mt-20 border-t border-[var(--line)] pt-8 max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
            What is not here
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
            There are photographs of Bolex cameras being assembled at
            Yverdon and of the Bolex repair workshop. They are held by the
            Musée d&rsquo;Yverdon et région and published with all rights
            reserved, so they are not reproduced here. The same is true of
            the only surviving material found anywhere on Jacques
            Bogopolsky, who designed the camera the company was named for.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
            Bolex International&rsquo;s own historical photographs are the best
            that exist of the early years. Its site states that they may not
            be reproduced without written permission, so none are used.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
            If you hold photographs of Paillard or Bolex and would be happy
            to see them preserved, the{" "}
            <Link
              href="/suggest"
              className="underline underline-offset-2 hover:text-[var(--accent)]"
            >
              suggestions page
            </Link>{" "}
            reaches us directly.
          </p>
        </section>
      </Reveal>

      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        <span className="uppercase tracking-[0.18em]">Credits: </span>
        {ARCHIVAL_PHOTOGRAPHS.map((p, i) => (
          <span key={p.slug}>
            {i > 0 && " · "}
            {creditLine(p)}
          </span>
        ))}
        .
      </aside>
    </div>
  );
}
