import Link from "next/link";
import type { Plate } from "@/lib/scenes";

/**
 * A photograph, set on the page five different ways.
 *
 * The chronology's entry panels lay a camera behind a paragraph, which
 * is right for a sentence about a camera and wrong for everything else:
 * half this page is company history, and a cut-out product on cream
 * paper has nothing to say about a merger or a decade.
 *
 * The first version of this gave every photograph the same treatment —
 * full width, same height, same movement — which is a slideshow. These
 * are five different ideas about what a picture can do to a page, and
 * four different ways of arriving, chosen per photograph in
 * lib/scenes.ts: a tall studio portrait is shown whole beside its
 * words, a wide group shot takes the window, a magazine cover sits on
 * the paper like a magazine on a table.
 *
 * Three things keep all of them honest rather than decorative:
 *
 *  - Each is captioned, visibly, with what it is, when the document
 *    says so, and who to credit. A photograph with a caption is a
 *    document; the same photograph without one is set dressing.
 *  - None sits against a dated entry, only over a chapter or between
 *    them, so none is standing in as evidence for a year.
 *  - The credit links to where the original can be seen.
 */
export function TimelinePlate({
  plate,
  children,
}: {
  plate: Plate;
  /** A chapter title to set over or beside it. */
  children?: React.ReactNode;
}) {
  const external = plate.href.startsWith("http");

  /*
   * On the compositions where the words sit on paper beside the
   * picture rather than over it, the title is the only thing in that
   * half of the screen, and a line of 10px monospace is not enough to
   * hold it: the page reads as though the text had failed to load. It
   * is set as a heading there, with the date and the credit under it.
   * Over a photograph the opposite is true, and a quiet line at the
   * foot is right.
   */
  const spoken = plate.kind !== "cover" && plate.kind !== "band";

  const caption = spoken ? (
    <>
      <h3 className="plate-title">{plate.title}</h3>
      <p className="plate-caption">
        {plate.when && <span className="plate-caption__when">{plate.when}</span>}
        {external ? (
          <a href={plate.href} target="_blank" rel="noreferrer">
            {plate.credit}
          </a>
        ) : (
          <Link href={plate.href}>{plate.credit}</Link>
        )}
      </p>
    </>
  ) : (
    <p className="plate-caption">
      <span className="plate-caption__title">{plate.title}</span>
      {plate.when && <span className="plate-caption__when">{plate.when}</span>}
      {external ? (
        <a href={plate.href} target="_blank" rel="noreferrer">
          {plate.credit}
        </a>
      ) : (
        <Link href={plate.href}>{plate.credit}</Link>
      )}
    </p>
  );

  const image = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className="plate-image"
      src={plate.src}
      alt={plate.alt}
      loading="lazy"
      decoding="async"
      style={plate.focus ? { objectPosition: plate.focus } : undefined}
    />
  );

  return (
    <section
      data-beat
      className="plate"
      data-kind={plate.kind}
      data-motion={plate.motion}
      data-side={plate.side}
    >
      <div className="plate-frame">
        {image}
        {/* Only the compositions that set words over the picture need a
            scrim; on the others the words are on paper and a wash over
            the photograph would be damage for no reason. */}
        {(plate.kind === "cover" || plate.kind === "band") && (
          <div className="plate-scrim" aria-hidden="true" />
        )}
      </div>

      <div className="plate-words">
        {children}
        {caption}
      </div>
    </section>
  );
}
