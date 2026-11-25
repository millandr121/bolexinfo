import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { PriceFinder } from "@/components/PriceFinder";
import { getCpi, getPricedItems, getPricePoints } from "@/lib/prices";

export const metadata: Metadata = {
  title: "Prices",
  description:
    "What Bolex equipment cost new, in US dollars, from Paillard's own dated price lists between 1952 and 1979 — with each figure shown in today's money and cited to the document it came from.",
};

export default function PricesPage() {
  const points = getPricePoints();
  const items = getPricedItems();
  const cpi = getCpi();
  const base = cpi.base.year;
  const years = [...new Set(points.map((p) => p.year))].sort((a, b) => a - b);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Prices
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          What Bolex equipment cost <span className="text-[var(--fg)]">new</span>, from
          Paillard&rsquo;s own dated price lists, {years[0]} to {years[years.length - 1]}, in{" "}
          <span className="text-[var(--fg)]">US dollars</span>.
        </p>
      </Reveal>

      {/*
       * The lookup first. Someone arriving here is holding a camera and
       * wants a number for that camera; the chart is worth finding
       * afterwards and a poor thing to be met by.
       */}
      <Reveal delay={0.05}>
        <PriceFinder items={items} baseYear={base} />
      </Reveal>

      {/*
       * One short note, not a methodology chapter. What was here ran to
       * four paragraphs on currency, CPI, OCR and which lists are
       * missing, which is the archive talking to itself. The careful
       * version of all of it is in the repository's research notes,
       * where the next person working on the data will actually look.
       */}
      <Reveal delay={0.1}>
        <section className="mt-16 border-t border-[var(--line)] pt-6">
          <p className="font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
            Every figure is one line of one document, read off the scanned page by eye, and
            is the price to the buyer rather than the dealer&rsquo;s own cost. Today&rsquo;s
            money is the US consumer price index applied to the year of the list, which is a
            blunt instrument for Swiss optics and should be read as rough. Nothing here is
            averaged, estimated, or carried over from a nearby year.
          </p>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
            The price lists were scanned by{" "}
            <a
              href="https://www.pacificrimcamera.com/rl/rlBolex.htm"
              target="_blank"
              rel="noreferrer nofollow"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Pacific Rim Camera ↗
            </a>
            , whose reference library made all of this possible, and the index from the{" "}
            <a
              href={cpi.source.url}
              target="_blank"
              rel="noreferrer nofollow"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              {cpi.source.publisher} ↗
            </a>
            .
          </p>
        </section>
      </Reveal>
    </div>
  );
}
