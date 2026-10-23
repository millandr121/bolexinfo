import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { RelatedModels } from "./RelatedModels";
import { partitionSpecs } from "@/lib/specs";
import type { ModelRecord } from "@/lib/museum";
import { getRelated, type Section } from "@/lib/related";
import { originalArchiveHref } from "@/lib/archive";

/**
 * The object page: one shared layout for every catalogued piece of hardware.
 *
 * Cameras and projectors previously had near-identical copies of this page
 * which had already drifted apart — the projector copy never gained the serial
 * table even though projectors were serial-catalogued just as cameras were.
 * One template keeps the record consistent and gives lenses and accessories
 * something to inherit.
 *
 * The layout answers two complaints about the old single-column version: that
 * the pages scrolled too far, and that the photographs felt dropped in beside
 * the text rather than part of it. Three things follow from that:
 *
 *  - A lead photograph anchors the top of the page, in the same grid row as
 *    the identifying facts, so the object and its description are read
 *    together instead of in sequence.
 *  - The short specifications — dimensions, weight, speeds, mount — are lifted
 *    out into a compact grid near the top, where they take a couple of rows
 *    instead of one full-width row each.
 *  - Only the prose specifications keep a full reading measure below.
 *
 * Nothing is hidden or dropped to achieve this: `partitionSpecs` is a pure
 * regrouping, and both groups are always rendered.
 */
export function ObjectPage({
  model,
  section,
}: {
  model: ModelRecord;
  /** The collection this object belongs to, for the breadcrumb. */
  section: { label: string; href: string; kind?: Section };
}) {
  const archiveHref = originalArchiveHref(model.originalPath);
  const related = section.kind ? getRelated(section.kind, model.slug) : {};
  const { glance, detail } = partitionSpecs(model.specs);
  const hasImages = model.images.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Paillard-Bolex ${model.name}`,
    description: model.summary ?? undefined,
    brand: { "@type": "Brand", name: "Paillard-Bolex" },
    ...(model.introduced ? { releaseDate: String(model.introduced) } : {}),
  };

  return (
    <article className="pt-14 pb-8">
      <Reveal>
        <nav
          aria-label="Breadcrumb"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]"
        >
          <Link href={section.href} className="hover:text-[var(--accent)]">
            {section.label}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{model.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {model.name}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          {model.format && <Fact label="Format">{model.format}</Fact>}
          <Fact label="Introduced">{model.introduced ?? "—"}</Fact>
          {archiveHref && (
            <Fact label="Original archive">
              <a href={archiveHref} className="text-[var(--accent)] underline underline-offset-4">
                View preserved page ↗
              </a>
            </Fact>
          )}
        </dl>
      </Reveal>

      {/*
       * Hero. The photograph and the text share one grid row on wide screens,
       * so neither has to be scrolled past to reach the other. On a phone the
       * grid collapses and `order` puts the photograph first — you see the
       * object, then read about it.
       */}
      <div
        className={`mt-10 grid items-start gap-8 ${
          hasImages ? "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12" : ""
        }`}
      >
        {hasImages && (
          /*
           * The rail sticks while the specifications scroll past it, so the
           * object stays in view for the whole description instead of being
           * left behind at the top of the page. It also puts the otherwise
           * empty right-hand column to use.
           */
          <Reveal className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            <section aria-label="Photographs">
              <ImageGallery images={model.images} caption={model.name} layout="feature" />
            </section>
          </Reveal>
        )}

        <div className="order-2 min-w-0 lg:order-1">
          {model.summary && (
            <Reveal delay={0.05}>
              <p className="max-w-2xl text-lg leading-relaxed">{model.summary}</p>
            </Reveal>
          )}

          {glance.length > 0 && (
            <Reveal delay={0.08}>
              <section aria-label="Key specifications" className={model.summary ? "mt-8" : ""}>
                <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                  At a glance
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)]">
                  {glance.map((spec) => (
                    <div key={spec.label} className="bg-[var(--bg)] px-4 py-3">
                      <dt className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
                        {spec.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          )}

          {/*
           * The detail specifications stay inside the text column rather than
           * starting a new full-width band below the grid. Keeping them here
           * closes the gap that otherwise opened under a short summary, and
           * gives the photograph something to stay beside.
           */}
          {detail.length > 0 && (
            <Reveal delay={0.1}>
              <section aria-label="Specifications" className="mt-12 max-w-3xl">
                <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                  Specifications in detail
                </h2>
                <dl className="mt-4 border-t border-[var(--line)]">
                  {detail.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid gap-1 border-b border-[var(--line)] py-3 sm:grid-cols-[11rem_1fr] sm:gap-6"
                    >
                      <dt className="pt-0.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                        {spec.label}
                      </dt>
                      <dd className="leading-relaxed">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          )}
        </div>
      </div>

      {model.serialRows.length > 0 && <SerialTable model={model} />}

      <RelatedModels
        related={related}
        sectionLabel={section.label}
        sectionHref={section.href}
      />

      {archiveHref && (
        <div className="max-w-3xl">
          <Reveal delay={0.1}>
            <ArchiveCompare originalHref={archiveHref} title={model.name} />
          </Reveal>
        </div>
      )}

      <aside className="rule mt-14 max-w-3xl pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        Recovered from{" "}
        <span className="text-[var(--fg)]">
          {model.originalUrl ?? `bolexcollector.com${model.originalPath ?? ""}`}
        </span>
        {model.capturedAt ? `, Wayback capture ${model.capturedAt}` : ""}. Specifications and serial
        ranges are reproduced verbatim from the archived page.
      </aside>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function SerialTable({ model }: { model: ModelRecord }) {
  return (
    <Reveal delay={0.1}>
      <section aria-label="Serial numbers" className="mt-14">
        <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Serial numbers &amp; production years
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-soft)]">
          As documented on this model&rsquo;s archived page. Look up any serial on the{" "}
          <Link href="/serials" className="text-[var(--accent)] underline underline-offset-4">
            serial lookup
          </Link>{" "}
          page.
        </p>
        <div className="scroll-x mt-4 max-w-md border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left font-[family-name:var(--font-sans)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Serial range
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Year
                </th>
              </tr>
            </thead>
            <tbody className="font-[family-name:var(--font-mono)] text-xs">
              {model.serialRows.map((r, i) => (
                <tr key={`${r.yearFrom}-${r.from}-${i}`} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-2">
                    {r.from?.toLocaleString() ?? "???"} – {r.to?.toLocaleString() ?? "???"}
                  </td>
                  <td className="px-4 py-2 text-[var(--fg-soft)]">
                    {r.yearFrom === r.yearTo ? r.yearFrom : `${r.yearFrom}–${r.yearTo}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Reveal>
  );
}
