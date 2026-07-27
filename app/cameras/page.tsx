import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getCameras } from "@/lib/content";
import { getCameraRecords, type ModelRecord } from "@/lib/museum";

export const metadata: Metadata = {
  title: "Cameras",
  description:
    "Every Paillard-Bolex camera recovered from BolexCollector.com: the H-16 and H-8 lineages, the Auto Cine, B/C/D/L series, the Zoom Reflex and Automatic lines, and the Super 8 models.",
};

const FORMAT_ORDER = ["16mm", "Double 8mm", "8mm", "Super 8", "9.5mm"] as const;

function groupKey(m: ModelRecord): string {
  return m.format && FORMAT_ORDER.includes(m.format as (typeof FORMAT_ORDER)[number]) ? m.format : "Other models";
}

export default function CamerasPage() {
  const models = getCameraRecords();
  const provenance = getCameras().provenance;

  const groups = [...FORMAT_ORDER, "Other models"]
    .map((format) => ({ format, models: models.filter((m) => groupKey(m) === format) }))
    .filter((g) => g.models.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Cameras
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The complete recovered index of Paillard-Bolex motion picture cameras — {models.length} models
          from the first H-16 of 1935 to the Super 8 Macrozoom series, each with its original
          specifications preserved from the archived site.
        </p>
      </Reveal>

      {groups.map((group) => (
        <section key={group.format} className="mt-14" aria-label={group.format}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {group.format}
            </h2>
          </Reveal>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {group.models.map((model, i) => (
              <Reveal key={model.slug} as="li" delay={Math.min(i * 0.03, 0.25)}>
                <Link
                  href={`/cameras/${model.slug}`}
                  className="group block h-full bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors duration-200">
                      {model.name}
                    </h3>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)] shrink-0">
                      {model.introduced ?? "—"}
                    </span>
                  </div>
                  <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {model.specs.length > 0 ? `${model.specs.length} specifications` : "recovered"}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}

      <aside className="rule mt-16 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        {provenance} Full specifications, images, and serial tables are recovered verbatim from the
        archived pages; format and year are inferred from each page&rsquo;s own header where not
        curated.
      </aside>
    </div>
  );
}
