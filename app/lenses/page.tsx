import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getRecoveredSection, decadeOf } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Lenses",
  description:
    "Cine lenses supplied on or crafted for Bolex cameras — Kern-Paillard, Hugo Meyer, Goerz, Wollensak, SOM Berthiot and Angénieux — recovered from BolexCollector.com.",
};

const MAKER_LABEL: Array<[RegExp, string]> = [
  [/kern/, "Kern-Paillard"],
  [/meyer/, "Hugo Meyer"],
  [/goerz/, "C.P. Goerz"],
  [/wollensak/, "Wollensak"],
  [/berthiot/, "SOM Berthiot"],
  [/angenieux/, "Angénieux"],
];

function makerOf(slug: string): string {
  for (const [re, label] of MAKER_LABEL) if (re.test(slug)) return label;
  return "Other";
}

export default function LensesPage() {
  const pages = getRecoveredSection("lenses");
  const makers = [...new Set(pages.map((p) => makerOf(p.slug)))];

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Lenses
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The manufacturers whose optics were supplied on — or computed specifically for —
          Bolex cameras, organised as the original site organised them: by maker and decade.
        </p>
      </Reveal>

      <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
        {makers.flatMap((maker) =>
          pages
            .filter((p) => makerOf(p.slug) === maker)
            .map((page, i) => (
              <Reveal key={page.slug} as="li" delay={Math.min(i * 0.04, 0.25)}>
                <Link
                  href={`/lenses/${page.slug}`}
                  className="group block h-full bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors">
                    {maker}
                  </h2>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--fg-soft)]">
                    {decadeOf(page.slug) ?? ""}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {page.images.length} lenses pictured
                  </p>
                </Link>
              </Reveal>
            )),
        )}
      </ul>
    </div>
  );
}
