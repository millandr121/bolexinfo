import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectPage } from "@/components/ObjectPage";
import { getCameraRecords, getCameraRecord } from "@/lib/museum";

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
      (model.specs[0]
        ? `${model.name}: ${model.specs[0].label} — ${model.specs[0].value}`
        : `Paillard-Bolex ${model.name}.`),
  };
}

export default async function CameraPage({ params }: Props) {
  const { slug } = await params;
  const model = getCameraRecord(slug);
  if (!model) notFound();

  return <ObjectPage model={model} section={{ label: "Cameras", href: "/cameras", kind: "cameras" }} />;
}
