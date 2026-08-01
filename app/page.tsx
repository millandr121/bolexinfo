import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getArchiveStats, getUrlInventory } from "@/lib/content";
import { getCameraRecords } from "@/lib/museum";

/**
 * The collections — the things a visitor came to browse. Every primary
 * destination in the header appears here too, so the front door and the
 * navigation describe the same site rather than two different ones.
 */
const COLLECTIONS = [
  {
    href: "/cameras",
    title: "Cameras",
    body: "The H-16 and H-8 lineages, the Auto Cine, the B, C, D and L series, the Zoom Reflex and Automatic lines, and the Super 8 era.",
    count: "54 models",
  },
  {
    href: "/projectors",
    title: "Projectors",
    body: "From the multi-gauge Model G of 1936 to the S-series sound projectors.",
    count: "17 models",
  },
  {
    href: "/lenses",
    title: "Lenses",
    body: "Kern-Paillard, Hugo Meyer, Goerz, Wollensak, SOM Berthiot and Angénieux optics for Bolex cameras.",
    count: "6 makers",
  },
  {
    href: "/accessories",
    title: "Accessories",
    body: "Motors, matte boxes, grips, viewfinders, filters, cases and editing gear, decade by decade.",
    count: "20 pages",
  },
  {
    href: "/ephemera",
    title: "Ephemera",
    body: "Period advertising, dealer catalogues, promotional brochures and the Bolex Reporter magazine.",
    count: "171 pieces",
  },
  {
    href: "/articles",
    title: "Articles",
    body: "Recovered writing from the original site — tips, histories and the serial-number reference.",
    count: "22 articles",
  },
] as const;

/** Tools and reference — reachable in one tap rather than buried in a footer. */
const REFERENCE = [
  { href: "/serials", title: "Serial Lookup", body: "Date a camera from its serial number." },
  { href: "/timeline", title: "Timeline", body: "45 entries, from Sainte-Croix to the Bolex era." },
  { href: "/glossary", title: "Glossary", body: "Bolex and filmmaking terminology." },
  { href: "/archive", title: "The Archive", body: "What was preserved, and what is missing." },
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
        <Reveal>
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            The collections
          </h2>
        </Reveal>
        <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
          {COLLECTIONS.map((s, i) => (
            <Reveal key={s.href} as="li" delay={Math.min(i * 0.05, 0.25)}>
              <Link
                href={s.href}
                className="group flex h-full flex-col bg-[var(--bg)] p-7 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {s.title}
                  </h3>
                  {/* The count sets expectations before the tap — a card that
                      says "171 pieces" reads as a place worth entering. */}
                  <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)] shrink-0">
                    {s.count}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{s.body}</p>
                <span
                  aria-hidden="true"
                  className="reveal-on-hover mt-5 inline-block font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]"
                >
                  View →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-label="Reference and tools" className="rule py-14">
        <Reveal>
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            Reference &amp; tools
          </h2>
        </Reveal>
        <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)]">
          {REFERENCE.map((s, i) => (
            <Reveal key={s.href} as="li" delay={Math.min(i * 0.05, 0.2)}>
              <Link
                href={s.href}
                className="group block h-full bg-[var(--bg)] p-6 hover:bg-[var(--bg-raised)] transition-colors duration-300"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)]">{s.body}</p>
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
              The original site has gone offline. Every recoverable page has been retrieved
              from the Internet Archive and preserved — byte-for-byte — alongside this
              modern edition. Recovery status is public, and every entry states its
              provenance.
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
