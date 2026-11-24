import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { EphemeraBrowser } from "@/components/EphemeraBrowser";
import { getEphemeraItems } from "@/lib/ephemera-items";
import { getRecoveredSection } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Ephemera",
  description:
    "Paillard-Bolex print advertising, catalogues, brochures and the Bolex Reporter, scanned from the original collection and arranged by kind or by year.",
};

export default function EphemeraPage() {
  const items = getEphemeraItems();
  const galleries = getRecoveredSection("ephemera").filter((p) =>
    /^(ads|bro|cat|rep)\d+$/.test(p.slug),
  );
  const dated = items.filter((i) => i.year).length;

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Ephemera
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The printed life of the company: period advertising, dealer catalogues, promotional
          brochures and the <em>Bolex Reporter</em>. {items.length} pieces scanned from the
          original collection.
        </p>
        {/*
         * Saying how much of it is dated, because the by-year view would
         * otherwise look like the whole collection and it is not.
         */}
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          {dated} carry a year, read from the original descriptions. The rest are known only to
          their decade, and are kept under it rather than hidden.
        </p>
      </Reveal>

      <EphemeraBrowser items={items} />

      {galleries.length > 0 && (
        <section className="mt-16 border-t border-[var(--line)] pt-6" aria-labelledby="galleries">
          <h2
            id="galleries"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            The galleries these came from
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fg-soft)]">
            The original site gathered the ephemera into galleries by decade. They are still
            here, in his order.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[0.7rem]">
            {galleries.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/ephemera/${page.slug}`}
                  className="text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
