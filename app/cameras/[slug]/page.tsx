import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote, RecoveryBadge } from "@/components/RecoveryBadge";
import { getCameras } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCameras().models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getCameras().models.find((m) => m.slug === slug);
  if (!model) return {};
  return {
    title: `${model.name} — Cameras`,
    description: model.summary ?? `Paillard-Bolex ${model.name} (${model.format}).`,
  };
}

export default async function CameraPage({ params }: Props) {
  const { slug } = await params;
  const { models, provenance } = getCameras();
  const model = models.find((m) => m.slug === slug);
  if (!model) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Paillard-Bolex ${model.name}`,
    description: model.summary ?? undefined,
    brand: { "@type": "Brand", name: "Paillard-Bolex" },
    ...(model.introduced ? { releaseDate: String(model.introduced) } : {}),
  };

  return (
    <article className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          <Link href="/cameras" className="hover:text-[var(--accent)]">Cameras</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{model.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {model.name}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Format</dt>
            <dd className="mt-0.5">{model.format}</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Introduced</dt>
            <dd className="mt-0.5">{model.introduced ?? "Pending recovery"}</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Recovery status</dt>
            <dd className="mt-0.5"><RecoveryBadge status={model.recovery} /></dd>
          </div>
        </dl>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="prose-archive mt-8">
          <p>{model.summary ?? "The full description of this model has not yet been recovered from the archived original. It will appear here, unaltered, once the preservation pipeline retrieves the page."}</p>
        </div>

        <section aria-label="Original archive" className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-6">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--fg-soft)]">
            View original archive
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            This entry preserves{" "}
            <span className="font-[family-name:var(--font-mono)]">{model.originalPath}</span> from the
            original BolexCollector.com. Once the page is recovered into{" "}
            <span className="font-[family-name:var(--font-mono)]">/archive</span>, the unmodified
            original will be viewable here side-by-side with this modern edition.
          </p>
          {model.originalPath && (
            <p className="mt-3 text-sm">
              <a
                className="text-[var(--accent)] underline underline-offset-4"
                href={`https://web.archive.org/web/2026/http://www.bolexcollector.com${model.originalPath}`}
              >
                Wayback Machine capture ↗
              </a>
            </p>
          )}
        </section>
      </Reveal>

      <ProvenanceNote>{provenance}</ProvenanceNote>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
