import Link from "next/link";
import type { Neighbours } from "@/lib/sequence";

/**
 * Previous and next, so a reader can walk a collection without bouncing off
 * the index between every item.
 *
 * Restores something the original site had: every page ended with this pair
 * of links, and 290 of the archived pages still carry them. Where the chain
 * survives it is used as written — that ordering is one collector's route
 * through his own collection, not a sort.
 *
 * Both ends name the thing they lead to rather than saying "Previous" and
 * "Next" alone, because knowing it is the H-16 M-5 next is the difference
 * between following a sequence and clicking blind.
 */
export function SequenceNav({
  neighbours,
  section,
}: {
  neighbours: Neighbours;
  /** Where "all of them" goes, for the middle of the row. */
  section: { label: string; href: string };
}) {
  const { previous, next } = neighbours;
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={`${section.label} sequence`}
      className="rule mt-14 pt-5 flex items-stretch justify-between gap-4 text-sm"
    >
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className="group flex min-w-0 flex-1 flex-col gap-1 hover:text-[var(--accent)] transition-colors"
        >
          <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]">
            ← Previous
          </span>
          <span className="truncate font-[family-name:var(--font-display)] text-base font-[560]">
            {previous.label}
          </span>
        </Link>
      ) : (
        /* An empty cell rather than nothing, so "next" stays on the right at
           the start of a sequence instead of jumping to the left. */
        <span aria-hidden="true" className="flex-1" />
      )}

      <Link
        href={section.href}
        className="hidden shrink-0 self-center px-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)] hover:text-[var(--accent)] transition-colors sm:block"
      >
        All {section.label.toLowerCase()}
      </Link>

      {next ? (
        <Link
          href={next.href}
          rel="next"
          className="group flex min-w-0 flex-1 flex-col items-end gap-1 text-right hover:text-[var(--accent)] transition-colors"
        >
          <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]">
            Next →
          </span>
          <span className="truncate font-[family-name:var(--font-display)] text-base font-[560]">
            {next.label}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="flex-1" />
      )}
    </nav>
  );
}
