import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PriceChart } from "@/components/PriceChart";
import { getCpi, getPricePoints, getPriceSeries } from "@/lib/prices";

export const metadata: Metadata = {
  title: "What it cost",
  description:
    "What Bolex equipment cost new, from Paillard's own dated price lists between 1952 and 1979, in dollars of the day and in today's money.",
};

function money(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function PricesPage() {
  const points = getPricePoints();
  const cpi = getCpi();
  const base = cpi.base.year;

  /*
   * Five lines. More would be unreadable, and the palette was validated
   * for five. The pick is simply the longest-running, which happens to
   * put 1952 and 1979 both on the chart and to include two of the
   * prices that never moved — so the flat stretch and the 1970s climb
   * are visible in the same frame rather than argued for in prose.
   */
  const series = getPriceSeries().slice(0, 5);

  const years = [...new Set(points.map((p) => p.year))].sort((a, b) => a - b);
  const outfit = points.find((p) => p.asPrinted.startsWith("H-16 De luxe with Switar 25mm F:1.4, Yvar"));
  const cheapest = [...points].sort((a, b) => a.nominal - b.nominal)[0]!;
  const dearest = [...points].sort((a, b) => b.adjusted - a.adjusted)[0]!;

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          What it cost
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          {points.length} prices from Paillard&rsquo;s own dated price lists, {years[0]} to{" "}
          {years[years.length - 1]}. Every one was read off the page rather than taken from the
          scan&rsquo;s OCR, and every one is cited on the item it belongs to.
        </p>
      </Reveal>

      {/*
       * Three figures before the chart, because most people who open this
       * page want one number and a feeling, not a plot.
       */}
      <Reveal delay={0.05}>
        <dl className="rule mt-10 grid gap-x-8 gap-y-6 pt-6 sm:grid-cols-3">
          {outfit && (
            <Stat label={`An H-16 outfit, ${outfit.year}`} value={money(outfit.adjusted)}>
              {money(outfit.nominal)} then, for the De luxe with three lenses and a case
            </Stat>
          )}
          <Stat label={`Dearest thing listed`} value={money(dearest.adjusted)}>
            {dearest.asPrinted.slice(0, 48)}, {dearest.year}
          </Stat>
          <Stat label="Cheapest" value={money(cheapest.adjusted)}>
            {cheapest.asPrinted.slice(0, 48)}, {cheapest.year}
          </Stat>
        </dl>
        <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--fg-soft)]">
          Large figures are approximate {base} money; the small ones are what the list said.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-14" aria-labelledby="chart">
          <h2
            id="chart"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            The things we can follow
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            Five that appear in more than one list, and the five the archive can follow
            longest. Switch the reading and some of them change direction. The eye-level focus
            and the prismatic focuser never moved a cent between 1952 and 1965, so in
            today&rsquo;s money they were quietly getting cheaper the whole time; the Yvar 75mm
            fell in plain dollars too. The matte box and the Macro Yvar went the other way, and
            both climb steeply once the 1970s arrive. Paillard was not doing one thing to its
            prices, and the chart is more interesting for it.
          </p>
          <PriceChart series={series} baseYear={base} />
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-14" aria-labelledby="flat">
          <h2
            id="flat"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Prices that did not move at all
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            The eye-level focus was $37.75 in February 1952 and $37.75 in June 1965. The
            prismatic focuser was $19.75 across the same thirteen years. The Tripod H held
            $99.50 through three lists and two years, and the Switar 16mm f/1.8 was $99.50 in
            1967 and still $99.50 in 1972. Meanwhile the Yvar 75mm f/2.8 actually came{" "}
            <em>down</em>, from $87.50 in 1952 to $69.50 by 1967. Paillard seems to have held
            its American prices still for as long as it could, and then not been able to.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-14 border-t border-[var(--line)] pt-6" aria-labelledby="method">
          <h2
            id="method"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            How this was made, and what it is not
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            <p>
              <span className="text-[var(--fg)]">The figures are new prices, not values.</span>{" "}
              This is what Paillard asked a dealer or a customer in a given month. It is not
              what a camera is worth now, and nothing here should be read as a valuation. What
              a sixty-year-old Bolex sells for today depends far more on condition than on
              model: a serviced H-16 and a seized one are the same entry in this archive and
              several times apart in price.
            </p>
            <p>
              <span className="text-[var(--fg)]">Every price is one line of one document.</span>{" "}
              Nothing is averaged, estimated or carried across from a nearby year. The scans
              are OCR&rsquo;d, but OCR gets digits wrong, so each figure published here was
              read off the rendered page by eye. Each item&rsquo;s own page names the list and
              links the scan.
            </p>
            <p>
              <span className="text-[var(--fg)]">The adjustment is CPI, and CPI is blunt.</span>{" "}
              Converted with the US consumer price index, annual averages, {cpi.source.publisher}
              , expressed in {base} money.{" "}
              <a
                href={cpi.source.url}
                target="_blank"
                rel="noreferrer nofollow"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                The series ↗
              </a>{" "}
              It measures a general basket of consumer goods and says nothing about the Swiss
              franc, about tariffs, or about what happened to precision optics in particular —
              all three of which plainly matter to this chart. The {base} base figure was taken
              from compilations of the index rather than read off a published annual-average
              table, so adjusted numbers are rounded and should be treated as approximate. The
              1952 to 1979 values are the official ones.
            </p>
            <p>
              <span className="text-[var(--fg)]">Where a year has several versions</span> — a
              lens in plain, preset and multicoated form — the line follows the cheapest, so it
              does not jump when a dearer variant appears. The table under the chart names
              exactly what was priced.
            </p>
            <p>
              <span className="text-[var(--fg)]">What is missing.</span> Seven price lists have
              been read and four more exist, including the Super 8 ones. There is no pricing at
              all before 1952, and the 1946 catalogue says to consult a price list that has not
              been found. Most of all there is nothing here about the second-hand market, which
              is the question most people actually arrive with. That needs a different kind of
              evidence, and the most useful thing anyone reading this can do is{" "}
              <Link
                href="/suggest"
                className="text-[var(--accent)] underline underline-offset-4"
              >
                tell us what they paid
              </Link>
              .
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        {label}
      </dt>
      <dd className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-[560] tracking-tight">
        {value}
      </dd>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-[0.62rem] leading-relaxed text-[var(--fg-soft)]">
        {children}
      </p>
    </div>
  );
}
