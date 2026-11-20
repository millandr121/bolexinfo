import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { RecoveredContent } from "@/components/RecoveredContent";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getRecoveredPage, getRecoveredSection } from "@/lib/recovered";
import { originalArchiveHref } from "@/lib/archive";
import { getBrowseIndex } from "@/lib/browse";
import { BrowseCarousel } from "@/components/BrowseCarousel";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getRecoveredSection("lenses").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getRecoveredPage("lenses", slug);
  if (!page) return {};
  return { title: `${page.title} — Lenses`, description: page.description };
}

export default async function LensPage({ params }: Props) {
  const { slug } = await params;
  const page = getRecoveredPage("lenses", slug);
  if (!page) notFound();
  const archiveHref = originalArchiveHref(page.originalPath);

  return (
    <article className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          <Link href="/lenses" className="hover:text-[var(--accent)]">Lenses</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{page.title}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {page.title}
        </h1>
      </Reveal>

      <Reveal>
        <RecoveredContent blocks={page.blocks} treatment="product" />
      </Reveal>


      {archiveHref && (
        <Reveal>
          <ArchiveCompare originalHref={archiveHref} title={page.title} />
        </Reveal>
      )}

      <p className="rule mt-12 pt-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        Something wrong, or something to add?{" "}
        <Link href={`/suggest?page=${encodeURIComponent(`/lenses/${slug}`)}`} className="text-[var(--accent)] underline underline-offset-2">
          Tell us
        </Link>
      </p>

      <BrowseCarousel
        index={getBrowseIndex()}
        currentSection="lenses"
        currentSlug={slug}
      />
      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        Text and photographs by Michael Tisdale.
      </aside>
    </article>
  );
}
