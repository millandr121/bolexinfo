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
 * Which photograph opens the whole chronology, and which carries each
 * chapter. Written out rather than derived, because there are five
 * decisions here and each one is a judgement about whether a picture
 * belongs over a given half-century.
 *
 * "Early History" is absent on purpose. It ends in 1927 and the earliest
 * photograph in this archive is from the 1940s.
 */
const ERA_PLATE: Record<string, () => Plate | undefined> = {
  /* A tall studio portrait, shown whole rather than cropped through
     the face, with the chapter title in the space beside it. */
  "1928 - 1949": () =>
    fromScene("b8-portrait-1946", { kind: "portrait", motion: "rise" }),
  /* A wide group photograph that wants the width and not the height. */
  "1950s": () =>
    fromArchival("usine-paillard-visite-2", { kind: "cover", motion: "zoom-in" }),
  /* The one that works as a cover: faces at the edges, the projector
     dead centre, and it holds a title without fighting it. */
  "1960s": () =>
    fromScene("projector-and-boy", { kind: "cover", motion: "zoom-out" }),
};

export function openingPlate(): Plate {
  return fromScene("catalogue-1946-cover", { kind: "cover", motion: "zoom-out" });
}

export function plateForEra(era: string): Plate | undefined {
  return ERA_PLATE[era]?.();
}

export function closingPlate(): Plate | undefined {
  return fromArchival("sainte-croix-works-1996", { kind: "band", motion: "zoom-in" });
}

/**
 * The interludes: full-screen photographs with nothing on them but
 * their own caption, run as a sequence after the last dated entry.
 *
 * They go there rather than among the years because that is honestly
 * where they belong. The recovered chronology stops in 1970 and this is
 * the photography from either side of it — a lake, a crew on a building
 * site, a man's eye against an EBM, a diver surfacing, a Super 8 camera
 * on a knee in 1979. The page has just told the reader the record ends;
 * these are what the end of it looked like.
 */
export function interludes(): Plate[] {
  return [
    /* A graphic cover, not a photograph, so it is shown whole and
       small: a magazine on a table rather than a wall. */
    fromScene("reporter-eyes-cover", { kind: "inset", motion: "rise" }),
    fromScene("crew-on-a-building-site", { kind: "split", motion: "wipe", side: "left" }),
    fromScene("ebm-on-the-shoulder", { kind: "band", motion: "zoom-in" }),
    fromScene("students-at-the-window", { kind: "split", motion: "rise", side: "right" }),
    fromScene("lake-and-boat", { kind: "cover", motion: "zoom-out" }),
    fromScene("diver-surfacing", { kind: "cover", motion: "zoom-in" }),
    /* Shown whole: it is a NASA frame reproduced in a magazine, and
       cropping somebody else's photograph of the moon to fit a web
       page is not a liberty this archive needs to take. */
    fromScene("apollo-11", { kind: "portrait", motion: "zoom-out" }),
    fromScene("563xl-on-the-knee", { kind: "split", motion: "wipe", side: "left" }),
  ];
}
