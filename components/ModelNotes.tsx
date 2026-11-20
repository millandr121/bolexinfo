import Link from "next/link";
import { Reveal } from "./Reveal";
import type { Notes, NotePart } from "@/lib/notes";

/**
 * The "Notes and Comments" section of a model page.
 *
 * Set as the reading matter it is: a measure a little wider than the
 * specification list, body size rather than the small type the rest of
 * the page's apparatus uses. It is the one part of an object page that
 * someone sits and reads.
 *
 * The heading keeps Michael's own wording. "Notes and Comments" is what
 * the original called it on all 71 pages, and a reader who knew the old
 * site should recognise where they are.
 */
export function ModelNotes({ notes }: { notes: Notes }) {
  if (notes.blocks.length === 0) return null;

  return (
    <Reveal delay={0.1}>
      <section aria-labelledby="notes" className="mt-14 max-w-3xl">
        <h2
          id="notes"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
        >
          Notes and Comments
        </h2>

        <div className="mt-5 space-y-5">
          {notes.blocks.map((block, i) => {
            if (block.kind === "heading") {
              return (
                <h3
                  key={i}
                  className="pt-3 font-[family-name:var(--font-display)] text-lg font-[560]"
                >
                  {block.text}
                </h3>
              );
            }

            if (block.kind === "list") {
              return (
                <ul key={i} className="ml-5 list-disc space-y-2">
                  {block.items.map((item, n) => (
                    <li key={n} className="leading-relaxed">
                      <Parts parts={item} />
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={i} className="leading-relaxed">
                <Parts parts={block.parts} />
              </p>
            );
          })}
        </div>

        {notes.footnotes.length > 0 && (
          <ol className="rule mt-8 space-y-2 pt-4">
            {notes.footnotes.map((footnote) => (
              <li
                key={footnote.marker}
                className="flex gap-2 text-xs leading-relaxed text-[var(--fg-soft)]"
              >
                <span className="font-[family-name:var(--font-mono)] text-[var(--accent)]">
                  {footnote.marker}
                </span>
                <span>
                  <Parts parts={footnote.parts} />
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  );
}

/**
 * A run of inline text with its links and emphasis.
 *
 * Internal links go through the router; links into the preserved
 * original and off-site links are plain anchors, since /original/ is
 * served outside the app and a prefetch of it would be wasted.
 */
function Parts({ parts }: { parts: NotePart[] }) {
  return (
    <>
      {parts.map((part, i) => {
        const className = [
          part.italic && "italic",
          part.bold && "font-[560]",
          part.footnote && "align-super text-[0.65em] text-[var(--accent)]",
        ]
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

        const link = `underline underline-offset-2 decoration-[var(--line)] hover:text-[var(--accent)] ${className}`;
        return part.href.startsWith("/original/") || /^https?:/i.test(part.href) ? (
          <a key={i} href={part.href} className={link}>
            {part.text}
          </a>
        ) : (
          <Link key={i} href={part.href} className={link}>
            {part.text}
          </Link>
        );
      })}
    </>
  );
}
