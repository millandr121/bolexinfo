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
    <header className="w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-baseline justify-between gap-6 py-4">
        <Link href="/" className="group shrink-0 no-underline">
          <span className="block font-[family-name:var(--font-display)] text-xl sm:text-2xl tracking-tight font-[560]">
            Bolex<span className="text-[var(--accent)]"> Collector</span>
          </span>
          <span className="block text-[0.65rem] uppercase tracking-[0.22em] text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">
            Paillard-Bolex · Est. archive
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-baseline gap-5 text-[0.8rem] uppercase tracking-[0.12em]">
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
      <nav aria-label="Primary mobile" className="md:hidden overflow-x-auto border-t border-[var(--line)]">
        <div className="flex gap-5 px-5 py-2.5 text-[0.75rem] uppercase tracking-[0.12em] whitespace-nowrap">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-[var(--fg-soft)]">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
