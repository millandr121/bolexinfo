import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getArchivedAssets, getArchiveStats, getUrlInventory } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archive & Recovery Status",
  description:
    "The public ledger of the BolexCollector.com preservation effort: every asset recovered from the Internet Archive, with capture timestamps and source.",
};

const SECTION_LABELS: Record<string, string> = {
  "": "Site root",
  cameras: "Cameras",
  projectors: "Projectors",
  lenses: "Lenses",
  accessories: "Accessories",
  articles: "Articles",
  ephemera: "Ephemera",
  images: "Images",
  forums: "Forums",
};

/** Group by the first path segment, which mirrors the original site's sections. */
function sectionOf(urlPath: string): string {
  const seg = urlPath.replace(/^\//, "").split("/")[0] ?? "";
  return seg.includes(".") || seg === "" ? "" : seg;
}

function formatBytes(bytes: number): string {
  const mb = bytes / 1_000_000;
  return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

export default function ArchivePage() {
  const stats = getArchiveStats();
  const assets = getArchivedAssets();
  const inventory = getUrlInventory();

  const bySection = new Map<string, number>();
  for (const a of assets) {
    const s = sectionOf(a.urlPath);
    bySection.set(s, (bySection.get(s) ?? 0) + 1);
  }
  const sections = [...bySection.entries()].sort((a, b) => b[1] - a[1]);

  // Pages the inventory knows about but the pipeline never managed to store.
  const stored = new Set(assets.map((a) => a.urlPath));
  const missing = inventory.entries.filter((e) => !stored.has(e.path));

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          The Archive
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          This project treats the original BolexCollector.com as a historical document. Below
          is the public ledger of what has been preserved — recovered from the Internet
          Archive, stored byte-for-byte, and verified against a checksum manifest.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-[family-name:var(--font-mono)] text-sm border-y border-[var(--line)] py-4">
          {[
            ["Assets preserved", stats.assets.toLocaleString()],
            ["Pages", stats.pages.toLocaleString()],
            ["Images", stats.images.toLocaleString()],
            ["Total size", formatBytes(stats.bytes)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">{label}</dt>
              <dd className="text-2xl mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <section aria-label="Preserved assets by section" className="mt-14">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            Preserved by section
          </h2>
          <div className="mt-4 max-w-xl overflow-x-auto border border-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-[family-name:var(--font-sans)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] border-b border-[var(--line)]">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Section</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold text-right">Assets</th>
                </tr>
              </thead>
              <tbody className="font-[family-name:var(--font-mono)] text-xs">
                {sections.map(([section, count]) => (
                  <tr key={section || "root"} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-2">{SECTION_LABELS[section] ?? section}</td>
                    <td className="px-4 py-2 text-right text-[var(--fg-soft)]">{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section aria-label="Recovery gaps" className="mt-14 max-w-2xl">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            Known gaps
          </h2>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              Every page in the verified URL inventory has been recovered. Some images and
              outbound links referenced by those pages were never archived and cannot be
              retrieved from any source — those are recorded in the pipeline&rsquo;s
              verification report rather than hidden.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                {missing.length} inventoried page{missing.length === 1 ? "" : "s"} could not be
                recovered from any archive source:
              </p>
              <ul className="mt-4 grid gap-1 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                {missing.map((m) => (
                  <li key={m.path}>{m.path}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </Reveal>

      <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
        <span className="uppercase tracking-[0.18em]">Provenance — </span>
        Counts are read directly from <span className="text-[var(--fg)]">archive/meta/manifest.json</span>,
        which records the original URL, capture timestamp, MIME type, byte size and SHA-1 of
        every stored asset. Integrity is re-verified on every commit.
      </aside>
    </div>
  );
}
