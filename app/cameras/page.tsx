import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote, RecoveryBadge } from "@/components/RecoveryBadge";
import { getCameras } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cameras",
  description:
    "Every Paillard-Bolex camera documented by the original BolexCollector.com: H-16 and H-8 lines, B, C, D and L series, and the Super 8 models.",
};

const FORMAT_ORDER = ["16mm", "Double 8mm", "Super 8"] as const;

export default function CamerasPage() {
  const { models, provenance } = getCameras();
  const byFormat = FORMAT_ORDER.map((format) => ({
    format,
    models: models.filter((m) => m.format === format),
  })).filter((g) => g.models.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Cameras
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          A complete index of Paillard-Bolex motion picture cameras, as documented by the
          original site — from the first H-16 of 1935 to the Super 8 Macrozoom series.
        </p>
      </Reveal>

      {byFormat.map((group) => (
        <section key={group.format} className="mt-14" aria-label={group.format}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {group.format}
            </h2>
          </Reveal>
          <ul className="mt-4 grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
            {group.models.map((model, i) => (
              <Reveal key={model.slug} as="li" delay={Math.min(i * 0.04, 0.3)}>
                <Link
                  href={`/cameras/${model.slug}`}
                  className="group block h-full bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-200">
                      {model.name}
                    </h3>
                    <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--fg-soft)]">
                      {model.introduced ?? "—"}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-soft)] line-clamp-3">
                    {model.summary ?? "Full description pending recovery from the archived original."}
                  </p>
                  <div className="mt-3">
                    <RecoveryBadge status={model.recovery} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}

      <ProvenanceNote>{provenance}</ProvenanceNote>
    </div>
  );
}
