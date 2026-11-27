/**
 * The photographs Paillard took of people using these cameras.
 *
 * Everything else illustrating this site is an object on a white ground:
 * a camera, a lens, a projector, lifted out of a catalogue. Useful, and
 * completely silent about what any of it was for. The brochures are full
 * of the other kind — a crew on a building site, a diver surfacing, a
 * woman in 1946 holding an H-16 against a painted sky — and that is the
 * photography the chronology wants behind it, because the chronology is
 * about a company and a half-century, not about a product.
 *
 * Each one is cut from a scan this archive already holds and cites, and
 * carries the document it came from. None of them is dated by itself; a
 * `when` is given only where the document states one, because a guessed
 * date on a photograph is the kind of small invention that is very hard
 * to take back out again.
 *
 * ## Where they may be shown
 *
 * Not against a sentence. The rule in lib/timeline-media.ts is that a
 * picture must show what the entry names, and a photograph merely
 * contemporary with a line of text reads as filler. That rule still
 * holds and these do not break it: a scene is never placed against a
 * dated entry. It carries a title card or an era card — a whole chapter,
 * not a claim — and it is captioned with what it is and which brochure
 * it came out of, so nobody can mistake it for evidence about the year
 * beside it.
 *
 * `era` is the chronology's own heading, so a scene only ever sits over
 * a chapter whose years its document could plausibly belong to. The
 * first chapter ends in 1927 and nothing here is that old, so it gets no
 * photograph at all, which is the right answer rather than a gap.
 */

import { ARCHIVAL_PHOTOGRAPHS, creditLine } from "./archival";

export interface Scene {
  src: string;
  /** Plain English, for anyone who cannot see it. */
  alt: string;
  /** What it is, shown on the slide. */
  title: string;
  /** Only where the document states one. */
  when?: string;
  /** The document, named as it names itself. */
  document: string;
  /** Pacific Rim's id, for the citation link. */
  doc: string;
  /** Which chapter of the chronology it may carry, if any. */
  era?: string;
  /**
   * Where the subject sits in the frame, as an `object-position`.
   *
   * Only read by the compositions that crop. The default centres
   * horizontally and sits a little above the middle, which suits most
   * of this photography; a picture whose subject is off to one side
   * says so here rather than being cropped through the face.
   */
  focus?: string;
}

const base = "/sourced/scenes";

export const SCENES: Scene[] = [
  {
    src: `${base}/catalogue-1946-cover.webp`,
    alt: "A woman behind an H-16 on a wooden tripod against a painted sky, under the word BOLEX and a red oval reading The World's Finest Movie Cameras, 1946 Catalog",
    title: "The cover of the 1946 catalogue",
    when: "1946",
    document: "Bolex: The World's Finest Movie Cameras, 1946 catalog",
    doc: "02027",
  },
  {
    src: `${base}/b8-portrait-1946.webp`,
    alt: "A woman in a patterned blouse kneeling and holding a small Bolex eight-millimetre camera up to her eye, photographed against a painted sky",
    title: "The back of the same catalogue",
    when: "1946",
    document: "Bolex: The World's Finest Movie Cameras, 1946 catalog",
    doc: "02027",
    era: "1928 - 1949",
  },
  {
    src: `${base}/projector-and-boy.webp`,
    alt: "A woman threading an 18-5 Super projector while a boy watches from beside it, both lit warmly against dark foliage",
    title: "An 18-5 Super, threaded",
    document: "Bolex 18-5 Super brochure",
    doc: "04634",
    era: "1960s",
  },
  {
    src: `${base}/lake-and-boat.webp`,
    alt: "A woman walking out of a lake towards the camera, a beach ball floating near her, children and a motor boat behind",
    title: "What the 18-5 Super was for",
    document: "Bolex 18-5 Super brochure",
    doc: "04634",
  },
  {
    src: `${base}/ebm-on-the-shoulder.webp`,
    alt: "A man with an H-16 EBM up to his eye, shooting handheld, a modern housing block out of focus behind him",
    title: "An H-16 EBM, handheld",
    document: "16mm Bolex: the H16 range brochure",
    doc: "00953",
  },
  {
    src: `${base}/crew-on-a-building-site.webp`,
    alt: "Four people filming on a building site, one behind an H-16 on a tripod, a tower crane overhead",
    title: "A crew on a building site",
    document: "16mm Bolex: the H16 range brochure",
    doc: "00953",
  },
  {
    src: `${base}/diver-surfacing.webp`,
    alt: "A diver breaking the surface holding the Bolex underwater housing, the water green around them",
    title: "Surfacing with the housing",
    document: "Bolex Underwater Housing brochure",
    doc: "02231",
  },
  {
    src: `${base}/563xl-on-the-knee.webp`,
    alt: "A man in a corduroy jacket sitting with a Bolex 563 XL Sound Macro-Zoom resting on his knee, its microphone boom extended",
    title: "A 563 XL, 1979",
    when: "1979",
    document: "Bolex 583 and 563 XL Sound Macro-Zoom brochure",
    doc: "02232",
  },
  {
    src: `${base}/apollo-11.webp`,
    alt: "An astronaut in a white suit standing on the moon, his long shadow across the dust, the lander reflected in his visor",
    title: "Apollo 11, and the lenses that went with it",
    when: "July 1969",
    document:
      "NASA, reproduced in the Bolex Reporter, Vol 19 No 2, 1969-70, which reports that Kern-Switar lenses were made at Sainte-Croix to NASA's order",
    doc: "03040",
  },
  {
    src: `${base}/reporter-eyes-cover.webp`,
    alt: "A black magazine cover with two stylised eyes, one iris red and one a mass of green, under the words BOLEX REPORTER and above the line one inch to infinity",
    title: "One inch to infinity",
    when: "1968-69",
    document: "Bolex Reporter, Vol 18 No 2, Paillard Incorporated",
    doc: "02689",
  },
  {
    src: `${base}/students-at-the-window.webp`,
    alt: "Three students silhouetted against a tall bright window, one with an arm raised, one reaching along the glass",
    title: "A film workshop, against the window",
    document: "Bolex Reporter, Vol 20 No 2, Paillard Incorporated",
    doc: "02810",
  },
  {
    src: `${base}/reporter-1967-projector.webp`,
    alt: "A magazine cover, black with a projector lit from one side in a pool of gold, under the words BOLEX REPORTER",
    title: "The Bolex Reporter",
    when: "1967-68",
    document: "Bolex Reporter, Vol 17 No 2, Paillard Incorporated",
    doc: "02589",
  },
  {
    src: `${base}/reporter-1972-paillard.webp`,
    alt: "A deep blue magazine cover with the word paillard set in a wide outlined typeface above BOLEX REPORTER",
    title: "The Reporter, under the Paillard name",
    when: "1972",
    document: "Bolex Reporter, Vol 22 No 1, Paillard Incorporated",
    doc: "02670",
  },
  {
    src: `${base}/reporter-1970-square.webp`,
    alt: "A pale blue magazine cover, almost empty, with a single white square outlined in dark blue at its centre",
    title: "A cover that is almost nothing",
    when: "1970",
    document: "Bolex Reporter, Vol 20 No 1, Paillard Incorporated",
    doc: "02731",
  },
  {
    src: `${base}/reporter-1970-canyon.webp`,
    alt: "A magazine cover showing a white river running through a dark canyon seen from above",
    title: "A river from the air",
    when: "1970",
    document: "Bolex Reporter, Vol 20 No 2, Paillard Incorporated",
    doc: "02810",
  },
  {
    src: `${base}/reporter-1969-divers.webp`,
    alt: "A magazine cover laid out as a grid of green underwater frames, divers moving through them",
    title: "A cover built from frames",
    when: "1969-70",
    document: "Bolex Reporter, Vol 19 No 2, Paillard Incorporated",
    doc: "03040",
  },
  {
    src: `${base}/reporter-1971-frames.webp`,
    alt: "A magazine cover laid out as a grid of night frames, pale streaks rising against a dark blue sky",
    title: "A rocket, frame by frame",
    when: "1971",
    document: "Bolex Reporter, 1971, Paillard Incorporated",
    doc: "02628",
  },
  {
    src: `${base}/reporter-1971-orange.webp`,
    alt: "An orange magazine cover with two strips of film running down it like a ladder",
    title: "Two strips of film",
    when: "1971-72",
    document: "Bolex Reporter, Paillard Incorporated",
    doc: "02655",
  },
  {
    src: `${base}/reporter-buying-guide.webp`,
    alt: "A pink magazine cover printed with concentric rings, carrying the words 16mm Product Buying Guide",
    title: "The 16mm Product Buying Guide",
    document:
      "Bolex Reporter, Paillard Incorporated. The guide the February 1970 price list keys every row to, and which the archive had been looking for",
    doc: "02746",
  },
  {
    src: `${base}/boy-with-a-whistle.webp`,
    alt: "A close-up of a fair-haired boy outdoors, a whistle at his lips, looking past the camera",
    title: "Somebody's film, somebody's boy",
    document: "Bolex Reporter, 1971, Paillard Incorporated",
    doc: "02628",
  },
  {
    src: `${base}/stereo-manual-1952.webp`,
    alt: "The red cover of an instruction manual showing an H-16 De Luxe with the Bolex Stereo system fitted to its turret",
    title: "The Bolex Stereo system",
    document: "Bolex Stereo Movies instruction manual, Paillard Products Inc.",
    doc: "01392",
  },
];

/**
 * A slide, from either collection.
 *
 * The brochure scenes above are Paillard's own advertising photography.
 * The archive also holds nine photographs from public collections — the
 * works at Sainte-Croix, a camera rigged for an eclipse, dealers
 * arriving by coach — and those are the better picture of the company
 * wherever one of them fits a chapter. Both end up here so the page does
 * not have to care which it is holding, and both carry a credit, because
 * the credit is the whole basis on which either may be shown.
 */
/**
 * How a photograph is set on the page.
 *
 * One shape used eleven times is a slideshow, and a slideshow is what
 * the first version of this was: every picture the full width of the
 * window, the same height, moving the same way. These are five
 * different ideas about what a photograph can do to a page, and the
 * deck below uses each of them.
 *
 *  `cover`    the whole window, cropped to fill, the picture behind
 *             everything. For the two or three that can carry a screen
 *             on their own.
 *  `band`     a letterbox strip across the page. Shorter than a
 *             screen, so it reads as a beat rather than a stop.
 *  `portrait` the picture whole and uncropped on a dark ground, the
 *             words in the space beside it. The answer for a tall scan,
 *             which a cover crop ruins.
 *  `split`    half picture, half paper, the words set in the paper
 *             half. Alternates which side the picture takes.
 *  `inset`    a framed card on the paper, smaller than the column is
 *             wide, with its caption under it. The quiet one.
 */
export type PlateKind = "cover" | "band" | "portrait" | "split" | "inset";

/**
 * How it arrives.
 *
 * All four are driven by `--lit`, the figure the cinema layer already
 * paints on every beat from its distance to the focal line, so they
 * run off the reader's own scrolling and reverse when they scroll
 * back. None of them is a timer and none of them plays twice.
 */
export type PlateMotion = "zoom-out" | "zoom-in" | "rise" | "wipe";

export interface Plate {
  src: string;
  alt: string;
  title: string;
  when?: string;
  /** Who to credit, in one line. */
  credit: string;
  /** Where the original can be seen. */
  href: string;
  kind: PlateKind;
  motion: PlateMotion;
  focus?: string;
  /** Which side the picture takes, for `split`. */
  side?: "left" | "right";
}

/*
 * By file name, not by position. These were indexes into the array
 * above until it became obvious that adding one photograph in the
 * middle would silently repoint every slide on the page at the wrong
 * picture, with nothing failing to say so.
 */
function scene(file: string): Scene {
  const found = SCENES.find((s) => s.src.endsWith(`/${file}.webp`));
  if (!found) throw new Error(`No scene named ${file}. Check lib/scenes.ts.`);
  return found;
}

type Setting = Pick<Plate, "kind" | "motion" | "side">;

function fromScene(file: string, setting: Setting): Plate {
  const s = scene(file);
  return {
    src: s.src,
    alt: s.alt,
    title: s.title,
    when: s.when,
    credit: s.document,
    href: `https://www.pacificrimcamera.com/rl/${s.doc}/${s.doc}.pdf`,
    focus: s.focus,
    ...setting,
  };
}

function fromArchival(slug: string, setting: Setting): Plate | undefined {
  const p = ARCHIVAL_PHOTOGRAPHS.find((a) => a.slug === slug);
  if (!p) return undefined;
  return {
    src: p.src,
    alt: p.alt,
    title: p.title,
    when: p.when,
    credit: creditLine(p),
    href: `/photographs#${p.slug}`,
    ...setting,
  };
}

/**
 * Which photograph goes with which year.
 *
 * The first version of this put the pictures on title cards — an
 * opening screen, a chapter screen for each era — with the chronology
 * itself left as type on paper. That was backwards. A title card is a
 * screen a reader has to get past to reach the thing they came for,
 * and the thing they came for was the one part with no picture on it.
 *
 * So there are no title cards. The chronology's own words sit on the
 * photograph, one year to a screen, and the opening paragraph sits on
 * the opening photograph the same way.
 *
 * Every placement below is a judgement, and the rule is that a picture
 * must be either of the thing the entry names or of the company in
 * those years — and that it is captioned on the slide with what it
 * actually is and when, so a reader is never asked to take it as
 * evidence for the year beside it. Where a photograph is older or
 * newer than the entry, the caption says so and that is the point:
 * the Sainte-Croix works on the 1875 entry is the same works,
 * photographed in 1996, and saying both is more interesting than
 * saying neither.
 *
 * Twenty-six of the forty-five entries have no picture. Most of those
 * are the early chapter, which ends in 1927, and nothing in this
 * archive is that old. Type on paper is the right answer there.
 */
type Placement = { plate: () => Plate | undefined; mode: "behind" | "beside" };

const sc = (file: string, setting: Setting) => () => fromScene(file, setting);
const ar = (slug: string, setting: Setting) => () => fromArchival(slug, setting);

const BEHIND: Setting = { kind: "cover", motion: "zoom-out" };
const BEHIND_IN: Setting = { kind: "cover", motion: "zoom-in" };
const BESIDE_L: Setting = { kind: "split", motion: "rise", side: "left" };
const BESIDE_R: Setting = { kind: "split", motion: "wipe", side: "right" };

const BY_YEAR: Record<string, Placement> = {
  /* The works the 1875 entry opens, photographed 121 years later and
     captioned as such. The only picture this archive has of it. */
  "1875": { plate: ar("sainte-croix-works-1996", BESIDE_L), mode: "beside" },

  "1939": { plate: ar("paillard-projector-1937", BESIDE_R), mode: "beside" },
  /* The entry is about the American Bolex Company's mail-order
     catalogue, and this is the back of one of them. The front carries
     the opening of the whole page, so it is not used twice. */
  "1941": { plate: sc("b8-portrait-1946", BESIDE_L), mode: "beside" },

  /* The entry announces the first Bolex Reporter. */
  "1950": { plate: sc("reporter-1967-projector", BESIDE_L), mode: "beside" },
  "1952": { plate: sc("stereo-manual-1952", BESIDE_R), mode: "beside" },
  /* The entry is about dealers and franchises; these are the dealers,
     arriving at Sainte-Croix by coach. */
  "1955": { plate: ar("usine-paillard-visite-2", BEHIND_IN), mode: "behind" },
  "1957": { plate: sc("boy-with-a-whistle", BEHIND), mode: "behind" },
  /* A new factory, and the only photograph of a visit to the old one. */
  "1959": { plate: ar("usine-paillard-visite-1", BEHIND), mode: "behind" },

  /* Two projectors, and a projector threaded. */
  "1960": { plate: sc("projector-and-boy", BEHIND), mode: "behind" },
  /* The entry records the Reporter ceasing quarterly publication. */
  "1961": { plate: sc("reporter-1972-paillard", BESIDE_L), mode: "beside" },
  "1962": { plate: sc("crew-on-a-building-site", BEHIND_IN), mode: "behind" },
  /* Already tagged to this year in lib/archival: a K2 in Trafalgar
     Square the year the K2 Automatic appears. Shown whole and not
     cropped, because its licence forbids derivative works and a
     full-screen crop is one. tests/archival.test.ts enforces this. */
  "1964": { plate: ar("k2-trafalgar-square", BESIDE_L), mode: "beside" },
  "1965": { plate: sc("reporter-1970-square", BESIDE_R), mode: "beside" },
  "1966": { plate: sc("students-at-the-window", BEHIND_IN), mode: "behind" },
  /* Likewise tagged: the 150 Super, photographed in 1967. */
  "1967": { plate: ar("bolex-150-super-1967", BEHIND), mode: "behind" },
  "1968": { plate: sc("reporter-1969-divers", BESIDE_L), mode: "beside" },
  /* July 1969, and the lenses were made at Sainte-Croix. */
  "1969": { plate: sc("apollo-11", BESIDE_R), mode: "beside" },
  "1970": { plate: sc("reporter-1970-canyon", BEHIND_IN), mode: "behind" },
};

/** The photograph the chronology opens on, behind its own first words. */
export function openingPlate(): Plate {
  return fromScene("catalogue-1946-cover", { kind: "cover", motion: "zoom-out" });
}

export function plateForYear(year: string): { plate: Plate; mode: "behind" | "beside" } | undefined {
  const p = BY_YEAR[year];
  const plate = p?.plate();
  return plate ? { plate, mode: p!.mode } : undefined;
}

export function closingPlate(): Plate | undefined {
  return fromArchival("sainte-croix-works-1996", { kind: "band", motion: "zoom-in" });
}

/**
 * The coda: photographs with nothing on them but their own caption,
 * run after the last dated entry.
 *
 * They belong there and not among the years. The recovered chronology
 * stops in 1970 and every one of these is from 1970 or after — the
 * 1971 and 1972 Reporters, the underwater housing, a Super 8 camera on
 * a knee in 1979. The page has just told the reader the record ends;
 * this is what the end of it looked like.
 */
export function interludes(): Plate[] {
  return [
    fromScene("reporter-eyes-cover", { kind: "inset", motion: "rise" }),
    fromScene("ebm-on-the-shoulder", { kind: "band", motion: "zoom-in" }),
    fromScene("lake-and-boat", { kind: "cover", motion: "zoom-out" }),
    fromScene("reporter-1971-frames", { kind: "split", motion: "wipe", side: "left" }),
    fromScene("diver-surfacing", { kind: "cover", motion: "zoom-in" }),
    fromScene("reporter-1971-orange", { kind: "split", motion: "rise", side: "right" }),
    fromScene("reporter-buying-guide", { kind: "inset", motion: "rise" }),
    fromScene("563xl-on-the-knee", { kind: "split", motion: "wipe", side: "left" }),
  ];
}

