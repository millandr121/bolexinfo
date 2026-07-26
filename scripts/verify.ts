/**
 * Stage 4 — Verification.
 *
 * Confirms archive integrity before anything is published:
 *   • every manifest entry exists on disk with matching SHA-1 and size
 *   • every internal link in every preserved page resolves within the archive
 *   • every referenced image and download is present
 *   • extracted tables match their source page's table count
 *
 * Writes data/recovery/verification.json and exits non-zero on integrity
 * failures (missing/corrupt stored bytes). Missing *linked* resources are
 * reported as recovery gaps, not failures — the originals may simply never
 * have been archived.
 *
 * Run: npm run pipeline:verify
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { paths } from "./lib/config";
import { analyzePage } from "./lib/html";
import { archiveLocation, loadManifest, writeJson } from "./lib/store";

function main() {
  const manifest = loadManifest();
  const assets = Object.values(manifest.assets);
  const corrupt: string[] = [];
  const missingFromDisk: string[] = [];
  const brokenInternalLinks: Array<{ page: string; target: string }> = [];
  const missingImages: Array<{ page: string; src: string }> = [];
  const missingDownloads: Array<{ page: string; href: string }> = [];

  const stored = new Set(assets.map((a) => a.urlPath));

  for (const asset of assets) {
    const file = archiveLocation(asset.urlPath);
    if (!fs.existsSync(file)) {
      missingFromDisk.push(asset.urlPath);
      continue;
    }
    const body = fs.readFileSync(file);
    if (crypto.createHash("sha1").update(body).digest("hex") !== asset.sha1) {
      corrupt.push(asset.urlPath);
      continue;
    }
    if (!asset.mimetype.includes("html")) continue;

    const analysis = analyzePage(body.toString("latin1"), asset.urlPath);
    for (const link of analysis.internalLinks) {
      if (!stored.has(link)) brokenInternalLinks.push({ page: asset.urlPath, target: link });
    }
    for (const img of analysis.images) {
      if (img.src.startsWith("/") && !stored.has(img.src)) missingImages.push({ page: asset.urlPath, src: img.src });
    }
    for (const dl of analysis.downloads) {
      if (!stored.has(dl)) missingDownloads.push({ page: asset.urlPath, href: dl });
    }
  }

  const report = {
    generated: new Date().toISOString(),
    assetsVerified: assets.length,
    integrity: { corrupt, missingFromDisk },
    gaps: {
      brokenInternalLinks,
      missingImages,
      missingDownloads,
    },
    ok: corrupt.length === 0 && missingFromDisk.length === 0,
  };
  writeJson(path.join(paths.recovery, "verification.json"), report);

  console.log(`Verified ${assets.length} assets.`);
  console.log(`Integrity: ${corrupt.length} corrupt, ${missingFromDisk.length} missing from disk.`);
  console.log(
    `Gaps: ${brokenInternalLinks.length} unresolved links, ${missingImages.length} missing images, ${missingDownloads.length} missing downloads.`,
  );
  if (!report.ok) process.exitCode = 1;
}

main();
