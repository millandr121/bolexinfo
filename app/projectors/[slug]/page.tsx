import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectPage } from "@/components/ObjectPage";
import { getProjectorRecords } from "@/lib/museum";
import { resolveNeighbours } from "@/lib/sequence";
import { getBrowseIndex } from "@/lib/browse";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectorRecords().map((m) => ({ slug: m.slug }));
}

function record(slug: string) {
  return getProjectorRecords().find((m) => m.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = record(slug);
  if (!model) return {};
  return {
    title: `${model.name} — Projectors`,
    description: model.summary ?? `Paillard-Bolex ${model.name} projector.`,
  };
}

export default async function ProjectorPage({ params }: Props) {
  const { slug } = await params;
  const model = record(slug);
  if (!model) notFound();

  const neighbours = resolveNeighbours(
    "projectors",
    slug,
    getProjectorRecords().map((m) => ({ slug: m.slug, label: m.name })),
  );

  return (
    <ObjectPage
      model={model}
      section={{ label: "Projectors", href: "/projectors", kind: "projectors" }}
      neighbours={neighbours}
      browse={{ index: getBrowseIndex(), sectionId: "projectors" }}
    />
  );
}
