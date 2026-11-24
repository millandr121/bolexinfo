import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Thumb } from "@/components/Thumb";
import { thumbnailFor } from "@/lib/thumbnails";
import { accessoryTypeOf, decadeOf, getRecoveredSection } from "@/lib/recovered";
import { getAddedRecords } from "@/lib/museum";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Accessories for Bolex cameras: motors, viewfinders, filters, cases, tripods, grips and editing equipment, organised by type and decade.",
};

const TYPE_ORDER = [
  "Motors",
  "Viewfinders",
  "Filters & Lens Accessories",
  "Tripods & Grips",
  "Cases",
  "Editing Equipment",
  "Miscellaneous",
  "Other",
];

export default function AccessoriesPage() {
  const pages = getRecoveredSection("accessories");
  const added = getAddedRecords("accessories");
  const groups = TYPE_ORDER.map((type) => ({
    type,
    pages: pages.filter((p) => accessoryTypeOf(p.slug) === type),
  })).filter((g) => g.pages.length > 0);

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Accessories
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Most were manufactured by Paillard in Switzerland, joined over the years by
          aftermarket items and modifications. The original site organised them by type and
          decade, and that organisation is preserved here, with anything this archive has
          added since kept separately above it.
        </p>
      </Reveal>

      {/*
       * Added entries come first, and are deliberately not folded into the
       * type groups below. Those groups are Michael's own arrangement of his
       * own pages, and quietly inserting new objects into them would rewrite
       * how he organised the collection. These sit above, under a heading
       * that says where they came from.
       */}
      {added.length > 0 && (
        <section className="mt-12" aria-labelledby="added">
          <Reveal>
            <h2
              id="added"
              className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
            >
              Added by this archive
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fg-soft)]">
              Equipment the original site never covered, researched and cited here. The original
              organised accessories by type and decade, so single objects like these had nowhere
              to go. If you know of Bolex equipment that is missing,{" "}
              <Link href="/suggest" className="text-[var(--accent)] underline underline-offset-4">
                tell us
              </Link>
              .
            </p>
          </Reveal>
          <ul className="mt-4 grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {added.map((item, i) => (
              <Reveal key={item.slug} as="li" delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  href={`/accessories/${item.slug}`}
                  className="group flex h-full items-start gap-4 bg-[var(--bg)] p-5 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <Thumb src={thumbnailFor("accessories", item.slug, item.images)} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {item.introduced ?? "Year not known"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.type} className="mt-12" aria-label={group.type}>
          <Reveal>
            <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              {group.type}
            </h2>
          </Reveal>
          <ul className="mt-4 grid sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {group.pages.map((page, i) => (
              <Reveal key={page.slug} as="li" delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  href={`/accessories/${page.slug}`}
                  className="group flex h-full items-start gap-4 bg-[var(--bg)] p-5 hover:bg-[var(--bg-raised)] transition-colors duration-300"
                >
                  <Thumb src={thumbnailFor("accessories", page.slug, page.images)} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-[560] group-hover:text-[var(--accent)] transition-colors">
                      {decadeOf(page.slug) ?? page.title}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {page.images.length} pictured
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
