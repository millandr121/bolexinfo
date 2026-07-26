import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote, RecoveryBadge } from "@/components/RecoveryBadge";
import { getAccessoryCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Accessories for Bolex cameras — motors, matte boxes, grips, viewfinders, filters, cases and editing equipment — organized by type and decade.",
};

export default function AccessoriesPage() {
  const { categories, provenance } = getAccessoryCategories();

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Accessories
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Most accessories were manufactured by Paillard in Switzerland, joined over the
          years by aftermarket items and modifications. The original site organized them
          by type and decade; that organization is preserved here.
        </p>
      </Reveal>

      <ul className="mt-12 grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
        {categories.map((category, i) => (
          <Reveal key={category.slug} as="li" delay={Math.min(i * 0.04, 0.3)}>
            <div className="h-full bg-[var(--bg)] p-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">{category.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-soft)]">{category.summary}</p>
              <div className="mt-3">
                <RecoveryBadge status={category.recovery} />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      <ProvenanceNote>{provenance}</ProvenanceNote>
    </div>
  );
}
