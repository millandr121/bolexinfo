import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { LensBrowser } from "@/components/LensBrowser";
import { getLensItems } from "@/lib/lens-items";
import { getRecoveredSection } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Lenses",
  description:
    "Every cine lens the archive holds, one at a time: Kern-Paillard, SOM Berthiot, Angénieux, Hugo Meyer, Goerz and Wollensak, searchable by name, by year, or by the five-letter code on the barrel.",
};

export default function LensesPage() {
  const items = getLensItems();
  const pages = getRecoveredSection("lenses");
  const coded = items.filter((i) => i.codes.length).length;
  const dated = items.filter((i) => i.year).length;
  const added = items.filter((i) => i.added).length;

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Lenses
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The optics supplied on, or computed specifically for, Bolex cameras. {items.length}{" "}
          lenses, each with its own page.
        </p>
        {/*
         * Leading with the codes because that is what someone arriving here
         * with a lens in their hand actually has: five letters engraved on
         * the barrel and nothing else to go on.
         */}
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          {coded} carry Paillard&rsquo;s five-letter code — SWINQ, PIZUI, DAESE — which is
          engraved on the barrel and is what to search if you are holding one. {dated} carry a
          year the original writing states; the rest show the decade of the page they were
          documented on. A decade is never shown as though it were a year.{" "}
          {added > 0 && (
            <>
              {added} were never on the original site at all, and were found in Paillard&rsquo;s
              own price lists while matching codes to the rest.
            </>
          )}
        </p>
      </Reveal>

      <LensBrowser items={items} />

      <section className="mt-16 border-t border-[var(--line)] pt-6" aria-labelledby="original">
        <h2
          id="original"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
        >
          The makers, and the pages these came from
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fg-soft)]">
          Each of these {pages.length} pages opens with an account of the company — who founded
          it, what it was known for, how it came to be supplying Bolex — and then lists its
          lenses. The lenses have been lifted out above; the company histories are only here,
          and are worth reading.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[0.7rem]">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/lenses/${page.slug}`}
                className="text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
