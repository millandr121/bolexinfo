import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getArchiveStats, getUrlInventory } from "@/lib/content";
import { getCameraRecords } from "@/lib/museum";

const SECTIONS = [
  {
    href: "/cameras",
    title: "Cameras",
    body: "The H-16 and H-8 lineages, the B, C, D and L series, and the Super 8 era — every model the original site documented.",
  },
  {
    href: "/projectors",
    title: "Projectors",
    body: "From the multi-gauge Model G of 1936 to the S-series sound projectors.",
  },
  {
    href: "/lenses",
    title: "Lenses",
    body: "Kern-Paillard, Hugo Meyer, Goerz, Wollensak, SOM Berthiot and Angénieux optics for Bolex cameras.",
  },
  {
    href: "/accessories",
    title: "Accessories",
    body: "Motors, matte boxes, grips, viewfinders, filters, cases and editing gear, decade by decade.",
  },
  {
    href: "/serials",
    title: "Serial Lookup",
    body: "Date a Paillard-Bolex camera from its serial number, using the ranges the original site preserved.",
  },
  {
    href: "/articles",
    title: "Articles & Ephemera",
    body: "Recovered writing, the Bolex Reporter magazine, catalogs and vintage advertising.",
  },
] as const;

export default function HomePage() {
  const models = getCameraRecords();
  const inventory = getUrlInventory();
  const stats = getArchiveStats();

  return (
    <>
      <section className="pt-16 sm:pt-24 pb-14">
        <Reveal>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            Paillard-Bolex · Sainte-Croix, Switzerland · 1935–1970s
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl font-[560]">
            The digital museum of the classic Bolex.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)]">
            A preservation — and continuation — of the original BolexCollector.com:
            cameras, projectors, lenses, accessories, serial numbers, and the printed
            ephemera of the Swiss company that put precision filmmaking in amateur hands.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 font-[family-name:var(--font-mono)] text-sm">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Models catalogued</dt>
              <dd className="text-2xl mt-1">{models.length}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Original URLs inventoried</dt>
              <dd className="text-2xl mt-1">{inventory.entries.length}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">Assets preserved</dt>
              <dd className="text-2xl mt-1">{stats.assets}</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <section aria-label="Collections" className="rule py-14">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.href} as="li" delay={i * 0.05}>
              <Link
                href={s.href}
                className="group block h-full bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{s.body}</p>
                <span
                  aria-hidden="true"
                  className="mt-5 inline-block font-[family-name:var(--font-mono)] text-xs text-[var(--accent)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                >
                  View →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="rule py-14">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-[560]">
              A preservation project, in the open.
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
              The original site has gone offline. With its owner&rsquo;s permission, every
              recoverable page is being retrieved from the Internet Archive and preserved —
              byte-for-byte — alongside this modern edition. Recovery status is public, and
              every entry states its provenance.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block border border-[var(--fg)] px-5 py-2.5 text-sm uppercase tracking-[0.12em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-200"
            >
              About the restoration
            </Link>
          </div>
        </Reveal>
      </section>

      <section aria-label="Dedication" className="rule py-16">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
              In appreciation
            </p>
            <p className="mt-5 font-[family-name:var(--font-display)] text-2xl sm:text-3xl leading-snug font-[560]">
              This archive is dedicated to Michael Tisdale, who built the original
              BolexCollector.com and shared it freely for nearly twenty years.
            </p>
            <Link
              href="/tribute"
              className="mt-6 inline-block font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--accent)] hover:underline underline-offset-4"
            >
              Read the dedication →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
