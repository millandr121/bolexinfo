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
export interface Plate {
  src: string;
  alt: string;
  title: string;
  when?: string;
  /** Who to credit, in one line. */
  credit: string;
  /** Where the original can be seen. */
  href: string;
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

function fromScene(scene: Scene): Plate {
  return {
    src: scene.src,
    alt: scene.alt,
    title: scene.title,
    when: scene.when,
    credit: scene.document,
    href: `https://www.pacificrimcamera.com/rl/${scene.doc}/${scene.doc}.pdf`,
  };
}

function fromArchival(slug: string): Plate | undefined {
  const p = ARCHIVAL_PHOTOGRAPHS.find((a) => a.slug === slug);
  if (!p) return undefined;
  return {
    src: p.src,
    alt: p.alt,
    title: p.title,
    when: p.when,
    credit: creditLine(p),
    href: `/photographs#${p.slug}`,
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
  "1928 - 1949": () => fromScene(scene("b8-portrait-1946")),
  "1950s": () => fromArchival("usine-paillard-visite-2"),
  "1960s": () => fromScene(scene("projector-and-boy")),
};

export function openingPlate(): Plate {
  return fromScene(scene("catalogue-1946-cover"));
}

export function plateForEra(era: string): Plate | undefined {
  return ERA_PLATE[era]?.();
}

export function closingPlate(): Plate | undefined {
  return fromArchival("sainte-croix-works-1996");
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
    "lake-and-boat",
    "crew-on-a-building-site",
    "ebm-on-the-shoulder",
    "diver-surfacing",
    "563xl-on-the-knee",
  ].map((f) => fromScene(scene(f)));
}
