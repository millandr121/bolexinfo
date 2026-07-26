import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getRecoveredArticles, getUrlInventory } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles, tips and images related to vintage 8mm, 16mm and Super 8 movie cameras, recovered from the original BolexCollector.com.",
};

export default function ArticlesPage() {
  const articles = getRecoveredArticles();
  const knownArticlePages = getUrlInventory().entries.filter((e) => e.section === "articles");

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Articles
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          The original site&rsquo;s articles: tips, stories, factory films, serial number
          references and Paillard-Bolex items not covered elsewhere. Each is preserved
          verbatim as it was recovered.
        </p>
      </Reveal>

      {articles.length > 0 ? (
        <ul className="mt-12 grid gap-px bg-[var(--line)] border border-[var(--line)]">
          {articles.map((article, i) => (
            <Reveal key={article.slug} as="li" delay={Math.min(i * 0.04, 0.3)}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <h2 className="font-[family-name:var(--font-display)] text-xl font-[560] group-hover:text-[var(--accent)] transition-colors">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="mt-2 text-sm text-[var(--fg-soft)]">{article.description}</p>
                )}
              </Link>
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal delay={0.1}>
          <div className="mt-12 border border-[var(--line)] bg-[var(--bg-raised)] p-8 max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
              Recovery in progress
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              {knownArticlePages.length} article pages are inventoried and awaiting retrieval
              from the Internet Archive. Recovered articles will appear here verbatim, with
              their original URLs and capture dates recorded.
            </p>
            <ul className="mt-5 grid gap-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
              {knownArticlePages.map((page) => (
                <li key={page.path}>
                  {page.title.replace(/^Bolex Collector \| Articles \| /, "")} —{" "}
                  <span className="opacity-70">{page.path}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </div>
  );
}
