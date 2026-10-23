"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Navigation links that know where you are.
 *
 * Without an active state a visitor has to re-read every label to work out
 * their location — the "where am I?" pause that precedes "what do I click
 * next?". Every tab bar worth copying marks the current destination, so the
 * answer is available at a glance instead of by inference.
 *
 * Matching is prefix-based so a detail page (/cameras/h16) still marks its
 * parent section, which is what keeps the rail meaningful two levels deep.
 */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      /*
       * Nine uppercase labels with letter-spacing need roughly 1400px beside
       * the wordmark and the tools. Switching to them at `md` left the header
       * overflowing the window on every laptop width — 275px of horizontal
       * page scroll at 1024px — so the rail now carries the sections until
       * there is genuinely room, and the spacing opens up as space allows.
       */
      className="hidden xl:flex items-baseline gap-3 min-[1700px]:gap-5 text-[0.72rem] min-[1700px]:text-[0.8rem] uppercase tracking-[0.06em] min-[1700px]:tracking-[0.12em]"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-[var(--accent)] border-b border-[var(--accent)] pb-0.5"
                : "text-[var(--fg-soft)] hover:text-[var(--accent)] transition-colors duration-200"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SectionRail({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="xl:hidden border-t border-[var(--line)] scroll-x scroll-fade"
    >
      <div className="flex px-3 whitespace-nowrap">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`tap-target px-3 text-[0.78rem] uppercase tracking-[0.1em] border-b-2 ${
                active
                  ? "text-[var(--accent)] border-[var(--accent)]"
                  : "text-[var(--fg-soft)] border-transparent active:text-[var(--accent)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
