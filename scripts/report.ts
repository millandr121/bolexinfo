/**
 * Stage 5 — Reporting.
 *
 * Renders the human-readable recovery report from the machine records the
 * earlier stages produced. Written to docs/reports/recovery-report.md.
 *
 * Run: npm run pipeline:report
 */
import path from "node:path";
import fs from "node:fs";
import { paths } from "./lib/config";
import { loadManifest, readJson } from "./lib/store";
import type { DiscoveredUrl } from "./discover";

interface Verification {
  generated: string;
  assetsVerified: number;
  integrity: { corrupt: string[]; missingFromDisk: string[] };
  gaps: {
    brokenInternalLinks: Array<{ page: string; target: string }>;
    missingImages: Array<{ page: string; src: string }>;
    missingDownloads: Array<{ page: string; href: string }>;
  };
  ok: boolean;
}

function main() {
  const manifest = loadManifest();
  const discovered = readJson<{ urls: DiscoveredUrl[] }>(path.join(paths.recovery, "discovered.json"), { urls: [] });
  const verification = readJson<Verification | null>(path.join(paths.recovery, "verification.json"), null);
  const failures = readJson<{ failures: Array<{ urlPath: string; reason: string }> }>(
    path.join(paths.recovery, "download-failures.json"),
    { failures: [] },
  );

  const assets = Object.values(manifest.assets);
  const byType = (pred: (m: string) => boolean) => assets.filter((a) => pred(a.mimetype));
  const pages = byType((m) => m.includes("html"));
  const images = byType((m) => m.startsWith("image/"));
  const pdfs = byType((m) => m.includes("pdf"));
  const downloads = byType((m) => m.includes("zip") || m.includes("octet") || m.includes("pdf"));
  const recoveredPaths = new Set(assets.map((a) => a.urlPath));
  const missingPages = discovered.urls.filter((u) => !recoveredPaths.has(u.urlPath));

  const lines = [
    "# BolexCollector.com Recovery Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| URLs discovered | ${discovered.urls.length} |`,
    `| Assets preserved | ${assets.length} |`,
    `| Pages recovered | ${pages.length} |`,
    `| Images recovered | ${images.length} |`,
    `| PDFs recovered | ${pdfs.length} |`,
    `| Downloads recovered | ${downloads.length} |`,
    `| Revisions preserved | ${assets.reduce((n, a) => n + a.revisions.length, 0)} |`,
    `| Pages still missing | ${missingPages.length} |`,
    `| Download failures | ${failures.failures.length} |`,
    "",
  ];

  if (verification) {
    lines.push(
      "## Verification",
      "",
      `Integrity check: ${verification.ok ? "✅ passed" : "❌ FAILED"} (${verification.assetsVerified} assets)`,
      `- Corrupt: ${verification.integrity.corrupt.length}`,
      `- Missing from disk: ${verification.integrity.missingFromDisk.length}`,
      `- Unresolved internal links: ${verification.gaps.brokenInternalLinks.length}`,
      `- Missing images: ${verification.gaps.missingImages.length}`,
      `- Missing downloads: ${verification.gaps.missingDownloads.length}`,
      "",
    );
  }

  if (missingPages.length > 0) {
    lines.push("## Pages needing recovery or manual review", "");
    for (const page of missingPages.slice(0, 200)) {
      lines.push(`- \`${page.urlPath}\` (known from: ${page.sources.join(", ")})`);
    }
    lines.push("");
  }

  fs.mkdirSync(paths.docsReports, { recursive: true });
  fs.writeFileSync(path.join(paths.docsReports, "recovery-report.md"), lines.join("\n"));
  console.log(`Wrote docs/reports/recovery-report.md (${assets.length} assets, ${missingPages.length} gaps).`);
}

main();
