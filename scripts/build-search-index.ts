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

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = <T>(p: string, fallback: T): T =>
  fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T) : fallback;

interface Entry {
  slug: string;
  name: string;
  format?: string;
  country?: string;
  introduced?: number | null;
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
];

const cameras = read<{ models: Entry[] }>(path.join(ROOT, "data/models/cameras.json"), { models: [] });
for (const m of cameras.models) {
  docs.push({
    title: m.name,
    href: `/cameras/${m.slug}`,
    section: "cameras",
    keywords: `${m.format ?? ""} ${m.introduced ?? ""} bolex paillard camera`,
    summary: m.summary ?? undefined,
  });
}

const projectors = read<{ models: Entry[] }>(path.join(ROOT, "data/models/projectors.json"), { models: [] });
for (const m of projectors.models) {
  docs.push({
    title: m.name,
    href: "/projectors",
    section: "projectors",
    keywords: `${m.format ?? ""} projector`,
    summary: m.summary ?? undefined,
  });
}

const lenses = read<{ manufacturers: Entry[] }>(path.join(ROOT, "data/models/lenses.json"), { manufacturers: [] });
for (const m of lenses.manufacturers) {
  docs.push({
    title: m.name,
    href: "/lenses",
    section: "lenses",
    keywords: `lens optics ${m.country ?? ""}`,
    summary: m.summary ?? undefined,
  });
}

const accessories = read<{ categories: Entry[] }>(path.join(ROOT, "data/models/accessories.json"), { categories: [] });
for (const m of accessories.categories) {
  docs.push({
    title: m.name,
    href: "/accessories",
    section: "accessories",
    keywords: "accessory",
    summary: m.summary ?? undefined,
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

fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public/search-index.json"), JSON.stringify(docs));

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

console.log(`Search index: ${docs.length} documents. RSS: ${feedItems.length} items.`);
