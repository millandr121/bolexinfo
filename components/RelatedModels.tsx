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
 * Deliberately small. This was two grids of bordered cells running most of a
 * screen, which was the right shape when it was the only way onward — it no
 * longer is. The browse shelf reaches every object in the collection with
 * thumbnails and a category switch, so this does not need to be a second
 * index; it needs to name the handful of models most closely related and
 * stay out of the way. Two lines of text do that.
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
      <section
        aria-label={`More ${sectionLabel.toLowerCase()}`}
        className="rule mt-14 max-w-3xl pt-4"
      >
        <div className="space-y-2">
          {series && (
            <Row label={series.heading ?? `${series.name} line`} models={series.models} />
          )}

          {/*
           * The gauge is named only when the models actually share one. Where
           * the relation widened past it — the H-9 is the only 9.5mm camera the
           * site documented — the label claims nothing more than the period.
           */}
          {era && (
            <Row
              label={era.heading ?? era.label ?? (era.gauge ? `Other ${era.gauge}` : "Same period")}
              models={era.models}
            />
          )}

          <Row
            label=""
            models={[]}
            trailing={
              <Link
                href={sectionHref}
                className="text-[var(--accent)] underline-offset-4 hover:underline"
              >
                All {sectionLabel.toLowerCase()} →
              </Link>
            }
          />
        </div>
      </section>
    </Reveal>
  );
}

/**
 * One line: a label, then the models run together inline.
 *
 * The label is a fixed column at `sm` and above so the two rows line up and
 * read as a small table; below that it stacks, because a 9rem column on a
 * phone leaves the links about forty characters to wrap in.
 */
function Row({
  label,
  models,
  trailing,
}: {
  label: string;
  models: RelatedModel[];
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 text-xs leading-relaxed sm:flex-row sm:gap-3">
      <span
        className="shrink-0 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-[var(--fg-soft)] sm:w-[9rem] sm:pt-px"
        aria-hidden={label ? undefined : "true"}
      >
        {label}
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[0.7rem]">
        {models.map((model, i) => (
          <span key={model.slug}>
            {i > 0 && <span className="text-[var(--fg-soft)] opacity-50"> · </span>}
            <Link href={model.href} className="hover:text-[var(--accent)]">
              {model.name}
              {model.introduced && (
                <span className="text-[var(--fg-soft)] opacity-70"> {model.introduced}</span>
              )}
            </Link>
          </span>
        ))}
        {trailing}
      </span>
    </div>
  );
}
