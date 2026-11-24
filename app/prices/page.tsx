import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PriceChart } from "@/components/PriceChart";
import { PriceFinder } from "@/components/PriceFinder";
import { getCpi, getPricedItems, getPricePoints, getPriceSeries } from "@/lib/prices";

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
  const series = getPriceSeries().slice(0, 5);
  const years = [...new Set(points.map((p) => p.year))].sort((a, b) => a - b);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Prices
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          What {items.length} pieces of Bolex equipment cost{" "}
          <span className="text-[var(--fg)]">new</span>, from Paillard&rsquo;s own dated price
          lists, {years[0]} to {years[years.length - 1]}. Every figure is in{" "}
          <span className="text-[var(--fg)]">US dollars</span>, was read off the page rather
          than taken from a scan&rsquo;s OCR, and names the document it came from.
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
       * Said once, plainly, and early. The question people actually
       * arrive with is what their camera is worth, and this page does
       * not answer it. Better to be told that in the second screen than
       * to work it out from a methodology note at the bottom.
       */}
      <Reveal delay={0.05}>
        <aside className="mt-12 border border-[var(--line)] bg-[var(--bg-raised)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            This is not what yours is worth
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-soft)]">
            These are shop prices from the 1950s to the 1970s, not valuations. What a Bolex
            sells for today turns far more on condition than on model &mdash; a recently
            serviced H-16 and a seized one are the same entry here and several times apart in
            price.{" "}
            <Link href="/worth" className="text-[var(--accent)] underline underline-offset-4">
              How to work out what yours is worth
            </Link>{" "}
            is its own page, and every item page takes what you paid so the archive can
            eventually answer it properly.
          </p>
        </aside>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-16" aria-labelledby="chart">
          <h2
            id="chart"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            How prices moved
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            The five things the archive can follow across the most years. Paillard held its
            American prices remarkably still: the eye-level focus was US$37.75 in 1952 and
            US$37.75 in 1965, and the Yvar 75mm actually came <em>down</em>. Then the 1970s
            arrive. Switch the reading to see the same figures in {base} money, where the flat
            ones are quietly falling all along.
          </p>
          <PriceChart series={series} baseYear={base} />
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-16 border-t border-[var(--line)] pt-6" aria-labelledby="method">
          <h2
            id="method"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Where the figures come from
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            <p>
              <span className="text-[var(--fg)]">US dollars, every one.</span> These are
              American price lists, and the figures include tax where the list said they did.
              For another currency, convert from the {base} figure rather than the historical
              one, with{" "}
              <a
                href="https://www.xe.com/currencyconverter/"
                target="_blank"
                rel="noreferrer nofollow"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                a live converter ↗
              </a>
              . This archive does not bake in a rate: a figure printed here today would be
              wrong within the week, and sources already disagree with each other by several
              per cent.
            </p>
            <p>
              <span className="text-[var(--fg)]">Each price is one line of one document.</span>{" "}
              Nothing averaged, estimated, or carried across from a nearby year. The scans are
              OCR&rsquo;d, and OCR gets digits wrong, so every figure published here was read
              off the rendered page by eye. Open any row&rsquo;s detail for the document and
              its own wording.
            </p>
            <p>
              <span className="text-[var(--fg)]">
                The {base} figures are approximate, and CPI is blunt.
              </span>{" "}
              Converted with the US consumer price index, annual averages, from the{" "}
              {cpi.source.publisher}.{" "}
              <a
                href={cpi.source.url}
                target="_blank"
                rel="noreferrer nofollow"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                The series ↗
              </a>{" "}
              It measures a general basket of consumer goods and says nothing about the Swiss
              franc, about tariffs, or about the cost of precision optics in particular, all of
              which plainly matter here. The {base} base figure came from compilations of the
              index rather than a published annual-average table read directly, so the adjusted
              numbers are rounded and should be treated as rough. The 1952 to 1979 values are
              the official ones.
            </p>
            <p>
              <span className="text-[var(--fg)]">What is missing.</span> Seven price lists have
              been read and four more exist, including the Super 8 ones. There is nothing
              before 1952: the 1946 catalogue tells the reader to consult a price list that has
              not been found.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
