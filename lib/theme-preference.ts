export type Theme = "light" | "dark";

/** Where the visitor's choice is kept, per browser. */
export const THEME_STORAGE_KEY = "bolex:theme";

/**
 * What the page should show.
 *
 * A stored choice always wins. With nothing stored the answer is `null`,
 * meaning "do not decide" — no attribute is set and the stylesheet's
 * `prefers-color-scheme` rules govern, which is the right default: a visitor
 * whose device asks for a dark page has already told us something, and
 * overriding that unasked would be worse than following it.
 */
export function chooseTheme(stored: string | null | undefined): Theme | null {
  return stored === "light" || stored === "dark" ? stored : null;
}

/**
 * The same decision, inlined into <head> so it runs before the first paint.
 *
 * Setting the attribute after hydration instead would show every visitor who
 * has chosen against their system setting a flash of the other theme first.
 *
 * Built by plain concatenation rather than a template literal, for the reason
 * recorded at length in `view-preference.ts`: an interpolation immediately
 * followed by `")}` has been silently mangled by the build before, emitting
 * valid-looking HTML around broken JavaScript. A test checks the built page,
 * not just this string, because that fault only existed after the build.
 */
export const THEME_INIT_SCRIPT =
  "(function(){var t=null;" +
  "try{t=localStorage.getItem(" +
  JSON.stringify(THEME_STORAGE_KEY) +
  ")}catch(e){t=null}" +
  'if(t==="light"||t==="dark")' +
  'document.documentElement.setAttribute("data-theme",t)})()';
