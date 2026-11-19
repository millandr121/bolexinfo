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

export interface ArchivalPhotograph {
  slug: string;
  src: string;
  /** Plain English, for anyone who cannot see it. */
  alt: string;
  title: string;
  /** As precise as the record is, in words rather than a date format. */
  when: string;
  /** The year it belongs to, for matching against the chronology. */
  year: string;
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
    year: "1937",
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
    year: "1951",
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
    year: "1955",
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
    year: "1955",
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
    slug: "sainte-croix-works-1996",
    src: "/archival/eth-sik-03-080632.jpg",
    alt:
      "A long five-storey factory block in evening light with an older " +
      "gabled house standing in front of it and a grass slope below.",
    title: "The Paillard-Bolex-Hermes works, Sainte-Croix",
    when: "November 1996",
    year: "1996",
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
  return ARCHIVAL_PHOTOGRAPHS.filter((p) => p.year === year);
}

/** One credit line, the same wherever a photograph appears. */
export function creditLine(p: ArchivalPhotograph): string {
  return `${p.photographer}, ${p.collection} / ${p.reference}`;
}
