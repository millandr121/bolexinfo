import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { accessoryTypeOf, decadeOf, getRecoveredSection } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Accessories for Bolex cameras — motors, viewfinders, filters, cases, tripods, grips and editing equipment — recovered from BolexCollector.com and organised by type and decade.",
};

const TYPE_ORDER = [
  "Motors",
  "Viewfinders",
  "Filters & Lens Accessories",
  "Tripods & Grips",
  "Cases",
  "Editing Equipment",
  "Miscellaneous",
  "Other",
];

export default function AccessoriesPage() {
  const pages = getRecoveredSection("accessories");
  const groups = TYPE_ORDER.map((type) => ({
    type,
    pages: pages.filter((p) => accessoryTypeOf(p.slug) === type),
  })).filter((g) => g.pages.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Accessories
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Most were manufactured by Paillard in Switzerland, joined over the years by
          aftermarket items and modifications. The original site organised them by type and
          decade; that organisation is preserved here.
        </p>
      </Reveal>

      {groups.map((group) => (
        <section key={group.type} className="mt-12" aria-label={group.type}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {group.type}
            </h2>
          </Reveal>
          <ul className="mt-4 grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {group.pages.map((page, i) => (
              <Reveal key={page.slug} as="li" delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  href={`/accessories/${page.slug}`}
                  className="group block h-full bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors">
                    {decadeOf(page.slug) ?? page.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {page.images.length} pictured
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
