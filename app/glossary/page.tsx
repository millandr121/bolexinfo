import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArchiveCompare } from "@/components/ArchiveCompare";
import { getRecoveredPage } from "@/lib/recovered";
import { originalArchiveHref } from "@/lib/archive";
import { getGlossary, glossaryCount, type GlossaryPart } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "105 Bolex and filmmaking terms defined, recovered from the original BolexCollector.com — from AMBOL and anamorphic lenses to zoom viewfinders.",
};

/**
 * A definition's text, with its links.
 *
 * Internal cross-references stay as plain anchors rather than becoming
 * Next links: they point within this same page, and routing a jump to
 * `#aperture` through the router would scroll the page twice.
 */
function Definition({ parts }: { parts: GlossaryPart[] }) {
  return (
    <>
      {parts.map((part, i) => {
        const className = [part.bold && "font-[560]", part.italic && "italic"]
          .filter(Boolean)
          .join(" ");

        if (!part.href) {
          return className ? (
            <span key={i} className={className}>
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          );
        }

        const link = "underline underline-offset-2 decoration-[var(--line)] hover:text-[var(--accent)]";
        return part.href.startsWith("#") ? (
          <a key={i} href={part.href} className={`${link} ${className}`}>
            {part.text}
          </a>
        ) : (
          <Link key={i} href={part.href} className={`${link} ${className}`}>
            {part.text}
          </Link>
        );
      })}
    </>
  );
}

export default function GlossaryPage() {
  const glossary = getGlossary();
  const total = glossaryCount();
  const page = getRecoveredPage("reference", "glossary");
  const archiveHref = originalArchiveHref(page?.originalPath);

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Glossary
        </h1>
        <p className="mt-4 text-[var(--fg-soft)] leading-relaxed">
          Bolex and filmmaking terminology, as defined on the original site.
        </p>
        {total > 0 && (
          <p className="mt-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
            {total} terms
          </p>
        )}
      </Reveal>

      {glossary.length > 0 ? (
        <>
          {/*
            The A–Z rail. The original printed all 26 letters whether or
            not anything sat under them, so Q, X and Y were links to
            nothing; only the letters that have terms appear here.
          */}
          <Reveal>
            <nav
              aria-label="Jump to a letter"
              className="mt-8 flex flex-wrap gap-x-1 gap-y-2 border-y border-[var(--line)] py-3"
            >
              {glossary.map((group) => (
                <a
                  key={group.letter}
                  href={`#letter-${group.letter}`}
                  className="font-[family-name:var(--font-mono)] text-sm w-8 h-8 inline-flex items-center justify-center text-[var(--fg-soft)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
                >
                  {group.letter}
                </a>
              ))}
            </nav>
          </Reveal>

          <div className="mt-12 space-y-12">
            {glossary.map((group) => (
              <section key={group.letter} aria-labelledby={`letter-${group.letter}`}>
                <h2
                  id={`letter-${group.letter}`}
                  className="scroll-mt-24 font-[family-name:var(--font-display)] text-3xl font-[560] text-[var(--accent)] border-b border-[var(--line)] pb-2"
                >
                  {group.letter}
                </h2>

                <dl className="mt-6 space-y-6">
                  {group.terms.map((term) => (
                    <div key={term.slug} id={term.slug} className="scroll-mt-24">
                      <dt className="font-[family-name:var(--font-display)] text-lg font-[560]">
                        {term.term}
                      </dt>
                      <dd className="mt-1.5 leading-relaxed text-[var(--fg-soft)]">
                        <Definition parts={term.definition} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          {archiveHref && (
            <Reveal>
              <ArchiveCompare originalHref={archiveHref} title="Glossary" />
            </Reveal>
          )}

          <aside className="rule mt-14 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
            <span className="uppercase tracking-[0.18em]">Provenance — </span>
            Recovered from{" "}
            <span className="text-[var(--fg)]">
              {page?.originalUrl ?? "bolexcollector.com/glossary.html"}
            </span>
            {page?.capturedAt ? `, Wayback capture ${page.capturedAt}` : ""}, reproduced
            verbatim. Each term keeps the anchor the original gave it, so links written
            against the old page still land.
          </aside>
        </>
      ) : (
        <Reveal>
          <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
              Awaiting recovery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
              The glossary has not yet been recovered from the archive.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
