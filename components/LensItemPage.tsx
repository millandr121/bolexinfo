import Link from "next/link";
import { Reveal } from "./Reveal";
import { ImageGallery } from "./ImageGallery";
import { ArchiveCompare } from "./ArchiveCompare";
import { PriceAsk } from "./PriceAsk";
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
/** The brochure's own row names, in plain words. */
const SPEC_LABELS: Record<string, string> = {
  catalogueNumber: "Catalogue number",
  designedFor: "Designed for",
  maximumAperture: "Maximum aperture",
  minimumDiaphragm: "Minimum diaphragm",
  angleOfView: "Angle of view",
  minimumFocus: "Minimum focusing distance",
  areaAtMinimumFocus: "Area covered, closest",
  areaAt20Feet: "Area covered at 20ft",
  depthOfFieldScale: "Depth of field scale",
  lengthAtInfinity: "Length at infinity",
  frontDiameter: "Front diameter",
  maximumDiameter: "Maximum diameter",
  weight: "Weight",
  filterAdapter: "Filter adapter",
};

export function LensItemPage({ item }: { item: LensItem }) {
  const archiveHref = originalArchiveHref(item.from.originalPath ?? undefined);
  const images = item.images.map((i) => ({ src: i.src, alt: i.alt || item.name }));
  /* Anything this archive went and found says where it came from. A
     photograph recovered from Michael's page carries no credit, because
     the provenance section below already credits the whole page to him. */
  const photoCredits = [...new Set(item.images.map((i) => i.credit).filter(Boolean))] as string[];

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
            What Paillard measured. Shown as the brochure's own table
            rather than folded into prose, because the useful thing about
            a weight or a minimum focusing distance is being able to find
            it and compare it, not read about it.
          */}
          {item.specs && (
            <section className="rule mt-10 pt-4" aria-labelledby="specs">
              <h2
                id="specs"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]"
              >
                Measured
              </h2>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-[max-content_1fr]">
                {Object.entries(item.specs).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b border-[var(--line)] pb-1.5 font-[family-name:var(--font-mono)] text-[0.72rem] leading-relaxed sm:contents"
                  >
                    <dt className="text-[var(--fg-soft)] sm:border-b sm:border-[var(--line)] sm:pb-1.5">
                      {SPEC_LABELS[label] ?? label}
                    </dt>
                    <dd className="text-[var(--fg)] sm:border-b sm:border-[var(--line)] sm:pb-1.5">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
                From Paillard&rsquo;s own{" "}
                <a
                  href="https://www.pacificrimcamera.com/rl/01992/01992.pdf"
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  Lenses for 16mm Motion Picture and Television Cameras ↗
                </a>
                , read off the page rather than the scan&rsquo;s text, which pairs every figure
                with the wrong lens.
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
            {photoCredits.length > 0 && (
              <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.62rem] leading-relaxed text-[var(--fg-soft)]">
                Photographs: <span className="text-[var(--fg)]">{photoCredits.join(", ")}</span>.
              </p>
            )}
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
        <PriceAsk slug={item.slug} section="lenses" name={item.name} />
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
