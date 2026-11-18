"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  NAVIGATION,
  flattenNavigation,
  isActiveEntry,
  isActiveHref,
  isGroup,
  type NavEntry,
  type NavGroup,
} from "@/lib/navigation";

/**
 * Primary navigation.
 *
 * Grouped rather than flat: nine top-level destinations filled the bar before
 * the tools were placed and overflowed the window below 1536px. Four groups
 * fit comfortably and, more usefully, tell a visitor what kind of thing each
 * destination is.
 */
export function DesktopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  /*
   * A menu that can only be dismissed by clicking its own button is a trap:
   * Escape and a click anywhere outside both close it, which is what every
   * menu people already know does.
   */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Navigating away should not leave a menu hanging open behind the new page.
  useEffect(() => setOpen(null), [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="hidden lg:flex items-center gap-1 xl:gap-2 text-[0.74rem] xl:text-[0.78rem] uppercase tracking-[0.08em]"
    >
      {NAVIGATION.map((entry) =>
        isGroup(entry) ? (
          <NavMenu
            key={entry.label}
            group={entry}
            pathname={pathname}
            open={open === entry.label}
            onToggle={() => setOpen((v) => (v === entry.label ? null : entry.label))}
          />
        ) : (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={isActiveHref(pathname, entry.href) ? "page" : undefined}
            className={`px-2 py-1.5 transition-colors duration-200 ${
              isActiveHref(pathname, entry.href)
                ? "text-[var(--accent)] border-b border-[var(--accent)]"
                : "text-[var(--fg-soft)] hover:text-[var(--accent)]"
            }`}
          >
            {entry.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function NavMenu({
  group,
  pathname,
  open,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const active = isActiveEntry(pathname, group);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`flex items-center gap-1.5 px-2 py-1.5 uppercase tracking-[0.08em] transition-colors duration-200 ${
          active || open
            ? "text-[var(--accent)]"
            : "text-[var(--fg-soft)] hover:text-[var(--accent)]"
        }`}
      >
        {group.label}
        <span
          aria-hidden="true"
          className={`text-[0.5em] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          id={id}
          className="absolute left-0 top-full z-50 mt-1 min-w-[17rem] border border-[var(--line)] bg-[var(--bg-raised)] p-2 shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
        >
          <ul>
            {group.items.map((item) => {
              const current = isActiveHref(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`block px-3 py-2.5 normal-case tracking-normal transition-colors duration-200 hover:bg-[var(--bg)] ${
                      current ? "text-[var(--accent)]" : "text-[var(--fg)]"
                    }`}
                  >
                    <span className="block text-[0.95rem] font-[520]">{item.label}</span>
                    {item.blurb && (
                      <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[0.68rem] text-[var(--fg-soft)]">
                        {item.blurb}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * The mobile rail stays flat.
 *
 * It already scrolls sideways and handles any number of destinations, so
 * folding it into menus would add a tap to reach everything and hide the
 * site's shape for no gain. Grouping solves a desktop width problem; this
 * surface does not have one.
 */
export function SectionRail() {
  const pathname = usePathname();
  const items = flattenNavigation();

  return (
    <nav
      aria-label="Sections"
      className="lg:hidden border-t border-[var(--line)] scroll-x scroll-fade"
    >
      <div className="flex px-3 whitespace-nowrap">
        {items.map((item) => {
          const active = isActiveHref(pathname, item.href);
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

export type { NavEntry };
