import Link from "next/link";
import { SUPPORT } from "@/lib/support";

/*
 * The footer is one line of links and one line of small print.
 *
 * It used to be a ten-item column, then a six-item block, and both made it
 * the tallest thing on a short page. Everything the header already carries is
 * gone from it, the labels are short enough to sit on a single row, and the
 * three paragraphs about provenance are now one sentence.
 *
 * Laid out as a wrapping row rather than columns: at a phone width it folds
 * to a few lines instead of becoming a ladder, and it never grows taller than
 * the text in it.
 */
const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/tribute", label: "Michael Tisdale" },
  { href: "/archive", label: "Recovery status" },
  { href: "/updates", label: "Updates" },
  { href: "/revisit", label: "The original site" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 text-[var(--fg-soft)]">
        {/* No wordmark here: it sits in the sticky header on every page, and
            repeating it cost the footer a whole row at phone widths. */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-[0.82rem]"
        >
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--accent)]">
              {link.label}
            </Link>
          ))}
          <a
            href={SUPPORT.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)]"
          >
            Support rural filmmakers ↗
          </a>
        </nav>

        {/* One sentence. The longer version ran to four lines on a phone,
            which is most of a footer by itself. */}
        <p className="mt-2.5 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed">
          Preserving BolexCollector.com © Michael Tisdale — texts and images unaltered,
          provenance recorded.
        </p>
      </div>
    </footer>
  );
}
