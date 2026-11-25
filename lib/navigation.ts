export interface NavLeaf {
  href: string;
  label: string;
  /** One line shown under the label in a desktop menu. */
  blurb?: string;
}

export interface NavGroup {
  label: string;
  /** Where the group's own index lives, when it has one. */
  href?: string;
  items: readonly NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

/**
 * The primary navigation, in four groups.
 *
 * Nine flat destinations was the whole problem: the bar was full before the
 * search and view controls were placed, and it overflowed the window on every
 * common laptop width. Four groups leave room for the tools and, more
 * usefully, say what kind of thing each destination is — the four collections
 * of hardware are one idea, the things to read are another.
 *
 * Identify comes first and stays a single item. It is a tool rather than a
 * collection, and someone holding a camera with a number stamped on it is the
 * most common visitor this site has — it is also what the front page now
 * leads with, so the navigation and the front door agree about what this site
 * is for. Burying it a click deeper to tidy the pattern would be the wrong
 * trade.
 */
export const NAVIGATION: readonly NavEntry[] = [
  { href: "/serials", label: "Identify" },
  {
    label: "Equipment",
    items: [
      { href: "/cameras", label: "Cameras", blurb: "56 models, 1928–1976" },
      { href: "/projectors", label: "Projectors", blurb: "18 models" },
      { href: "/lenses", label: "Lenses", blurb: "119 lenses, by maker, year or code" },
      { href: "/accessories", label: "Accessories", blurb: "99 objects, by type or year" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/technicians", label: "Repair & service", blurb: "Who works on these cameras" },
      { href: "/articles", label: "Articles", blurb: "Recovered from the original site" },
      { href: "/ephemera", label: "Ephemera", blurb: "168 pieces, by kind or year" },
      { href: "/manuals", label: "Technical bulletins", blurb: "Paillard to its dealers, 1959–62" },
      { href: "/prices", label: "Prices", blurb: "What it cost new, 1952–1979" },
      { href: "/articles/what-one-is-worth", label: "What one is worth", blurb: "How to value yours" },
      { href: "/photographs", label: "Archive photographs", blurb: "The works, from public collections" },
      { href: "/timeline", label: "Timeline", blurb: "Paillard, 1814 onwards" },
      { href: "/glossary", label: "Glossary", blurb: "The terms, defined" },
      { href: "/links", label: "Links", blurb: "Resources worth your time" },
      { href: "/suggest", label: "Suggest an edit", blurb: "Corrections, photographs, what you know" },
    ],
  },
  {
    label: "The Archive",
    items: [
      { href: "/updates", label: "Updates", blurb: "What has been added, 2005 to now" },
      { href: "/about", label: "About this archive" },
      { href: "/tribute", label: "Michael Tisdale" },
    ],
  },
];

/** Every destination, flattened — the order the mobile rail uses. */
export function flattenNavigation(entries: readonly NavEntry[] = NAVIGATION): NavLeaf[] {
  return entries.flatMap((entry) => (isGroup(entry) ? [...entry.items] : [entry]));
}

/**
 * Whether a path belongs to this destination.
 *
 * Prefix-based so a detail page (/cameras/h16) still marks its parent, which
 * is what keeps the navigation meaningful two levels deep.
 */
export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Whether any destination in a group is the current one. */
export function isActiveEntry(pathname: string, entry: NavEntry): boolean {
  return isGroup(entry)
    ? entry.items.some((item) => isActiveHref(pathname, item.href))
    : isActiveHref(pathname, entry.href);
}
