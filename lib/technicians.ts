/**
 * Where a technician is, precisely enough to put a dot on a map.
 *
 * The town centre, not the business's own address. A repair shop is
 * often someone's home workshop, and this project is not going to
 * publish a map pin on a person's house — the point is "there is
 * someone in this part of the world", which a town does perfectly
 * well.
 *
 * `from` records how the coordinates were obtained, because a number
 * that cannot be rechecked is not evidence.
 */
export interface Place {
  lat: number;
  lon: number;
  /** What the coordinates actually locate. */
  precision: "town" | "city";
  from: string;
}

export interface Technician {
  name: string;
  /** Town and country as the business states them, or the best evidence available. */
  location: string;
  /**
   * Coordinates, where the stated location is specific enough to have
   * any. Three of the current entries are not: two give only a country
   * and one only a region, and none of them publish more. A guess
   * would put a business in a town it is not in, which is worse on a
   * map than an absence.
   */
  place?: Place;
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
    location: "Janetville, Ontario, Canada",
    place: { lat: 44.2144316, lon: -78.7243914, precision: "town", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
    region: "North America",
    url: "https://www.pigeoncreekcamera.com/services",
    email: "contact@pigeoncreekcamera.com",
    work: "CLA for mechanical 16mm Bolex bodies; C-mount and Bolex bayonet lens service, including collimation. Super 16 conversion listed as coming soon.",
    pricing: "CLA from CAD $495 + parts; lens service from CAD $150 + parts",
    evidence: {
      kind: "site",
      note:
        "Their own services page, read November 2026. Prices in CAD; the site carries a 2021 " +
        "copyright, so confirm they are taking work. The town comes from the map pin on their " +
        "contact page, which sits at the centre of Janetville rather than on an address — they " +
        "publish no street address and none is given here.",
    },
  },
  {
    /*
     * The strongest public record of anyone here, and the entry that
     * took longest to justify, because a reputation is not a business
     * listing. The forum corpus holds 95 of his posts across 70 threads
     * from 2010 to July 2025, and members send people to him unprompted.
     * None of that is permission: listing someone who has not asked for
     * strangers is a disservice dressed as a favour. He trades publicly
     * under his own business name with a published address for enquiries,
     * which settles it.
     */
    name: "Dom Jaeger — Cinetinker",
    location: "Melbourne, Victoria, Australia",
    place: { lat: -37.8142454, lon: 144.9631732, precision: "city", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
    region: "Rest of world",
    url: "https://cinetinker.blogspot.com/",
    email: "cinetinker@gmail.com",
    work:
      "Freelance cine lens and camera technician. In his own words he works on mechanical " +
      "Bolexes and avoids the electronic ones even for a mechanical fault, because they are a " +
      "real pain to work on — which is more use before shipping than most service pages offer. " +
      "His blog carries full strip-down write-ups of cine cameras.",
    pricing: "By quote",
    evidence: {
      kind: "site",
      note:
        "His blog at cinetinker.blogspot.com, read November 2026: detailed service procedures, " +
        "last posted 2019. The email and the description of his work are from his own public " +
        "profile. He has answered Bolex questions on cinematography.com continuously from 2010 " +
        "to July 2025. The blog is dormant, so write before assuming he is taking work.",
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
    place: { lat: 40.651726, lon: -74.3483059, precision: "town", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
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
    place: { lat: 41.1685867, lon: -82.2175679, precision: "town", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
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
    place: { lat: 35.0796355, lon: -106.3879441, precision: "town", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
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
    place: { lat: 34.0536923, lon: -118.2427676, precision: "city", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
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
    /*
     * Spelled "Boscher" here until his own site was read, which was a
     * misspelling of a real person's name on a page that exists to
     * help people find him.
     */
    name: "Les Bosher",
    location: "South Wales, United Kingdom",
    region: "United Kingdom & Europe",
    url: "https://www.lesbosher.co.uk/",
    work:
      "Lens and camera conversions, lens mounts, adapters, range extenders and " +
      "lens supports, made in-house on CNC and manual machinery. Manufacturing for " +
      "film and television since 1982, run by Les Bosher with his son Chris. This " +
      "is fabrication rather than general CLA work.",
    evidence: {
      kind: "site",
      note:
        "His own site, read November 2026 — a frameset from the early web, still up, " +
        "stating 43 years as a camera engineer. It publishes no email or phone and no " +
        "address beyond the work itself, so contact is through the site. The South Wales " +
        "location comes from elsewhere and is not stated there.",
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
