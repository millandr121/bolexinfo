import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { MANUALS, MISSING_NUMBERS, manualHref, manualSize } from "@/lib/manuals";

export const metadata: Metadata = {
  title: "Technical bulletins",
  description:
    "The Bolex Technical Bulletins issued by Paillard Incorporated to its dealers, 1959 to 1962: lens charts, accessories, anamorphic projection and close-up work. Fifteen surviving sheets, hosted here as PDFs.",
};

export default function ManualsPage() {
  const sorted = [...MANUALS].sort((a, b) => a.order - b.order);
  const pages = sorted.reduce((n, m) => n + m.pages, 0);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Technical bulletins
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          Paillard Incorporated, of 100 Sixth Avenue, New York, sent these to its dealers between
          1959 and 1962. They are not service manuals. They are what the person behind the counter
          was expected to know, which in practice means depth of field charts for lenses nobody
          prints charts for any more, what the Unimotor&rsquo;s friction clutch is for, and how to
          mount an anamorphic lens on a Bell &amp; Howell projector.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          Fifteen survive, {pages} pages in all. The series runs to at least number 36, so most of
          it is gone: numbers {MISSING_NUMBERS} are not among them. If you hold any of the missing
          ones, or a later one,{" "}
          <Link href="/suggest" className="text-[var(--accent)] underline underline-offset-4">
            the suggest page
          </Link>{" "}
          is where to say so.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="mt-12 border-t border-[var(--line)]">
          {sorted.map((manual) => (
            <li
              key={manual.id}
              id={manual.id}
              className="scroll-mt-28 border-b border-[var(--line)] py-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-[560]">
                  <a
                    href={manualHref(manual)}
                    className="transition-colors hover:text-[var(--accent)]"
                  >
                    {manual.number}
                  </a>
                </h2>
                <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                  {manual.year ?? "Undated"}
                </p>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">{manual.subject}</p>
              <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
                <a
                  href={manualHref(manual)}
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  PDF
                </a>{" "}
                · {manual.pages} {manual.pages === 1 ? "page" : "pages"} · {manualSize(manual)}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>

      {/*
       * The credit, and the reason for hosting rather than linking. Both
       * belong on the page rather than only in the commit history: someone
       * who wants the better scan should be told where it is, and Pacific Rim
       * did the work of making these exist on the web at all.
       */}
      <Reveal delay={0.1}>
        <section className="mt-12 border-t border-[var(--line)] pt-6" aria-labelledby="provenance">
          <h2
            id="provenance"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Where these came from
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            Every sheet here was scanned by{" "}
            <a
              href="https://www.pacificrimcamera.com/rl/rlBolexMisc.htm"
              target="_blank"
              rel="noreferrer nofollow"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Pacific Rim Camera&rsquo;s reference library
            </a>
            , who put them on the web and ask nothing for it. Their originals are larger and
            sharper than the copies here, and are worth going to if you need to read a figure off
            a chart precisely.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            They are hosted here as well because a library that exists in one place exists
            conditionally, which is the lesson of this entire archive. The copies have been
            recompressed to 150 dpi, which took fifteen documents from 106 MB to 9 MB without
            making anything harder to read, and each one&rsquo;s text layer was kept.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
