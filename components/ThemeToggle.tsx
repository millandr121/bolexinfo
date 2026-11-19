"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme-preference";

/**
 * Choose a light or dark page, and remember it.
 *
 * Without this the site follows the device and the visitor has no say, which
 * is fine until someone's machine switches itself at sunset and hands them a
 * black page they did not ask for. The stylesheet already reads `data-theme`;
 * this is the control that sets it.
 *
 * It renders nothing until mounted. The served HTML cannot know which theme
 * is in force — that depends on a stored choice or on the device, neither of
 * which exists at build time — so drawing a sun or a moon on the server would
 * be a guess, wrong half the time, and React would complain when the client
 * disagreed. The gap it leaves is one icon wide and only until hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") {
      setTheme(attr);
      return;
    }
    // Nothing stored, so the page is following the device.
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  if (theme === null) return <span className={className} aria-hidden="true" />;

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Switch to the dark page" : "Switch to the light page";

  const apply = () => {
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing or blocked storage: the switch still works for this
      // page view, it simply will not be remembered.
    }
  };

  return (
    <button
      type="button"
      onClick={apply}
      className={className}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        // Sun: offering the light page.
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
        </svg>
      ) : (
        // Moon: offering the dark page.
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />
        </svg>
      )}
    </button>
  );
}
