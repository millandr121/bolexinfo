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
 * their websites down. Nothing here is a recommendation, and the page says so.
 *
 * Coordinates are carried so this can become a map once the list is long
 * enough for one to beat a grouped list.
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
