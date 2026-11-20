export interface Technician {
  name: string;
  /** Town and country as the business states them, or the best evidence available. */
  location: string;
  region: "North America" | "United Kingdom & Europe" | "Rest of world";
  url?: string;
  phone?: string;
  email?: string;
  /** What they actually do — not a blanket "camera repair". */
  work: string;
  /** Indicative only; every one of these needs confirming before shipping. */
  pricing?: string;
  /**
   * How current the listing is. "site" means their own site was read and the
   * date is the most recent one it carries; "listed" means the business was
   * found on someone else's directory and has not been confirmed here.
   */
  evidence: { kind: "site" | "listed"; note: string };
}

/**
 * Bolex repair, service and conversion.
 *
 * Every entry here was found and read rather than recalled, and each carries
 * what the evidence for it actually is. That matters more than it might look:
 * a stale repair listing costs someone a camera and a shipping bill, and the
 * small-gauge trade is thin enough that businesses go quiet without taking
 * their websites down.
 *
 * The list curates by inclusion. Someone shipping a camera across a continent
 * treats a listing here as a recommendation whether or not it is labelled one,
 * so the bar for appearing is that this project is willing to stand behind the
 * entry. Anyone it is not willing to stand behind is simply absent — there is
 * no "not recommended" anywhere on the site, no asterisk and no implication.
 * Omission is silent, and silence is the whole of it: absence says nothing
 * about a business, where a published doubt would say a great deal.
 *
 * See research/roadmap.md for how that is meant to be applied.
 *
 * There is no map yet, and no coordinates: an earlier version of this
 * comment said coordinates were carried, which was never true of any
 * entry. A map is planned — see research/roadmap.md — and wants a
 * longer list first, because seven dots on a world map is mostly
 * ocean.
 */
export const TECHNICIANS: readonly Technician[] = [
  {
    name: "Pigeon Creek Camera",
    location: "Canada",
    region: "North America",
    url: "https://www.pigeoncreekcamera.com/services",
    email: "contact@pigeoncreekcamera.com",
    work: "CLA for mechanical 16mm Bolex bodies; C-mount and Bolex bayonet lens service, including collimation. Super 16 conversion listed as coming soon.",
    pricing: "CLA from CAD $495 + parts; lens service from CAD $150 + parts",
    evidence: {
      kind: "site",
      note: "Their own services page, read November 2026. Prices in CAD; the site carries a 2021 copyright, so confirm they are taking work.",
    },
  },
  {
    /*
     * Added after the Reddit corpus made it impossible to ignore: Du-All
     * is named in 13 separate threads, more than twice as often as
     * anyone else, and people describe sending Bolex bodies there for a
     * CLA and discussing the turnaround. The details below are from
     * their own site rather than from those posts.
     */
    name: "Du-All Camera",
    location: "Westfield, New Jersey, USA",
    region: "North America",
    url: "https://duallcamera.com/",
    phone: "+1 212-643-1042",
    email: "duall529@aol.com",
    work:
      "Motion picture camera and lens repair, modification and overhaul, with an " +
      "in-house machine shop making parts that are no longer available. Family run " +
      "for over forty-five years; the founder George Gal is a tool and die maker by " +
      "trade, and his sons Jeffrey and Steven now run it, Jeffrey as service " +
      "technician. They also sell Bolex accessories and parts.",
    pricing: "By quote",
    evidence: {
      kind: "site",
      note:
        "Their own about page and shop, read November 2026. The site has no Bolex-specific " +
        "service page, so the Bolex work is attested by customers on r/bolex rather than " +
        "advertised; confirm scope and turnaround before shipping.",
    },
  },
  {
    name: "Visual Products",
    location: "Wellington, Ohio, USA",
    region: "North America",
    url: "https://visualproducts.com/",
    phone: "+1 440-647-4999",
    email: "sales@visualproducts.com",
    work:
      "Dealer in used and refurbished motion picture equipment, including S16 and " +
      "16mm cameras, with an in-house machine shop and camera and lens departments. " +
      "They refurbish what they sell and make conversions, and their staff includes " +
      "engineers and technicians rather than sales alone. In business over thirty years.",
    pricing: "By quote",
    evidence: {
      kind: "site",
      note:
        "Their own about page and departments, read November 2026, plus a recommendation " +
        "from the site owner. They publish no Bolex-specific repair page — the service " +
        "side is described around the equipment they sell — so ask directly whether they " +
        "will take in a camera that did not come from them.",
    },
  },
  {
    name: "Dr Bolex",
    location: "Tijeras, New Mexico, USA",
    region: "North America",
    url: "https://www.drbolex.com/cla-1",
    phone: "+1 214-870-5608",
    email: "spline1@sbcglobal.net",
    work: "H16 repair and CLA, including non-reflex bodies; Super 16 and Omni 16 format conversion.",
    pricing: "By quote",
    evidence: {
      kind: "site",
      note: "Their own CLA page, read November 2026; site carries a 2024 copyright.",
    },
  },
  {
    name: "High Line Camera Rentals",
    location: "Los Angeles, California, USA",
    region: "North America",
    url: "https://www.highlinecamerarentals.com/bolex-repair-service",
    phone: "+1 213-444-2422",
    work: "Repair and CLA across most H16 models; Super 16 conversion, which they state includes a full CLA.",
    pricing: "Full CLA around USD $800 + parts",
    evidence: {
      kind: "site",
      note: "Their own Bolex service page, read November 2026 — the most recently updated of these.",
    },
  },
  {
    name: "Martin Stent — Steicca",
    location: "United Kingdom",
    region: "United Kingdom & Europe",
    work: "Full service and overhaul of H16 bodies.",
    evidence: {
      kind: "listed",
      note: "Listed on bolexh16user.net's useful links rather than confirmed here. Treat as a lead to check, not a verified listing.",
    },
  },
  {
    name: "Les Boscher",
    location: "South Wales, United Kingdom",
    region: "United Kingdom & Europe",
    work: "PL mount fitting and Super 16 conversion rather than general CLA work.",
    evidence: {
      kind: "listed",
      note: "Listed on bolexh16user.net's useful links rather than confirmed here. Treat as a lead to check, not a verified listing.",
    },
  },
];

export const TECHNICIAN_REGIONS = [
  "North America",
  "United Kingdom & Europe",
  "Rest of world",
] as const;

export function techniciansByRegion(): Array<{ region: string; people: Technician[] }> {
  return TECHNICIAN_REGIONS.map((region) => ({
    region,
    people: TECHNICIANS.filter((t) => t.region === region),
  })).filter((g) => g.people.length > 0);
}
