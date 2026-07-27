import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ImageGallery } from "@/components/ImageGallery";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getCameras } from "@/lib/content";
import { getCameraRecords, getCameraRecord, type ModelRecord } from "@/lib/museum";
import { originalArchiveHref } from "@/lib/archive";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getCameraRecords().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getCameraRecord(slug);
  if (!model) return {};
  return {
    title: `${model.name} — Cameras`,
    description:
      model.summary ??
      (model.specs[0] ? `${model.name}: ${model.specs[0].label} — ${model.specs[0].value}` : `Paillard-Bolex ${model.name}.`),
  };
}

export default async function CameraPage({ params }: Props) {
  const { slug } = await params;
  const model = getCameraRecord(slug);
  if (!model) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Paillard-Bolex ${model.name}`,
    description: model.summary ?? undefined,
    brand: { "@type": "Brand", name: "Paillard-Bolex" },
    ...(model.introduced ? { releaseDate: String(model.introduced) } : {}),
  };
  const archiveHref = originalArchiveHref(model.originalPath);

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
          {archiveHref && (
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Original archive</dt>
              <dd className="mt-0.5">
                <a href={archiveHref} className="text-[var(--accent)] underline underline-offset-4">
                  View preserved page ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      </Reveal>

      {model.summary && (
        <Reveal delay={0.05}>
          <p className="mt-8 text-lg leading-relaxed max-w-2xl">{model.summary}</p>
        </Reveal>
      )}

      {model.images.length > 0 && (
        <Reveal delay={0.1}>
          <section aria-label="Photographs" className="mt-10">
            <ImageGallery images={model.images} caption={model.name} />
          </section>
        </Reveal>
      )}

      {model.specs.length > 0 && (
        <Reveal delay={0.1}>
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

      {model.serialRows.length > 0 && <SerialTable model={model} />}

      {archiveHref && (
        <Reveal delay={0.1}>
          <ArchiveCompare originalHref={archiveHref} title={model.name} />
        </Reveal>
      )}

      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        Recovered from{" "}
        <span className="text-[var(--fg)]">{model.originalUrl ?? `bolexcollector.com${model.originalPath ?? ""}`}</span>
        {model.capturedAt ? `, Wayback capture ${model.capturedAt}` : ""}. Specifications and serial
        ranges are reproduced verbatim from the archived page.
      </aside>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

function SerialTable({ model }: { model: ModelRecord }) {
  return (
    <Reveal delay={0.1}>
      <section aria-label="Serial numbers" className="mt-12">
        <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Serial numbers &amp; production years
        </h2>
        <p className="mt-3 text-sm text-[var(--fg-soft)]">
          As documented on this model&rsquo;s archived page. Look up any serial on the{" "}
          <Link href="/serials" className="text-[var(--accent)] underline underline-offset-4">
            serial lookup
          </Link>{" "}
          page.
        </p>
        <div className="mt-4 max-w-md overflow-x-auto border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-[family-name:var(--font-sans)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] border-b border-[var(--line)]">
                <th scope="col" className="px-4 py-2.5 font-semibold">Serial range</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Year</th>
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
