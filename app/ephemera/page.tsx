import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { decadeOf, ephemeraTypeOf, getRecoveredSection } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Ephemera",
  description:
    "Paillard-Bolex print advertising, catalogues, brochures and the Bolex Reporter magazine — scanned from the original collection and recovered from BolexCollector.com.",
};

const TYPE_ORDER = ["Advertising", "Brochures", "Catalogs", "Bolex Reporter", "Other"];

export default function EphemeraPage() {
  const pages = getRecoveredSection("ephemera");
  const groups = TYPE_ORDER.map((type) => ({
    type,
    pages: pages.filter((p) => ephemeraTypeOf(p.slug) === type),
  })).filter((g) => g.pages.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Ephemera
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The printed life of the company: period advertising, dealer catalogues, promotional
          brochures and the <em>Bolex Reporter</em> magazine — {pages.length} pieces scanned
          from the original collection.
        </p>
      </Reveal>

      {groups.map((group) => (
        <section key={group.type} className="mt-14" aria-label={group.type}>
          <Reveal>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                {group.type}
              </h2>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                {group.pages.length}
              </span>
            </div>
          </Reveal>
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)]">
            {group.pages.map((page, i) => {
              const cover = page.images[0];
              return (
                <Reveal key={page.slug} as="li" delay={Math.min(i * 0.015, 0.2)}>
                  <Link
                    href={`/ephemera/${page.slug}`}
                    className="group flex h-full flex-col bg-[var(--bg)] p-4 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                  >
                    {cover && (
                      <div className="document mb-3 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover.src}
                          alt={cover.alt || page.title}
                          loading="lazy"
                          className="w-full aspect-[3/4] object-contain bg-white transition-transform duration-500 group-hover:scale-[1.03] no-touch-zoom"
                        />
                      </div>
                    )}
                    <h3 className="text-sm leading-snug group-hover:text-[var(--accent)] transition-colors">
                      {page.title}
                    </h3>
                    <p className="mt-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {decadeOf(page.slug) ?? ""}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
