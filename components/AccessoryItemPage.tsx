import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { originalArchiveHref } from "@/lib/archive";
import { dateLabel, type AccessoryItem } from "@/lib/accessory-items";

/**
 * One accessory.
 *
 * Close to ObjectPage in shape, deliberately, so the site reads as one
 * collection; separate from it because the two have different things to be
 * honest about. A camera has specifications and a serial table. An accessory
 * has a paragraph, a photograph, and a date that is usually only a decade —
 * and that last difference is the reason this is its own component rather
 * than a camera page with the fields left empty. ObjectPage would print
 * "Introduced: 1950" from a decade, which is a claim Michael never made.
 */
export function AccessoryItemPage({ item }: { item: AccessoryItem }) {
  const archiveHref = originalArchiveHref(item.from.originalPath);
  const images = item.images.map((i) => ({ src: i.src, alt: i.alt || item.name }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    category: item.type,
    description: item.description.slice(0, 300),
    ...(item.year ? { releaseDate: String(item.year) } : {}),
  };

  return (
    <article className="pt-14 pb-8 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <nav
          aria-label="Breadcrumb"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]"
        >
          <Link href="/accessories" className="hover:text-[var(--accent)]">
            Accessories
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{item.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          {item.name}
        </h1>
      </Reveal>

      <Reveal>
        <dl className="rule mt-8 grid grid-cols-2 gap-x-8 gap-y-4 pt-6 sm:grid-cols-3">
          <Fact label="Type">{item.type}</Fact>
          <Fact label={item.year ? "Introduced" : "Documented as"}>{dateLabel(item)}</Fact>
          {!item.year && item.decade && (
            <Fact label="Exact year">Not stated</Fact>
          )}
        </dl>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <Reveal>
          <p className="whitespace-pre-line text-lg leading-relaxed">{item.description}</p>

          {/*
           * His footnotes, carried with the object that cites them rather
           * than left at the foot of a page this object no longer sits on.
           */}
          {item.sources.length > 0 && (
            <section className="rule mt-10 pt-4" aria-labelledby="notes">
              <h2
                id="notes"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]"
              >
                Notes
              </h2>
              <ol className="mt-3 space-y-2">
                {item.sources.map((source, n) => (
                  <li
                    key={source}
                    className="font-[family-name:var(--font-mono)] text-[0.7rem] leading-relaxed text-[var(--fg-soft)]"
                  >
                    <span className="text-[var(--accent)]">{n + 1}</span> {source}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {item.yearNote && (
            <p className="mt-6 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
              On the date: {item.yearNote}
            </p>
          )}
        </Reveal>

        {images.length > 0 && (
          <Reveal>
            <ImageGallery images={images} caption={item.name} layout="feature" />
          </Reveal>
        )}
      </div>

      {/*
       * Where this came from, always. An object lifted out of someone else's
       * page should say whose page, and link back to it: the surrounding
       * writing is sometimes the part that matters.
       */}
      <Reveal>
        <section className="rule mt-14 pt-4" aria-labelledby="provenance">
          <h2
            id="provenance"
            className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]"
          >
            Source
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            Written by Michael Tisdale for BolexCollector.com, on his{" "}
            <Link
              href={`/accessories/${item.from.page}`}
              className="text-[var(--accent)] underline underline-offset-4"
            >
              {item.from.heading ?? "accessories"} page
            </Link>
            , where it appears alongside the rest of its group. The words above are his; this
            archive has given the object a page of its own so it can be dated, searched and
            linked to.
          </p>
        </section>
      </Reveal>

      {archiveHref && (
        <Reveal>
          <ArchiveCompare originalHref={archiveHref} title={item.name} />
        </Reveal>
      )}

      <p className="rule mt-12 pt-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        Something wrong, or something to add?{" "}
        <Link
          href={`/suggest?page=${encodeURIComponent(`/accessories/${item.slug}`)}`}
          className="text-[var(--accent)] underline underline-offset-2"
        >
          Tell us
        </Link>
      </p>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        {label}
      </dt>
      <dd className="mt-1 font-[family-name:var(--font-display)] text-lg font-[560]">{children}</dd>
    </div>
  );
}
