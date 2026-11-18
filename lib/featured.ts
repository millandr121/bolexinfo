export interface FeaturedLink {
  href: string;
  label: string;
  blurb: string;
  /**
   * Named rather than imported, so this stays a plain data module that the
   * tests can read without pulling in JSX. components/Icons.tsx owns the
   * drawing.
   */
  icon: "book" | "history" | "portrait";
}

/**
 * The third slot on the front page, which changes between visits.
 *
 * Two of the three cards below the lookup are fixed because they answer the
 * two questions people arrive with — where are the other collectors, and who
 * can fix this. The third rotates so the front page can point somewhere
 * different each time without growing a fourth, fifth and sixth card.
 *
 * Everything in this list is a page that exists and has content in it. Repair
 * manuals will join when there are manuals to link to; a slot that rotates to
 * an empty page is worse than one that rotates between three good ones.
 */
export const FEATURED_LINKS: readonly FeaturedLink[] = [
  {
    href: "/ephemera",
    label: "The memorabilia",
    blurb: "Advertising, brochures and catalogues as Bolex sold itself, decade by decade.",
    icon: "book",
  },
  {
    href: "/timeline",
    label: "The whole history",
    blurb: "Paillard from a Swiss music-box workshop to the end of the H series.",
    icon: "history",
  },
  {
    href: "/tribute",
    label: "Michael Tisdale",
    blurb: "The collector who built all of this, and why the archive exists at all.",
    icon: "portrait",
  },
];

/**
 * Picks the rotating card before the first paint.
 *
 * Done inline rather than in React for the same reason the edition switch is:
 * all three cards are in the served HTML and CSS shows one, so the right card
 * paints immediately and no card flashes past on the way to another. Choosing
 * after hydration would also mean the server and the client disagreed about
 * what to render, which React treats as an error.
 *
 * Built by string concatenation, not a template literal — a template literal
 * holding `")}` was silently mangled by the build once already, and that bug
 * is documented in lib/view-preference.ts.
 */
export const FEATURED_INIT_SCRIPT =
  "(function(){try{" +
  "var n=" +
  String(FEATURED_LINKS.length) +
  ";var i=Math.floor(Math.random()*n);" +
  'document.documentElement.setAttribute("data-featured",String(i))' +
  '}catch(e){document.documentElement.setAttribute("data-featured","0")}})()';
