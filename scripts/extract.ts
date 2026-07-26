/**
 * Stage 3 — Extraction.
 *
 * Converts preserved HTML into structured, presentation-independent content:
 *
 *   articles           → content/articles/<slug>.md   (frontmatter + Markdown)
 *   camera pages       → data/cameras/<slug>.json     (specs merged onto seed)
 *   projector pages    → data/projectors/<slug>.json
 *   lens pages         → data/lenses/<slug>.json
 *   accessory pages    → data/accessories/<slug>.json
 *   serial tables      → data/serials/ranges.json
 *   glossary           → data/glossary.json
 *   timeline           → data/timeline.json
 *   every <table>      → data/tables/<page>.json      (verbatim, lossless)
 *
 * Nothing is deleted from /archive — extraction is additive and repeatable.
 *
 * Run: npm run pipeline:extract
 */
import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";
import { paths } from "./lib/config";
import { analyzePage, parseSerialRanges } from "./lib/html";
import { archiveLocation, loadManifest, writeJson } from "./lib/store";

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

const SECTION_OF = (urlPath: string): string => {
  const seg = urlPath.replace(/^\//, "").split("/")[0] ?? "";
  if (seg.includes(".html") || seg === "") return "root";
  return seg;
};

const slugOf = (urlPath: string): string =>
  path
    .basename(urlPath, ".html")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "index";

function frontmatter(fields: Record<string, string | string[] | undefined>): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const v of value) lines.push(`  - ${JSON.stringify(v)}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

function main() {
  const manifest = loadManifest();
  const pages = Object.values(manifest.assets).filter((a) => a.mimetype.includes("html"));
  if (pages.length === 0) {
    console.error("Archive is empty — run `npm run pipeline:download` first.");
    process.exitCode = 1;
    return;
  }

  let articles = 0;
  let datasets = 0;
  let tables = 0;
  const allSerialRanges: ReturnType<typeof parseSerialRanges> = [];

  for (const asset of pages) {
    const file = archiveLocation(asset.urlPath);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "latin1");
    const analysis = analyzePage(html, asset.urlPath);
    const section = SECTION_OF(asset.urlPath);
    const slug = slugOf(asset.urlPath);

    // Verbatim table preservation for every page that has tables.
    if (analysis.tables.length > 0) {
      writeJson(path.join(paths.data, "tables", section, `${slug}.json`), {
        source: asset.urlPath,
        capturedAt: asset.timestamp,
        tables: analysis.tables,
      });
      tables += analysis.tables.length;
    }

    // Serial ranges can appear on camera, projector and article pages alike.
    const ranges = parseSerialRanges(analysis.tables);
    if (ranges.length > 0) {
      allSerialRanges.push(
        ...ranges.map((r) => ({ ...r, note: r.note ?? `source: ${asset.urlPath} @ ${asset.timestamp}` })),
      );
    }

    if (section === "articles") {
      const markdown = turndown.turndown(html);
      const md =
        frontmatter({
          title: analysis.title.replace(/^Bolex Collector \| /, ""),
          originalUrl: `http://www.bolexcollector.com${asset.urlPath}`,
          originalPath: asset.urlPath,
          capturedAt: asset.timestamp,
          description: analysis.description || undefined,
          images: analysis.images.map((i) => i.src),
        }) + markdown;
      fs.mkdirSync(path.join(paths.content, "articles"), { recursive: true });
      fs.writeFileSync(path.join(paths.content, "articles", `${slug}.md`), md);
      articles++;
    } else if (["cameras", "projectors", "lenses", "accessories", "ephemera"].includes(section) || asset.urlPath === "/glossary.html" || asset.urlPath === "/timeline.html") {
      const dir = asset.urlPath === "/glossary.html" || asset.urlPath === "/timeline.html" ? "reference" : section;
      writeJson(path.join(paths.data, dir, `${slug}.json`), {
        slug,
        title: analysis.title.replace(/^Bolex Collector \| /, ""),
        originalUrl: `http://www.bolexcollector.com${asset.urlPath}`,
        originalPath: asset.urlPath,
        capturedAt: asset.timestamp,
        description: analysis.description,
        bodyText: analysis.bodyText,
        images: analysis.images,
        internalLinks: analysis.internalLinks,
        tables: analysis.tables,
      });
      datasets++;
    }
  }

  if (allSerialRanges.length > 0) {
    writeJson(path.join(paths.data, "serials", "ranges.json"), {
      source:
        "Extracted from preserved bolexcollector.com pages; original data credited by the site to the Bolex International S.A. bulletin 'Serial Numbers and Date of Manufacture' (Sept 1, 1977) and Paillard service manuals.",
      generated: new Date().toISOString(),
      ranges: allSerialRanges,
    });
  }

  console.log(`Extracted ${articles} articles, ${datasets} datasets, ${tables} tables, ${allSerialRanges.length} serial ranges.`);
}

main();
