import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { AccessoryBrowser } from "@/components/AccessoryBrowser";
import { getAccessoryItems } from "@/lib/accessory-items";
import { getAddedRecords } from "@/lib/museum";
import { getRecoveredSection } from "@/lib/recovered";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Every Bolex accessory the archive holds, one object at a time: motors, viewfinders, filters, cases, tripods, grips and editing equipment, by type or by year.",
};

export default function AccessoriesPage() {
  const items = getAccessoryItems();
  const added = getAddedRecords("accessories").map((m) => ({
    slug: m.slug,
    name: m.name,
    type: "Added by this archive",
    decade: null,
    year: m.introduced,
    description: m.summary ?? "",
    images: m.images.map((i) => ({ src: i.src, alt: i.alt ?? m.name })),
    sources: [],
    from: { page: "", heading: null, originalPath: "" },
  }));
  const pages = getRecoveredSection("accessories");
  const dated = items.filter((i) => i.year).length;

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Accessories
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Most were made by Paillard in Switzerland, joined over the years by the American Bolex
          Company&rsquo;s own line and by aftermarket makers. {items.length + added.length} objects,
          each with its own page.
        </p>
        {/*
         * Saying how the dating works, once, at the top. People arrive here
         * holding something and wanting to know what year it is from, and
         * the honest answer for most of these is the decade. Better to say
         * that plainly than to let a reader assume every date is firm.
         */}
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          {dated} of them carry a year the original writing actually states. The rest show the
          decade of the page they were documented on, which is all that is known. A decade is
          never shown as though it were a year.
        </p>
      </Reveal>

      <AccessoryBrowser items={[...added, ...items]} />

      {/*
       * The pages they came from, kept and linked rather than replaced. They
       * are Michael's arrangement of his own collection, and they carry
       * things an item list cannot: the order he put objects in, and what he
       * wrote about a group as a whole.
       */}
      <section className="mt-16 border-t border-[var(--line)] pt-6" aria-labelledby="original">
        <h2
          id="original"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
        >
          The pages these came from
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fg-soft)]">
          The original site wrote accessories up {pages.length} pages at a time, by type and
          decade. Everything above was lifted out of them, word for word. They are still here,
          in his order.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[0.7rem]">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/accessories/${page.slug}`}
                className="text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
