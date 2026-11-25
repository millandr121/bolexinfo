/**
 * How worn a thing is, which matters more than which model it is.
 *
 * A serviced H-16 and a seized one are the same entry in this archive
 * and several times apart in price, so a price report without a
 * condition is close to useless and the archive will not show one.
 *
 * The order is deliberate and "serviced" sits above "excellent" on
 * purpose: a recent overhaul is worth more on a sixty-year-old camera
 * than good cosmetics are. A clean-looking Bolex that has not run in
 * twenty years is a worse buy than a scuffed one just back from a
 * technician, and the scale should say so.
 */
export const CONDITIONS = [
  {
    id: "broken",
    label: "Broken",
    blurb: "Does not run, or runs wrongly. For parts or for repair.",
  },
  {
    id: "as-is",
    label: "As found",
    blurb: "Untested or sold without claims. Most attic finds.",
  },
  {
    id: "fair",
    label: "Fair",
    blurb: "Runs, but wants attention. Marks, sticky speeds, tired foam.",
  },
  {
    id: "good",
    label: "Good",
    blurb: "Works as it should, with the wear of its age.",
  },
  {
    id: "excellent",
    label: "Excellent",
    blurb: "Unusually clean and fully working, but not recently serviced.",
  },
  {
    id: "serviced",
    label: "Serviced",
    blurb: "Overhauled by a technician, recently enough to matter.",
  },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];

export const VENUES = [
  { id: "ebay", label: "eBay" },
  { id: "facebook", label: "Facebook" },
  { id: "shop", label: "A dealer or shop" },
  { id: "auction", label: "An auction house" },
  { id: "private", label: "Privately" },
  { id: "other", label: "Somewhere else" },
] as const;

export type VenueId = (typeof VENUES)[number]["id"];

/**
 * Currencies the form offers. Nothing is converted between them: rates
 * move, and a figure the archive converted on the day it arrived would
 * quietly rot. Reports are kept and shown in the currency they happened
 * in.
 */
export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"] as const;
export type CurrencyId = (typeof CURRENCIES)[number];

export function conditionLabel(id: string): string {
  return CONDITIONS.find((c) => c.id === id)?.label ?? id;
}

export function venueLabel(id: string): string {
  return VENUES.find((v) => v.id === id)?.label ?? id;
}

/** Order for display: worst first, as the scale is written. */
export function conditionRank(id: string): number {
  const n = CONDITIONS.findIndex((c) => c.id === id);
  return n === -1 ? 99 : n;
}
