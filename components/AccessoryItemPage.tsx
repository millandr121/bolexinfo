import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { PriceAsk } from "./PriceAsk";
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
          {item.codes && item.codes.length > 0 && (
            <Fact label={item.codes.length > 1 ? "Codes" : "Code"}>
              <span className="font-[family-name:var(--font-mono)] text-base">
                {item.codes.join(" · ")}
              </span>
            </Fact>
          )}
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

          {/*
            The catalogues, which reach back further than the dealer price
            lists do. The earliest is February 1952, and for most of these
            objects it is the only price anyone has recorded.
          */}
          {item.catalogue && (
            <section className="rule mt-10 pt-4" aria-labelledby="catalogue">
              <h2
                id="catalogue"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]"
              >
                In the {item.catalogue.month ? `${item.catalogue.month} ` : ""}
                {item.catalogue.year} Bolex retail price list
              </h2>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.72rem] leading-relaxed text-[var(--fg-soft)]">
                {item.catalogue.price && (
                  <span className="text-[var(--fg)]">{item.catalogue.price}</span>
                )}{" "}
                · listed as &ldquo;{item.catalogue.asPrinted}&rdquo;
                {item.catalogue.note ? `. ${item.catalogue.note}` : "."}{" "}
                <a
                  href={`https://www.pacificrimcamera.com/rl/${item.catalogue.doc}/${item.catalogue.doc}.pdf`}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  the catalogue ↗
                </a>
              </p>
            </section>
          )}

          {/*
            Paillard's own dealer price lists, which are the only hard
            dates on most of these pages and the only place the archive
            has ever had a code for an accessory. Where a thing appears in
            several lists all the prices are kept, because what it cost
            over time is itself worth knowing.
          */}
          {item.listings && item.listings.length > 0 && (
            <section className="rule mt-10 pt-4" aria-labelledby="listings">
              <h2
                id="listings"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]"
              >
                In Paillard&rsquo;s dealer price lists
              </h2>
              <ul className="mt-3 space-y-2">
                {item.listings.map((listing) => (
                  <li
                    key={`${listing.doc}-${listing.asPrinted}`}
                    className="font-[family-name:var(--font-mono)] text-[0.72rem] leading-relaxed"
                  >
                    <span className="text-[var(--fg)]">{listing.price}</span>
                    <span className="text-[var(--fg-soft)]">
                      {" "}
                      · {listing.date} · listed as &ldquo;{listing.asPrinted}&rdquo; ·{" "}
                      <a
                        href={`https://www.pacificrimcamera.com/rl/${listing.doc}/${listing.doc}.pdf`}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="text-[var(--accent)] underline underline-offset-4"
                      >
                        the list ↗
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
                Scanned by Pacific Rim Camera. Matched to this object by hand, not by script.
                {item.listingNote ? ` ${item.listingNote}` : ""}
              </p>
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

      <Reveal>
        <PriceAsk slug={item.slug} section="accessories" name={item.name} />
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
