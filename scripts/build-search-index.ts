/**
 * Builds the static search index consumed by the ⌘K palette
 * (public/search-index.json) and the RSS feed (public/feed.xml) from the
 * structured content. Runs automatically before every `next build`.
 *
 * Run standalone: npm run search:index
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCameraRecords, getProjectorRecords } from "../lib/museum";
import { getAccessoryItems } from "../lib/accessory-items";
import { getLensItems } from "../lib/lens-items";
import { getEphemeraItems } from "../lib/ephemera-items";
import { getRecoveredSection } from "../lib/recovered";
import { getLinkDirectory, getUpdates } from "../lib/directory";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = <T>(p: string, fallback: T): T =>
  fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T) : fallback;

interface Entry {
  slug: string;
  name: string;
  country?: string;
  summary: string | null;
}

interface Doc {
  title: string;
  href: string;
  section: string;
  keywords?: string;
  summary?: string;
}

const docs: Doc[] = [
  { title: "Cameras", href: "/cameras", section: "index" },
  { title: "Projectors", href: "/projectors", section: "index" },
  { title: "Lenses", href: "/lenses", section: "index" },
  { title: "Accessories", href: "/accessories", section: "index" },
  { title: "Serial Number Lookup", href: "/serials", section: "tools", keywords: "date year manufacture serial" },
  { title: "Articles", href: "/articles", section: "index" },
  { title: "Archive & Recovery Status", href: "/archive", section: "archive", keywords: "preservation wayback original" },
  { title: "Timeline", href: "/timeline", section: "reference", keywords: "history paillard sainte-croix" },
  { title: "About the Restoration", href: "/about", section: "archive" },
  {
    title: "A Dedication to Michael Tisdale",
    href: "/tribute",
    section: "archive",
    keywords: "michael tisdale creator webmaster founder bolex collector tribute dedication honor",
  },
];

// Index the full recovered camera catalogue, including spec labels so a search
// for "matte box" or "turret" surfaces the models that document it.
for (const m of getCameraRecords()) {
  docs.push({
    title: m.name,
    href: `/cameras/${m.slug}`,
    section: "cameras",
    keywords: `${m.format ?? ""} ${m.introduced ?? ""} bolex paillard camera ${m.specs.map((s) => s.label).join(" ")}`,
    summary: m.summary ?? m.specs[0]?.value ?? undefined,
  });
}

for (const m of getProjectorRecords()) {
  docs.push({
    title: m.name,
    href: `/projectors`,
    section: "projectors",
    keywords: `${m.format ?? ""} projector ${m.specs.map((s) => s.label).join(" ")}`,
    summary: m.summary ?? undefined,
  });
}

/*
 * Every accessory as its own entry. This is the point of having broken the
 * decade pages into objects: someone searching "Rexofader" or "Octameter"
 * should land on the thing, not on the page that happens to mention it. The
 * year goes in the keywords so a search for 1962 finds what was made then.
 */
for (const item of getAccessoryItems()) {
  docs.push({
    title: item.name,
    href: `/accessories/${item.slug}`,
    section: "accessories",
    keywords: [item.type, item.year ?? "", item.decade ? `${item.decade}s` : "", ...(item.codes ?? []), ...item.images.map((i) => i.alt)]
      .filter(Boolean)
      .join(" "),
    summary: item.description.slice(0, 160),
  });
}

/*
 * Every lens as its own entry, with its codes in the keywords. Someone
 * holding a lens reads five letters off the barrel; typing SWINQ should
 * land on that lens, which is the whole reason the codes were parsed out.
 */
for (const lens of getLensItems()) {
  docs.push({
    title: lens.name,
    href: `/lenses/${lens.slug}`,
    section: "lenses",
    keywords: [
      ...lens.codes,
      lens.maker,
      lens.series ?? "",
      lens.focalLength ?? "",
      lens.aperture ?? "",
      lens.mount ? `${lens.mount} mount` : "",
      lens.gauge ?? "",
      lens.year ?? "",
      lens.decade ? `${lens.decade}s` : "",
    ]
      .filter(Boolean)
      .join(" "),
    summary: lens.description.slice(0, 160),
  });
}

/* Ephemera with its year in the keywords, so a search for 1944 finds
 * the advertising from 1944. */
for (const piece of getEphemeraItems()) {
  docs.push({
    title: piece.title,
    href: `/ephemera/${piece.slug}`,
    section: "ephemera",
    keywords: [piece.type, piece.year ?? "", piece.month ?? "", piece.decade ? `${piece.decade}s` : ""]
      .filter(Boolean)
      .join(" "),
    summary: piece.description.slice(0, 160),
  });
}

// Recovered narrative sections. Index the alt text of every pictured item too,
// so searching a Kern product code ("SWINQ") or an accessory name finds the
// page that actually shows it.
for (const [section, prefix] of [
  ["lenses", "/lenses"],
  ["accessories", "/accessories"],
  ["ephemera", "/ephemera"],
] as const) {
  for (const page of getRecoveredSection(section)) {
    docs.push({
      title: page.title,
      href: `${prefix}/${page.slug}`,
      section,
      keywords: page.images.map((i) => i.alt).filter(Boolean).join(" "),
      summary: page.description,
    });
  }
}

for (const [title, href, keywords] of [
  ["Prices", "/prices", "what it cost new price list paillard dealer 1952 1965 1967 1972 1979 dollars"],
  ["What one is worth", "/articles/what-one-is-worth", "value valuation worth sold listings ebay auction resale second hand how much"],
  ["Glossary", "/glossary", "terminology terms definitions filmmaking"],
  ["Ephemera", "/ephemera", "advertising catalogs brochures bolex reporter"],
  ["Links", "/links", "resources directory repair film stock cinema history recommended sites"],
  ["Previous Updates", "/updates", "archives site news changelog history 2005 2011"],
  ["Revisit the original site", "/revisit", "old site original look classic browse nostalgia as it was"],
] as const) {
  docs.push({ title, href, section: "reference", keywords });
}

/*
 * The link directory and update log are indexed entry by entry, not just as
 * two page titles. Someone looking for a repair specialist searches the
 * specialist's name, and someone chasing when the serial-number article
 * appeared searches its title — neither is findable if only the container is
 * indexed. Both deep-link to the section of the page that holds them.
 */
for (const category of getLinkDirectory().categories) {
  for (const entry of category.entries) {
    docs.push({
      title: entry.name,
      href: "/links",
      section: "reference",
      keywords: `link resource ${category.title}`,
      summary: entry.description,
    });
  }
}

for (const update of getUpdates()) {
  if (!update.title) continue; // undated housekeeping notes have nothing to match on
  docs.push({
    title: update.title,
    href: update.articleSlug ? `/articles/${update.articleSlug}` : "/updates",
    section: "reference",
    keywords: `update ${update.date}`,
    summary: update.description,
  });
}

const feedItems: Array<{ title: string; link: string; date: string; description: string }> = [];
const articlesDir = path.join(ROOT, "content/articles");
if (fs.existsSync(articlesDir)) {
  for (const file of fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md") && f !== "README.md")) {
    const { data } = matter(fs.readFileSync(path.join(articlesDir, file), "utf8"));
    const slug = path.basename(file, ".md");
    docs.push({
      title: (data.title as string) ?? slug,
      href: `/articles/${slug}`,
      section: "articles",
      summary: data.description as string | undefined,
    });
    feedItems.push({
      title: (data.title as string) ?? slug,
      link: `https://bolexcollector.com/articles/${slug}`,
      date: (data.date as string) ?? "",
      description: (data.description as string) ?? "",
    });
  }
}

/*
 * One entry per destination.
 *
 * 193 of the 806 entries shared an href with another, and /projectors
 * was in there twenty-eight times: the index is assembled from
 * several passes over the catalogue and some pages are reachable from
 * more than one of them. A duplicate costs more than its bytes — the
 * palette keys its list by href, and a duplicate key stops React
 * reconciling the list at all, so rows from an old query were still
 * on screen under the results of a new one.
 *
 * The first entry for a destination wins, because the passes run from
 * most specific to least.
 */
const byHref = new Map<string, Doc>();
for (const doc of docs) if (!byHref.has(doc.href)) byHref.set(doc.href, doc);
const unique = [...byHref.values()];

fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public/search-index.json"), JSON.stringify(unique));

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bolex Collector</title>
    <link>https://bolexcollector.com</link>
    <description>Recovered articles and additions to the Bolex Collector archive.</description>
${feedItems
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(ROOT, "public/feed.xml"), rss);

console.log(
  `Search index: ${unique.length} documents` +
    `${docs.length !== unique.length ? ` (${docs.length - unique.length} duplicates dropped)` : ""}` +
    `. RSS: ${feedItems.length} items.`,
);
