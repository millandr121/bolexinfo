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

/**
 * The kinds of work someone might want done, as a reader would ask
 * for them rather than as a workshop would bill them.
 */
export const CAPABILITIES = [
  { id: "16mm", label: "16mm" },
  { id: "super16", label: "Super 16 conversion" },
  { id: "electronic", label: "Electronic bodies (EBM, EL)" },
  { id: "double8", label: "8mm and Double 8" },
  { id: "super8", label: "Super 8" },
  { id: "projectors", label: "Projectors" },
  { id: "lenses", label: "Lenses" },
] as const;

export type Capability = (typeof CAPABILITIES)[number]["id"];

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
  /**
   * What they do, and what they have said they do not.
   *
   * Three states, not two. `does` is work the evidence actually
   * supports; `doesNot` is work they have explicitly declined, which
   * is worth as much to a reader as a yes; anything in neither list is
   * simply not stated and is shown as such.
   *
   * Nothing is assumed, not even 16mm. It would be a fair guess for
   * almost everyone here, and a guess is exactly what sends a camera
   * to the wrong bench. Where a listing says 16mm it is because the
   * source said so.
   */
  does?: readonly Capability[];
  doesNot?: readonly Capability[];
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
 * Six of the seven carry coordinates and appear on the map at the top
 * of the page. They are town centres, never a street address: a repair
 * shop is often somebody's home workshop. An entry whose stated
 * location is no finer than a country or a region gets no coordinates
 * at all and is named under the map instead, because a dot invented
 * for it would put a business in a town it is not in.
 *
 * Seven dots is indeed mostly ocean, which was the argument for
 * waiting. It turned out to be the wrong way round: the emptiness is
 * information. Someone in continental Europe can see at a glance that
 * their nearest listed workshop is in South Wales, and that is worth
 * knowing before reading seven entries to work it out.
 */
export const TECHNICIANS: readonly Technician[] = [
  {
    name: "Pigeon Creek Camera",
    does: ["16mm", "lenses"],
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
        "contact page, which sits at the centre of Janetville rather than on an address. They " +
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
    name: "Dom Jaeger, Cinetinker",
    does: ["16mm", "lenses"],
    doesNot: ["electronic"],
    location: "Melbourne, Victoria, Australia",
    place: { lat: -37.8142454, lon: 144.9631732, precision: "city", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
    region: "Rest of world",
    url: "https://cinetinker.blogspot.com/",
    email: "cinetinker@gmail.com",
    work:
      "Freelance cine lens and camera technician. In his own words he works on mechanical " +
      "Bolexes and avoids the electronic ones even for a mechanical fault, because they are a " +
      "real pain to work on, which is more use before shipping than most service pages offer. " +
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
    does: ["16mm", "electronic", "lenses"],
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
    does: ["16mm", "super16", "lenses"],
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
        "from the site owner. They publish no Bolex-specific repair page, since the service " +
        "side is described around the equipment they sell, so ask directly whether they " +
        "will take in a camera that did not come from them.",
    },
  },
  /*
   * Dr Bolex was listed here and is removed on 23 November.
   *
   * Two independent accounts, neither of them hearsay. On r/16mm in
   * February 2023 someone answering a request for a Super 16
   * conversion says flatly that he is a scammer and names someone
   * else. In the Bolex Camera Users group a customer sets out, with
   * screenshots of the paid invoice and the emails, an EBM Omni 16
   * conversion paid for in March 2022 and still undelivered a year
   * later, after a run of missed dates.
   *
   * Neither says the work is bad when it arrives, and the complaints
   * are three years old. But this page exists so that someone can
   * post a camera and a few hundred pounds to a stranger, and that is
   * exactly what is in question. Standing behind the entry is the
   * bar, and it is not met. Omission is silent: nothing about this
   * appears on the site. See research/roadmap.md.
   */
  {
    /*
     * No website, and listed anyway. The evidence is better than a
     * website would be: the same address given out by three different
     * people on two subreddits across 2021, 2022 and 2023, each
     * recommending him for the work, one of them answering a request
     * for a Super 16 conversion with little else to say.
     */
    name: "Abdul Setoua, Cine Repair",
    location: "Queens, New York, USA",
    place: { lat: 40.7282, lon: -73.7949, precision: "city", from: "Queens, the borough named by the people who send him cameras" },
    region: "North America",
    does: ["16mm", "super16", "electronic"],
    email: "cinerepair@aol.com",
    work:
      "CLA, overhaul and Super 16 conversion. One of only two names anywhere in this " +
      "directory for the electronic bodies, the EBM and the EL, which most of the trade " +
      "will not touch.",
    evidence: {
      kind: "listed",
      note:
        "No site of his own. The address is published openly on r/16mm and r/cinematography " +
        "by customers recommending him, most recently in 2023, and he is named for the EBM " +
        "and EL on the Bolex users' own repair list. Nothing here was read from a page he " +
        "controls, so ask what he is taking in before you post anything.",
    },
  },
  {
    name: "High Line Camera Rentals",
    does: ["16mm", "super16"],
    location: "Los Angeles, California, USA",
    place: { lat: 34.0536923, lon: -118.2427676, precision: "city", from: "OpenStreetMap / Nominatim, geocoded 2026-11-20" },
    region: "North America",
    url: "https://www.highlinecamerarentals.com/bolex-repair-service",
    phone: "+1 213-444-2422",
    work: "Repair and CLA across most H16 models; Super 16 conversion, which they state includes a full CLA.",
    pricing: "Full CLA around USD $800 + parts",
    evidence: {
      kind: "site",
      note: "Their own Bolex service page, read November 2026, the most recently updated of these.",
    },
  },
  /*
   * Les Bosher was here and has been removed. He died on 5 December
   * 2025: a customer of his says so in a February 2026 thread on
   * r/cinematography, and cinematography.com carries a "Les Bosher
   * RIP" thread opened by his son. His site is still up, unchanged,
   * written in his own voice and advertising accessories for a 2008
   * camcorder, so it is no evidence that the business is trading.
   *
   * His son Chris worked with him and may carry it on. Until that can
   * be established, an entry here would send someone's camera and
   * shipping money to an address that may not answer, which is the one
   * harm this page exists to prevent. Removing it says nothing about
   * anyone: omission is silent. See research/roadmap.md.
   */
  {
    /*
     * Named by the user as worth checking and left out until their own
     * site could be read. It turns out to be the strongest claim of
     * any entry here: not "we repair most makes" but factory training,
     * naming the models.
     */
    name: "TCS, Technological Cinevideo Services",
    does: ["16mm"],
    location: "Brooklyn, New York, USA",
    place: { lat: 40.6782, lon: -73.9442, precision: "city", from: "Brooklyn, from the address on their own site; the borough, not the street" },
    region: "North America",
    url: "https://tcsfilm.com/service/",
    phone: "+1 212-247-6517",
    work:
      "Repairs to all H16 spring-wound Bolex cameras, naming the RX4, RX5, SB, SBM " +
      "and the non-reflex bodies. They describe themselves as a factory-trained and " +
      "authorised Bolex dealer and service facility.",
    evidence: {
      kind: "site",
      note:
        "Their own service page, read November 2026, which carries a notice for this " +
        "year's Thanksgiving closure, so the site is being kept current. Repairs are " +
        "booked through a form on their site rather than by email.",
    },
  },
  {
    /*
     * His email is deliberately absent from this entry.
     *
     * His own page gives a phone number and then says: "Please take my
     * E-Mail address from the terms of business down below. Spam bots
     * would pick it up here." It is in the PDF, and copying it into a
     * public HTML page would undo the one precaution he asked for. The
     * phone number and the link are enough to reach him.
     */
    name: "Simon Wyss",
    does: ["16mm", "double8", "projectors", "lenses"],
    doesNot: ["super8", "super16", "electronic"],
    location: "Äsch, Basel-Landschaft, Switzerland",
    place: { lat: 47.4686, lon: 7.5947, precision: "town", from: "Äsch (Aesch BL), the town in the address on his own site" },
    region: "United Kingdom & Europe",
    url: "https://www.filmmechaniksimonwyss.biz/english/",
    phone: "+41 77 406 65 65",
    work:
      "Examination, repair, overhaul and maintenance of mechanical cine equipment: " +
      "cameras, projectors, printers, viewers, splicers and optics, all makes. He also " +
      "makes Bolex parts, among them a new mainspring for the H 16 from 1962 on and a " +
      "metal ocular adjustment ring for the H Reflex with the 10x finder. In his own " +
      "words, conservative action and no modifications. Note what he does not take: no " +
      "Super 8, no Single-8, and no electronics, so the EBM and EL are out unless the " +
      "fault is in a mechanism that works independently of the control.",
    pricing: "Published list: general overhaul CHF 600 for an H Standard, 650 for an H Reflex, SB or SBM; CHF 25 per quarter hour",
    evidence: {
      kind: "site",
      note:
        "His own site, read November 2026, with a price list effective March 2025 and " +
        "terms of business dated January 2026, so it is being kept up. Business hours " +
        "Monday to Friday. He has also answered Bolex questions on cinematography.com " +
        "for years, and was recommended by name on r/cinematography in 2026.",
    },
  },
  {
    /*
     * The strongest word-of-mouth of anyone here, and the only entry
     * resting on it rather than on a site of his own.
     *
     * He is named by a maintained public directory, aciarfilm.org, as
     * the Italian technical assistance for Bolex. Separately, in the
     * Bolex Camera Users group, customers describe a complete
     * overhaul and a Super 16 conversion on an SBM, a serviced REX-5,
     * and more besides, and he answers there himself about what he
     * takes in. Several people call him the best in Europe.
     *
     * His email is given here because he hands it out himself for
     * repair enquiries, on the open cinematography.com forum as well
     * as in the group. That is a man advertising, not an address
     * taken from behind a login.
     */
    name: "Guido Wilhelm",
    location: "Milan, Italy",
    place: { lat: 45.4642, lon: 9.19, precision: "city", from: "Milan, the city given in the directory listing and by customers" },
    region: "United Kingdom & Europe",
    does: ["16mm", "super16", "double8"],
    doesNot: ["electronic"],
    url: "https://www.aciarfilm.org/En/Technical_Assistance.php",
    email: "wtv.milan@gmail.com",
    work:
      "Overhaul, repair and Super 16 conversion. In his own words he also takes the H8, " +
      "the small box cameras and the K2, so he is one of the few here who is not 16mm " +
      "only. Customers describe him testing the camera and developing the film himself " +
      "before it goes back.",
    evidence: {
      kind: "listed",
      note:
        "Named for Bolex in Italy by aciarfilm.org, whose page carries 2024 data and asks " +
        "readers to report centres that have closed. That listing gives his scope as the SB " +
        "and SBM and not the RX, EBM or EL, while customers writing in 2026 describe a " +
        "serviced REX-5, so the range may be wider than the directory says. He publishes no " +
        "site: he gives this address out for repair enquiries on cinematography.com and in " +
        "the Bolex Camera Users group, and the directory also takes contact requests.",
    },
  },
  /*
   * Sendean Cameras, London, was listed here on 23 November and is
   * removed the same day.
   *
   * The entry rested on one customer who had reported a complete
   * overhaul on r/bolex in 2023. The same person, by name, has since
   * written in the Bolex Camera Users group about what Sendean did to
   * his Bolex EL for £2,000: "One day I will tell the story. And it's
   * not going to be a nice one." An endorsement its own author has
   * withdrawn is not evidence, and it was the only thing raising this
   * above "a shop that lists Bolex among forty makes".
   *
   * Two others in the same thread describe their cine work as vastly
   * overpriced, one of them quoted £3,876 for a stuck motor and a
   * service, which he declined. The only warm word is from someone
   * they served in the mid-1970s.
   *
   * None of that is published anywhere on the site, and none of it
   * needs to be. The bar is whether this project will stand behind an
   * entry, and it will not stand behind this one. Omission is silent.
   * See research/roadmap.md.
   */
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

/**
 * The id a technician's entry carries in the list.
 *
 * Lives here rather than beside the map so the page, which is a server
 * component, and the map, which is not, derive it the same way. A link
 * from a dot to an entry that does not exist would be worse than no
 * link at all.
 */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
