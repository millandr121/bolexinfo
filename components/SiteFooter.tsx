import Link from "next/link";
import { SUPPORT } from "@/lib/support";

/*
 * The footer holds what the header does not.
 *
 * It used to list ten destinations in a single column, which made it the
 * tallest thing on a short page — and eight of those ten were already one
 * click away in the navigation above. Repeating the whole site at the bottom
 * is not a courtesy to anyone.
 *
 * What is left is the housekeeping: who made this and why, the two ways out
 * of the modern edition, and the provenance note. Laid out in two columns so
 * it reads as a block rather than a ladder.
 */
const FOOTER_LINKS = [
  { href: "/about", label: "About the restoration" },
  { href: "/tribute", label: "A dedication to Michael Tisdale" },
  { href: "/archive", label: "Recovery status" },
  { href: "/updates", label: "Previous updates" },
  { href: "/revisit", label: "Revisit the original site" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] text-sm text-[var(--fg-soft)]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--fg)]">
            Bolex Collector
          </p>
          <p className="mt-2 max-w-xs leading-relaxed">
            A preservation of the original BolexCollector.com by{" "}
            <Link href="/tribute" className="underline underline-offset-4 hover:text-[var(--accent)]">
              Michael Tisdale
            </Link>
            , kept as a permanent archive.
          </p>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.68rem] leading-relaxed">
            Original site © Michael Tisdale. Historical texts and images are preserved
            unaltered; recovery provenance is recorded throughout.
          </p>
        </div>

        <nav aria-label="Footer" className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2 self-start">
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
      </div>
    </footer>
  );
}
