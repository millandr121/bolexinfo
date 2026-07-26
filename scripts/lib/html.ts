import { parse, type HTMLElement } from "node-html-parser";

export interface PageAnalysis {
  title: string;
  description: string;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{ src: string; alt: string }>;
  downloads: string[];
  tables: string[][][];
  bodyText: string;
}

const DOWNLOAD_EXTENSIONS = /\.(pdf|zip|mov|mp4|avi|doc|txt)$/i;

/** Normalize an in-page href/src to a site-relative path, or null if external. */
export function toSitePath(raw: string, basePath: string): string | null {
  const href = raw.trim();
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) return null;
  // Un-rewrite Wayback Machine URLs if the capture was fetched without id_.
  const wayback = /^https?:\/\/web\.archive\.org\/web\/\d+(?:[a-z_]+)?\/(https?:\/\/.*)$/i.exec(href);
  const target = wayback?.[1] ?? href;
  try {
    const url = new URL(target, `http://bolexcollector.com${basePath}`);
    if (!/(^|\.)bolexcollector\.com$/i.test(url.hostname)) return null;
    return url.pathname + (url.search || "");
  } catch {
    return null;
  }
}

/** Extract every preservable feature of an archived HTML page. */
export function analyzePage(html: string, basePath: string): PageAnalysis {
  const root = parse(html);
  stripWaybackChrome(root);

  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  const downloads = new Set<string>();

  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href") ?? "";
    const sitePath = toSitePath(href, basePath);
    if (sitePath) {
      internalLinks.add(sitePath);
      if (DOWNLOAD_EXTENSIONS.test(sitePath)) downloads.add(sitePath);
    } else if (/^https?:\/\//i.test(href) && !href.includes("web.archive.org")) {
      externalLinks.add(href);
    }
  }

  const images = root
    .querySelectorAll("img[src]")
    .map((img) => ({
      src: toSitePath(img.getAttribute("src") ?? "", basePath) ?? img.getAttribute("src") ?? "",
      alt: img.getAttribute("alt") ?? "",
    }))
    .filter((img) => img.src.length > 0);

  return {
    title: root.querySelector("title")?.text.trim() ?? "",
    description:
      root.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "",
    internalLinks: [...internalLinks],
    externalLinks: [...externalLinks],
    images,
    downloads: [...downloads],
    tables: extractTables(root),
    bodyText: root.querySelector("body")?.structuredText ?? "",
  };
}

/** Extract every <table> as rows of cell text — the raw material for JSON datasets. */
export function extractTables(root: HTMLElement): string[][][] {
  return root.querySelectorAll("table").map((table) =>
    table
      .querySelectorAll("tr")
      .map((tr) => tr.querySelectorAll("td, th").map((cell) => cell.structuredText.trim()))
      .filter((row) => row.some((cell) => cell.length > 0)),
  );
}

/**
 * Remove Wayback Machine toolbar/injected chrome from a capture that was
 * fetched without the id_ flag, so only original bytes are analyzed.
 */
function stripWaybackChrome(root: HTMLElement): void {
  for (const selector of ["#wm-ipp-base", "#wm-ipp", "#donato", "script[src*='web.archive.org']", "link[href*='web.archive.org/_static']"]) {
    root.querySelectorAll(selector).forEach((el) => el.remove());
  }
  root.querySelectorAll("comment").forEach(() => {});
}

/** Serial-range table heuristics: a row like ["1936", "1001 – 2500"]. */
export interface SerialRange {
  year: number;
  from: number;
  to: number;
  note?: string;
}

export function parseSerialRanges(tables: string[][][]): SerialRange[] {
  const ranges: SerialRange[] = [];
  for (const table of tables) {
    for (const row of table) {
      const yearCell = row.find((c) => /^(19[2-9]\d)$/.test(c.trim()));
      const rangeCell = row.find((c) => /^[\d,.']+\s*[-–—to]+\s*[\d,.']+$/i.test(c.trim()));
      if (!yearCell || !rangeCell) continue;
      const nums = rangeCell.match(/[\d,.']+/g)?.map((n) => Number(n.replace(/[,.']/g, "")));
      if (!nums || nums.length < 2 || nums[0] === undefined || nums[1] === undefined) continue;
      ranges.push({ year: Number(yearCell), from: nums[0], to: nums[1] });
    }
  }
  return ranges.sort((a, b) => a.year - b.year || a.from - b.from);
}
