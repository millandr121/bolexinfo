import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote, RecoveryBadge } from "@/components/RecoveryBadge";
import { getProjectors } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projectors",
  description:
    "Paillard-Bolex movie projectors for 8mm, Super 8 and 16mm film, from the multi-gauge Model G of 1936 to the S-series sound projectors.",
};

export default function ProjectorsPage() {
  const { models, provenance } = getProjectors();

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Projectors
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Paillard manufactured single and multi-format projectors for 8mm, Super 8 and
          16mm film, aimed mainly at the amateur and home movie market.
        </p>
      </Reveal>

      <ul className="mt-12 grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
        {models.map((model, i) => (
          <Reveal key={model.slug} as="li" delay={Math.min(i * 0.04, 0.3)}>
            <div className="h-full bg-[var(--bg)] p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">{model.name}</h2>
                <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--fg-soft)]">
                  {model.format} · {model.introduced ?? "—"}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-soft)]">
                {model.summary ?? "Full description pending recovery from the archived original."}
              </p>
              <div className="mt-3">
                <RecoveryBadge status={model.recovery} />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      <ProvenanceNote>{provenance}</ProvenanceNote>
    </div>
  );
}
