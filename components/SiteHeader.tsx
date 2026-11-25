import Link from "next/link";
import { SearchButton } from "./SearchPalette";
import { DesktopNav, SectionMenu } from "./NavLinks";
import { RevisitButton } from "./RevisitButton";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-sm sticky top-0 z-40 safe-top">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4 py-3 sm:py-4">
        {/*
         * The wordmark is a two-line stack: title above, imprint below. It
         * deliberately does not use the .tap-target utility — that sets
         * `display: inline-flex`, which would lay these two spans out as row
         * flex items and run the whole lockup onto one line, stretching the
         * brand and squeezing the nav. The 44px floor is set directly instead.
         */}
        <Link
          href="/"
          className="group shrink-0 no-underline flex flex-col justify-center min-h-[44px]"
        >
          <span className="block font-[family-name:var(--font-display)] text-2xl sm:text-4xl tracking-tight font-[560] leading-[1.05]">
            Bolex<span className="text-[var(--accent)]"> Collector</span>
          </span>
          {/* The imprint drops as the title grows, so the lockup reads as one
              name with a line under it rather than two competing labels. */}
          <span className="block mt-0.5 text-[0.52rem] sm:text-[0.58rem] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[var(--fg-soft)] font-[family-name:var(--font-mono)] leading-tight">
            Paillard-Bolex · Est. archive
          </span>
        </Link>
        <DesktopNav />
        {/* Tools, kept together and apart from the sections in the nav. */}
        <div className="flex shrink-0 items-center gap-2">
          <RevisitButton />
          <ThemeToggle className="flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-soft)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--fg)]" />
          <SearchButton />
        </div>
      </div>

      {/*
       * Narrow screens get the same two levels the desktop menus have,
       * in a panel. It replaced a flat rail of every destination that
       * scrolled sideways: with this many places to go that had become a
       * long drag under a scrollbar, and it looked broken on a tablet.
       */}
      <SectionMenu />
    </header>
  );
}
