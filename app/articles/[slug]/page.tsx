import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { SourceNote } from "@/components/RecoveryBadge";
import { getRecoveredArticles } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

/**
 * Static export requires at least one param. Until the pipeline recovers the
 * original articles, a single noindexed "pending-recovery" status page stands
 * in; it is dropped automatically once real articles exist.
 */
export function generateStaticParams() {
  const articles = getRecoveredArticles();
  return articles.length > 0 ? articles.map((a) => ({ slug: a.slug })) : [{ slug: "pending-recovery" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getRecoveredArticles().find((a) => a.slug === slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getRecoveredArticles().find((a) => a.slug === slug);
  if (!article) {
    if (slug === "pending-recovery") return <PendingRecovery />;
    notFound();
  }

  const html = await marked.parse(article.body);

  return (
    <article className="pt-14 pb-8">
      <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
        <Link href="/articles" className="hover:text-[var(--accent)]">Articles</Link>
      </nav>
      <div className="prose-archive mt-6">
        <h1>{article.title}</h1>
        {/*
          Every article says who wrote it. Michael's carry his credit at
          the foot, as they always did on his site; everything written
          since is bylined at the top. That is the whole of what a reader
          needs, and no article has to justify its existence: this
          section preserves his work and carries it on, which is the
          point of the modern site.
        */}
        {article.author && (
          <p className="not-prose font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]">
            By {article.author}
            {article.date ? ` · ${formatDate(article.date)}` : ""}
          </p>
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {article.originalUrl ? (
        <SourceNote>Written by Michael Tisdale for BolexCollector.com.</SourceNote>
      ) : null}
    </article>
  );
}

/** "2026-11-25" to "25 November 2026", without pulling in a date library. */
function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function PendingRecovery() {
  return (
    <div className="pt-14 pb-8 max-w-2xl">
      <nav aria-label="Breadcrumb" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
        <Link href="/articles" className="hover:text-[var(--accent)]">Articles</Link>
      </nav>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-[560] tracking-tight">
        Articles are being recovered
      </h1>
      <p className="mt-4 text-[var(--fg-soft)] leading-relaxed">
        The original site&rsquo;s articles are inventoried and awaiting retrieval from the
        Internet Archive. Each will be reproduced here verbatim, with its original URL and
        capture date recorded. This placeholder disappears as soon as the first article is
        recovered.
      </p>
    </div>
  );
}
