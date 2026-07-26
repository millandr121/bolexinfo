import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getEditorial } from "@/lib/content";

export const metadata: Metadata = {
  title: "About the Restoration",
  description:
    "How and why the original BolexCollector.com is being preserved and rebuilt, with the owner's permission, as a permanent digital archive.",
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
