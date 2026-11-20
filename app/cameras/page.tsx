import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Thumb } from "@/components/Thumb";
import { thumbnailFor } from "@/lib/thumbnails";
import { getCameras } from "@/lib/content";
import { getCameraRecords, type ModelRecord } from "@/lib/museum";

export const metadata: Metadata = {
  title: "Cameras",
  description:
    "Paillard-Bolex motion picture cameras: the H-16 and H-8 lineages, the Auto Cine, the B, C, D and L series, the Zoom Reflex and Automatic lines, and the Super 8 models.",
};

/**
 * Film gauges, in the order the collection reads best. Every recovered model
 * declares its own gauge on its archived page, so there is no catch-all
 * bucket — a model whose gauge somehow can't be read is surfaced under
 * "Gauge unrecorded" rather than silently misfiled.
 */
const FORMAT_ORDER = ["16mm", "8mm", "Super 8", "9.5mm"] as const;
const UNKNOWN_GROUP = "Gauge unrecorded";

function groupKey(m: ModelRecord): string {
  return m.format && (FORMAT_ORDER as readonly string[]).includes(m.format) ? m.format : UNKNOWN_GROUP;
}

export default function CamerasPage() {
  const models = getCameraRecords();
  const provenance = getCameras().provenance;

  /*
   * Chronological within each gauge.
   *
   * The catalogue's own order is recovered-first then alphabetical, which
   * reads oddly here — it puts the H-16 M-3 of 1964 above the H-16 Reflex of
   * 1956, and it buries anything sourced rather than recovered at the bottom
   * of its gauge regardless of date. By year, a reader scrolling the 16mm
   * list watches the line actually develop, and a model added since lands
   * among its contemporaries instead of in an appendix.
   *
   * Models whose year was never recorded keep the alphabetical order and
   * follow the dated ones, rather than being guessed into a position.
   */
  const byYear = (a: ModelRecord, b: ModelRecord) => {
    if (a.introduced && b.introduced) return a.introduced - b.introduced || a.name.localeCompare(b.name);
    if (a.introduced) return -1;
    if (b.introduced) return 1;
    return a.name.localeCompare(b.name);
  };

  const groups = [...FORMAT_ORDER, UNKNOWN_GROUP]
    .map((format) => ({
      format,
      models: models.filter((m) => groupKey(m) === format).sort(byYear),
    }))
    .filter((g) => g.models.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Cameras
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Paillard built these at Sainte-Croix for four decades, from the first H-16 of 1935
          to the Super 8 Macrozoom series. {models.length} models, with their specifications,
          serial ranges and photographs.
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
                  className="group flex h-full items-start gap-4 bg-[var(--bg)] p-5 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <Thumb src={thumbnailFor("cameras", model.slug, model.images)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors duration-200">
                        {model.name}
                      </h3>
                      <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)] shrink-0">
                        {model.introduced ?? "—"}
                      </span>
                    </div>
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {/*
                        The empty case used to read "recovered", which is a
                        claim and not always a true one: a model sourced
                        since says so instead of borrowing the archive's
                        word for itself.
                      */}
                      {model.specs.length > 0
                        ? `${model.specs.length} specifications`
                        : model.recovered
                          ? "recovered"
                          : "added since"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}

      <aside className="rule mt-16 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
        <span className="uppercase tracking-[0.18em]">Provenance: </span>
        {provenance}
      </aside>
    </div>
  );
}
