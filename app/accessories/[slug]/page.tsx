import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { RecoveredContent } from "@/components/RecoveredContent";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { ObjectPage } from "@/components/ObjectPage";
import { AccessoryItemPage } from "@/components/AccessoryItemPage";
import { getAccessoryItem, getAccessoryItems } from "@/lib/accessory-items";
import { getAddedRecord, getAddedRecords } from "@/lib/museum";
import { getRecoveredPage, getRecoveredSection } from "@/lib/recovered";
import { originalArchiveHref } from "@/lib/archive";
import { getBrowseIndex } from "@/lib/browse";
import { BrowseCarousel } from "@/components/BrowseCarousel";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

/*
 * Two kinds of page live under this route. The recovered ones are Michael's
 * own, a page per type and decade. The added ones are single objects this
 * archive researched, which the original site had nowhere to put. They share
 * a URL space because a reader does not care which is which, and the page
 * itself says so where it matters.
 */
export function generateStaticParams() {
  return [
    ...getRecoveredSection("accessories").map((p) => ({ slug: p.slug })),
    ...getAddedRecords("accessories").map((m) => ({ slug: m.slug })),
    ...getAccessoryItems().map((i) => ({ slug: i.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getRecoveredPage("accessories", slug);
  if (page) return { title: `${page.title} · Accessories`, description: page.description };
  const added = getAddedRecord("accessories", slug);
  if (added) {
    return {
      title: `${added.name} · Accessories`,
      description: added.summary ?? `The ${added.name}, a Bolex accessory.`,
    };
  }
  const item = getAccessoryItem(slug);
  if (item) {
    return {
      title: `${item.name} · Accessories`,
      description: item.description.slice(0, 180),
    };
  }
  return {};
}

export default async function AccessoryPage({ params }: Props) {
  const { slug } = await params;
  const page = getRecoveredPage("accessories", slug);
  if (!page) {
    const item = getAccessoryItem(slug);
    if (item) return <AccessoryItemPage item={item} />;
    const added = getAddedRecord("accessories", slug);
    if (!added) notFound();
    return (
      <ObjectPage
        model={added}
        section={{ label: "Accessories", href: "/accessories" }}
      />
    );
  }
  const archiveHref = originalArchiveHref(page.originalPath);

  return (
    <article className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          <Link href="/accessories" className="hover:text-[var(--accent)]">Accessories</Link>
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
        <Link href={`/suggest?page=${encodeURIComponent(`/accessories/${slug}`)}`} className="text-[var(--accent)] underline underline-offset-2">
          Tell us
        </Link>
      </p>

      <BrowseCarousel
        index={getBrowseIndex()}
        currentSection="accessories"
        currentSlug={slug}
      />
      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
        Text and photographs by Michael Tisdale.
      </aside>
    </article>
  );
}
