export type Theme = "light" | "dark";

/** Where the visitor's choice is kept, per browser. */
export const THEME_STORAGE_KEY = "bolex:theme";

/**
 * What the page should show.
 *
 * A stored choice always wins; with nothing stored the answer is light.
 *
 * This used to defer to the device, on the reasoning that a machine asking
 * for a dark page had told us something worth respecting. In practice it
 * meant a reader whose laptop switches itself at sunset opened a site built
 * out of 1950s catalogue paper and found it black, having asked for nothing
 * of the kind. The paper is what this site looks like; dark is a deliberate
 * choice and stays one click away.
 */
export function chooseTheme(stored: string | null | undefined): Theme {
  return stored === "dark" ? "dark" : "light";
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
  'document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light")})()';
