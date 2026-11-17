export type View = "original" | "modern";

/** Where the visitor's choice is kept, per browser. */
export const VIEW_STORAGE_KEY = "bolex:view";

/**
 * Below this the original site is not offered first.
 *
 * It was built for a fixed-width window of around 960px and has no responsive
 * behaviour at all, so on a phone it can only be panned and pinched. Handing
 * that to someone as their first impression would cost more than the nostalgia
 * is worth, so narrow screens open on the modern edition instead — with the
 * toggle still there for anyone who wants the old one.
 */
export const DESKTOP_MIN_WIDTH = 1024;

/**
 * Which edition to show.
 *
 * A stored choice always wins, on any screen: someone who switched has told us
 * what they want, and being re-routed on every visit would be the opposite of
 * remembering. Only a visitor with no stored choice is sorted by screen width.
 */
export function chooseView(stored: string | null | undefined, width: number): View {
  if (stored === "original" || stored === "modern") return stored;
  return width >= DESKTOP_MIN_WIDTH ? "original" : "modern";
}

/**
 * The same decision, inlined into <head> so it runs before the first paint.
 *
 * This is deliberately not React. The two editions are both present in the
 * served HTML and CSS picks between them from this attribute, which means the
 * right one paints immediately and keeps painting even if the page's
 * JavaScript never arrives. Were the choice made after hydration instead,
 * every desktop visitor would see the modern homepage flash past first.
 *
 * It must stay in step with `chooseView` above; a test asserts that it does.
 *
 * Built by plain concatenation rather than a template literal, which is not a
 * style choice. Written as `` `...getItem("${KEY}")}catch(e){}...` `` the
 * build silently dropped the thirteen characters from `")` to the end of the
 * catch block, emitting `getItem("bolex:viewif(v!==...` — valid-looking HTML
 * containing broken JavaScript, so the attribute was never set and every
 * visitor fell through to the modern edition. An interpolation immediately
 * followed by `")}` appears to confuse the compiler. A test checks the built
 * page, not just this string, because the fault only existed after the build.
 */
export const VIEW_INIT_SCRIPT =
  "(function(){var v=null;" +
  "try{v=localStorage.getItem(" +
  JSON.stringify(VIEW_STORAGE_KEY) +
  ")}catch(e){v=null}" +
  'if(v!=="original"&&v!=="modern")v=window.innerWidth>=' +
  String(DESKTOP_MIN_WIDTH) +
  '?"original":"modern";' +
  'document.documentElement.setAttribute("data-view",v)})()';
