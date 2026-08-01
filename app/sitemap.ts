import type { MetadataRoute } from "next";
import { getRecoveredArticles } from "@/lib/content";
import { getCameraRecords } from "@/lib/museum";
import { getRecoveredSection } from "@/lib/recovered";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const BASE = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/cameras",
    "/projectors",
    "/lenses",
    "/accessories",
    "/serials",
    "/articles",
    "/archive",
    "/timeline",
    "/glossary",
    "/ephemera",
    "/about",
    "/tribute",
  ].map((route) => ({ url: `${BASE}${route}`, changeFrequency: "weekly" as const }));

  const sectionRoutes = (["lenses", "accessories", "ephemera"] as const).flatMap((section) =>
    getRecoveredSection(section).map((page) => ({
      url: `${BASE}/${section}/${page.slug}`,
      changeFrequency: "monthly" as const,
    })),
  );

  const cameraRoutes = getCameraRecords().map((m) => ({
    url: `${BASE}/cameras/${m.slug}`,
    changeFrequency: "monthly" as const,
  }));

  const articleRoutes = getRecoveredArticles().map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    changeFrequency: "yearly" as const,
  }));

  return [...staticRoutes, ...cameraRoutes, ...sectionRoutes, ...articleRoutes];
}
