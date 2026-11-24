import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { PriceReports } from "./PriceReports";
import { originalArchiveHref } from "@/lib/archive";
import { lensDateLabel, type LensItem } from "@/lib/lens-types";

/**
 * One lens.
 *
 * The facts row leads with the code, because that is what someone arriving
 * with a lens in their hand is holding: five letters engraved on the barrel
 * and nothing else to go on. Then focal length and aperture, then the date,
 * which for most of these is only a decade and says so.
 */
export function LensItemPage({ item }: { item: LensItem }) {
  const archiveHref = originalArchiveHref(item.from.originalPath ?? undefined);
  const images = item.images.map((i) => ({ src: i.src, alt: i.alt || item.name }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    brand: item.maker,
    ...(item.codes.length ? { mpn: item.codes[0] } : {}),
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
          <Link href="/lenses" className="hover:text-[var(--accent)]">
            Lenses
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{item.name}</span>
        </nav>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-[560] tracking-tight">
          {item.name}
        </h1>
      </Reveal>

      <Reveal>
        <dl className="rule mt-8 grid grid-cols-2 gap-x-8 gap-y-4 pt-6 sm:grid-cols-4">
          {item.codes.length > 0 && (
            <Fact label={item.codes.length > 1 ? "Codes" : "Code"}>
              <span className="font-[family-name:var(--font-mono)] text-base">
                {item.codes.join(" · ")}
              </span>
            </Fact>
          )}
          <Fact label="Maker">{item.maker}</Fact>
          {item.focalLength && <Fact label="Focal length">{item.focalLength}</Fact>}
          {item.aperture && <Fact label="Maximum aperture">{item.aperture}</Fact>}
          {item.mount && <Fact label="Mount">{item.mount}</Fact>}
          {item.gauge && <Fact label="For">{item.gauge} cameras</Fact>}
          <Fact label={item.year ? "Introduced" : "Documented as"}>{lensDateLabel(item)}</Fact>
        </dl>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <Reveal>
          {/*
            Forty-one of these have no description at all. That is not a
            gap in the extraction: on the Wollensak, Meyer and Goerz pages
            he listed the lenses that existed and wrote about the company
            instead. Saying so is better than an empty column, and better
            than pretending the page is incomplete.
          */}
          {item.description ? (
            <p className="whitespace-pre-line text-lg leading-relaxed">{item.description}</p>
          ) : item.catalogue ? (
            /*
              No description from Michael, but the catalogue says what it
              was and who it was for, which is most of what a reader wants.
              Better to lead with the document than with an apology.
            */
            <p className="text-lg leading-relaxed">
              Offered by the American Bolex Company for {item.catalogue.offeredFor} in its{" "}
              {item.catalogue.year} catalogue, listed there as &ldquo;
              {item.catalogue.asPrinted}&rdquo;
              {item.catalogue.price ? ` at ${item.catalogue.price}` : ""}. The original site
              recorded the lens without
              describing it, so what is known of it is what the catalogue says.{" "}
              <Link
                href={`/suggest?page=${encodeURIComponent(`/lenses/${item.slug}`)}`}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                If you know more, tell us
              </Link>
              .
            </p>
          ) : (
            <p className="text-lg leading-relaxed text-[var(--fg-soft)]">
              The original site listed this lens without describing it: the{" "}
              <Link
                href={`/lenses/${item.from.page}`}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                {item.maker} page
              </Link>{" "}
              gives its name and the mount it takes, and puts its writing into the account of
              the company instead. If you know this lens,{" "}
              <Link
                href={`/suggest?page=${encodeURIComponent(`/lenses/${item.slug}`)}`}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                tell us about it
              </Link>
              .
            </p>
          )}

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
            The catalogue entry, where there is one and the lens also has
            prose of its own. Where it does not, the catalogue is already
            the description above and this would repeat it.
          */}
          {item.catalogue && item.description && (
            <section className="rule mt-10 pt-4" aria-labelledby="catalogue">
              <h2
                id="catalogue"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]"
              >
                In the {item.catalogue.month ? `${item.catalogue.month} ` : ""}
                {item.catalogue.year} catalogue
              </h2>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.72rem] leading-relaxed text-[var(--fg-soft)]">
                {item.catalogue.price ? (
                  <span className="text-[var(--fg)]">{item.catalogue.price}</span>
                ) : null}{" "}
                Listed as &ldquo;{item.catalogue.asPrinted}&rdquo;
                {item.catalogue.price ? "" : `, offered for ${item.catalogue.offeredFor}`}.
                {item.catalogue.note ? ` ${item.catalogue.note}` : ""}{" "}
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
            Hard evidence, and the only kind on this page that is not
            Michael's: Paillard's own dealer price lists give a lens, its
            code and a price on a stated date. A price in the May 1967
            list proves the lens was on sale in May 1967, which is more
            than most of these entries could say before.
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
                Scanned by Pacific Rim Camera. Matched to this lens by hand, not by script: the
                scans interleave their columns, so a code can land beside the wrong description.
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

      <Reveal>
        <section className="rule mt-14 pt-4" aria-labelledby="provenance">
          <h2
            id="provenance"
            className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]"
          >
            Source
          </h2>
          {item.added ? (
            /*
              Not Michael's at all. Found in Paillard's own documents while
              matching codes and prices to the lenses he did list, and said
              so plainly rather than quietly filed among his.
            */
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              <span className="text-[var(--fg)]">Added by this archive.</span> The original site
              never listed this lens. It is here because Paillard&rsquo;s own price list or
              catalogue names it, prices it and gives its code, and the entry says no more than
              those documents do.{" "}
              <Link
                href={`/suggest?page=${encodeURIComponent(`/lenses/${item.slug}`)}`}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                If you have one, or know more, tell us
              </Link>
              .
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              Written by Michael Tisdale for BolexCollector.com, on his{" "}
              <Link
                href={`/lenses/${item.from.page}`}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                {item.maker} page
              </Link>
              , which opens with an account of the company and then lists its lenses.{" "}
              {item.description
                ? "The words above are his; this archive has given the lens a page of its own so it can be dated, searched, and found by its code."
                : "He listed this lens there without describing it, so the words above are not his: they are what the catalogue says, and the page exists so the lens can be dated, searched and linked to."}
            </p>
          )}
        </section>
      </Reveal>

      <Reveal>
        <PriceReports slug={item.slug} section="lenses" name={item.name} />
      </Reveal>

      {archiveHref && (
        <Reveal>
          <ArchiveCompare originalHref={archiveHref} title={item.name} />
        </Reveal>
      )}

      <p className="rule mt-12 pt-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        Something wrong, or something to add?{" "}
        <Link
          href={`/suggest?page=${encodeURIComponent(`/lenses/${item.slug}`)}`}
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
