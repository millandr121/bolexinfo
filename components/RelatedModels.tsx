import Link from "next/link";
import { Reveal } from "./Reveal";
import type { RelatedContext, RelatedModel } from "@/lib/related";

/**
 * Onward links from an object page.
 *
 * Without these every model page is a terminus: someone who has just
 * identified a camera from its serial number lands on it and has nowhere to
 * go, even though the next thing they want is almost always the rest of its
 * line or what else was being made alongside it.
 *
 * Two bands, strongest relation first. The line is bounded and ordered by
 * nearness in year, so an eighteen-model series shows the neighbouring
 * variants rather than becoming a second index.
 */
export function RelatedModels({
  related,
  sectionLabel,
  sectionHref,
}: {
  related: RelatedContext;
  /** "Cameras" / "Projectors", for the fall-through link to the full index. */
  sectionLabel: string;
  sectionHref: string;
}) {
  const { series, era } = related;
  if (!series && !era) return null;

  return (
    <Reveal delay={0.1}>
      <section aria-label={`More ${sectionLabel.toLowerCase()}`} className="mt-16 max-w-3xl">
        <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Related models
        </h2>

        {series && (
          <Band title={series.heading ?? `The ${series.name} line`} models={series.models} />
        )}

        {/*
         * The gauge is named only when the models actually share one. Where
         * the relation widened past it — the H-9 is the only 9.5mm camera the
         * site documented — the heading claims nothing more than the period.
         */}
        {era && (
          <Band
            title={
              era.heading ??
              (era.gauge
                ? `${era.gauge} ${sectionLabel.toLowerCase()} of the same period`
                : "Others of the same period")
            }
            subtitle={era.heading ? undefined : era.label}
            models={era.models}
          />
        )}

        <p className="mt-8 font-[family-name:var(--font-mono)] text-xs">
          <Link href={sectionHref} className="text-[var(--accent)] hover:underline underline-offset-4">
            All {sectionLabel.toLowerCase()} →
          </Link>
        </p>
      </section>
    </Reveal>
  );
}

function Band({
  title,
  subtitle,
  models,
}: {
  title: string;
  subtitle?: string;
  models: RelatedModel[];
}) {
  return (
    <div className="mt-6">
      <h3 className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        {title}
        {subtitle && <span className="ml-2 opacity-70">· {subtitle}</span>}
      </h3>
      <ul className="mt-3 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
        {models.map((model) => (
          /*
           * The grid draws its separators as a one-pixel gap over a line
           * coloured background, so an odd count would leave the empty cell
           * showing as a solid block. A lone trailing item spans the row
           * instead.
           */
          <li key={model.slug} className="sm:[&:last-child:nth-child(odd)]:col-span-2">
            <Link
              href={model.href}
              className="group flex h-full items-baseline justify-between gap-3 bg-[var(--bg)] px-4 py-3 transition-colors duration-200 hover:bg-[var(--bg-raised)]"
            >
              <span className="font-[family-name:var(--font-display)] text-base font-[560] transition-colors group-hover:text-[var(--accent)]">
                {model.name}
              </span>
              <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                {model.introduced ?? model.gauge}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
