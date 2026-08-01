import Link from "next/link";
import { SearchButton } from "./SearchPalette";

const NAV = [
  { href: "/cameras", label: "Cameras" },
  { href: "/projectors", label: "Projectors" },
  { href: "/lenses", label: "Lenses" },
  { href: "/accessories", label: "Accessories" },
  { href: "/ephemera", label: "Ephemera" },
  { href: "/serials", label: "Serials" },
  { href: "/articles", label: "Articles" },
  { href: "/archive", label: "Archive" },
] as const;

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
        <nav
          aria-label="Primary"
          className="hidden md:flex items-baseline gap-5 text-[0.8rem] uppercase tracking-[0.12em]"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--fg-soft)] hover:text-[var(--accent)] transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SearchButton />
      </div>

      {/*
       * Mobile section bar. Kept as a swipeable rail rather than a hamburger:
       * with only eight destinations, a rail keeps them one tap away and shows
       * where you are, where a menu would add a tap and hide the structure.
       * Each item is a 44pt target, and `.scroll-x` fades the right edge so it
       * is visibly scrollable instead of looking arbitrarily truncated.
       */}
      <nav aria-label="Sections" className="md:hidden border-t border-[var(--line)] scroll-x scroll-fade">
        <div className="flex px-3 whitespace-nowrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tap-target px-3 text-[0.78rem] uppercase tracking-[0.1em] text-[var(--fg-soft)] active:text-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
