import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote, RecoveryBadge } from "@/components/RecoveryBadge";
import { getLensMakers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lenses",
  description:
    "Cine lenses supplied on or crafted for Bolex cameras: Kern-Paillard, Hugo Meyer, Goerz, Wollensak, SOM Berthiot and Angénieux.",
};

export default function LensesPage() {
  const { makers, provenance } = getLensMakers();

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Lenses
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The manufacturers whose optics were supplied on — or specifically computed for —
          Bolex cameras, organized as the original site organized them: by maker and decade.
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-px bg-[var(--line)] border border-[var(--line)]">
        {makers.map((maker, i) => (
          <Reveal key={maker.slug} as="li" delay={Math.min(i * 0.05, 0.3)}>
            <div className="bg-[var(--bg)] p-7 sm:flex sm:items-start sm:gap-10">
              <div className="sm:w-56 shrink-0">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560]">{maker.name}</h2>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--fg-soft)]">
                  {maker.country}
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <p className="text-sm leading-relaxed text-[var(--fg-soft)] max-w-xl">{maker.summary}</p>
                <div className="mt-3">
                  <RecoveryBadge status={maker.recovery} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      <ProvenanceNote>{provenance}</ProvenanceNote>
    </div>
  );
}
