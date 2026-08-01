import Link from "next/link";
import { SearchButton } from "./SearchPalette";
import { DesktopNav, SectionRail, type NavItem } from "./NavLinks";

/**
 * Primary destinations, ordered so the five *collections* come first and the
 * tools and meta pages follow. A visitor scanning left to right meets the
 * things they came to browse before anything about the project itself.
 */
export const NAV: readonly NavItem[] = [
  { href: "/cameras", label: "Cameras" },
  { href: "/projectors", label: "Projectors" },
  { href: "/lenses", label: "Lenses" },
  { href: "/accessories", label: "Accessories" },
  { href: "/ephemera", label: "Ephemera" },
  { href: "/serials", label: "Serials" },
  { href: "/articles", label: "Articles" },
  { href: "/timeline", label: "Timeline" },
  { href: "/archive", label: "Archive" },
];

export function SiteHeader() {
  return (
    <header className="w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-sm sticky top-0 z-40 safe-top">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4 py-3 sm:py-4">
        <Link href="/" className="group shrink-0 no-underline tap-target">
          <span className="block font-[family-name:var(--font-display)] text-lg sm:text-2xl tracking-tight font-[560] leading-tight">
            Bolex<span className="text-[var(--accent)]"> Collector</span>
          </span>
          <span className="hidden sm:block text-[0.65rem] uppercase tracking-[0.22em] text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
            Paillard-Bolex · Est. archive
          </span>
        </Link>
        <DesktopNav items={NAV} />
        <SearchButton />
      </div>

      {/*
       * Mobile section rail. Kept as a swipeable rail rather than a hamburger:
       * with this many destinations a menu would add a tap and hide the site's
       * structure, where a rail keeps every section one tap away and shows
       * which one you are in.
       */}
      <SectionRail items={NAV} />
    </header>
  );
}
