"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
      className="hidden menus:flex items-center gap-1 xl:gap-2 text-[0.74rem] xl:text-[0.78rem] uppercase tracking-[0.08em]"
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
          className="absolute left-0 top-full z-50 mt-1 min-w-[13rem] border border-[var(--line)] bg-[var(--bg-raised)] p-2 shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
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
 * The menu, for phones and narrow windows.
 *
 * This used to be a flat rail of every destination that scrolled
 * sideways. With twenty-odd places to go it had become a long drag
 * under a scrollbar, which is a poor way to find anything and looked
 * broken on a tablet, where there is plenty of room but not quite
 * enough for the desktop menus.
 *
 * So it is a menu with the same two levels the desktop has: the groups
 * first, and a group's contents slide in over them. One tap to open,
 * one to choose a group, one to arrive, and at every point you can see
 * where you are rather than scrolling to look for it.
 */
export function SectionMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<NavGroup | null>(null);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  /* The label of wherever we are, so the closed bar still says it. */
  const here =
    flattenNavigation().find((item) => isActiveHref(pathname, item.href))?.label ?? "Menu";

  useEffect(() => {
    setOpen(false);
    setGroup(null);
  }, [pathname]);

  /* A panel over the page must not leave the page scrolling behind it,
     and must close on Escape like every other dialog. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (group) setGroup(null);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, group]);

  return (
    <div className="menus:hidden border-t border-[var(--line)]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="tap-target flex w-full items-center gap-2.5 px-5 text-[0.78rem] uppercase tracking-[0.1em] text-[var(--fg-soft)]"
      >
        <span aria-hidden="true" className="flex flex-col gap-[3px]">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
        <span className="sr-only">Open the menu. Currently in: </span>
        <span className="text-[var(--accent)]">{here}</span>
      </button>

      {/*
        Portalled to the body on purpose. The site header carries
        `backdrop-blur`, and a backdrop-filter makes an element a
        containing block for any `position: fixed` descendant — so a
        panel rendered in place was clipped to the height of the header
        instead of covering the screen. Nothing about the markup looked
        wrong; it only showed up on screen.
      */}
      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 menus:hidden">
          <button
            type="button"
            aria-label="Close the menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            role="menu"
            aria-label="Sections"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--bg)] outline-none"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <span className="font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.2em] text-[var(--fg-soft)]">
                {group ? group.label : "Sections"}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the menu"
                className="tap-target -mr-2 px-2 text-lg leading-none text-[var(--fg-soft)]"
              >
                ×
              </button>
            </div>

            {/* Two levels on one track. The second slides over the first
                rather than replacing it, so the movement says which way
                you went and Back says how to come out. */}
            <div className="relative flex-1 overflow-hidden">
              <ul
                className={`absolute inset-0 overflow-y-auto transition-transform duration-200 ${
                  group ? "-translate-x-full" : "translate-x-0"
                }`}
              >
                {NAVIGATION.map((entry) =>
                  isGroup(entry) ? (
                    <li key={entry.label}>
                      <button
                        type="button"
                        onClick={() => setGroup(entry)}
                        className={`tap-target flex w-full items-center justify-between px-5 text-left text-[0.82rem] uppercase tracking-[0.1em] ${
                          isActiveEntry(pathname, entry)
                            ? "text-[var(--accent)]"
                            : "text-[var(--fg)]"
                        }`}
                      >
                        {entry.label}
                        <span aria-hidden="true" className="text-[var(--fg-soft)]">
                          ›
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li key={entry.href}>
                      <Link
                        href={entry.href}
                        aria-current={isActiveHref(pathname, entry.href) ? "page" : undefined}
                        className={`tap-target flex w-full items-center px-5 text-[0.82rem] uppercase tracking-[0.1em] ${
                          isActiveHref(pathname, entry.href)
                            ? "text-[var(--accent)]"
                            : "text-[var(--fg)]"
                        }`}
                      >
                        {entry.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>

              <div
                className={`absolute inset-0 overflow-y-auto bg-[var(--bg)] transition-transform duration-200 ${
                  group ? "translate-x-0" : "translate-x-full"
                }`}
                aria-hidden={!group}
              >
                {group && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGroup(null)}
                      className="tap-target flex w-full items-center gap-2 px-5 text-left font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]"
                    >
                      <span aria-hidden="true">‹</span> Back
                    </button>
                    <ul className="border-t border-[var(--line)]">
                      {group.href && (
                        <li>
                          <Link
                            href={group.href}
                            className="block px-5 py-3 text-[0.82rem] uppercase tracking-[0.1em] text-[var(--fg)]"
                          >
                            All {group.label.toLowerCase()}
                          </Link>
                        </li>
                      )}
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={
                              isActiveHref(pathname, item.href) ? "page" : undefined
                            }
                            className={`block px-5 py-3 ${
                              isActiveHref(pathname, item.href)
                                ? "text-[var(--accent)]"
                                : "text-[var(--fg)]"
                            }`}
                          >
                            <span className="block text-[0.82rem] uppercase tracking-[0.1em]">
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
