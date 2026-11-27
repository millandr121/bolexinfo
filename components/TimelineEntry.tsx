import Link from "next/link";
import type { Plate } from "@/lib/scenes";
import type { TimelineEntry as Entry } from "@/lib/timeline";

/**
 * One year of the chronology, on one screen.
 *
 * Three shapes, depending on what there is to show:
 *
 *  - **behind** — the photograph fills the screen and the date and the
 *    words sit on it. For a picture that can carry type: a wide scene,
 *    a group, a landscape.
 *  - **beside** — the photograph is shown whole on a dark ground with
 *    the words in the space next to it. For a magazine cover or a
 *    studio plate, which a full-screen crop would ruin.
 *  - **bare** — the date and the words on paper, and nothing else.
 *    Twenty-six of the forty-five entries are like this and that is
 *    the right answer: most of them are the chapter that ends in 1927,
 *    and nothing in this archive is that old. An entry with no
 *    photograph reads better than an entry with a dull one.
 *
 * The caption is not decoration. It says what the photograph actually
 * is and when it was taken, which is what lets a picture sit beside a
 * year it does not belong to — the Sainte-Croix works on the 1875
 * entry is the same works, photographed in 1996, and the slide says
 * so.
 */
export function TimelineEntry({
  entry,
  era,
  placed,
}: {
  entry: Entry;
  /** The chapter, where this is the first entry of one. */
  era?: string;
  placed?: { plate: Plate; mode: "behind" | "beside" };
}) {
  const plate = placed?.plate;
  const mode = placed?.mode ?? "bare";
  const external = plate?.href.startsWith("http");

  const words = (
    <div className="entry-words">
      {era && <p className="entry-era">{era}</p>}
      <p className="entry-year">{entry.year}</p>
      <p className="entry-event">{entry.event}</p>

      {plate && (
        <p className="entry-credit">
          <span className="entry-credit__title">{plate.title}</span>
          {plate.when && <span className="entry-credit__when">{plate.when}</span>}
          {external ? (
            <a href={plate.href} target="_blank" rel="noreferrer">
              {plate.credit}
            </a>
          ) : (
            <Link href={plate.href}>{plate.credit}</Link>
          )}
        </p>
      )}
    </div>
  );

  return (
    <li
      data-beat
      data-mode={mode}
      data-motion={plate?.motion}
      data-side={plate?.side}
      id={`year-${entry.year}`}
      className="entry"
    >
      {plate && (
        <div className="entry-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="entry-image"
            src={plate.src}
            alt={plate.alt}
            loading="lazy"
            decoding="async"
            style={plate.focus ? { objectPosition: plate.focus } : undefined}
          />
          {mode === "behind" && <div className="entry-scrim" aria-hidden="true" />}
        </div>
      )}
      {words}
    </li>
  );
}
