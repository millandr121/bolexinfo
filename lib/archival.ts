/**
 * Photographs from outside this archive, and what we are allowed to do
 * with each one.
 *
 * Everything else on the site came off BolexCollector.com. These did
 * not. They come from public collections that publish under licences
 * permitting reuse, and they exist because the original site, for all
 * its depth, had almost no photography of Paillard as a company — the
 * works, the people, the cameras in use rather than on a white
 * background.
 *
 * The rule here is stricter than the licences require. Every entry
 * carries the photographer, the holding institution, the institution's
 * own reference for the item, a link back to the record, and the
 * licence by name and URL. A credit that cannot be checked is not a
 * credit, and an archive that is careless with other people's work has
 * no business asking anyone to be careful with Michael's.
 *
 * What is deliberately absent is as important. bolex.com's historical
 * photographs are the best that exist and are not here, because that
 * site states they are the property of Bolex International SA and may
 * not be reproduced without written permission. Nor is anything marked
 * "Tous droits réservés" on notrehistoire.ch, which includes every
 * photograph found of Bolex cameras actually being assembled and
 * repaired. Those are asked for in research/outreach.md, not taken.
 */

export interface Licence {
  /** As the holding institution names it. */
  name: string;
  /** Where the licence terms are stated. */
  href: string;
  /**
   * True where the licence forbids derivative works. Such a photograph
   * is shown exactly as it was published: no cropping, no blending
   * into the page, no tonal adjustment.
   */
  noDerivatives?: boolean;
  /**
   * True where the licence permits non-commercial use only. The site
   * carries no advertising and sells nothing, so this is satisfied —
   * but if that ever changes these have to come down, and recording it
   * per-photograph is what makes that possible to act on.
   */
  nonCommercial?: boolean;
}

export const PUBLIC_DOMAIN: Licence = {
  name: "Public domain",
  href: "https://creativecommons.org/publicdomain/mark/1.0/",
};

export const CC_BY_SA_4: Licence = {
  name: "CC BY-SA 4.0",
  href: "https://creativecommons.org/licenses/by-sa/4.0/",
};

export const CC_BY_NC_ND_4: Licence = {
  name: "CC BY-NC-ND 4.0",
  href: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  noDerivatives: true,
  nonCommercial: true,
};

export interface ArchivalPhotograph {
  slug: string;
  src: string;
  /** Plain English, for anyone who cannot see it. */
  alt: string;
  title: string;
  /** As precise as the record is, in words rather than a date format. */
  when: string;
  /**
   * The chronology year this photograph may be shown against, where the
   * entry for that year genuinely concerns what the photograph shows.
   *
   * Absent means the photograph lives on this page only, and that is the
   * normal case rather than a gap. 1964's entry is a list of models that
   * includes the K2 Automatic, so a photograph of a K2 belongs there; the
   * Expo 64 prospectus is from the same year and the entry says nothing
   * about Expo 64, so putting it on that panel would be decoration
   * standing in for a connection. Same test the catalogue plates have to
   * pass, applied by hand because there are nine of these.
   */
  year?: string;
  /** What it shows and why it is here. Ours, not the institution's. */
  note: string;
  photographer: string;
  collection: string;
  /** The institution's own reference for the item. */
  reference: string;
  /** The record this came from. */
  source: string;
  licence: Licence;
}

export const ARCHIVAL_PHOTOGRAPHS: readonly ArchivalPhotograph[] = [
  {
    slug: "paillard-projector-1937",
    src: "/archival/eth-pi-38-g-0023.jpg",
    alt:
      "Studio photograph of a Paillard cine projector with two film reels mounted, " +
      "the upper reel full and the lower one part-wound.",
    title: "A Paillard cine projector",
    when: "10 January 1937",
    note:
      "Photographed on a glass plate in a studio, lit to show the mechanism. " +
      "The Paillard name is legible on the lower reel. This is the earliest " +
      "photograph of Paillard equipment this project has found that may be reused.",
    photographer: "Photographisches Institut der ETH Zürich",
    collection: "ETH Library Zurich, Image Archive",
    reference: "PI_38-G-0023",
    source:
      "https://ba.e-pics.ethz.ch/#main-search-text=Paillard&main-search-mode=and&detail-asset=0f918230-5032-4419-8846-cbe6ca3c6d06",
    licence: CC_BY_SA_4,
  },
  {
    slug: "paillard-eclipse-camera-1951",
    src: "/archival/eth-pi-51-s-0086.jpg",
    alt:
      "A Paillard 16mm camera clamped into a wooden and metal mount on a bench, " +
      "tilted upward with a lens and solar attachment fitted.",
    title: "A Paillard 16mm camera rigged for an eclipse",
    when: "December 1951",
    note:
      "Built into a mount for the Swiss Federal Observatory to film the " +
      "total solar eclipse, ordered by Max Waldmeier, ETH professor of " +
      "astrophysics. A Bolex doing serious scientific work, photographed " +
      "before it left for the expedition.",
    photographer: "Photographisches Institut der ETH Zürich",
    collection: "ETH Library Zurich, Image Archive",
    reference: "PI_51-S-0086",
    source:
      "https://ba.e-pics.ethz.ch/#main-search-text=Paillard&main-search-mode=and&detail-asset=0cb8ff00-983a-44ed-a804-42b8619f51e7",
    licence: CC_BY_SA_4,
  },
  {
    slug: "usine-paillard-visite-1",
    src: "/archival/paillard-ste-croix-visite-1.webp",
    alt:
      "A group of men and women in 1950s dress standing outside a concrete " +
      "building with PAILLARD S.A. in raised letters above the entrance.",
    title: "Outside the works at Sainte-Croix",
    when: "1950s",
    note:
      "Paillard periodically invited its dealers to tour the Sainte-Croix " +
      "workshops so that the people selling the cameras had seen them made. " +
      "This is one such party outside the entrance. It was published by " +
      "Claudio Abächerli, whose father kept a photographic shop in Lugano " +
      "and is in the middle of the group.",
    photographer: "Paillard SA",
    collection: "notreHistoire.ch, published by Claudio Abächerli",
    reference: "Une visite à l'usine Paillard à Sainte-Croix",
    source: "https://notrehistoire.ch/documents/01k81dp6kz476vhbdvf81t2kf2",
    licence: PUBLIC_DOMAIN,
  },
  {
    slug: "usine-paillard-visite-2",
    src: "/archival/paillard-ste-croix-visite-2.webp",
    alt:
      "The same party of visitors standing beside a coach among pine trees, " +
      "the women in suits and hats, the men in overcoats.",
    title: "The dealers arrive",
    when: "1950s",
    note:
      "The same visit, as the coach brings the party up from Yverdon.",
    photographer: "Paillard SA",
    collection: "notreHistoire.ch, published by Claudio Abächerli",
    reference: "Une visite à l'usine Paillard à Sainte-Croix",
    source: "https://notrehistoire.ch/documents/01k81dp6kz476vhbdvf81t2kf2",
    licence: PUBLIC_DOMAIN,
  },
  {
    slug: "bolex-150-super-1967",
    src: "/archival/eth-com-c16-049-005.jpg",
    alt:
      "A Paillard Bolex 150 Super super-8 camera beside a Kodak Retina S2 " +
      "stills camera, photographed for a magazine feature.",
    title: "The 150 Super, for a feature on amateur film-making",
    when: "1967",
    year: "1967",
    note:
      "Shot by the press agency Comet for a piece titled Fototipps für " +
      "Amateure. The 150 Super is on the left, a Kodak Retina S2 on the " +
      "right. The chronology records the 150 Super's introduction in this " +
      "same year.",
    photographer: "Jack Metzger (1918–1999)",
    collection: "ETH Library Zurich, Image Archive",
    reference: "Com_C16-049-005",
    source:
      "https://ba.e-pics.ethz.ch/#main-search-text=Bolex&main-search-mode=and&detail-asset=18a48e98-9b51-4840-94fe-a1f38325115e",
    licence: CC_BY_SA_4,
  },
  {
    slug: "k2-trafalgar-square",
    src: "/archival/k2-trafalgar-square.webp",
    alt:
      "A young man in sunglasses filming with a Bolex Paillard K2 in " +
      "Trafalgar Square, a pigeon standing on top of the camera and another " +
      "perched on his shoulder, the National Gallery behind him.",
    title: "Filming in Trafalgar Square with a K2",
    when: "1960s",
    year: "1964",
    note:
      "Jean-Fred Friederich, who has filmed on Bolex cameras since 1963, " +
      "photographed by his brother Eric while being overrun by pigeons. He " +
      "rates the K2 the best of them for its Kern-Switar lens, and his 8mm " +
      "film Trois jours à Londres came out of this trip. The record's period " +
      "field reads 1930s, which the colour film and the camera both " +
      "contradict; the 1960s is his own account.",
    photographer: "Eric Friederich",
    collection: "notreHistoire.ch, published by Jean-Fred Friederich",
    reference: "Caméra Bolex Paillard K2 à Trafalgar Square Londres",
    source: "https://notrehistoire.ch/documents/01kqfbvc263cgzzh3e9w7yeeh0",
    licence: CC_BY_NC_ND_4,
  },
  {
    slug: "route-bolex-expo64-recto",
    src: "/archival/route-bolex-expo64-recto.webp",
    alt:
      "A folded four-language prospectus headed ROUTE BOLEX, with a red " +
      "and black cover showing a man filming on a tripod, the Bolex Paillard " +
      "roundel and a Swiss cross.",
    title: "The Route Bolex prospectus for Expo 64",
    when: "1964",
    note:
      "For the Swiss National Exhibition at Lausanne, 30 April to 25 October " +
      "1964, Paillard marked out a route through the grounds for amateur " +
      "film-makers, signposting the best places to shoot so that a visitor " +
      "came home with a film that cut together. The leaflet went to photographic " +
      "shops across Switzerland and is printed in French, German, Italian and " +
      "English. This copy carries the stamp of Foto Studio L. Abächerli of " +
      "Lugano, the shop whose dealers' visit to Sainte-Croix appears above.",
    photographer: "Photographer unrecorded",
    collection: "notreHistoire.ch, published by Claudio Abächerli",
    reference: "La Route Bolex à l’Expo 64 à Lausanne — Recto",
    source: "https://notrehistoire.ch/documents/01k81cwmrt2e2wq635hk15b95r",
    licence: CC_BY_NC_ND_4,
  },
  {
    slug: "route-bolex-expo64-verso",
    src: "/archival/route-bolex-expo64-verso.webp",
    alt: "The reverse of the Route Bolex prospectus.",
    title: "The Route Bolex prospectus, reverse",
    when: "1964",
    note: "The other side of the same leaflet.",
    photographer: "Photographer unrecorded",
    collection: "notreHistoire.ch, published by Claudio Abächerli",
    reference: "La Route Bolex à l’Expo 64 à Lausanne — Verso",
    source: "https://notrehistoire.ch/documents/01k81cwmrt2e2wq635hk15b960",
    licence: CC_BY_NC_ND_4,
  },
  {
    slug: "sainte-croix-works-1996",
    src: "/archival/eth-sik-03-080632.jpg",
    alt:
      "A long five-storey factory block in evening light with an older " +
      "gabled house standing in front of it and a grass slope below.",
    title: "The Paillard-Bolex-Hermes works, Sainte-Croix",
    when: "November 1996",
    note:
      "Photographed by the industrial historian Hans-Peter Bärtschi, who " +
      "spent his working life recording Swiss industry as it closed. The " +
      "chronology this site recovered ends in 1970; the building outlasted " +
      "it, and was offered for sale in 2002.",
    photographer: "Hans-Peter Bärtschi (1950–2022)",
    collection: "ETH Library Zurich, Image Archive",
    reference: "SIK_03-080632",
    source:
      "https://ba.e-pics.ethz.ch/#main-search-text=Bolex&main-search-mode=and&detail-asset=ab26806d-469c-430d-b607-c6906d260de9",
    licence: CC_BY_SA_4,
  },
];

/** Photographs belonging to a given chronology year, if any. */
export function archivalFor(year: string): ArchivalPhotograph[] {
  return ARCHIVAL_PHOTOGRAPHS.filter((p) => p.year !== undefined && p.year === year);
}

/** One credit line, the same wherever a photograph appears. */
export function creditLine(p: ArchivalPhotograph): string {
  return `${p.photographer}, ${p.collection} / ${p.reference}`;
}
