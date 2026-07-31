import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ImageGallery } from "@/components/ImageGallery";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getProjectorRecords } from "@/lib/museum";
import { originalArchiveHref } from "@/lib/archive";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectorRecords().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getProjectorRecords().find((m) => m.slug === slug);
  if (!model) return {};
  return {
    title: `${model.name} — Projectors`,
    description: model.summary ?? `Paillard-Bolex ${model.name} projector.`,
  };
}

export default async function ProjectorPage({ params }: Props) {
  const { slug } = await params;
  const model = getProjectorRecords().find((m) => m.slug === slug);
  if (!model) notFound();
  const archiveHref = originalArchiveHref(model.originalPath);

  return (
    <article className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          <Link href="/projectors" className="hover:text-[var(--accent)]">Projectors</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{model.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {model.name}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          {model.format && (
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Format</dt>
              <dd className="mt-0.5">{model.format}</dd>
            </div>
          )}
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Introduced</dt>
            <dd className="mt-0.5">{model.introduced ?? "—"}</dd>
          </div>
        </dl>
      </Reveal>

      {model.summary && (
        <Reveal>
          <p className="mt-8 text-lg leading-relaxed max-w-2xl">{model.summary}</p>
        </Reveal>
      )}

      {model.images.length > 0 && (
        <Reveal>
          <section aria-label="Photographs" className="mt-10">
            <ImageGallery images={model.images} caption={model.name} />
          </section>
        </Reveal>
      )}

      {model.specs.length > 0 && (
        <Reveal>
          <section aria-label="Specifications" className="mt-12">
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              Specifications
            </h2>
            <dl className="mt-4 border-t border-[var(--line)]">
              {model.specs.map((spec) => (
                <div key={spec.label} className="grid sm:grid-cols-[13rem_1fr] gap-1 sm:gap-6 border-b border-[var(--line)] py-3">
                  <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--fg-soft)] pt-0.5">
                    {spec.label}
                  </dt>
                  <dd className="leading-relaxed">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      )}

      {archiveHref && (
        <Reveal>
          <ArchiveCompare originalHref={archiveHref} title={model.name} />
        </Reveal>
      )}

      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        Recovered from{" "}
        <span className="text-[var(--fg)]">{model.originalUrl ?? `bolexcollector.com${model.originalPath ?? ""}`}</span>
        {model.capturedAt ? `, Wayback capture ${model.capturedAt}` : ""}, reproduced verbatim.
      </aside>
    </article>
  );
}
