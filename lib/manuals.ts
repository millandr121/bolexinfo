/**
 * The Bolex Technical Bulletins, hosted here.
 *
 * Paillard Incorporated of 100 Sixth Avenue, New York issued these to its
 * dealers between 1959 and 1962. They are not repair manuals, whatever this
 * archive's own notes said for a while: they are the technical literature a
 * counter salesman was expected to know, which in practice means lens charts,
 * accessory descriptions and how to shoot through a microscope. That turns
 * out to be more useful than a service sheet to most people who find this
 * site, because the depth-of-field tables for a 1959 Kern lens are not
 * printed anywhere a search engine will find.
 *
 * Fifteen of them survive on Pacific Rim Camera's reference library. The
 * series runs to at least number 36, so most of it is missing: numbers 5,
 * 7 to 12, 15 to 18, 20 to 23, 25, 28 to 30 and 34 are not there, and
 * number 3 is listed but its file 404s. If you have any of them, the
 * suggest page is the place.
 *
 * Why host rather than link. Pacific Rim is a working camera dealer running
 * a library as a courtesy, and the one lesson of this whole project is that
 * a site is up until it is not. Their scans are also 106 MB for fifteen
 * documents, which is a slow download on a phone; recompressed at 150 dpi
 * they come to 9 MB and read identically, and the text layer each one
 * carried is kept alongside so nothing is lost by it. Credit for the
 * scanning is theirs and is on the page.
 */
export interface Manual {
  /** Pacific Rim's own file number, kept as the filename and the anchor. */
  id: string;
  /** "No. 32-SP61", as printed on the sheet. */
  number: string;
  /** Sort key: the bulletin's own number in the series. */
  order: number;
  /** The year, where the sheet's code gives one. */
  year?: number;
  subject: string;
  pages: number;
  /** Bytes, for the download link. */
  bytes: number;
}

export const MANUALS: readonly Manual[] = [
  {
    id: "01884",
    number: "No. 1-SP59",
    order: 1,
    year: 1959,
    subject: "Field size and focus charts for the 12.5 mm and 13 mm standard lenses",
    pages: 1,
    bytes: 220345,
  },
  {
    id: "02107",
    number: "No. 2-SP59",
    order: 2,
    year: 1959,
    subject: "Field size and focus charts for the 36 mm telephoto lenses",
    pages: 1,
    bytes: 220088,
  },
  {
    id: "02109",
    number: "No. 4-SP62",
    order: 4,
    year: 1962,
    subject: "Field size and focus charts for the 10 mm extreme wide angle lens",
    pages: 1,
    bytes: 223277,
  },
  {
    id: "01885",
    number: "No. 6-SP59",
    order: 6,
    year: 1959,
    subject: "Field size and focus charts for the 25 mm and standard 26 mm lenses",
    pages: 1,
    bytes: 242134,
  },
  {
    id: "02105",
    number: "No. 13-1/62",
    order: 13,
    year: 1962,
    subject: "The Unimotor and its transformer, and what the friction clutch is for",
    pages: 1,
    bytes: 433204,
  },
  {
    id: "02122",
    number: "No. 14-1/62",
    order: 14,
    year: 1962,
    subject: "Accessories for Bolex motion picture cameras",
    pages: 1,
    bytes: 356369,
  },
  {
    id: "03223",
    number: "No. 19-SP60",
    order: 19,
    year: 1960,
    subject: "Bolex cable releases, and which camera takes which",
    pages: 1,
    bytes: 205979,
  },
  {
    id: "02119",
    number: "No. 24",
    order: 24,
    subject: "The Bolex anamorphic lenses, System Moeller",
    pages: 3,
    bytes: 686599,
  },
  {
    id: "03221",
    number: "No. 26",
    order: 26,
    subject:
      "Wide screen projection with the 16 mm anamorphic lenses, with mounting brackets for five makes of projector",
    pages: 3,
    bytes: 476917,
  },
  {
    id: "03222",
    number: "No. 27",
    order: 27,
    subject: "Close-up photography with the 8 mm extension tubes",
    pages: 3,
    bytes: 404641,
  },
  {
    id: "02118",
    number: "No. 31-SP60",
    order: 31,
    year: 1960,
    subject: "The Bolex Tripod H",
    pages: 2,
    bytes: 416055,
  },
  {
    id: "01883",
    number: "No. 32-SP61",
    order: 32,
    year: 1961,
    subject: "The Pan Cinor 70, 85 and 100 zoom lenses for 16 mm cameras",
    pages: 2,
    bytes: 579116,
  },
  {
    id: "02106",
    number: "No. 33-SP61",
    order: 33,
    year: 1961,
    subject: "Adapting Pan Cinor lenses to various cameras, and which mounts convert",
    pages: 2,
    bytes: 477455,
  },
  {
    id: "02120",
    number: "No. 35-1/62",
    order: 35,
    year: 1962,
    subject: "Photography through the microscope",
    pages: 4,
    bytes: 1731132,
  },
  {
    id: "01882",
    number: "No. 36-2/62",
    order: 36,
    year: 1962,
    subject:
      "The Bolex H system of film making, the longest of them: sports, slow motion and what the camera was sold as being for",
    pages: 8,
    bytes: 2841037,
  },
];

/** The numbers in the series that are not here, as printed ranges. */
export const MISSING_NUMBERS = "3, 5, 7–12, 15–18, 20–23, 25, 28–30 and 34";

export function manualHref(manual: Manual): string {
  return `/manuals/${manual.id}.pdf`;
}

/** "0.4 MB", for a download link that says what it will cost someone. */
export function manualSize(manual: Manual): string {
  return `${(manual.bytes / 1_000_000).toFixed(1)} MB`;
}
