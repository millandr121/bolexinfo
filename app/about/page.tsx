import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getEditorial } from "@/lib/content";

export const metadata: Metadata = {
  title: "About this archive",
  description:
    "What this site is, where it came from, and how the original BolexCollector.com is kept alongside it.",
};

export default async function AboutPage() {
  const editorial = getEditorial("restoring-bolexcollector");
  if (!editorial) notFound();
  const html = await marked.parse(editorial.body);

  return (
    <article className="pt-14 pb-8">
      <div className="prose-archive" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
