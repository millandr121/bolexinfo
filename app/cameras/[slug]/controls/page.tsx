import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { CONTROLS_PAGES, getControls } from "@/lib/controls";
import { getCameraRecord } from "@/lib/museum";

export function generateStaticParams() {
  // Only the models that actually published a figure set.
  return Object.keys(CONTROLS_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = getCameraRecord(slug);
  const name = model?.name ?? slug;
  return {
    title: `${name} — controls`,
    description: `Every named control and part of the Paillard-Bolex ${name}, numbered as the original instructions numbered them.`,
  };
}

export default async function ControlsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const controls = getControls(slug);
  const model = getCameraRecord(slug);
  if (!controls || !model) notFound();

  /*
   * The figures number their parts continuously — figure 1 ends at 10 and
   * figure 2 begins at 11 — which is not obvious from the markup, where each
   * list restarts. The original's own captions prove it: figure 2 refers to
   * "the film knife (14)", its fourth item, and figure 3 to "the loop shaper
   * lever (24)", its fourth. Restarting each list at 1 would make every
   * cross-reference on the page point at the wrong part.
   */
  let running = 0;
  const figures = controls.figures.map((figure) => {
    const start = running + 1;
    running += figure.parts.length;
    return { ...figure, start };
  });

  const totalParts = running;

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          <Link href={`/cameras/${slug}`} className="hover:text-[var(--accent)]">
            {model.name}
          </Link>
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          What everything is called
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          {totalParts} named controls and parts of the {model.name}, numbered as Paillard
          numbered them. Reproduced from the instructions page of the original site.
        </p>
      </Reveal>

      {figures.map((figure, i) => (
        <Reveal key={figure.caption} delay={i === 0 ? 0.05 : 0}>
          <section className="mt-14" aria-labelledby={`fig-${i}`}>
            <h2
              id={`fig-${i}`}
              className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em] text-[var(--accent)]"
            >
              {figure.caption}
            </h2>

            {figure.image && (
              <figure className="mt-4">
                <div className="plate border border-[var(--line)] p-3 inline-block max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={figure.image}
                    alt={`${model.name}: ${figure.caption}`}
                    loading={i === 0 ? undefined : "lazy"}
                    className="max-w-full h-auto"
                  />
                </div>
                {figure.imageCaption && (
                  <figcaption className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)] max-w-xl">
                    {figure.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {figure.parts.length > 0 && (
              <ol className="mt-5 grid sm:grid-cols-2 gap-x-8 border-t border-[var(--line)]">
                {figure.parts.map((part, n) => (
                  <li
                    key={`${part}-${n}`}
                    className="flex gap-3 border-b border-[var(--line)] py-2.5 text-sm leading-relaxed"
                  >
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)] tabular-nums w-6 shrink-0 pt-0.5">
                      {figure.start + n}
                    </span>
                    <span>{part}</span>
                  </li>
                ))}
              </ol>
            )}

            {figure.notes.map((note, n) => (
              <p key={n} className="mt-4 text-sm leading-relaxed text-[var(--fg-soft)] max-w-xl">
                {note}
              </p>
            ))}
          </section>
        </Reveal>
      ))}

      <Reveal>
        <aside className="rule mt-16 pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          <span className="uppercase tracking-[0.18em]">Provenance — </span>
          Recovered from{" "}
          <span className="text-[var(--fg)]">bolexcollector.com{controls.originalPath}</span>.
          Figures and part names are reproduced verbatim; the numbering is the original&rsquo;s,
          running continuously across all four figures.
        </aside>
      </Reveal>
    </div>
  );
}
