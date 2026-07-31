import type { MetadataRoute } from "next";
import { getRecoveredArticles } from "@/lib/content";
import { getCameraRecords } from "@/lib/museum";

export const dynamic = "force-static";

const BASE = "https://bolexcollector.com";

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
    "/about",
    "/tribute",
  ].map((route) => ({ url: `${BASE}${route}`, changeFrequency: "weekly" as const }));

  const cameraRoutes = getCameraRecords().map((m) => ({
    url: `${BASE}/cameras/${m.slug}`,
    changeFrequency: "monthly" as const,
  }));

  const articleRoutes = getRecoveredArticles().map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    changeFrequency: "yearly" as const,
  }));

  return [...staticRoutes, ...cameraRoutes, ...articleRoutes];
}
