export interface NavLeaf {
  href: string;
  label: string;
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
      { href: "/cameras", label: "Cameras" },
      { href: "/projectors", label: "Projectors" },
      { href: "/lenses", label: "Lenses" },
      { href: "/accessories", label: "Accessories" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/answers", label: "Answers" },
      { href: "/technicians", label: "Repair & service" },
      { href: "/articles", label: "Articles" },
      { href: "/ephemera", label: "Ephemera" },
      { href: "/manuals", label: "Technical bulletins" },
      { href: "/prices", label: "Prices" },
      { href: "/photographs", label: "Archive photographs" },
      { href: "/timeline", label: "Timeline" },
      { href: "/glossary", label: "Glossary" },
      { href: "/links", label: "Links" },
      { href: "/suggest", label: "Suggest an edit" },
    ],
  },
  {
    label: "The Archive",
    items: [
      { href: "/updates", label: "Updates" },
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
