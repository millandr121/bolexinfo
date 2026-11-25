import type { Metadata } from "next";
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

      <Reveal delay={0.1}>
        <section className="mt-16" aria-labelledby="chart">
          <h2
            id="chart"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            How prices moved
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            The five things the archive can follow across the most price lists. Several now
            appear in five of the ten, the extension tubes reaching furthest of all: US$15.00
            in 1952 and US$120.00 in 1979. The matte box went US$84.50 in 1965 to US$412.00 in
            1979, which looks like a thing getting five times dearer. Switch the reading to{" "}
            {base} money and it roughly doubles instead, the rest of the climb being the 1970s
            happening to everything at once. The Pan Cinor Compact, on the same switch, barely
            moves at all. That gap, between what the sticker did and what it meant, is most of
            what this chart is for.
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
                Two lists nine months apart, and almost nothing moved.
              </span>{" "}
              Both 1952 catalogues carry a full retail list, February and November, and setting
              them side by side is the closest thing here to watching Paillard think. Every
              H-16 and H-8 outfit sold with a single lens held its price to the cent. What rose
              was the three-lens outfits, by $7.00 and $8.05, and four lenses bought on their
              own: the Yvar 75mm from $87.50 to $94.50, and the three small Yvars by a few
              dollars each. The November list also prices an H-8 with the Yvar 13mm that the
              February one does not sell at all.
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
              <span className="text-[var(--fg)]">What is missing.</span> Every Bolex price
              list Pacific Rim holds has now been read, ten of them, together with the retail
              lists bound into both 1952 catalogues. There is nothing before 1952: the 1946
              catalogue names its lenses but tells the reader to consult a price list that has
              not been found. The 1965 catalogue prices nothing at all. Three more lists are
              known to exist and are not on the site, each named as the one its successor
              replaced: February 1969 and July 1971 for 16mm, and June 1971 for Super 8.
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
